import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { RotateCcw, Trash2, Clock, User, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppContext';
import { AuditAction, AuditSection } from '@/types';

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

function formatFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch { return iso; }
}

export default function LogEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { auditLogs, currentAdmin, revertLogEntry, deleteLogEntry } = useApp();
  const [busy, setBusy] = useState(false);

  const entry = auditLogs.find(l => l.id === id);
  const isSuper = currentAdmin?.role === 'super';

  const handleRevert = useCallback(() => {
    if (!entry) return;
    Alert.alert(
      'Revert Change?',
      entry.action === 'update'
        ? `Restore ${entry.field} on "${entry.entityLabel}" to its previous value?`
        : entry.action === 'delete'
          ? `Restore "${entry.entityLabel}"?`
          : entry.action === 'create'
            ? `Remove "${entry.entityLabel}"?`
            : 'Apply revert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revert', style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const res = await revertLogEntry(entry.id);
            setBusy(false);
            void Haptics.notificationAsync(res.ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
            Alert.alert(res.ok ? 'Reverted' : 'Could Not Revert', res.message);
            if (res.ok) router.back();
          },
        },
      ],
    );
  }, [entry, revertLogEntry, router]);

  const handleDelete = useCallback(() => {
    if (!entry) return;
    Alert.alert(
      'Delete Log Entry?',
      'This only removes the log record. The change itself stays applied.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteLogEntry(entry.id);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ],
    );
  }, [entry, deleteLogEntry, router]);

  if (!entry) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.notFoundText}>Log entry not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const color = ACTION_COLORS[entry.action] ?? Colors.textSecondary;
  const canRevert = isSuper && (
    (entry.action === 'update' && Boolean(entry.field) && Boolean(entry.entityId)) ||
    (entry.action === 'delete' && Boolean(entry.snapshot)) ||
    (entry.action === 'create' && Boolean(entry.entityId))
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Log Entry',
          headerRight: () => isSuper ? (
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Trash2 size={20} color={Colors.redBright} />
            </TouchableOpacity>
          ) : null,
        }}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroBadge, { backgroundColor: color + '18', borderColor: color + '60' }]}>
          <Text style={[styles.heroAction, { color }]}>{entry.action.toUpperCase()}</Text>
          <Text style={styles.heroSection}>{SECTION_LABEL[entry.section]}</Text>
        </View>

        <Text style={styles.summary}>{entry.summary}</Text>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Clock size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{formatFullDate(entry.ts)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <User size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{entry.adminName}</Text>
          </View>
          {entry.entityLabel && (
            <>
              <View style={styles.divider} />
              <View style={styles.metaRow}>
                <FileText size={14} color={Colors.textTertiary} />
                <Text style={styles.metaText}>{entry.entityLabel}</Text>
              </View>
            </>
          )}
        </View>

        {entry.field && (
          <>
            <Text style={styles.sectionLabel}>FIELD CHANGED</Text>
            <View style={styles.fieldNameCard}>
              <Text style={styles.fieldName}>{entry.field}</Text>
            </View>
          </>
        )}

        {(entry.oldValue !== null || entry.newValue !== null) && (
          <>
            <Text style={styles.sectionLabel}>CHANGE</Text>
            <View style={styles.diffCard}>
              <View style={styles.diffRow}>
                <Text style={styles.diffLabel}>BEFORE</Text>
                <Text style={[styles.diffValue, styles.diffOld]}>{entry.oldValue ?? '—'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.diffRow}>
                <Text style={styles.diffLabel}>AFTER</Text>
                <Text style={[styles.diffValue, styles.diffNew]}>{entry.newValue ?? '—'}</Text>
              </View>
            </View>
          </>
        )}

        {entry.snapshot != null && (
          <>
            <Text style={styles.sectionLabel}>SNAPSHOT</Text>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotText} selectable>
                {JSON.stringify(entry.snapshot, null, 2)}
              </Text>
            </View>
          </>
        )}

        {canRevert && (
          <TouchableOpacity
            style={[styles.revertBtn, busy && styles.revertBtnDisabled]}
            onPress={handleRevert}
            disabled={busy}
            activeOpacity={0.85}
            testID="revert-entry-btn"
          >
            {busy ? <ActivityIndicator color={Colors.text} /> : (
              <>
                <RotateCcw size={18} color={Colors.text} />
                <Text style={styles.revertBtnText}>
                  {entry.action === 'update' ? 'Revert This Change' :
                   entry.action === 'delete' ? 'Restore This Item' :
                   entry.action === 'create' ? 'Remove This Item' : 'Revert'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {!canRevert && isSuper && (
          <View style={styles.cantRevertBox}>
            <Text style={styles.cantRevertText}>This change cannot be reverted automatically.</Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 12 },
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.red, borderRadius: 12 },
  backBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text },

  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  heroAction: { fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  heroSection: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4 },
  summary: { fontSize: 18, fontWeight: '700', color: Colors.text, lineHeight: 24 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1.2, marginTop: 8 },
  metaCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  metaText: { fontSize: 13, color: Colors.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },

  fieldNameCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12 },
  fieldName: { fontSize: 15, fontWeight: '700', color: Colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  diffCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  diffRow: { padding: 14, gap: 6 },
  diffLabel: { fontSize: 10, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 1 },
  diffValue: { fontSize: 14, lineHeight: 20 },
  diffOld: { color: Colors.redBright, textDecorationLine: 'line-through' },
  diffNew: { color: Colors.success, fontWeight: '600' },

  snapshotCard: { backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12, maxHeight: 280 },
  snapshotText: { fontSize: 11, color: Colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 16 },

  revertBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.warning, borderRadius: 14, paddingVertical: 16, marginTop: 12 },
  revertBtnDisabled: { opacity: 0.6 },
  revertBtnText: { fontSize: 15, fontWeight: '800', color: Colors.text },
  cantRevertBox: { padding: 14, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, marginTop: 12 },
  cantRevertText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', fontStyle: 'italic' },
  bottomPad: { height: 40 },
});
