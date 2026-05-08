import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_PRESETS } from '@/mocks/presets';
import { DEFAULT_TIPS } from '@/mocks/tips';
import { DEFAULT_ISSUES } from '@/mocks/issues';
import {
  SettingPreset, QuickTip, QuickIssue, SavedSetup,
  AdminUser, AuditLogEntry,
} from '@/types';
import {
  fetchRemotePresets, fetchRemoteTips, fetchRemoteIssues,
  saveRemotePresets, saveRemoteTips, saveRemoteIssues,
  fetchRemoteAdmins, upsertRemoteAdmin, deleteRemoteAdmin,
  fetchRemoteAuditLogs, appendRemoteAuditLogs,
  deleteRemoteAuditLogsBefore, deleteRemoteAuditLogById,
} from '@/services/supabase';
import {
  diffPresets, diffTips, diffIssues, adminEntry, systemEntry,
} from '@/services/audit';

const CACHE_PRESETS_KEY = 'cached_setting_presets';
const CACHE_TIPS_KEY = 'cached_quick_tips';
const CACHE_ISSUES_KEY = 'cached_quick_issues';
const SETUPS_KEY = 'saved_setups';
const CACHE_ADMINS_KEY = 'cached_admin_users';
const CACHE_LOGS_KEY = 'cached_audit_logs';
const LOGS_LAST_SEEN_KEY = 'audit_logs_last_seen';

function mergePresets(defaults: SettingPreset[], remote: SettingPreset[]): SettingPreset[] {
  return defaults.map(def => {
    const override = remote.find(r => r.id === def.id);
    return override ?? def;
  });
}

export const [AppProvider, useApp] = createContextHook(() => {
  const [settingPresets, setSettingPresets] = useState<SettingPreset[]>(DEFAULT_PRESETS);
  const [quickTips, setQuickTips] = useState<QuickTip[]>(DEFAULT_TIPS);
  const [quickIssues, setQuickIssues] = useState<QuickIssue[]>(DEFAULT_ISSUES);
  const [savedSetups, setSavedSetups] = useState<SavedSetup[]>([]);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [logsLastSeen, setLogsLastSeen] = useState<string | null>(null);

  useEffect(() => {
    void loadCachedData();
  }, []);

  const loadCachedData = async () => {
    console.log('[AppContext] Loading cached data');
    try {
      const [
        cachedPresets, cachedTips, cachedIssues, cachedSetups,
        cachedAdmins, cachedLogs, lastSeen,
      ] = await Promise.all([
        AsyncStorage.getItem(CACHE_PRESETS_KEY),
        AsyncStorage.getItem(CACHE_TIPS_KEY),
        AsyncStorage.getItem(CACHE_ISSUES_KEY),
        AsyncStorage.getItem(SETUPS_KEY),
        AsyncStorage.getItem(CACHE_ADMINS_KEY),
        AsyncStorage.getItem(CACHE_LOGS_KEY),
        AsyncStorage.getItem(LOGS_LAST_SEEN_KEY),
      ]);

      if (cachedPresets) {
        const parsed = JSON.parse(cachedPresets) as SettingPreset[];
        setSettingPresets(mergePresets(DEFAULT_PRESETS, parsed));
      }
      if (cachedTips) {
        const parsed = JSON.parse(cachedTips) as QuickTip[];
        if (parsed.length > 0) setQuickTips(parsed);
      }
      if (cachedIssues) {
        const parsed = JSON.parse(cachedIssues) as QuickIssue[];
        if (parsed.length > 0) setQuickIssues(parsed);
      }
      if (cachedSetups) setSavedSetups(JSON.parse(cachedSetups) as SavedSetup[]);
      if (cachedAdmins) setAdminUsers(JSON.parse(cachedAdmins) as AdminUser[]);
      if (cachedLogs) setAuditLogs(JSON.parse(cachedLogs) as AuditLogEntry[]);
      if (lastSeen) setLogsLastSeen(lastSeen);
    } catch (e) {
      console.warn('[AppContext] Cache load error:', e);
    }
    void fetchAll();
  };

  const fetchAll = useCallback(async () => {
    console.log('[AppContext] Fetching remote data');
    const [
      remotePresets, remoteTips, remoteIssues,
      remoteAdmins, remoteLogs,
    ] = await Promise.all([
      fetchRemotePresets(),
      fetchRemoteTips(),
      fetchRemoteIssues(),
      fetchRemoteAdmins(),
      fetchRemoteAuditLogs(),
    ]);

    if (remotePresets && remotePresets.length > 0) {
      const merged = mergePresets(DEFAULT_PRESETS, remotePresets);
      setSettingPresets(merged);
      await AsyncStorage.setItem(CACHE_PRESETS_KEY, JSON.stringify(remotePresets));
    }
    if (remoteTips && remoteTips.length > 0) {
      setQuickTips(remoteTips);
      await AsyncStorage.setItem(CACHE_TIPS_KEY, JSON.stringify(remoteTips));
    }
    if (remoteIssues && remoteIssues.length > 0) {
      setQuickIssues(remoteIssues);
      await AsyncStorage.setItem(CACHE_ISSUES_KEY, JSON.stringify(remoteIssues));
    }
    if (remoteAdmins) {
      setAdminUsers(remoteAdmins);
      await AsyncStorage.setItem(CACHE_ADMINS_KEY, JSON.stringify(remoteAdmins));
    }
    if (remoteLogs) {
      setAuditLogs(remoteLogs);
      await AsyncStorage.setItem(CACHE_LOGS_KEY, JSON.stringify(remoteLogs));
    }
  }, []);

  // ─── Audit log helpers ────────────────────────────────────────────────────
  const appendLogs = useCallback(async (entries: AuditLogEntry[]) => {
    if (entries.length === 0) return;
    const next = [...entries, ...auditLogs];
    setAuditLogs(next);
    await AsyncStorage.setItem(CACHE_LOGS_KEY, JSON.stringify(next));
    void appendRemoteAuditLogs(entries);
  }, [auditLogs]);

  const actorOf = useCallback((): { id: string | null; name: string } => ({
    id: currentAdmin?.id ?? null,
    name: currentAdmin?.name ?? 'Unknown',
  }), [currentAdmin]);

  // ─── Save with diff logging ───────────────────────────────────────────────
  const savePresets = useCallback(async (presets: SettingPreset[]) => {
    const prev = settingPresets;
    setSettingPresets(presets);
    await AsyncStorage.setItem(CACHE_PRESETS_KEY, JSON.stringify(presets));
    await saveRemotePresets(presets);
    const entries = diffPresets(prev, presets, actorOf());
    if (entries.length > 0) await appendLogs(entries);
  }, [settingPresets, actorOf, appendLogs]);

  const saveTips = useCallback(async (tips: QuickTip[]) => {
    const prev = quickTips;
    setQuickTips(tips);
    await AsyncStorage.setItem(CACHE_TIPS_KEY, JSON.stringify(tips));
    await saveRemoteTips(tips);
    const entries = diffTips(prev, tips, actorOf());
    if (entries.length > 0) await appendLogs(entries);
  }, [quickTips, actorOf, appendLogs]);

  const saveIssues = useCallback(async (issues: QuickIssue[]) => {
    const prev = quickIssues;
    setQuickIssues(issues);
    await AsyncStorage.setItem(CACHE_ISSUES_KEY, JSON.stringify(issues));
    await saveRemoteIssues(issues);
    const entries = diffIssues(prev, issues, actorOf());
    if (entries.length > 0) await appendLogs(entries);
  }, [quickIssues, actorOf, appendLogs]);

  // ─── Saved setups (unchanged user-side data) ──────────────────────────────
  const persistSetups = async (setups: SavedSetup[]) => {
    await AsyncStorage.setItem(SETUPS_KEY, JSON.stringify(setups));
  };
  const addSavedSetup = useCallback(async (setup: SavedSetup) => {
    const updated = [setup, ...savedSetups];
    setSavedSetups(updated);
    await persistSetups(updated);
  }, [savedSetups]);
  const deleteSavedSetup = useCallback(async (id: string) => {
    const updated = savedSetups.filter(s => s.id !== id);
    setSavedSetups(updated);
    await persistSetups(updated);
  }, [savedSetups]);
  const updateSavedSetup = useCallback(async (id: string, updates: Partial<SavedSetup>) => {
    const updated = savedSetups.map(s => s.id === id ? { ...s, ...updates } : s);
    setSavedSetups(updated);
    await persistSetups(updated);
  }, [savedSetups]);

  // ─── Admin auth & user management ─────────────────────────────────────────
  const persistAdmins = async (next: AdminUser[]) => {
    await AsyncStorage.setItem(CACHE_ADMINS_KEY, JSON.stringify(next));
  };

  const signInWithPasscode = useCallback((passcode: string): AdminUser | null => {
    const found = adminUsers.find(a => a.passcode === passcode);
    if (found) {
      setCurrentAdmin(found);
      void appendLogs([systemEntry({
        actor: { id: found.id, name: found.name },
        action: 'sign-in',
        summary: `${found.name} signed in`,
      })]);
    }
    return found ?? null;
  }, [adminUsers, appendLogs]);

  const signOut = useCallback(() => {
    if (currentAdmin) {
      void appendLogs([systemEntry({
        actor: { id: currentAdmin.id, name: currentAdmin.name },
        action: 'sign-out',
        summary: `${currentAdmin.name} signed out`,
      })]);
    }
    setCurrentAdmin(null);
  }, [currentAdmin, appendLogs]);

  const createInitialSuperAdmin = useCallback(async (name: string, passcode: string): Promise<AdminUser> => {
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      name: name.trim() || 'Super Admin',
      passcode,
      role: 'super',
      createdAt: new Date().toISOString(),
    };
    const next = [...adminUsers, newAdmin];
    setAdminUsers(next);
    await persistAdmins(next);
    await upsertRemoteAdmin(newAdmin);
    setCurrentAdmin(newAdmin);
    await appendLogs([adminEntry({
      actor: { id: newAdmin.id, name: newAdmin.name },
      action: 'create',
      target: newAdmin,
      summary: `Initial super admin "${newAdmin.name}" created`,
    })]);
    return newAdmin;
  }, [adminUsers, appendLogs]);

  const addAdminUser = useCallback(async (name: string, passcode: string, role: AdminUser['role'] = 'admin'): Promise<AdminUser | null> => {
    if (!currentAdmin || currentAdmin.role !== 'super') return null;
    if (adminUsers.some(a => a.passcode === passcode)) return null;
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      name: name.trim() || 'Admin',
      passcode,
      role,
      createdAt: new Date().toISOString(),
    };
    const next = [...adminUsers, newAdmin];
    setAdminUsers(next);
    await persistAdmins(next);
    await upsertRemoteAdmin(newAdmin);
    await appendLogs([adminEntry({
      actor: actorOf(),
      action: 'create',
      target: newAdmin,
      summary: `Created ${role} "${newAdmin.name}"`,
    })]);
    return newAdmin;
  }, [adminUsers, currentAdmin, appendLogs, actorOf]);

  const updateAdminUser = useCallback(async (id: string, updates: Partial<Pick<AdminUser, 'name' | 'passcode' | 'role'>>) => {
    if (!currentAdmin || currentAdmin.role !== 'super') return;
    const target = adminUsers.find(a => a.id === id);
    if (!target) return;
    const updated: AdminUser = { ...target, ...updates };
    const next = adminUsers.map(a => a.id === id ? updated : a);
    setAdminUsers(next);
    await persistAdmins(next);
    await upsertRemoteAdmin(updated);
    await appendLogs([adminEntry({
      actor: actorOf(),
      action: 'update',
      target: updated,
      summary: `Updated admin "${updated.name}"`,
    })]);
  }, [adminUsers, currentAdmin, appendLogs, actorOf]);

  const deleteAdminUser = useCallback(async (id: string) => {
    if (!currentAdmin || currentAdmin.role !== 'super') return;
    const target = adminUsers.find(a => a.id === id);
    if (!target) return;
    if (target.role === 'super' && adminUsers.filter(a => a.role === 'super').length <= 1) return;
    const next = adminUsers.filter(a => a.id !== id);
    setAdminUsers(next);
    await persistAdmins(next);
    await deleteRemoteAdmin(id);
    await appendLogs([adminEntry({
      actor: actorOf(),
      action: 'delete',
      target,
      summary: `Deleted admin "${target.name}"`,
    })]);
  }, [adminUsers, currentAdmin, appendLogs, actorOf]);

  // ─── Logs management ──────────────────────────────────────────────────────
  const markLogsSeen = useCallback(async () => {
    const ts = new Date().toISOString();
    setLogsLastSeen(ts);
    await AsyncStorage.setItem(LOGS_LAST_SEEN_KEY, ts);
  }, []);

  const unseenLogCount = useMemo(() => {
    if (!logsLastSeen) return auditLogs.length;
    return auditLogs.filter(l => l.ts > logsLastSeen).length;
  }, [auditLogs, logsLastSeen]);

  const countLogsBefore = useCallback((cutoffIso: string): number => {
    return auditLogs.filter(l => l.ts < cutoffIso).length;
  }, [auditLogs]);

  const clearLogsBefore = useCallback(async (days: number): Promise<number> => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const removed = auditLogs.filter(l => l.ts < cutoff).length;
    const remaining = auditLogs.filter(l => l.ts >= cutoff);
    setAuditLogs(remaining);
    await AsyncStorage.setItem(CACHE_LOGS_KEY, JSON.stringify(remaining));
    await deleteRemoteAuditLogsBefore(cutoff);
    await appendLogs([systemEntry({
      actor: actorOf(),
      action: 'clear-logs',
      summary: `Cleared ${removed} log entr${removed === 1 ? 'y' : 'ies'} older than ${days} day${days === 1 ? '' : 's'}`,
      snapshot: { days, removed },
    })]);
    return removed;
  }, [auditLogs, appendLogs, actorOf]);

  // ─── Revert / Restore from a log entry ────────────────────────────────────
  const revertLogEntry = useCallback(async (entryId: string): Promise<{ ok: boolean; message: string }> => {
    const entry = auditLogs.find(l => l.id === entryId);
    if (!entry) return { ok: false, message: 'Entry not found' };
    if (entry.section === 'preset' && entry.action === 'update' && entry.entityId && entry.field) {
      const target = settingPresets.find(p => p.id === entry.entityId);
      if (!target) return { ok: false, message: 'Preset no longer exists' };
      const updated: SettingPreset = { ...target, [entry.field]: entry.oldValue ?? '' } as SettingPreset;
      const next = settingPresets.map(p => p.id === target.id ? updated : p);
      await savePresets(next);
      return { ok: true, message: `Reverted ${entry.field} on "${entry.entityLabel}"` };
    }
    if (entry.section === 'tip' && entry.action === 'update' && entry.entityId && entry.field) {
      const target = quickTips.find(t => t.id === entry.entityId);
      if (!target) return { ok: false, message: 'Tip no longer exists' };
      const updated = { ...target, [entry.field]: entry.oldValue ?? '' } as QuickTip;
      await saveTips(quickTips.map(t => t.id === target.id ? updated : t));
      return { ok: true, message: `Reverted ${entry.field} on tip "${entry.entityLabel}"` };
    }
    if (entry.section === 'issue' && entry.action === 'update' && entry.entityId && entry.field) {
      const target = quickIssues.find(i => i.id === entry.entityId);
      if (!target) return { ok: false, message: 'Issue no longer exists' };
      const updated = { ...target, [entry.field]: entry.oldValue ?? '' } as QuickIssue;
      await saveIssues(quickIssues.map(i => i.id === target.id ? updated : i));
      return { ok: true, message: `Reverted ${entry.field} on issue "${entry.entityLabel}"` };
    }
    if (entry.action === 'delete' && entry.snapshot) {
      if (entry.section === 'preset') {
        const snap = entry.snapshot as SettingPreset;
        await savePresets([...settingPresets, snap]);
        return { ok: true, message: `Restored preset "${entry.entityLabel}"` };
      }
      if (entry.section === 'tip') {
        await saveTips([...quickTips, entry.snapshot as QuickTip]);
        return { ok: true, message: `Restored tip "${entry.entityLabel}"` };
      }
      if (entry.section === 'issue') {
        await saveIssues([...quickIssues, entry.snapshot as QuickIssue]);
        return { ok: true, message: `Restored issue "${entry.entityLabel}"` };
      }
    }
    if (entry.action === 'create' && entry.entityId) {
      if (entry.section === 'preset') {
        await savePresets(settingPresets.filter(p => p.id !== entry.entityId));
        return { ok: true, message: `Removed preset "${entry.entityLabel}"` };
      }
      if (entry.section === 'tip') {
        await saveTips(quickTips.filter(t => t.id !== entry.entityId));
        return { ok: true, message: `Removed tip "${entry.entityLabel}"` };
      }
      if (entry.section === 'issue') {
        await saveIssues(quickIssues.filter(i => i.id !== entry.entityId));
        return { ok: true, message: `Removed issue "${entry.entityLabel}"` };
      }
    }
    return { ok: false, message: 'This change cannot be reverted automatically.' };
  }, [auditLogs, settingPresets, quickTips, quickIssues, savePresets, saveTips, saveIssues]);

  const deleteLogEntry = useCallback(async (entryId: string) => {
    const next = auditLogs.filter(l => l.id !== entryId);
    setAuditLogs(next);
    await AsyncStorage.setItem(CACHE_LOGS_KEY, JSON.stringify(next));
    await deleteRemoteAuditLogById(entryId);
  }, [auditLogs]);

  // ─── Backup (export/import) ───────────────────────────────────────────────
  const exportBackup = useCallback(() => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      presets: settingPresets,
      tips: quickTips,
      issues: quickIssues,
    };
  }, [settingPresets, quickTips, quickIssues]);

  const importBackup = useCallback(async (raw: string): Promise<{ ok: boolean; message: string }> => {
    try {
      const data = JSON.parse(raw) as { presets?: SettingPreset[]; tips?: QuickTip[]; issues?: QuickIssue[] };
      if (data.presets && Array.isArray(data.presets)) await savePresets(mergePresets(DEFAULT_PRESETS, data.presets));
      if (data.tips && Array.isArray(data.tips)) await saveTips(data.tips);
      if (data.issues && Array.isArray(data.issues)) await saveIssues(data.issues);
      await appendLogs([systemEntry({
        actor: actorOf(),
        action: 'import',
        summary: 'Imported settings backup',
      })]);
      return { ok: true, message: 'Backup imported successfully.' };
    } catch (e) {
      console.warn('[AppContext] importBackup error:', e);
      return { ok: false, message: 'Invalid backup file.' };
    }
  }, [savePresets, saveTips, saveIssues, appendLogs, actorOf]);

  return {
    settingPresets, quickTips, quickIssues, savedSetups,
    savePresets, saveTips, saveIssues,
    addSavedSetup, deleteSavedSetup, updateSavedSetup,
    fetchAll,
    // admin
    adminUsers, currentAdmin,
    signInWithPasscode, signOut,
    createInitialSuperAdmin, addAdminUser, updateAdminUser, deleteAdminUser,
    // logs
    auditLogs, appendLogs, unseenLogCount, markLogsSeen,
    countLogsBefore, clearLogsBefore,
    revertLogEntry, deleteLogEntry,
    // backup
    exportBackup, importBackup,
  };
});
