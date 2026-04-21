import { SettingPreset, QuickTip, QuickIssue } from '@/types';

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

export async function fetchRemotePresets(): Promise<SettingPreset[] | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/setting_presets?select=*`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      console.warn('[Supabase] fetchPresets failed:', res.status);
      return null;
    }
    const data = await res.json() as SettingPreset[];
    console.log('[Supabase] Fetched presets:', data.length);
    return data;
  } catch (e) {
    console.warn('[Supabase] fetchPresets error:', e);
    return null;
  }
}

export async function fetchRemoteTips(): Promise<QuickTip[] | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/quick_tips?select=*&order=id`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      console.warn('[Supabase] fetchTips failed:', res.status);
      return null;
    }
    const data = await res.json() as QuickTip[];
    console.log('[Supabase] Fetched tips:', data.length);
    return data;
  } catch (e) {
    console.warn('[Supabase] fetchTips error:', e);
    return null;
  }
}

export async function fetchRemoteIssues(): Promise<QuickIssue[] | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/quick_issues?select=*&order=id`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      console.warn('[Supabase] fetchIssues failed:', res.status);
      return null;
    }
    const data = await res.json() as QuickIssue[];
    console.log('[Supabase] Fetched issues:', data.length);
    return data;
  } catch (e) {
    console.warn('[Supabase] fetchIssues error:', e);
    return null;
  }
}

async function upsertRows(table: string, rows: unknown[]): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    for (const row of rows) {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(row),
      });
    }
    console.log(`[Supabase] Upserted ${rows.length} rows to ${table}`);
    return true;
  } catch (e) {
    console.warn(`[Supabase] upsertRows error (${table}):`, e);
    return false;
  }
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
