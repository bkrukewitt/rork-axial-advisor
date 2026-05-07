import { SettingPreset, QuickTip, QuickIssue, AdminUser, AuditLogEntry } from '@/types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY ?? ''}`,
    'apikey': SUPABASE_ANON_KEY ?? '',
  };
}

function isConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function isSupabaseConfigured(): boolean {
  return isConfigured();
}

export async function fetchRemotePresets(): Promise<SettingPreset[] | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/setting_presets?select=*`, { headers: getHeaders() });
    if (!res.ok) { console.warn('[Supabase] fetchPresets failed:', res.status); return null; }
    const data = await res.json() as SettingPreset[];
    console.log('[Supabase] Fetched presets:', data.length);
    return data;
  } catch (e) { console.warn('[Supabase] fetchPresets error:', e); return null; }
}

export async function fetchRemoteTips(): Promise<QuickTip[] | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/quick_tips?select=*&order=id`, { headers: getHeaders() });
    if (!res.ok) { console.warn('[Supabase] fetchTips failed:', res.status); return null; }
    const data = await res.json() as QuickTip[];
    console.log('[Supabase] Fetched tips:', data.length);
    return data;
  } catch (e) { console.warn('[Supabase] fetchTips error:', e); return null; }
}

export async function fetchRemoteIssues(): Promise<QuickIssue[] | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/quick_issues?select=*&order=id`, { headers: getHeaders() });
    if (!res.ok) { console.warn('[Supabase] fetchIssues failed:', res.status); return null; }
    const data = await res.json() as QuickIssue[];
    console.log('[Supabase] Fetched issues:', data.length);
    return data;
  } catch (e) { console.warn('[Supabase] fetchIssues error:', e); return null; }
}

async function upsertRows(table: string, rows: unknown[]): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    for (const row of rows) {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(row),
      });
    }
    console.log(`[Supabase] Upserted ${rows.length} rows to ${table}`);
    return true;
  } catch (e) { console.warn(`[Supabase] upsertRows error (${table}):`, e); return false; }
}

export function saveRemotePresets(presets: SettingPreset[]): Promise<boolean> {
  return upsertRows('setting_presets', presets);
}
export function saveRemoteTips(tips: QuickTip[]): Promise<boolean> {
  return upsertRows('quick_tips', tips);
}
export function saveRemoteIssues(issues: QuickIssue[]): Promise<boolean> {
  return upsertRows('quick_issues', issues);
}

// ─── Admin Users ─────────────────────────────────────────────────────────────

interface RemoteAdminUser {
  id: string;
  name: string;
  passcode: string;
  role: string;
  created_at: string;
}

function fromRemoteAdmin(r: RemoteAdminUser): AdminUser {
  return {
    id: r.id,
    name: r.name,
    passcode: r.passcode,
    role: (r.role === 'super' ? 'super' : 'admin'),
    createdAt: r.created_at,
  };
}

function toRemoteAdmin(a: AdminUser): RemoteAdminUser {
  return {
    id: a.id,
    name: a.name,
    passcode: a.passcode,
    role: a.role,
    created_at: a.createdAt,
  };
}

export async function fetchRemoteAdmins(): Promise<AdminUser[] | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=*&order=created_at`, { headers: getHeaders() });
    if (!res.ok) { console.warn('[Supabase] fetchAdmins failed:', res.status); return null; }
    const data = await res.json() as RemoteAdminUser[];
    console.log('[Supabase] Fetched admins:', data.length);
    return data.map(fromRemoteAdmin);
  } catch (e) { console.warn('[Supabase] fetchAdmins error:', e); return null; }
}

export async function upsertRemoteAdmin(admin: AdminUser): Promise<boolean> {
  return upsertRows('admin_users', [toRemoteAdmin(admin)]);
}

export async function deleteRemoteAdmin(id: string): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/admin_users?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return true;
  } catch (e) { console.warn('[Supabase] deleteAdmin error:', e); return false; }
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

interface RemoteAuditLog {
  id: string;
  ts: string;
  admin_id: string | null;
  admin_name: string;
  section: string;
  entity_id: string | null;
  entity_label: string | null;
  action: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  snapshot: unknown | null;
  summary: string;
}

function fromRemoteLog(r: RemoteAuditLog): AuditLogEntry {
  return {
    id: r.id,
    ts: r.ts,
    adminId: r.admin_id,
    adminName: r.admin_name,
    section: r.section as AuditLogEntry['section'],
    entityId: r.entity_id,
    entityLabel: r.entity_label,
    action: r.action as AuditLogEntry['action'],
    field: r.field,
    oldValue: r.old_value,
    newValue: r.new_value,
    snapshot: r.snapshot,
    summary: r.summary,
  };
}

function toRemoteLog(a: AuditLogEntry): RemoteAuditLog {
  return {
    id: a.id,
    ts: a.ts,
    admin_id: a.adminId,
    admin_name: a.adminName,
    section: a.section,
    entity_id: a.entityId,
    entity_label: a.entityLabel,
    action: a.action,
    field: a.field,
    old_value: a.oldValue,
    new_value: a.newValue,
    snapshot: a.snapshot,
    summary: a.summary,
  };
}

export async function fetchRemoteAuditLogs(): Promise<AuditLogEntry[] | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs?select=*&order=ts.desc&limit=2000`, { headers: getHeaders() });
    if (!res.ok) { console.warn('[Supabase] fetchAuditLogs failed:', res.status); return null; }
    const data = await res.json() as RemoteAuditLog[];
    console.log('[Supabase] Fetched audit logs:', data.length);
    return data.map(fromRemoteLog);
  } catch (e) { console.warn('[Supabase] fetchAuditLogs error:', e); return null; }
}

export async function appendRemoteAuditLogs(entries: AuditLogEntry[]): Promise<boolean> {
  if (entries.length === 0) return true;
  return upsertRows('audit_logs', entries.map(toRemoteLog));
}

export async function deleteRemoteAuditLogsBefore(isoCutoff: string): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/audit_logs?ts=lt.${encodeURIComponent(isoCutoff)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return true;
  } catch (e) { console.warn('[Supabase] deleteAuditLogsBefore error:', e); return false; }
}

export async function deleteRemoteAuditLogById(id: string): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/audit_logs?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return true;
  } catch (e) { console.warn('[Supabase] deleteAuditLogById error:', e); return false; }
}
