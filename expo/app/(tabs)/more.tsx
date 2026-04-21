import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Globe, Info, ExternalLink } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const APP_VERSION = '1.0.0';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

interface RowProps {
  label: string;
  value?: string;
  isLink?: boolean;
}

const Row: React.FC<RowProps> = ({ label, value, isLink }) => (
  <TouchableOpacity style={styles.row} activeOpacity={isLink ? 0.7 : 1} disabled={!isLink}>
    <Text style={styles.rowLabel}>{label}</Text>
    {value && <Text style={styles.rowValue}>{value}</Text>}
    {isLink && <ExternalLink size={14} color={Colors.textTertiary} />}
  </TouchableOpacity>
);

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/1ftdc5nqjl6xg4zbworqc.png' }}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>AXIAL ADVISOR</Text>
          <Text style={styles.heroSub}>Axial-Flow Combine Setup Guide</Text>
        </View>

        <Section title="About">
          <Row label="Version" value={APP_VERSION} />
          <View style={styles.divider} />
          <Row label="Platform" value="Axial-Flow Series" />
          <View style={styles.divider} />
          <Row label="Models" value="7250 / 8250 / 9250 / 7260 / 8260 / 9260" />
        </Section>

        <Section title="Resources">
          <Row label="Case IH Website" isLink />
          <View style={styles.divider} />
          <Row label="Operator Manuals" isLink />
          <View style={styles.divider} />
          <Row label="Dealer Locator" isLink />
        </Section>

        <Section title="Disclaimer">
          <View style={styles.disclaimerWrap}>
            <View style={styles.disclaimerRow}>
              <AlertTriangle size={18} color={Colors.warning} />
              <Text style={styles.disclaimerBold}>For Reference Only</Text>
            </View>
            <Text style={styles.disclaimerBody}>
              Settings provided are starting guidelines only. Always consult your Operator&apos;s Manual
              and adjust based on crop conditions and machine performance.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.legalWrap}>
            <Info size={14} color={Colors.textTertiary} />
            <Text style={styles.legalText}>
              Axial Advisor is not affiliated with CNH Industrial or Case IH. All brand names used for reference only.
            </Text>
          </View>
        </Section>

        <Text style={styles.footer}>Built for the field · v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },
  hero: { alignItems: 'center', paddingTop: 36, paddingBottom: 32, paddingHorizontal: 20, gap: 10 },
  heroLogo: { width: 80, height: 80, borderRadius: 16, marginBottom: 4 },
  heroTitle: { fontSize: 30, fontWeight: '900', color: Colors.text, letterSpacing: 1.5 },
  heroSub: { fontSize: 14, color: Colors.textSecondary },
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1.2, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: Colors.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 16 },
  rowLabel: { fontSize: 15, color: Colors.text, flex: 1 },
  rowValue: { fontSize: 13, color: Colors.textSecondary, textAlign: 'right', flexShrink: 1, marginLeft: 8 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: 16 },
  disclaimerWrap: { padding: 16, gap: 10 },
  disclaimerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disclaimerBold: { fontSize: 14, fontWeight: '700', color: Colors.warning },
  disclaimerBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  legalWrap: { flexDirection: 'row', padding: 16, gap: 8, alignItems: 'flex-start' },
  legalText: { flex: 1, fontSize: 12, color: Colors.textTertiary, lineHeight: 18 },
  footer: { textAlign: 'center', fontSize: 12, color: Colors.textTertiary, paddingHorizontal: 20, marginTop: 4 },
});
