import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import {
  Lightbulb,
  Search,
  Wind,
  AlertTriangle,
  Layers,
  Cpu,
  Droplets,
  CheckSquare,
  Shield,
  Info,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { QuickTip } from '@/types';

const ICON_MAP: Record<string, React.FC<{ size: number; color: string }>> = {
  lightbulb: ({ size, color }) => <Lightbulb size={size} color={color} />,
  search: ({ size, color }) => <Search size={size} color={color} />,
  wind: ({ size, color }) => <Wind size={size} color={color} />,
  'alert-triangle': ({ size, color }) => <AlertTriangle size={size} color={color} />,
  layers: ({ size, color }) => <Layers size={size} color={color} />,
  cpu: ({ size, color }) => <Cpu size={size} color={color} />,
  droplets: ({ size, color }) => <Droplets size={size} color={color} />,
  'check-square': ({ size, color }) => <CheckSquare size={size} color={color} />,
  shield: ({ size, color }) => <Shield size={size} color={color} />,
  default: ({ size, color }) => <Info size={size} color={color} />,
};

function TipIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const IconComp = ICON_MAP[name] ?? ICON_MAP.default;
  return <IconComp size={size} color={color} />;
}

interface QuickTipCardProps {
  tip: QuickTip;
}

export const QuickTipCard: React.FC<QuickTipCardProps> = ({ tip }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.75}
        testID={`tip-card-${tip.id}`}
      >
        <View style={styles.iconWrap}>
          <TipIcon name={tip.icon} size={22} color={Colors.red} />
        </View>
        <Text style={styles.title} numberOfLines={2}>{tip.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{tip.subtitle}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <TipIcon name={tip.icon} size={24} color={Colors.red} />
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>{tip.title}</Text>
                <Text style={styles.modalSubtitle}>{tip.subtitle}</Text>
              </View>
            </View>
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              bounces={Platform.OS !== 'web'}
            >
              <Text style={styles.contentText}>{tip.content}</Text>
              <View style={styles.bottomPad} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 148,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    backgroundColor: Colors.redMuted,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
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
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: Colors.redMuted,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contentText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  bottomPad: {
    height: 40,
  },
});
