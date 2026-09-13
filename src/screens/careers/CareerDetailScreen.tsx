import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Career } from '../../types';

const COLORS = {
  primary: '#004877', accent: '#3BBEE8', bg: '#F6FCFF', white: '#fff',
  text: '#1C2D37', gray: '#8B909A', indigo: '#4f46e5', slate: '#1e293b',
  rose: '#be123c', roseBg: '#fff1f2',
};

function Chips({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.chipWrap}>
      {items.map((s, i) => (
        <Text key={i} style={styles.chip}>{s}</Text>
      ))}
    </View>
  );
}

function BulletList({ items, dotColor = COLORS.indigo }: { items?: string[]; dotColor?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ gap: 10 }}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CareerDetailScreen({ route }: any) {
  const career: Career = route.params?.career;
  if (!career) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          {career.industry && <Text style={styles.heroBadge}>{career.industry}</Text>}
          <Text style={styles.heroTitle}>{career.title}</Text>
        </View>

        {/* Description */}
        {career.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What The Role Entails</Text>
            <Text style={styles.body}>{career.description}</Text>
          </View>
        )}

        {/* Progression + Education path */}
        {(career.progression || career.educationPath) && (
          <View style={styles.progressionCard}>
            {career.progression && (
              <>
                <Text style={styles.progressionLabel}>Progression</Text>
                <Text style={styles.progressionValue}>{career.progression}</Text>
              </>
            )}
            {career.educationPath && (
              <>
                <Text style={[styles.progressionLabel, { marginTop: 16 }]}>Education Path</Text>
                <Text style={styles.progressionSub}>{career.educationPath}</Text>
              </>
            )}
          </View>
        )}

        {/* Key Skills */}
        {(career.keySkills?.length || career.skills?.length) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Skills</Text>
            <Chips items={career.keySkills?.length ? career.keySkills : career.skills} />
          </View>
        ) : null}

        {/* What you actually do */}
        {career.whatYouActuallyDo && career.whatYouActuallyDo.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You Actually Do</Text>
            <BulletList items={career.whatYouActuallyDo} />
          </View>
        )}

        {/* Early exposure */}
        {career.exposure && career.exposure.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Early Exposure</Text>
            <Chips items={career.exposure} />
          </View>
        )}

        {/* Entrance exams */}
        {career.entranceExams && career.entranceExams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entrance Exams</Text>
            <Chips items={career.entranceExams} />
          </View>
        )}

        {/* Top institutions India */}
        {career.topInstitutionsIndia && career.topInstitutionsIndia.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Institutions (India)</Text>
            <BulletList items={career.topInstitutionsIndia} />
          </View>
        )}

        {/* Global pathways */}
        {career.globalPathways && career.globalPathways.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Global Pathways</Text>
            <BulletList items={career.globalPathways} dotColor={COLORS.gray} />
          </View>
        )}

        {/* Scholarships */}
        {career.scholarships && career.scholarships.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scholarships</Text>
            <BulletList items={career.scholarships} />
          </View>
        )}

        {/* Lateral options */}
        {career.lateralOptions && career.lateralOptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lateral Options</Text>
            <BulletList items={career.lateralOptions} />
          </View>
        )}

        {/* Adjacent roles */}
        {career.adjacentRoles && career.adjacentRoles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adjacent Roles</Text>
            <Chips items={career.adjacentRoles} />
          </View>
        )}

        {/* Who should not choose */}
        {career.whoShouldNotChoose && (
          <View style={styles.warnCard}>
            <Text style={styles.warnTitle}>Who Should Not Choose This</Text>
            <Text style={styles.warnBody}>{career.whoShouldNotChoose}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 40 },
  hero: {
    backgroundColor: COLORS.slate, borderRadius: 18, padding: 22, marginBottom: 16,
  },
  heroBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', color: '#cbd5e1',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, fontSize: 11,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14, overflow: 'hidden',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  section: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: COLORS.gray, marginBottom: 12,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  body: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  progressionCard: { backgroundColor: COLORS.indigo, borderRadius: 14, padding: 18, marginBottom: 12 },
  progressionLabel: {
    fontSize: 11, fontWeight: '700', color: '#c7d2fe',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  progressionValue: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  progressionSub: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#F1F5F9', color: COLORS.text, borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, fontSize: 13, fontWeight: '600',
    overflow: 'hidden',
  },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bulletText: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  warnCard: { backgroundColor: COLORS.roseBg, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#fecdd3', marginBottom: 12 },
  warnTitle: { fontSize: 12, fontWeight: '800', color: COLORS.rose, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  warnBody: { fontSize: 14, color: COLORS.rose, lineHeight: 21 },
});
