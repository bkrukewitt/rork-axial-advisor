import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface PickerModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: T[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  renderLabel?: (option: T) => string;
}

function PickerModalInner<T extends string>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
  renderLabel,
}: PickerModalProps<T>) {
  const getLabel = useCallback((opt: T) => renderLabel ? renderLabel(opt) : opt, [renderLabel]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="picker-close">
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            bounces={Platform.OS !== 'web'}
          >
            {options.map(opt => {
              const selected = opt === value;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => { onSelect(opt); onClose(); }}
                  testID={`picker-option-${opt}`}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {getLabel(opt)}
                  </Text>
                  {selected && <Check size={18} color={Colors.red} />}
                </TouchableOpacity>
              );
            })}
            <View style={styles.bottomPad} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const PickerModal = React.memo(PickerModalInner) as typeof PickerModalInner;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    paddingTop: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.redMuted,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.red,
    fontWeight: '600',
  },
  bottomPad: {
    height: 32,
  },
});
