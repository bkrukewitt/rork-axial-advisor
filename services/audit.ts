import {
  SettingPreset,
  QuickTip,
  QuickIssue,
  AuditLogEntry,
  AuditSection,
  AuditAction,
  AdminUser,
} from '@/types';

interface Actor { id: string | null; name: string; }

function newId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeEntry(args: {
  actor: Actor;
  section: AuditSection;
  action: AuditAction;
  entityId?: string | null;
  entityLabel?: string | null;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  snapshot?: unknown | null;
  summary: string;
}): AuditLogEntry {
  return {
    id: newId(),
    ts: new Date().toISOString(),
    adminId: args.actor.id,
    adminName: args.actor.name,
    section: args.section,
    entityId: args.entityId ?? null,
    entityLabel: args.entityLabel ?? null,
    action: args.action,
    field: args.field ?? null,
    oldValue: args.oldValue ?? null,
    newValue: args.newValue ?? null,
    snapshot: args.snapshot ?? null,
    summary: args.summary,
  };
}

const PRESET_FIELDS: (keyof SettingPreset)[] = [
  'concave', 'rotor', 'fan', 'topSieve', 'bottomSieve', 'automationMode', 'notes',
];

function presetLabel(p: SettingPreset): string {
  return `${p.crop} · ${p.moisture}${p.isFoodGrade ? ' · Food-Grade' : ''}`;
}

export function diffPresets(prev: SettingPreset[], next: SettingPreset[], actor: Actor): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];
  const prevById = new Map(prev.map(p => [p.id, p]));
  const nextById = new Map(next.map(p => [p.id, p]));

  for (const [id, n] of nextById) {
    const p = prevById.get(id);
    if (!p) {
      entries.push(makeEntry({
        actor, section: 'preset', action: 'create',
        entityId: id, entityLabel: presetLabel(n),
        snapshot: n, summary: `Created preset "${presetLabel(n)}"`,
      }));
      continue;
    }
    for (const f of PRESET_FIELDS) {
      const a = String(p[f] ?? '');
      const b = String(n[f] ?? '');
      if (a !== b) {
        entries.push(makeEntry({
          actor, section: 'preset', action: 'update',
          entityId: id, entityLabel: presetLabel(n),
          field: String(f), oldValue: a, newValue: b,
          summary: `Changed ${String(f)} on "${presetLabel(n)}"`,
        }));
      }
    }
  }
  for (const [id, p] of prevById) {
    if (!nextById.has(id)) {
      entries.push(makeEntry({
        actor, section: 'preset', action: 'delete',
        entityId: id, entityLabel: presetLabel(p),
        snapshot: p, summary: `Deleted preset "${presetLabel(p)}"`,
      }));
    }
  }
  return entries;
}

const TIP_FIELDS: (keyof QuickTip)[] = ['title', 'subtitle', 'icon', 'content'];

export function diffTips(prev: QuickTip[], next: QuickTip[], actor: Actor): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];
  const prevById = new Map(prev.map(t => [t.id, t]));
  const nextById = new Map(next.map(t => [t.id, t]));
  for (const [id, n] of nextById) {
    const p = prevById.get(id);
    if (!p) {
      entries.push(makeEntry({
        actor, section: 'tip', action: 'create',
        entityId: id, entityLabel: n.title,
        snapshot: n, summary: `Created tip "${n.title}"`,
      }));
      continue;
    }
    for (const f of TIP_FIELDS) {
      const a = String(p[f] ?? '');
      const b = String(n[f] ?? '');
      if (a !== b) {
        entries.push(makeEntry({
          actor, section: 'tip', action: 'update',
          entityId: id, entityLabel: n.title,
          field: String(f), oldValue: a, newValue: b,
          summary: `Changed ${String(f)} on tip "${n.title}"`,
        }));
      }
    }
  }
  for (const [id, p] of prevById) {
    if (!nextById.has(id)) {
      entries.push(makeEntry({
        actor, section: 'tip', action: 'delete',
        entityId: id, entityLabel: p.title,
        snapshot: p, summary: `Deleted tip "${p.title}"`,
      }));
    }
  }
  return entries;
}

const ISSUE_FIELDS: (keyof QuickIssue)[] = ['label', 'icon', 'response'];

export function diffIssues(prev: QuickIssue[], next: QuickIssue[], actor: Actor): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];
  const prevById = new Map(prev.map(i => [i.id, i]));
  const nextById = new Map(next.map(i => [i.id, i]));
  for (const [id, n] of nextById) {
    const p = prevById.get(id);
    if (!p) {
      entries.push(makeEntry({
        actor, section: 'issue', action: 'create',
        entityId: id, entityLabel: n.label,
        snapshot: n, summary: `Created issue "${n.label}"`,
      }));
      continue;
    }
    for (const f of ISSUE_FIELDS) {
      const a = String(p[f] ?? '');
      const b = String(n[f] ?? '');
      if (a !== b) {
        entries.push(makeEntry({
          actor, section: 'issue', action: 'update',
          entityId: id, entityLabel: n.label,
          field: String(f), oldValue: a, newValue: b,
          summary: `Changed ${String(f)} on issue "${n.label}"`,
        }));
      }
    }
  }
  for (const [id, p] of prevById) {
    if (!nextById.has(id)) {
      entries.push(makeEntry({
        actor, section: 'issue', action: 'delete',
        entityId: id, entityLabel: p.label,
        snapshot: p, summary: `Deleted issue "${p.label}"`,
      }));
    }
  }
  return entries;
}

export function adminEntry(args: {
  actor: Actor;
  action: AuditAction;
  target: AdminUser;
  summary: string;
}): AuditLogEntry {
  return makeEntry({
    actor: args.actor,
    section: 'admin',
    action: args.action,
    entityId: args.target.id,
    entityLabel: args.target.name,
    snapshot: { ...args.target, passcode: '••••' },
    summary: args.summary,
  });
}

export function systemEntry(args: {
  actor: Actor;
  action: AuditAction;
  summary: string;
  snapshot?: unknown;
}): AuditLogEntry {
  return makeEntry({
    actor: args.actor,
    section: 'system',
    action: args.action,
    summary: args.summary,
    snapshot: args.snapshot ?? null,
  });
}

export { makeEntry as makeAuditEntry };
