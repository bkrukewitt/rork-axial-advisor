import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Trash2, ChevronRight, BookOpen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppContext';
import { StarsRating } from '@/components/StarsRating';
import { SavedSetup } from '@/types';

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

const CROP_COLORS: Record<string, string> = {
  Corn: '#FF9F0A',
  Soybeans: '#34C759',
  Wheat: '#FFD60A',
  Canola: '#30D158',
  Oats: '#64D2FF',
  Barley: '#BF5AF2',
  Sorghum: '#FF6961',
};

interface LogItemProps {
  setup: SavedSetup;
  onPress: () => void;
  onDelete: () => void;
}

const LogItem: React.FC<LogItemProps> = React.memo(({ setup, onPress, onDelete }) => {
  const cropColor = CROP_COLORS[setup.crop] ?? Colors.textSecondary;
  return (
    <TouchableOpacity
      style={styles.logItem}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`log-item-${setup.id}`}
    >
      <View style={[styles.cropStripe, { backgroundColor: cropColor }]} />
      <View style={styles.logContent}>
        <View style={styles.logTop}>
          <Text style={styles.logFieldName} numberOfLines={1}>{setup.fieldName}</Text>
          <View style={[styles.cropBadge, { backgroundColor: cropColor + '25', borderColor: cropColor + '60' }]}>
            <Text style={[styles.cropBadgeText, { color: cropColor }]}>{setup.crop}</Text>
          </View>
        </View>
        <View style={styles.logMeta}>
          <Text style={styles.logDate}>{formatDate(setup.date)}</Text>
          <Text style={styles.logDot}>·</Text>
          <Text style={styles.logMetaText}>{setup.combineModel}</Text>
          <Text style={styles.logDot}>·</Text>
          <Text style={styles.logMetaText}>{setup.moisture}</Text>
          {setup.isFoodGrade && (
            <>
              <Text style={styles.logDot}>·</Text>
              <Text style={[styles.logMetaText, styles.foodGradeTag]}>Food-Grade</Text>
            </>
          )}
        </View>
        {setup.sampleQualityRating > 0 && (
          <View style={styles.starsWrap}>
            <StarsRating rating={setup.sampleQualityRating} readonly size={14} />
          </View>
        )}
      </View>
      <View style={styles.logActions}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`delete-${setup.id}`}
        >
          <Trash2 size={17} color={Colors.textTertiary} />
        </TouchableOpacity>
        <ChevronRight size={17} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
});

export default function LogsScreen() {
  const router = useRouter();
  const { savedSetups, deleteSavedSetup } = useApp();

  const handleDelete = useCallback((id: string, fieldName: string) => {
    Alert.alert(
      'Delete Setup',
      `Remove "${fieldName}" from your logs?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteSavedSetup(id);
          },
        },
      ]
    );
  }, [deleteSavedSetup]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Field Logs</Text>
        {savedSetups.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{savedSetups.length}</Text>
          </View>
        )}
      </View>

      {savedSetups.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <BookOpen size={36} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Saved Setups</Text>
          <Text style={styles.emptySub}>
            Use the Settings Advisor to generate recommendations, then save them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedSetups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <LogItem
              setup={item}
              onPress={() => router.push(`/log-detail?id=${item.id}`)}
              onDelete={() => handleDelete(item.id, item.fieldName)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 10 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: 0.5 },
  countBadge: { backgroundColor: Colors.red, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  countText: { fontSize: 13, fontWeight: '700', color: Colors.text },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyIcon: { width: 80, height: 80, backgroundColor: Colors.surfaceElevated, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  separator: { height: 8 },
  logItem: { flexDirection: 'row', backgroundColor: Colors.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', alignItems: 'center' },
  cropStripe: { width: 4, alignSelf: 'stretch' },
  logContent: { flex: 1, paddingVertical: 14, paddingLeft: 14, gap: 5 },
  logTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  logFieldName: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  cropBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, flexShrink: 0 },
  cropBadgeText: { fontSize: 11, fontWeight: '700' },
  logMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 3 },
  logDate: { fontSize: 12, color: Colors.textSecondary },
  logDot: { fontSize: 12, color: Colors.textTertiary },
  logMetaText: { fontSize: 12, color: Colors.textSecondary },
  foodGradeTag: { color: Colors.warning, fontWeight: '600' },
  starsWrap: { marginTop: 2 },
  logActions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  deleteBtn: { padding: 4 },
});
