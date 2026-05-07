# Admin Logging System — Multi-Admin + Audit Trail

Build a full admin/audit system: multiple admin users (super-admin assigned), per-field change logging stored in Supabase, and a redesigned super-admin panel with tabbed pages.

## Schema (Supabase)

```sql
create table if not exists admin_users (
  id text primary key,
  name text not null,
  passcode text not null,
  role text not null default 'admin',
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id text primary key,
  ts timestamptz not null default now(),
  admin_id text,
  admin_name text not null,
  section text not null,
  entity_id text,
  entity_label text,
  action text not null,
  field text,
  old_value text,
  new_value text,
  snapshot jsonb,
  summary text not null
);
create index if not exists audit_logs_ts_idx on audit_logs (ts desc);
```

## Files

- [x] `expo/types/index.ts` — AdminUser, AuditLogEntry types
- [x] `expo/services/supabase.ts` — admin_users + audit_logs CRUD
- [x] `expo/services/audit.ts` — diff helpers (presets/tips/issues)
- [x] `expo/store/AppContext.tsx` — admin auth, currentAdmin, log emission, clear/restore
- [x] `expo/app/(tabs)/index.tsx` — passcode flow → admin user resolve / first-time super admin setup
- [x] `expo/app/admin.tsx` — show signed-in admin, super-admin link, log on save
- [x] `expo/app/super-admin.tsx` — tabs: Settings (admins) | Logs (filter+list+red-dot) | Backup (export/import) | Debug
- [x] `expo/app/log-entry.tsx` — log detail with revert/restore
- [x] `expo/app/_layout.tsx` — register new screens
