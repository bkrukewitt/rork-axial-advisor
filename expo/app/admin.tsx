import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppContext';
import { SegmentedControl } from '@/components/SegmentedControl';
import { PickerModal } from '@/components/PickerModal';
import {
  SettingPreset, QuickTip, QuickIssue,
  CropType, AutomationMode, CROP_TYPES,
} from '@/types';

const AUTO_MODES: AutomationMode[] = ['Quality Priority', 'Throughput Priority', 'Balanced'];

interface FieldInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}
const FieldInput: React.FC<FieldInputProps> = ({ label, value, onChange, multiline }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      placeholderTextColor={Colors.textTertiary}
      testID={`admin-field-${label}`}
    />
  </View>
);

interface PresetCardProps {
  preset: SettingPreset;
  onUpdate: (id: string, field: keyof SettingPreset, value: string | boolean | AutomationMode) => void;
  onEditAuto: (id: string) => void;
}
const PresetCard: React.FC<PresetCardProps> = React.memo(({ preset, onUpdate, onEditAuto }) => (
  <View style={styles.presetCard}>
    <View style={styles.presetHeader}>
      <Text style={styles.presetMoisture}>{preset.moisture}</Text>
      {preset.isFoodGrade && (
        <View style={styles.foodGradeBadge}>
          <Text style={styles.foodGradeBadgeText}>Food-Grade</Text>
        </View>
      )}
    </View>
    <FieldInput label="Concave" value={preset.concave} onChange={v => onUpdate(preset.id, 'concave', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Rotor Speed" value={preset.rotor} onChange={v => onUpdate(preset.id, 'rotor', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Fan Speed" value={preset.fan} onChange={v => onUpdate(preset.id, 'fan', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Top Sieve" value={preset.topSieve} onChange={v => onUpdate(preset.id, 'topSieve', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Bottom Sieve" value={preset.bottomSieve} onChange={v => onUpdate(preset.id, 'bottomSieve', v)} />
    <View style={styles.cardDivider} />
    <TouchableOpacity style={styles.autoRow} onPress={() => onEditAuto(preset.id)} activeOpacity={0.7}>
      <Text style={styles.fieldLabel}>Automation Mode</Text>
      <View style={styles.autoRowRight}>
        <Text style={styles.autoValue}>{preset.automationMode}</Text>
        <ChevronRight size={16} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
    <View style={styles.cardDivider} />
    <FieldInput label="Notes" value={preset.notes} onChange={v => onUpdate(preset.id, 'notes', v)} multiline />
  </View>
));

interface TipCardProps {
  tip: QuickTip;
  onUpdate: (id: string, field: keyof QuickTip, value: string) => void;
  onDelete: (id: string) => void;
}
const TipCard: React.FC<TipCardProps> = React.memo(({ tip, onUpdate, onDelete }) => (
  <View style={styles.presetCard}>
    <View style={styles.presetHeader}>
      <Text style={styles.presetMoisture}>Quick Tip</Text>
      <TouchableOpacity onPress={() => onDelete(tip.id)} style={styles.deleteRowBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Trash2 size={16} color={Colors.redBright} />
      </TouchableOpacity>
    </View>
    <FieldInput label="Title" value={tip.title} onChange={v => onUpdate(tip.id, 'title', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Subtitle" value={tip.subtitle} onChange={v => onUpdate(tip.id, 'subtitle', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Icon" value={tip.icon} onChange={v => onUpdate(tip.id, 'icon', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Content" value={tip.content} onChange={v => onUpdate(tip.id, 'content', v)} multiline />
  </View>
));

interface IssueCardProps {
  issue: QuickIssue;
  onUpdate: (id: string, field: keyof QuickIssue, value: string) => void;
  onDelete: (id: string) => void;
}
const IssueCard: React.FC<IssueCardProps> = React.memo(({ issue, onUpdate, onDelete }) => (
  <View style={styles.presetCard}>
    <View style={styles.presetHeader}>
      <Text style={styles.presetMoisture}>Quick Issue</Text>
      <TouchableOpacity onPress={() => onDelete(issue.id)} style={styles.deleteRowBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Trash2 size={16} color={Colors.redBright} />
      </TouchableOpacity>
    </View>
    <FieldInput label="Label" value={issue.label} onChange={v => onUpdate(issue.id, 'label', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Icon" value={issue.icon} onChange={v => onUpdate(issue.id, 'icon', v)} />
    <View style={styles.cardDivider} />
    <FieldInput label="Response" value={issue.response} onChange={v => onUpdate(issue.id, 'response', v)} multiline />
  </View>
));

export default function AdminScreen() {
  const router = useRouter();
  const { settingPresets, quickTips, quickIssues, savePresets, saveTips, saveIssues } = useApp();

  const [localPresets, setLocalPresets] = useState<SettingPreset[]>(() => [...settingPresets]);
  const [localTips, setLocalTips] = useState<QuickTip[]>(() => [...quickTips]);
  const [localIssues, setLocalIssues] = useState<QuickIssue[]>(() => [...quickIssues]);

  const [segment, setSegment] = useState(0);
  const [cropFilter, setCropFilter] = useState<CropType>('Corn');
  const [foodGradeFilter, setFoodGradeFilter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cropPickerOpen, setCropPickerOpen] = useState(false);
  const [editingAutoPresetId, setEditingAutoPresetId] = useState<string | null>(null);

  const filteredPresets = localPresets.filter(p => {
    if (p.crop !== cropFilter) return false;
    if (cropFilter === 'Corn') return p.isFoodGrade === foodGradeFilter;
    return !p.isFoodGrade;
  });

  const updatePreset = useCallback((id: string, field: keyof SettingPreset, value: string | boolean | AutomationMode) => {
    setLocalPresets(prev => prev.map(p => p.id === id ? { ...p, [field]: value } as SettingPreset : p));
  }, []);

  const handleSavePresets = useCallback(async () => {
    setIsSaving(true);
    await savePresets(localPresets);
    setIsSaving(false);
    Alert.alert('Saved', 'Setting presets updated.');
  }, [localPresets, savePresets]);

  const updateTip = useCallback((id: string, field: keyof QuickTip, value: string) => {
    setLocalTips(prev => prev.map(t => t.id === id ? { ...t, [field]: value } as QuickTip : t));
  }, []);

  const deleteTip = useCallback((id: string) => {
    setLocalTips(prev => prev.filter(t => t.id !== id));
  }, []);

  const addTip = useCallback(() => {
    const newTip: QuickTip = { id: `tip-${Date.now()}`, title: 'New Tip', subtitle: 'Subtitle', icon: 'lightbulb', content: 'Enter content here.' };
    setLocalTips(prev => [...prev, newTip]);
  }, []);

  const handleSaveTips = useCallback(async () => {
    setIsSaving(true);
    await saveTips(localTips);
    setIsSaving(false);
    Alert.alert('Saved', 'Quick tips updated.');
  }, [localTips, saveTips]);

  const updateIssue = useCallback((id: string, field: keyof QuickIssue, value: string) => {
    setLocalIssues(prev => prev.map(i => i.id === id ? { ...i, [field]: value } as QuickIssue : i));
  }, []);

  const deleteIssue = useCallback((id: string) => {
    setLocalIssues(prev => prev.filter(i => i.id !== id));
  }, []);

  const addIssue = useCallback(() => {
    const newIssue: QuickIssue = { id: `issue-${Date.now()}`, label: 'New Issue', icon: 'alert-triangle', response: 'Enter response here.' };
    setLocalIssues(prev => [...prev, newIssue]);
  }, []);

  const handleSaveIssues = useCallback(async () => {
    setIsSaving(true);
    await saveIssues(localIssues);
    setIsSaving(false);
    Alert.alert('Saved', 'Quick issues updated.');
  }, [localIssues, saveIssues]);

  const editingPreset = editingAutoPresetId ? localPresets.find(p => p.id === editingAutoPresetId) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn} testID="admin-done">
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.segmentWrap}>
        <SegmentedControl options={['Settings', 'Tips', 'Issues']} selectedIndex={segment} onChange={setSegment} />
      </View>

      {segment === 0 && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.filterBar}>
            <TouchableOpacity style={styles.filterPicker} onPress={() => setCropPickerOpen(true)} activeOpacity={0.7}>
              <Text style={styles.filterLabel}>Crop:</Text>
              <Text style={styles.filterValue}>{cropFilter}</Text>
              <ChevronRight size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
            {cropFilter === 'Corn' && (
              <View style={styles.filterToggle}>
                <Text style={styles.filterLabel}>Food-Grade</Text>
                <Switch
                  value={foodGradeFilter}
                  onValueChange={setFoodGradeFilter}
                  trackColor={{ false: Colors.border, true: Colors.red }}
                  thumbColor={Platform.OS === 'android' ? Colors.text : undefined}
                />
              </View>
            )}
          </View>
          <Text style={styles.sectionNote}>{filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''} for {cropFilter}{foodGradeFilter ? ' (Food-Grade)' : ''}</Text>
          {filteredPresets.map(preset => (
            <PresetCard key={preset.id} preset={preset} onUpdate={updatePreset} onEditAuto={setEditingAutoPresetId} />
          ))}
          <TouchableOpacity style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} onPress={handleSavePresets} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
          <View style={styles.bottomPad} />
        </ScrollView>
      )}

      {segment === 1 && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.addBtn} onPress={addTip} activeOpacity={0.7}>
            <Plus size={18} color={Colors.red} />
            <Text style={styles.addBtnText}>Add Tip</Text>
          </TouchableOpacity>
          {localTips.map(tip => <TipCard key={tip.id} tip={tip} onUpdate={updateTip} onDelete={deleteTip} />)}
          <TouchableOpacity style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} onPress={handleSaveTips} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
          <View style={styles.bottomPad} />
        </ScrollView>
      )}

      {segment === 2 && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.addBtn} onPress={addIssue} activeOpacity={0.7}>
            <Plus size={18} color={Colors.red} />
            <Text style={styles.addBtnText}>Add Issue</Text>
          </TouchableOpacity>
          {localIssues.map(issue => <IssueCard key={issue.id} issue={issue} onUpdate={updateIssue} onDelete={deleteIssue} />)}
          <TouchableOpacity style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} onPress={handleSaveIssues} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
          <View style={styles.bottomPad} />
        </ScrollView>
      )}

      <PickerModal visible={cropPickerOpen} title="Filter by Crop" options={CROP_TYPES} value={cropFilter} onSelect={val => setCropFilter(val as CropType)} onClose={() => setCropPickerOpen(false)} />
      <PickerModal
        visible={editingAutoPresetId !== null}
        title="Automation Mode"
        options={AUTO_MODES}
        value={editingPreset?.automationMode ?? 'Balanced'}
        onSelect={val => { if (editingAutoPresetId) updatePreset(editingAutoPresetId, 'automationMode', val as AutomationMode); setEditingAutoPresetId(null); }}
        onClose={() => setEditingAutoPresetId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  doneBtn: { paddingVertical: 4, paddingHorizontal: 2, minWidth: 60 },
  doneBtnText: { fontSize: 17, fontWeight: '600', color: Colors.red },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  headerSpacer: { minWidth: 60 },
  segmentWrap: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surfaceElevated, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10, flexWrap: 'wrap' },
  filterPicker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filterValue: { fontSize: 14, color: Colors.text, fontWeight: '700' },
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  sectionNote: { fontSize: 12, color: Colors.textTertiary, marginBottom: 4 },
  presetCard: { backgroundColor: Colors.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  presetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  presetMoisture: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.3 },
  foodGradeBadge: { backgroundColor: Colors.warning + '25', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.warning + '60' },
  foodGradeBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.warning },
  deleteRowBtn: { padding: 4 },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: 14 },
  fieldRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, letterSpacing: 0.8, textTransform: 'uppercase' },
  fieldInput: { fontSize: 14, color: Colors.text, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  fieldInputMulti: { minHeight: 60, textAlignVertical: 'top' },
  autoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14 },
  autoRowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  autoValue: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.red, borderStyle: 'dashed' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: Colors.red },
  saveBtn: { backgroundColor: Colors.red, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  bottomPad: { height: 20 },
});
