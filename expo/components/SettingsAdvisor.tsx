import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppContext';
import { generateRecommendation } from '@/services/recommendation';
import {
  AdvisorFormState,
  CombineModel,
  HeaderType,
  CropType,
  MoistureLevel,
  YieldEstimate,
  COMBINE_MODELS,
  HEADER_TYPES,
  CROP_TYPES,
  MOISTURE_LEVELS,
  YIELD_ESTIMATES,
  RecommendationResult,
  SavedSetup,
} from '@/types';
import { PickerModal } from '@/components/PickerModal';
import { ResultsBlock } from '@/components/ResultsBlock';
import { QuickTipCard } from '@/components/QuickTipCard';

const DEFAULT_FORM: AdvisorFormState = {
  combineModel: '8250',
  headerType: 'Corn Head',
  crop: 'Corn',
  moisture: '13\u201316%',
  yieldEstimate: '150\u2013200 bu/ac',
  isFoodGrade: false,
};

interface PickerRowProps {
  label: string;
  value: string;
  onPress: () => void;
}

const PickerRow: React.FC<PickerRowProps> = React.memo(({ label, value, onPress }) => (
  <TouchableOpacity style={styles.pickerRow} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.pickerLabel}>{label}</Text>
    <View style={styles.pickerValueWrap}>
      <Text style={styles.pickerValue}>{value}</Text>
      <ChevronRight size={16} color={Colors.textTertiary} />
    </View>
  </TouchableOpacity>
));

type ActivePicker = 'combineModel' | 'headerType' | 'crop' | 'moisture' | 'yieldEstimate' | null;

export const SettingsAdvisor: React.FC = () => {
  const { settingPresets, quickTips, addSavedSetup } = useApp();
  const [form, setForm] = useState<AdvisorFormState>(DEFAULT_FORM);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [fieldName, setFieldName] = useState('');

  const updateForm = useCallback((update: Partial<AdvisorFormState>) => {
    setForm(prev => ({ ...prev, ...update }));
    setResult(null);
  }, []);

  const handleShowSettings = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const rec = generateRecommendation(form, settingPresets);
    setResult(rec);
  }, [form, settingPresets]);

  const handleSaveConfirm = useCallback(async () => {
    if (!result || !fieldName.trim()) return;
    const setup: SavedSetup = {
      id: `setup-${Date.now()}`,
      fieldName: fieldName.trim(),
      date: new Date().toISOString(),
      combineModel: form.combineModel,
      headerType: form.headerType,
      crop: form.crop,
      moisture: form.moisture,
      yieldEstimate: form.yieldEstimate,
      concave: result.concave,
      rotor: result.rotor,
      fan: result.fan,
      topSieve: result.topSieve,
      bottomSieve: result.bottomSieve,
      automationMode: result.automationMode,
      notes: result.notes,
      sampleQualityRating: 0,
      isFoodGrade: form.isFoodGrade,
    };
    await addSavedSetup(setup);
    setShowSaveModal(false);
    setFieldName('');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved!', `"${setup.fieldName}" has been saved to your Logs.`);
  }, [result, fieldName, form, addSavedSetup]);

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>QUICK TIPS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsContent}
          style={styles.tipsScroll}
        >
          {quickTips.map(tip => (
            <QuickTipCard key={tip.id} tip={tip} />
          ))}
          <View style={styles.tipsEnd} />
        </ScrollView>

        <Text style={styles.sectionLabel}>COMBINE SETUP</Text>
        <View style={styles.card}>
          <PickerRow
            label="Combine Model"
            value={form.combineModel}
            onPress={() => setActivePicker('combineModel')}
          />
          <View style={styles.cardDivider} />
          <PickerRow
            label="Header Type"
            value={form.headerType}
            onPress={() => setActivePicker('headerType')}
          />
        </View>

        <Text style={styles.sectionLabel}>CROP CONDITIONS</Text>
        <View style={styles.card}>
          <PickerRow
            label="Crop"
            value={form.crop}
            onPress={() => setActivePicker('crop')}
          />
          <View style={styles.cardDivider} />
          <PickerRow
            label="Moisture Level"
            value={form.moisture}
            onPress={() => setActivePicker('moisture')}
          />
          <View style={styles.cardDivider} />
          <PickerRow
            label="Yield Estimate"
            value={form.yieldEstimate}
            onPress={() => setActivePicker('yieldEstimate')}
          />
          {form.crop === 'Corn' && (
            <>
              <View style={styles.cardDivider} />
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Food-Grade Mode</Text>
                  <Text style={styles.toggleDesc}>Tighter settings for premium quality</Text>
                </View>
                <Switch
                  value={form.isFoodGrade}
                  onValueChange={val => updateForm({ isFoodGrade: val })}
                  trackColor={{ false: Colors.border, true: Colors.red }}
                  thumbColor={Platform.OS === 'android' ? Colors.text : undefined}
                />
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.showBtn}
          onPress={handleShowSettings}
          activeOpacity={0.85}
          testID="show-settings-btn"
        >
          <Sparkles size={20} color={Colors.text} />
          <Text style={styles.showBtnText}>Show Settings</Text>
        </TouchableOpacity>

        {result && (
          <ResultsBlock
            result={result}
            onSave={() => { setFieldName(''); setShowSaveModal(true); }}
          />
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      <PickerModal
        visible={activePicker === 'combineModel'}
        title="Combine Model"
        options={COMBINE_MODELS}
        value={form.combineModel}
        onSelect={val => updateForm({ combineModel: val as CombineModel })}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'headerType'}
        title="Header Type"
        options={HEADER_TYPES}
        value={form.headerType}
        onSelect={val => updateForm({ headerType: val as HeaderType })}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'crop'}
        title="Crop"
        options={CROP_TYPES}
        value={form.crop}
        onSelect={val => {
          const crop = val as CropType;
          const update: Partial<AdvisorFormState> = { crop };
          if (crop !== 'Corn') update.isFoodGrade = false;
          updateForm(update);
        }}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'moisture'}
        title="Moisture Level"
        options={MOISTURE_LEVELS}
        value={form.moisture}
        onSelect={val => updateForm({ moisture: val as MoistureLevel })}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'yieldEstimate'}
        title="Yield Estimate"
        options={YIELD_ESTIMATES}
        value={form.yieldEstimate}
        onSelect={val => updateForm({ yieldEstimate: val as YieldEstimate })}
        onClose={() => setActivePicker(null)}
      />

      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <Pressable style={styles.saveOverlay} onPress={() => setShowSaveModal(false)}>
          <Pressable style={styles.saveDialog} onPress={() => {}}>
            <Text style={styles.saveTitle}>Save Setup</Text>
            <Text style={styles.saveSub}>Enter a name to save these settings to your Logs.</Text>
            <TextInput
              style={styles.saveInput}
              value={fieldName}
              onChangeText={setFieldName}
              placeholder="e.g. North Field, Section 4"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveConfirm}
              testID="field-name-input"
            />
            <View style={styles.saveActions}>
              <TouchableOpacity style={styles.saveCancelBtn} onPress={() => setShowSaveModal(false)}>
                <Text style={styles.saveCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveConfirmBtn, !fieldName.trim() && styles.saveConfirmDisabled]}
                onPress={handleSaveConfirm}
                disabled={!fieldName.trim()}
              >
                <Text style={styles.saveConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
  },
  tipsScroll: {
    marginHorizontal: -16,
  },
  tipsContent: {
    paddingLeft: 16,
    paddingVertical: 2,
  },
  tipsEnd: {
    width: 6,
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  pickerLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  pickerValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pickerValue: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  showBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.red,
    borderRadius: 14,
    paddingVertical: 17,
    marginTop: 20,
  },
  showBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  bottomPad: {
    height: 40,
  },
  saveOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  saveDialog: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 18,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  saveSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  saveInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  saveActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  saveCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveConfirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: Colors.red,
    alignItems: 'center',
  },
  saveConfirmDisabled: {
    opacity: 0.4,
  },
  saveConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
});
