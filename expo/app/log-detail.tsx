import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppContext';
import { StarsRating } from '@/components/StarsRating';
import { AutomationMode } from '@/types';

const AUTOMATION_COLORS: Record<AutomationMode, string> = {
  'Quality Priority': '#34C759',
  'Throughput Priority': '#FF9F0A',
  'Balanced': '#0A84FF',
};

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

interface SettingItemProps { label: string; value: string; }
const SettingItem: React.FC<SettingItemProps> = ({ label, value }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.settingValue}>{value}</Text>
  </View>
);

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { savedSetups, updateSavedSetup, deleteSavedSetup } = useApp();

  const setup = savedSetups.find(s => s.id === id);
  const [rating, setRating] = useState(setup?.sampleQualityRating ?? 0);
  const [fieldNotes, setFieldNotes] = useState(setup?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!setup) return;
    setIsSaving(true);
    await updateSavedSetup(setup.id, { sampleQualityRating: rating, notes: fieldNotes });
    setIsSaving(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Updated', 'Setup details have been saved.');
  }, [setup, rating, fieldNotes, updateSavedSetup]);

  const handleDelete = useCallback(() => {
    if (!setup) return;
    Alert.alert('Delete Setup', `Remove "${setup.fieldName}" from your logs?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteSavedSetup(setup.id); router.back(); },
      },
    ]);
  }, [setup, deleteSavedSetup, router]);

  if (!setup) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.notFoundText}>Setup not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const autoColor = AUTOMATION_COLORS[setup.automationMode] ?? Colors.textSecondary;

  return (
    <>
      <Stack.Screen
        options={{
          title: setup.fieldName,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Trash2 size={20} color={Colors.redBright} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.topInfo}>
          <Text style={styles.dateText}>{formatDate(setup.date)}</Text>
          <View style={styles.topMeta}>
            <View style={styles.metaBadge}><Text style={styles.metaBadgeText}>{setup.crop}</Text></View>
            {setup.isFoodGrade && (
              <View style={[styles.metaBadge, styles.foodBadge]}>
                <Text style={[styles.metaBadgeText, styles.foodBadgeText]}>Food-Grade</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>MACHINE SETUP</Text>
        <View style={styles.card}>
          <SettingItem label="Combine Model" value={setup.combineModel} />
          <View style={styles.divider} />
          <SettingItem label="Header Type" value={setup.headerType} />
          <View style={styles.divider} />
          <SettingItem label="Moisture Level" value={setup.moisture} />
          <View style={styles.divider} />
          <SettingItem label="Yield Estimate" value={setup.yieldEstimate} />
        </View>

        <Text style={styles.sectionTitle}>RECOMMENDED SETTINGS</Text>
        <View style={styles.card}>
          <SettingItem label="Concave Clearance" value={setup.concave} />
          <View style={styles.divider} />
          <SettingItem label="Rotor Speed" value={setup.rotor} />
          <View style={styles.divider} />
          <SettingItem label="Fan Speed" value={setup.fan} />
          <View style={styles.divider} />
          <SettingItem label="Top Sieve" value={setup.topSieve} />
          <View style={styles.divider} />
          <SettingItem label="Bottom Sieve" value={setup.bottomSieve} />
        </View>

        <Text style={styles.sectionTitle}>AUTOMATION MODE</Text>
        <View style={[styles.autoCard, { borderColor: autoColor + '50' }]}>
          <Text style={[styles.autoMode, { color: autoColor }]}>{setup.automationMode}</Text>
        </View>

        <Text style={styles.sectionTitle}>SAMPLE QUALITY RATING</Text>
        <View style={styles.ratingCard}>
          <Text style={styles.ratingHint}>Rate the grain sample quality achieved:</Text>
          <StarsRating rating={rating} onChange={setRating} size={32} />
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Acceptable' : rating === 2 ? 'Poor' : 'Very Poor'}
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>FIELD NOTES</Text>
        <View style={styles.notesCard}>
          <TextInput
            style={styles.notesInput}
            value={fieldNotes}
            onChangeText={setFieldNotes}
            multiline
            placeholder="Add notes about field conditions, adjustments made, etc."
            placeholderTextColor={Colors.textTertiary}
            textAlignVertical="top"
            testID="notes-input"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          testID="save-detail-btn"
        >
          <Save size={18} color={Colors.text} />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
        <View style={styles.bottomPad} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  topInfo: { marginBottom: 20, gap: 8 },
  dateText: { fontSize: 14, color: Colors.textSecondary },
  topMeta: { flexDirection: 'row', gap: 8 },
  metaBadge: { backgroundColor: Colors.surfaceElevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  metaBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  foodBadge: { borderColor: Colors.warning + '60', backgroundColor: Colors.warning + '15' },
  foodBadgeText: { color: Colors.warning },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1.2, marginBottom: 8, marginTop: 16 },
  card: { backgroundColor: Colors.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  settingLabel: { fontSize: 14, color: Colors.textSecondary },
  settingValue: { fontSize: 15, fontWeight: '700', color: Colors.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: 16 },
  autoCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 14, borderWidth: 1, padding: 16 },
  autoMode: { fontSize: 16, fontWeight: '700' },
  ratingCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 12, alignItems: 'flex-start' },
  ratingHint: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: Colors.starActive },
  notesCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, minHeight: 120 },
  notesInput: { fontSize: 14, color: Colors.text, lineHeight: 22, minHeight: 96 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.red, borderRadius: 14, paddingVertical: 16, marginTop: 20 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  bottomPad: { height: 40 },
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 18, color: Colors.textSecondary },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.red, borderRadius: 12 },
  backBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text },
});
