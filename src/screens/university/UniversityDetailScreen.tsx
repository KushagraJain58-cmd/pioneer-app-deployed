import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { University } from '../../types';

const COLORS = {
  primary: '#004877', accent: '#3BBEE8', bg: '#F6FCFF', white: '#fff',
  text: '#1C2D37', gray: '#8B909A', teal: '#0d9488', slate: '#1e293b',
  border: '#E2E8F0',
};

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function Chips({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.chipWrap}>
      {items.map((item, i) => (
        <Text key={i} style={styles.chip}>{item}</Text>
      ))}
    </View>
  );
}

function StatBox({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value || '—'}</Text>
    </View>
  );
}

export default function UniversityDetailScreen({ route }: any) {
  const uni: University = route.params?.university;
  if (!uni) return null;

  const openWebsite = () => {
    if (!uni.officialWebsite) return;
    const url = uni.officialWebsite.startsWith('http')
      ? uni.officialWebsite
      : `https://${uni.officialWebsite}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            {uni.rankAccreditation && (
              <View style={styles.rankChip}>
                <Text style={styles.rankChipText}>{uni.rankAccreditation}</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroTitle}>{uni.name}</Text>
          {(uni.city || uni.state) && (
            <Text style={styles.heroSub}>
              {[uni.city, uni.state].filter(Boolean).join(', ').toUpperCase()}
            </Text>
          )}
        </View>

        {/* Stats row: Established / Mode of Entry / Acceptance Rate / Fees */}
        <View style={styles.statsGrid}>
          <StatBox label="Established" value={uni.establishedYear} />
          <StatBox label="Mode of Entry" value={uni.modeOfEntry} />
          <StatBox label="Acceptance Rate" value={uni.acceptanceRate} />
          <StatBox label="Fees Range" value={uni.feesRange} />
        </View>

        {/* Packages */}
        {(uni.averagePackage || uni.highestPackage) && (
          <View style={styles.statsGrid}>
            {uni.averagePackage && <StatBox label="Avg Package" value={uni.averagePackage} />}
            {uni.highestPackage && <StatBox label="Highest Package" value={uni.highestPackage} />}
          </View>
        )}

        {/* Entrance Exams */}
        <View style={styles.section}>
          <SectionLabel label="Entrance Exams" />
          {uni.entranceExams && uni.entranceExams.length > 0 ? (
            <Chips items={uni.entranceExams} />
          ) : (
            <Text style={styles.naText}>No entrance exams required</Text>
          )}
        </View>

        {/* Cut-off Trend */}
        {uni.cutOffTrend && (
          <View style={[styles.section, styles.trendSection]}>
            <SectionLabel label="Cut-off Trend (Last 3 Years)" />
            <View style={styles.trendRow}>
              <Ionicons name="trending-up" size={20} color={COLORS.teal} />
              <Text style={styles.trendText}>{uni.cutOffTrend}</Text>
            </View>
          </View>
        )}

        {/* Courses Offered */}
        {uni.coursesOffered && uni.coursesOffered.length > 0 && (
          <View style={styles.section}>
            <SectionLabel label="Courses Offered" />
            <Chips items={uni.coursesOffered} />
          </View>
        )}

        {/* Specializations */}
        {uni.specializations && uni.specializations.length > 0 && (
          <View style={styles.section}>
            <SectionLabel label="Specializations" />
            <Chips items={uni.specializations} />
          </View>
        )}

        {/* Facilities */}
        {uni.facilities && uni.facilities.length > 0 && (
          <View style={styles.section}>
            <SectionLabel label="Facilities" />
            <Chips items={uni.facilities} />
          </View>
        )}

        {/* Visit website */}
        {uni.officialWebsite && (
          <TouchableOpacity style={styles.websiteBtn} onPress={openWebsite} activeOpacity={0.85}>
            <Ionicons name="globe-outline" size={18} color={COLORS.white} />
            <Text style={styles.websiteBtnText}>Visit Official Website</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { paddingBottom: 40 },
  // hero
  hero: {
    backgroundColor: COLORS.slate, padding: 24, paddingTop: 20,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 14 },
  rankChip: {
    backgroundColor: COLORS.teal, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  rankChipText: { fontSize: 11, fontWeight: '800', color: COLORS.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 6, lineHeight: 28 },
  heroSub: { fontSize: 12, color: '#94a3b8', letterSpacing: 0.8 },
  // stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingTop: 16, gap: 10,
  },
  statBox: {
    flex: 1, minWidth: '40%', backgroundColor: COLORS.white,
    borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.gray,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6,
  },
  statValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  // sections
  section: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 16,
    marginHorizontal: 16, marginTop: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  trendSection: {},
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.gray,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  naText: { fontSize: 14, color: COLORS.gray },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trendText: { fontSize: 15, fontWeight: '700', color: COLORS.teal },
  // chips
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#F8FAFC', color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, fontSize: 13, fontWeight: '500', overflow: 'hidden',
  },
  // website button
  websiteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.slate, borderRadius: 14,
    paddingVertical: 16, marginHorizontal: 16, marginTop: 16,
  },
  websiteBtnText: {
    fontSize: 14, fontWeight: '700', color: COLORS.white,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
});
