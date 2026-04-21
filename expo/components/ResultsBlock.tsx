import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, Zap, BarChart2, Save, Wheat } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { RecommendationResult, AutomationMode } from '@/types';

interface SettingRowProps {
  label: string;
  value: string;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, value }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.settingValue}>{value}</Text>
  </View>
);

type AutoConfig = {
  icon: React.FC<{ size: number; color: string }>;
  color: string;
  bg: string;
};

const AUTOMATION_CONFIG: Record<AutomationMode, AutoConfig> = {
  'Quality Priority': {
    icon: ({ size, color }) => <Shield size={size} color={color} />,
    color: '#34C759',
    bg: 'rgba(52,199,89,0.15)',
  },
  'Throughput Priority': {
    icon: ({ size, color }) => <Zap size={size} color={color} />,
    color: '#FF9F0A',
    bg: 'rgba(255,159,10,0.15)',
  },
  'Balanced': {
    icon: ({ size, color }) => <BarChart2 size={size} color={color} />,
    color: '#0A84FF',
    bg: 'rgba(10,132,255,0.15)',
  },
};

interface ResultsBlockProps {
  result: RecommendationResult;
  onSave: () => void;
}

export const ResultsBlock: React.FC<ResultsBlockProps> = ({ result, onSave }) => {
  const autoConfig = AUTOMATION_CONFIG[result.automationMode];
  const AutoIcon = autoConfig.icon;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>RECOMMENDED SETTINGS</Text>

      <View style={styles.card}>
        <SettingRow label="Concave Clearance" value={result.concave} />
        <View style={styles.divider} />
        <SettingRow label="Rotor Speed" value={result.rotor} />
        <View style={styles.divider} />
        <SettingRow label="Fan Speed" value={result.fan} />
        <View style={styles.divider} />
        <SettingRow label="Top Sieve" value={result.topSieve} />
        <View style={styles.divider} />
        <SettingRow label="Bottom Sieve" value={result.bottomSieve} />
      </View>

      <Text style={styles.sectionTitle}>AUTOMATION MODE</Text>
      <View style={[styles.autoCard, { borderColor: autoConfig.color + '50' }]}>
        <View style={[styles.autoIconWrap, { backgroundColor: autoConfig.bg }]}>
          <AutoIcon size={22} color={autoConfig.color} />
        </View>
        <View style={styles.autoContent}>
          <Text style={[styles.autoMode, { color: autoConfig.color }]}>{result.automationMode}</Text>
          <Text style={styles.autoDesc}>{result.automationDescription}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>FIELD NOTES</Text>
      <View style={styles.notesCard}>
        <Text style={styles.notesText}>{result.notes}</Text>
      </View>

      {result.foodGradeNotes && (
        <>
          <Text style={styles.sectionTitle}>FOOD-GRADE MODE</Text>
          <View style={[styles.notesCard, styles.foodCard]}>
            <View style={styles.foodHeader}>
              <Wheat size={16} color={Colors.warning} />
              <Text style={styles.foodTitle}>Food-Grade Active</Text>
            </View>
            <Text style={styles.notesText}>{result.foodGradeNotes}</Text>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.8} testID="save-setup-btn">
        <Save size={18} color={Colors.text} />
        <Text style={styles.saveBtnText}>Save Setup to Logs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  autoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  autoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  autoContent: {
    flex: 1,
  },
  autoMode: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  autoDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  notesCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  foodCard: {
    borderColor: Colors.warning + '50',
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  foodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.warning,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.red,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});
