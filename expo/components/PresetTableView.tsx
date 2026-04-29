import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { SettingPreset, CropType, CROP_TYPES } from '@/types';

interface PresetTableViewProps {
  presets: SettingPreset[];
  onEdit: (preset: SettingPreset) => void;
}

const CROP_COLOR: Record<CropType, string> = {
  Corn: '#F5A623',
  Soybeans: '#30D158',
  Wheat: '#D4A76A',
  Canola: '#A8C256',
  Oats: '#C4A15E',
  Barley: '#9B8B6E',
  Sorghum: '#BF5AF2',
};

const MODE_SHORT: Record<string, string> = {
  'Quality Priority': 'Quality',
  'Throughput Priority': 'Thruput',
  Balanced: 'Balanced',
};

const MODE_COLOR: Record<string, string> = {
  'Quality Priority': Colors.success,
  'Throughput Priority': Colors.info,
  Balanced: Colors.warning,
};

const LABEL_W = 126;
const COL = {
  concave: 76,
  rotor: 94,
  fan: 94,
  topSieve: 72,
  bottomSieve: 72,
  mode: 78,
};

export const PresetTableView: React.FC<PresetTableViewProps> = ({ presets, onEdit }) => {
  const groups = CROP_TYPES
    .map(crop => ({ crop, rows: presets.filter(p => p.crop === crop) }))
    .filter(g => g.rows.length > 0);

  return (
    <ScrollView
      style={styles.outerScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        <View>
          {/* Table header */}
          <View style={styles.headerRow}>
            <View style={[styles.cell, { width: LABEL_W, borderRightWidth: 1, borderRightColor: Colors.borderLight }]}>
              <Text style={styles.headerText}>CROP / MOISTURE</Text>
            </View>
            <View style={[styles.cell, { width: COL.concave }]}>
              <Text style={styles.headerText}>CONCAVE</Text>
            </View>
            <View style={[styles.cell, { width: COL.rotor }]}>
              <Text style={styles.headerText}>ROTOR</Text>
            </View>
            <View style={[styles.cell, { width: COL.fan }]}>
              <Text style={styles.headerText}>FAN</Text>
            </View>
            <View style={[styles.cell, { width: COL.topSieve }]}>
              <Text style={styles.headerText}>TOP SIEVE</Text>
            </View>
            <View style={[styles.cell, { width: COL.bottomSieve }]}>
              <Text style={styles.headerText}>BOT SIEVE</Text>
            </View>
            <View style={[styles.cell, { width: COL.mode, borderRightWidth: 0 }]}>
              <Text style={styles.headerText}>MODE</Text>
            </View>
          </View>

          {/* Groups */}
          {groups.map(({ crop, rows }) => {
            const color = CROP_COLOR[crop];
            return (
              <View key={crop}>
                {/* Crop group label */}
                <View style={[styles.groupHeader, { borderLeftColor: color }]}>
                  <View style={[styles.cropDot, { backgroundColor: color }]} />
                  <Text style={[styles.groupHeaderText, { color }]}>{crop.toUpperCase()}</Text>
                  <Text style={styles.groupCount}>{rows.length} preset{rows.length !== 1 ? 's' : ''}</Text>
                </View>

                {/* Rows */}
                {rows.map((preset, idx) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={[styles.dataRow, idx % 2 === 1 && styles.dataRowAlt]}
                    onPress={() => onEdit(preset)}
                    activeOpacity={0.6}
                    testID={`table-row-${preset.id}`}
                  >
                    {/* Label cell */}
                    <View style={[styles.cell, styles.labelCell, { borderRightColor: color + '50' }]}>
                      <View style={[styles.moistureBadge, { borderColor: color + '55', backgroundColor: color + '18' }]}>
                        <Text style={[styles.moistureText, { color }]}>{preset.moisture}</Text>
                      </View>
                      {preset.isFoodGrade && (
                        <Text style={styles.fgTag}>FOOD-GRADE</Text>
                      )}
                    </View>

                    {/* Concave */}
                    <View style={[styles.cell, { width: COL.concave }]}>
                      <Text style={styles.dataText}>{preset.concave}</Text>
                    </View>

                    {/* Rotor */}
                    <View style={[styles.cell, { width: COL.rotor }]}>
                      <Text style={styles.dataText}>{preset.rotor}</Text>
                    </View>

                    {/* Fan */}
                    <View style={[styles.cell, { width: COL.fan }]}>
                      <Text style={styles.dataText}>{preset.fan}</Text>
                    </View>

                    {/* Top Sieve */}
                    <View style={[styles.cell, { width: COL.topSieve }]}>
                      <Text style={styles.dataText}>{preset.topSieve}</Text>
                    </View>

                    {/* Bottom Sieve */}
                    <View style={[styles.cell, { width: COL.bottomSieve }]}>
                      <Text style={styles.dataText}>{preset.bottomSieve}</Text>
                    </View>

                    {/* Mode */}
                    <View style={[styles.cell, { width: COL.mode, borderRightWidth: 0 }]}>
                      <View style={[styles.modeBadge, { backgroundColor: MODE_COLOR[preset.automationMode] + '20' }]}>
                        <Text style={[styles.modeText, { color: MODE_COLOR[preset.automationMode] }]}>
                          {MODE_SHORT[preset.automationMode]}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerScroll: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.borderLight,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderLeftWidth: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  cropDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  groupHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  groupCount: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  dataRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  dataRowAlt: {
    backgroundColor: Colors.surface,
  },
  cell: {
    paddingVertical: 11,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Colors.border,
  },
  labelCell: {
    width: LABEL_W,
    alignItems: 'flex-start',
    borderRightWidth: 1,
  },
  headerText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.7,
    textAlign: 'center',
  },
  moistureBadge: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  moistureText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  fgTag: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.warning,
    letterSpacing: 0.6,
    marginTop: 4,
  },
  dataText: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  modeBadge: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
