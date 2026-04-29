import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, ChevronRight, RotateCcw } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { SettingPreset, AutomationMode, CropType } from '@/types';
import { PickerModal } from '@/components/PickerModal';
import { DEFAULT_PRESETS } from '@/mocks/presets';

const AUTO_MODES: AutomationMode[] = ['Quality Priority', 'Throughput Priority', 'Balanced'];

const CROP_COLOR: Record<CropType, string> = {
  Corn: '#F5A623',
  Soybeans: '#30D158',
  Wheat: '#D4A76A',
  Canola: '#A8C256',
  Oats: '#C4A15E',
  Barley: '#9B8B6E',
  Sorghum: '#BF5AF2',
};

interface FieldRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  defaultValue?: string;
  onRevert?: () => void;
  multiline?: boolean;
  testId?: string;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value, onChange, defaultValue, onRevert, multiline, testId }) => {
  const isChanged = defaultValue !== undefined && value !== defaultValue;
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isChanged && onRevert && (
          <TouchableOpacity onPress={onRevert} style={styles.revertBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <RotateCcw size={11} color={Colors.warning} />
            <Text style={styles.revertBtnText}>Revert</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti, isChanged && styles.fieldInputChanged]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        placeholderTextColor={Colors.textTertiary}
        testID={testId}
      />
      {isChanged && defaultValue !== undefined && (
        <Text style={styles.defaultHint}>Default: {defaultValue}</Text>
      )}
    </View>
  );
};

interface PresetEditModalProps {
  preset: SettingPreset | null;
  visible: boolean;
  onSave: (updated: SettingPreset) => void;
  onClose: () => void;
}

export const PresetEditModal: React.FC<PresetEditModalProps> = ({
  preset,
  visible,
  onSave,
  onClose,
}) => {
  const [local, setLocal] = useState<SettingPreset | null>(null);
  const [autoPickerOpen, setAutoPickerOpen] = useState(false);

  const defaultPreset = preset ? DEFAULT_PRESETS.find(d => d.id === preset.id) ?? null : null;

  const handleShow = useCallback(() => {
    if (preset) setLocal({ ...preset });
  }, [preset]);

  const handleClose = useCallback(() => {
    setAutoPickerOpen(false);
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (local) {
      onSave(local);
    }
  }, [local, onSave]);

  const update = useCallback(<K extends keyof SettingPreset>(field: K, value: SettingPreset[K]) => {
    setLocal(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const revert = useCallback(<K extends keyof SettingPreset>(field: K) => {
    if (defaultPreset) {
      setLocal(prev => prev ? { ...prev, [field]: defaultPreset[field] } : prev);
    }
  }, [defaultPreset]);

  if (!preset) return null;

  const cropColor = CROP_COLOR[preset.crop];
  const autoIsChanged = defaultPreset && local?.automationMode !== defaultPreset.automationMode;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        onShow={handleShow}
      >
        <KeyboardAvoidingView
          style={styles.kavWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.overlay} onPress={handleClose}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.cropBadge, { backgroundColor: cropColor + '20', borderColor: cropColor + '50' }]}>
                    <Text style={[styles.cropBadgeText, { color: cropColor }]}>{preset.crop}</Text>
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>{local?.moisture ?? preset.moisture}</Text>
                    {preset.isFoodGrade && (
                      <Text style={styles.foodGradeLabel}>Food-Grade</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn} testID="preset-edit-close">
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <FieldRow
                  label="Concave Clearance"
                  value={local?.concave ?? ''}
                  onChange={v => update('concave', v)}
                  defaultValue={defaultPreset?.concave}
                  onRevert={() => revert('concave')}
                  testId="edit-concave"
                />
                <View style={styles.divider} />
                <FieldRow
                  label="Rotor Speed"
                  value={local?.rotor ?? ''}
                  onChange={v => update('rotor', v)}
                  defaultValue={defaultPreset?.rotor}
                  onRevert={() => revert('rotor')}
                  testId="edit-rotor"
                />
                <View style={styles.divider} />
                <FieldRow
                  label="Fan Speed"
                  value={local?.fan ?? ''}
                  onChange={v => update('fan', v)}
                  defaultValue={defaultPreset?.fan}
                  onRevert={() => revert('fan')}
                  testId="edit-fan"
                />
                <View style={styles.divider} />
                <FieldRow
                  label="Top Sieve"
                  value={local?.topSieve ?? ''}
                  onChange={v => update('topSieve', v)}
                  defaultValue={defaultPreset?.topSieve}
                  onRevert={() => revert('topSieve')}
                  testId="edit-topSieve"
                />
                <View style={styles.divider} />
                <FieldRow
                  label="Bottom Sieve"
                  value={local?.bottomSieve ?? ''}
                  onChange={v => update('bottomSieve', v)}
                  defaultValue={defaultPreset?.bottomSieve}
                  onRevert={() => revert('bottomSieve')}
                  testId="edit-bottomSieve"
                />
                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.autoRow}
                  onPress={() => setAutoPickerOpen(true)}
                  activeOpacity={0.7}
                  testID="edit-autoMode"
                >
                  <View style={styles.autoLabelCol}>
                    <Text style={styles.fieldLabel}>Automation Mode</Text>
                    {autoIsChanged && defaultPreset && (
                      <Text style={styles.defaultHint}>Default: {defaultPreset.automationMode}</Text>
                    )}
                  </View>
                  <View style={styles.autoRowRight}>
                    {autoIsChanged && (
                      <TouchableOpacity
                        onPress={() => revert('automationMode')}
                        style={styles.revertBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <RotateCcw size={11} color={Colors.warning} />
                        <Text style={styles.revertBtnText}>Revert</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={[styles.autoValue, autoIsChanged && styles.autoValueChanged]}>
                      {local?.automationMode ?? preset.automationMode}
                    </Text>
                    <ChevronRight size={16} color={Colors.textTertiary} />
                  </View>
                </TouchableOpacity>
                <View style={styles.divider} />

                <FieldRow
                  label="Notes"
                  value={local?.notes ?? ''}
                  onChange={v => update('notes', v)}
                  defaultValue={defaultPreset?.notes}
                  onRevert={() => revert('notes')}
                  multiline
                  testId="edit-notes"
                />

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} testID="edit-cancel">
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave} testID="edit-save">
                    <Text style={styles.saveText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomPad} />
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <PickerModal
        visible={autoPickerOpen}
        title="Automation Mode"
        options={AUTO_MODES}
        value={local?.automationMode ?? preset.automationMode}
        onSelect={val => update('automationMode', val as AutomationMode)}
        onClose={() => setAutoPickerOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  kavWrapper: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 8,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cropBadge: {
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  cropBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  foodGradeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warning,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: 0,
  },
  fieldRow: {
    paddingVertical: 13,
    gap: 5,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  revertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.warning + '18',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  revertBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.warning,
    letterSpacing: 0.3,
  },
  fieldInput: {
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  fieldInputChanged: {
    color: Colors.warning,
    borderBottomColor: Colors.warning + '60',
  },
  fieldInputMulti: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  defaultHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  autoLabelCol: {
    gap: 2,
    flex: 1,
  },
  autoRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autoValue: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  autoValueChanged: {
    color: Colors.warning,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 13,
    backgroundColor: Colors.red,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  bottomPad: {
    height: 32,
  },
});
