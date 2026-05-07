import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft, Users, FileText, Database, HardDrive,
  UserPlus, Trash2, Shield, ChevronRight,
  Download, Upload, Filter, X, Eraser,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppContext';
import { isSupabaseConfigured } from '@/services/supabase';
import { AdminUser, AuditLogEntry, AuditSection, AuditAction } from '@/types';

type Tab = 'admins' | 'logs' | 'backup' | 'debug';

const SECTIONS: { value: AuditSection | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'preset', label: 'Presets' },
  { value: 'tip', label: 'Tips' },
  { value: 'issue', label: 'Issues' },
  { value: 'admin', label: 'Admins' },
  { value: 'system', label: 'System' },
];

const ACTION_COLORS: Record<AuditAction, string> = {
  update: '#0A84FF',
  create: '#34C759',
  delete: '#E5152F',
  reset: '#FF9F0A',
  revert: '#BF5AF2',
  restore: '#30D158',
  import: '#0A84FF',
  export: '#9A9A9F',
  'clear-logs': '#FF9F0A',
  'sign-in': '#5A5A60',
  'sign-out': '#5A5A60',
};

const SECTION_LABEL: Record<AuditSection, string> = {
  preset: 'Preset',
  tip: 'Tip',
  issue: 'Issue',
  admin: 'Admin',
  system: 'System',
};

function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SuperAdminScreen() {
  const router = useRouter();
  const {
    currentAdmin, adminUsers, addAdminUser, deleteAdminUser, updateAdminUser,
    auditLogs, unseenLogCount, markLogsSeen,
    countLogsBefore, clearLogsBefore,
    exportBackup, importBackup,
    fetchAll,
  } = useApp();

  const [tab, setTab] = useState<Tab>('admins');

  useEffect(() => {
    if (tab === 'logs') void markLogsSeen();
  }, [tab, markLogsSeen]);

  if (!currentAdmin || currentAdmin.role !== 'super') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.lockedWrap}>
          <Shield size={42} color={Colors.textTertiary} />
          <Text style={styles.lockedTitle}>Super Admin Only</Text>
          <Text style={styles.lockedSub}>You must be signed in as a super admin to view this page.</Text>
          <TouchableOpacity style={styles.backBtnBig} onPress={() => router.back()}>
            <Text style={styles.backBtnBigText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="super-back">
          <ChevronLeft size={20} color={Colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Super Admin</Text>
          <Text style={styles.headerSub}>{currentAdmin.name}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabBar}>
        <TabButton icon={<Users size={16} />} label="Admins" active={tab === 'admins'} onPress={() => setTab('admins')} />
        <TabButton icon={<FileText size={16} />} label="Logs" active={tab === 'logs'} onPress={() => setTab('logs')} badge={unseenLogCount} />
        <TabButton icon={<HardDrive size={16} />} label="Backup" active={tab === 'backup'} onPress={() => setTab('backup')} />
        <TabButton icon={<Database size={16} />} label="Debug" active={tab === 'debug'} onPress={() => setTab('debug')} />
      </View>

      {tab === 'admins' && (
        <AdminsTab
          admins={adminUsers}
          currentId={currentAdmin.id}
          onAdd={addAdminUser}
          onDelete={deleteAdminUser}
          onUpdate={updateAdminUser}
        />
      )}
      {tab === 'logs' && (
        <LogsTab
          logs={auditLogs}
          onOpen={id => router.push(`/log-entry?id=${id}`)}
          countLogsBefore={countLogsBefore}
          clearLogsBefore={clearLogsBefore}
        />
      )}
      {tab === 'backup' && (
        <BackupTab exportBackup={exportBackup} importBackup={importBackup} />
      )}
      {tab === 'debug' && (
        <DebugTab onRefresh={fetchAll} adminCount={adminUsers.length} logCount={auditLogs.length} />
      )}
    </SafeAreaView>
  );
}

// ─── Tab Button ────────────────────────────────────────────────────────────
const TabButton: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onPress: () => void; badge?: number }> = ({ icon, label, active, onPress, badge }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]} activeOpacity={0.7} testID={`tab-${label.toLowerCase()}`}>
    <View style={styles.tabIconWrap}>
      {React.cloneElement(icon as React.ReactElement<{ color: string }>, { color: active ? Colors.text : Colors.textSecondary })}
      {badge !== undefined && badge > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge > 99 ? '99+' : String(badge)}</Text>
        </View>
      )}
    </View>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Admins Tab ─────────────────────────────────────────────────────────────
interface AdminsTabProps {
  admins: AdminUser[];
  currentId: string;
  onAdd: (name: string, passcode: string, role?: AdminUser['role']) => Promise<AdminUser | null>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Pick<AdminUser, 'name' | 'passcode' | 'role'>>) => Promise<void>;
}
const AdminsTab: React.FC<AdminsTabProps> = ({ admins, currentId, onAdd, onDelete, onUpdate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [makeSuper, setMakeSuper] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!newName.trim() || !newPass.trim()) {
      setError('Name and passcode are required.'); return;
    }
    if (admins.some(a => a.passcode === newPass)) {
      setError('That passcode is already in use.'); return;
    }
    const created = await onAdd(newName.trim(), newPass, makeSuper ? 'super' : 'admin');
    if (created) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdd(false); setNewName(''); setNewPass(''); setMakeSuper(false); setError('');
    } else {
      setError('Could not create admin.');
    }
  };

  const handleDelete = (admin: AdminUser) => {
    if (admin.id === currentId) {
      Alert.alert('Cannot Delete', 'You cannot delete the admin you are currently signed in as.');
      return;
    }
    Alert.alert(
      `Delete ${admin.name}?`,
      `This admin will no longer be able to sign in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void onDelete(admin.id) },
      ],
    );
  };

  const handlePromote = (admin: AdminUser) => {
    const newRole: AdminUser['role'] = admin.role === 'super' ? 'admin' : 'super';
    Alert.alert(
      `${newRole === 'super' ? 'Promote to Super Admin' : 'Demote to Admin'}?`,
      `${admin.name} will ${newRole === 'super' ? 'gain' : 'lose'} super-admin powers.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => void onUpdate(admin.id, { role: newRole }) },
      ],
    );
  };

  return (
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
      <Text style={styles.sectionLabel}>{admins.length} ADMIN{admins.length === 1 ? '' : 'S'}</Text>
      {admins.map(a => (
        <View key={a.id} style={styles.adminCard}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>{a.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.adminInfo}>
            <View style={styles.adminNameRow}>
              <Text style={styles.adminName}>{a.name}</Text>
              {a.role === 'super' && (
                <View style={styles.superBadge}>
                  <Shield size={9} color={Colors.warning} />
                  <Text style={styles.superBadgeText}>SUPER</Text>
                </View>
              )}
              {a.id === currentId && (
                <View style={styles.youBadge}><Text style={styles.youBadgeText}>YOU</Text></View>
              )}
            </View>
            <Text style={styles.adminMeta}>Passcode: ••••• · Created {new Date(a.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.adminActions}>
            {a.id !== currentId && (
              <TouchableOpacity onPress={() => handlePromote(a)} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Shield size={16} color={a.role === 'super' ? Colors.warning : Colors.textTertiary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDelete(a)} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Trash2 size={16} color={Colors.redBright} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addAdminBtn} onPress={() => setShowAdd(true)} activeOpacity={0.8} testID="add-admin">
        <UserPlus size={18} color={Colors.red} />
        <Text style={styles.addAdminBtnText}>Add Admin</Text>
      </TouchableOpacity>

      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>New Admin</Text>
            <TextInput style={styles.modalInput} placeholder="Name" placeholderTextColor={Colors.textTertiary} value={newName} onChangeText={setNewName} testID="new-admin-name" />
            <TextInput style={styles.modalInput} placeholder="Passcode" placeholderTextColor={Colors.textTertiary} value={newPass} onChangeText={setNewPass} secureTextEntry testID="new-admin-passcode" />
            <TouchableOpacity onPress={() => setMakeSuper(s => !s)} style={styles.checkRow} activeOpacity={0.7}>
              <View style={[styles.checkBox, makeSuper && styles.checkBoxOn]}>
                {makeSuper && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>Grant super-admin powers</Text>
            </TouchableOpacity>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowAdd(false); setError(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAdd} testID="confirm-add-admin">
                <Text style={styles.modalConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

// ─── Logs Tab ───────────────────────────────────────────────────────────────
interface LogsTabProps {
  logs: AuditLogEntry[];
  onOpen: (id: string) => void;
  countLogsBefore: (cutoffIso: string) => number;
  clearLogsBefore: (days: number) => Promise<number>;
}
const LogsTab: React.FC<LogsTabProps> = ({ logs, onOpen, countLogsBefore, clearLogsBefore }) => {
  const [sectionFilter, setSectionFilter] = useState<AuditSection | 'all'>('all');
  const [adminFilter, setAdminFilter] = useState<string | 'all'>('all');
  const [showClear, setShowClear] = useState(false);
  const [clearDays, setClearDays] = useState('30');

  const adminOptions = useMemo(() => {
    const set = new Set(logs.map(l => l.adminName));
    return ['all', ...Array.from(set)];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (sectionFilter !== 'all' && l.section !== sectionFilter) return false;
      if (adminFilter !== 'all' && l.adminName !== adminFilter) return false;
      return true;
    });
  }, [logs, sectionFilter, adminFilter]);

  const cutoffIso = useMemo(() => {
    const days = parseInt(clearDays, 10);
    if (isNaN(days) || days < 0) return new Date().toISOString();
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  }, [clearDays]);
  const willClear = countLogsBefore(cutoffIso);

  const handleClear = async () => {
    const days = parseInt(clearDays, 10);
    if (isNaN(days) || days < 0) {
      Alert.alert('Invalid', 'Please enter a number of days (0 or more).'); return;
    }
    Alert.alert(
      `Clear ${willClear} log${willClear === 1 ? '' : 's'}?`,
      `All entries older than ${days} day${days === 1 ? '' : 's'} will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive', onPress: async () => {
            const removed = await clearLogsBefore(days);
            setShowClear(false);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Cleared', `Removed ${removed} log entr${removed === 1 ? 'y' : 'ies'}.`);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.body}>
      <View style={styles.filterStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SECTIONS.map(s => (
            <TouchableOpacity key={s.value} style={[styles.chip, sectionFilter === s.value && styles.chipActive]} onPress={() => setSectionFilter(s.value)} activeOpacity={0.7}>
              <Text style={[styles.chipText, sectionFilter === s.value && styles.chipTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.chipDivider} />
          {adminOptions.map(name => (
            <TouchableOpacity key={name} style={[styles.chip, adminFilter === name && styles.chipActive]} onPress={() => setAdminFilter(name)} activeOpacity={0.7}>
              <Text style={[styles.chipText, adminFilter === name && styles.chipTextActive]}>{name === 'all' ? 'All people' : name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.logsHeaderBar}>
        <View style={styles.logsHeaderLeft}>
          <Filter size={13} color={Colors.textTertiary} />
          <Text style={styles.logsHeaderText}>{filtered.length} of {logs.length}</Text>
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={() => setShowClear(true)} activeOpacity={0.8} testID="open-clear-logs">
          <Eraser size={13} color={Colors.warning} />
          <Text style={styles.clearBtnText}>Clear Old</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <FileText size={32} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No log entries match.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={l => l.id}
          contentContainerStyle={styles.logList}
          renderItem={({ item }) => <LogRow entry={item} onPress={() => onOpen(item.id)} />}
          ItemSeparatorComponent={() => <View style={styles.logSep} />}
        />
      )}

      <Modal visible={showClear} transparent animationType="fade" onRequestClose={() => setShowClear(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowClear(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Clear Old Logs</Text>
            <Text style={styles.modalSub}>Delete log entries older than the chosen number of days.</Text>
            <View style={styles.daysRow}>
              <TextInput
                style={[styles.modalInput, styles.daysInput]}
                value={clearDays}
                onChangeText={setClearDays}
                keyboardType="number-pad"
                placeholderTextColor={Colors.textTertiary}
                testID="clear-days-input"
              />
              <Text style={styles.daysLabel}>days</Text>
            </View>
            <View style={styles.quickDays}>
              {['7', '30', '90', '180', '365'].map(d => (
                <TouchableOpacity key={d} style={[styles.quickDay, clearDays === d && styles.quickDayActive]} onPress={() => setClearDays(d)}>
                  <Text style={[styles.quickDayText, clearDays === d && styles.quickDayTextActive]}>{d}d</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Will delete</Text>
              <Text style={styles.previewCount}>{willClear}</Text>
              <Text style={styles.previewLabel}>of {logs.length} log entries</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowClear(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, willClear === 0 && styles.modalConfirmDisabled]} onPress={handleClear} disabled={willClear === 0} testID="confirm-clear-logs">
                <Text style={styles.modalConfirmText}>Clear {willClear}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const LogRow: React.FC<{ entry: AuditLogEntry; onPress: () => void }> = React.memo(({ entry, onPress }) => {
  const color = ACTION_COLORS[entry.action] ?? Colors.textSecondary;
  return (
    <TouchableOpacity style={styles.logRow} onPress={onPress} activeOpacity={0.7} testID={`log-row-${entry.id}`}>
      <View style={[styles.logStripe, { backgroundColor: color }]} />
      <View style={styles.logContent}>
        <View style={styles.logTopRow}>
          <View style={[styles.actionBadge, { backgroundColor: color + '22', borderColor: color + '60' }]}>
            <Text style={[styles.actionBadgeText, { color }]}>{entry.action.toUpperCase()}</Text>
          </View>
          <Text style={styles.sectionTag}>{SECTION_LABEL[entry.section]}</Text>
          <Text style={styles.logTime}>{formatRelative(entry.ts)}</Text>
        </View>
        <Text style={styles.logSummary} numberOfLines={2}>{entry.summary}</Text>
        <Text style={styles.logAuthor}>by {entry.adminName}</Text>
      </View>
      <ChevronRight size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
});

// ─── Backup Tab ────────────────────────────────────────────────────────────
interface BackupTabProps {
  exportBackup: () => unknown;
  importBackup: (raw: string) => Promise<{ ok: boolean; message: string }>;
}
const BackupTab: React.FC<BackupTabProps> = ({ exportBackup, importBackup }) => {
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleExport = async () => {
    const data = exportBackup();
    const json = JSON.stringify(data, null, 2);
    setExportText(json);
    if (Platform.OS === 'web') {
      setShowExport(true);
      return;
    }
    try {
      await Share.share({ message: json, title: 'Axial Advisor Backup' });
    } catch (e) {
      console.warn('[Backup] share error:', e);
      setShowExport(true);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) { Alert.alert('Empty', 'Paste backup JSON first.'); return; }
    const res = await importBackup(importText.trim());
    if (res.ok) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Imported', res.message);
      setShowImport(false);
      setImportText('');
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Import Failed', res.message);
    }
  };

  return (
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
      <Text style={styles.sectionLabel}>BACKUP</Text>
      <Text style={styles.sectionDesc}>Save a copy of all presets, tips, and issues. Restore later if anything gets out of hand.</Text>

      <TouchableOpacity style={styles.bigActionBtn} onPress={handleExport} activeOpacity={0.8} testID="export-btn">
        <View style={[styles.bigActionIcon, { backgroundColor: Colors.info + '22' }]}>
          <Download size={20} color={Colors.info} />
        </View>
        <View style={styles.bigActionText}>
          <Text style={styles.bigActionTitle}>Export Backup</Text>
          <Text style={styles.bigActionSub}>Share or copy a JSON snapshot of all settings</Text>
        </View>
        <ChevronRight size={16} color={Colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.bigActionBtn} onPress={() => setShowImport(true)} activeOpacity={0.8} testID="import-btn">
        <View style={[styles.bigActionIcon, { backgroundColor: Colors.warning + '22' }]}>
          <Upload size={20} color={Colors.warning} />
        </View>
        <View style={styles.bigActionText}>
          <Text style={styles.bigActionTitle}>Import Backup</Text>
          <Text style={styles.bigActionSub}>Paste a previously exported JSON file</Text>
        </View>
        <ChevronRight size={16} color={Colors.textTertiary} />
      </TouchableOpacity>

      <Modal visible={showImport} transparent animationType="slide" onRequestClose={() => setShowImport(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowImport(false)}>
          <Pressable style={[styles.modalCard, styles.modalCardLarge]} onPress={() => {}}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Import Backup</Text>
              <TouchableOpacity onPress={() => setShowImport(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Paste the JSON contents of your backup below.</Text>
            <TextInput
              style={styles.jsonInput}
              value={importText}
              onChangeText={setImportText}
              placeholder='{"version":1,"presets":[...]}'
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
              testID="import-json-input"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowImport(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleImport} testID="confirm-import">
                <Text style={styles.modalConfirmText}>Import</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showExport} transparent animationType="slide" onRequestClose={() => setShowExport(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowExport(false)}>
          <Pressable style={[styles.modalCard, styles.modalCardLarge]} onPress={() => {}}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Backup JSON</Text>
              <TouchableOpacity onPress={() => setShowExport(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Copy this text and save it somewhere safe.</Text>
            <TextInput
              style={styles.jsonInput}
              value={exportText}
              multiline
              textAlignVertical="top"
              editable
              selectTextOnFocus
              testID="export-json-output"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalConfirm} onPress={() => setShowExport(false)}>
                <Text style={styles.modalConfirmText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

// ─── Debug Tab ─────────────────────────────────────────────────────────────
interface DebugTabProps {
  onRefresh: () => Promise<void>;
  adminCount: number;
  logCount: number;
}
const DebugTab: React.FC<DebugTabProps> = ({ onRefresh, adminCount, logCount }) => {
  const [refreshing, setRefreshing] = useState(false);
  const supabaseOk = isSupabaseConfigured();

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
      <Text style={styles.sectionLabel}>SYSTEM</Text>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{adminCount}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{logCount}</Text>
          <Text style={styles.statLabel}>Logs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: supabaseOk ? Colors.success : Colors.warning }]}>{supabaseOk ? 'OK' : 'OFF'}</Text>
          <Text style={styles.statLabel}>Supabase</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Platform</Text>
        <Text style={styles.infoValue}>{Platform.OS} · {Platform.Version}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Supabase URL</Text>
        <Text style={styles.infoValue} numberOfLines={1}>{process.env.EXPO_PUBLIC_SUPABASE_URL ?? '— not configured —'}</Text>
      </View>

      <TouchableOpacity style={styles.bigActionBtn} onPress={handleRefresh} activeOpacity={0.8} disabled={refreshing} testID="debug-refresh">
        <View style={[styles.bigActionIcon, { backgroundColor: Colors.success + '22' }]}>
          {refreshing ? <ActivityIndicator color={Colors.success} /> : <Database size={20} color={Colors.success} />}
        </View>
        <View style={styles.bigActionText}>
          <Text style={styles.bigActionTitle}>Refresh from Supabase</Text>
          <Text style={styles.bigActionSub}>Pull latest presets, admins and logs</Text>
        </View>
        <ChevronRight size={16} color={Colors.textTertiary} />
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 76 },
  backText: { fontSize: 16, color: Colors.text, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 11, color: Colors.textTertiary, marginTop: 1 },
  headerSpacer: { minWidth: 76 },
  lockedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  lockedTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 8 },
  lockedSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  backBtnBig: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.red, borderRadius: 12, marginTop: 8 },
  backBtnBigText: { fontSize: 15, fontWeight: '700', color: Colors.text },

  tabBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', gap: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: Colors.red },
  tabIconWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  tabBadge: { position: 'absolute', top: -4, right: -8, backgroundColor: Colors.red, borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1, minWidth: 16, alignItems: 'center' },
  tabBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.text },
  tabLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  tabLabelActive: { color: Colors.text },

  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1.2, marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 8 },

  // Admin
  adminCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surfaceElevated, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  adminAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' },
  adminAvatarText: { fontSize: 16, fontWeight: '800', color: Colors.text },
  adminInfo: { flex: 1, gap: 2 },
  adminNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  adminName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  superBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warning + '22', borderColor: Colors.warning + '60', borderWidth: 1, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  superBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.warning, letterSpacing: 0.5 },
  youBadge: { backgroundColor: Colors.info + '22', borderColor: Colors.info + '60', borderWidth: 1, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  youBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.info, letterSpacing: 0.5 },
  adminMeta: { fontSize: 11, color: Colors.textTertiary },
  adminActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  addAdminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.red, borderStyle: 'dashed', marginTop: 6 },
  addAdminBtnText: { fontSize: 15, fontWeight: '700', color: Colors.red },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 18, padding: 20, width: '100%', borderWidth: 1, borderColor: Colors.border, gap: 10 },
  modalCardLarge: { maxHeight: '85%' },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  modalSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  modalInput: { backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.text },
  jsonInput: { backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12, fontSize: 12, color: Colors.text, minHeight: 200, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkBoxOn: { backgroundColor: Colors.warning + '22', borderColor: Colors.warning },
  checkMark: { color: Colors.warning, fontSize: 14, fontWeight: '900' },
  checkLabel: { fontSize: 14, color: Colors.text },
  errorText: { fontSize: 12, color: Colors.redBright },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  modalConfirm: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.red, alignItems: 'center' },
  modalConfirmDisabled: { opacity: 0.4 },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: Colors.text },

  // Logs
  filterStrip: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 8 },
  chipRow: { paddingHorizontal: 12, gap: 6, alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.red, borderColor: Colors.red },
  chipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.text },
  chipDivider: { width: 1, height: 22, backgroundColor: Colors.border, marginHorizontal: 4 },
  logsHeaderBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  logsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logsHeaderText: { fontSize: 12, color: Colors.textTertiary, fontWeight: '600' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.warning + '18', borderRadius: 8, borderWidth: 1, borderColor: Colors.warning + '40' },
  clearBtnText: { fontSize: 12, fontWeight: '700', color: Colors.warning },
  logList: { paddingHorizontal: 12, paddingBottom: 24 },
  logSep: { height: 6 },
  logRow: { flexDirection: 'row', backgroundColor: Colors.surfaceElevated, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', alignItems: 'center', paddingRight: 10 },
  logStripe: { width: 3, alignSelf: 'stretch' },
  logContent: { flex: 1, padding: 11, gap: 4 },
  logTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1 },
  actionBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  sectionTag: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600' },
  logTime: { marginLeft: 'auto', fontSize: 11, color: Colors.textTertiary },
  logSummary: { fontSize: 13, color: Colors.text, fontWeight: '500', lineHeight: 18 },
  logAuthor: { fontSize: 11, color: Colors.textTertiary, fontStyle: 'italic' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 36 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },

  // Clear modal
  daysRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  daysInput: { flex: 1, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  daysLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  quickDays: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  quickDay: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  quickDayActive: { backgroundColor: Colors.warning + '22', borderColor: Colors.warning },
  quickDayText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  quickDayTextActive: { color: Colors.warning },
  previewBox: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: 2 },
  previewLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 0.4 },
  previewCount: { fontSize: 32, fontWeight: '900', color: Colors.warning },

  // Big action / debug
  bigActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  bigActionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bigActionText: { flex: 1, gap: 2 },
  bigActionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  bigActionSub: { fontSize: 12, color: Colors.textSecondary },

  statRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 0.4 },
  infoCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  infoLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 0.4 },
  infoValue: { fontSize: 13, color: Colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
