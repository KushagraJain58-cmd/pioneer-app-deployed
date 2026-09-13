import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useWelcomeProfile } from '../../context/WelcomeProfileContext';
import { getStudentExperience } from '../../lib/api';
import {
  buildInterestEvents,
  gradeCategories,
  interestOptions,
  isSeniorGrade,
  normalizeGrade,
  targetExams,
} from '../../data/studentExperience';

const COLORS = {
  primary: '#004877',
  primaryDeep: '#013152',
  accent: '#3BBEE8',
  bg: '#F6FCFF',
  white: '#FFFFFF',
  text: '#12303F',
  gray: '#6B7A86',
  faint: '#9AA7B1',
  border: '#E4EDF3',
  surface: '#F0F7FB',
  slate: '#0E2635',
};

interface PreviewItem {
  title: string;
  tag?: string;
  category?: string;
  date: string;
  detail?: string;
  location?: string;
}

export default function WelcomeScreen() {
  const { user } = useAuth();
  const { profile, saveProfile } = useWelcomeProfile();

  const studentName = user?.firstName || 'there';

  const [selectedGrade, setSelectedGrade] = useState<string>(
    profile?.grade || normalizeGrade(user?.grade)
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests?.length ? profile.interests : ['sports', 'arts']
  );

  const [examRecords, setExamRecords] = useState<any[]>([]);
  const [eventRecords, setEventRecords] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const seniorGrade = isSeniorGrade(selectedGrade);

  /* ---------- Two WELCOME calls, identical to the client ---------- */
  useEffect(() => {
    let active = true;
    setLoadingPreview(true);
    Promise.allSettled([
      getStudentExperience({
        contentScope: 'WELCOME',
        contentType: 'TARGET_EXAM',
        grade: selectedGrade,
        activeOnly: true,
      }),
      getStudentExperience({
        contentScope: 'WELCOME',
        contentType: 'UPCOMING_EVENT',
        grade: selectedGrade,
        interest: selectedInterests.join(','),
        activeOnly: true,
      }),
    ]).then(([examRes, eventRes]) => {
      if (!active) return;
      if (examRes.status === 'fulfilled') setExamRecords(examRes.value.data?.data || []);
      if (eventRes.status === 'fulfilled') setEventRecords(eventRes.value.data?.data || []);
      setLoadingPreview(false);
    });
    return () => {
      active = false;
    };
  }, [selectedGrade, selectedInterests]);

  const dynamicTargetExams = useMemo<PreviewItem[]>(() => {
    if (!examRecords.length) return targetExams;
    return examRecords.slice(0, 3).map((item) => ({
      title: item.title,
      tag: item.categoryLabel,
      date: item.dateLabel,
      detail: item.description,
    }));
  }, [examRecords]);

  const eventFeed = useMemo<PreviewItem[]>(() => {
    if (!eventRecords.length) return buildInterestEvents(selectedInterests).slice(0, 3);
    return eventRecords.slice(0, 3).map((item) => ({
      title: item.title,
      category: item.categoryLabel,
      date: item.dateLabel,
      location: item.locationLabel || item.description,
    }));
  }, [eventRecords, selectedInterests]);

  const previewItems = seniorGrade ? dynamicTargetExams : eventFeed;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest]
    );
  };

  const continueToDashboard = useCallback(async () => {
    setSaving(true);
    await saveProfile({
      grade: selectedGrade,
      interests: selectedInterests.length ? selectedInterests : ['sports'],
      completedAt: new Date().toISOString(),
    });
    // Root navigator swaps to the dashboard automatically once the profile is set.
  }, [saveProfile, selectedGrade, selectedInterests]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <View style={styles.heroBlob2} />
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={13} color={COLORS.accent} />
            <Text style={styles.heroBadgeText}>WELCOME EXPERIENCE</Text>
          </View>
          <Text style={styles.heroTitle}>
            Hi {studentName}, let's personalize your Pioneer journey.
          </Text>
          <Text style={styles.heroSub}>
            Pick your grade and interests so we can surface the most relevant exams, local
            opportunities, and next actions before opening your dashboard.
          </Text>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipLabel}>STARTING WITH</Text>
            <Text style={styles.heroChipValue}>Grade {selectedGrade}</Text>
          </View>
        </View>

        {/* Grade selection */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Select Grade Category</Text>
          <View style={styles.gradeGrid}>
            {gradeCategories.map((g) => {
              const active = selectedGrade === g.value;
              return (
                <TouchableOpacity
                  key={g.value}
                  activeOpacity={0.85}
                  style={[styles.gradeCard, active && styles.gradeCardActive]}
                  onPress={() => setSelectedGrade(g.value)}
                >
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color={active ? COLORS.primary : COLORS.faint}
                  />
                  <Text style={[styles.gradeText, active && styles.gradeTextActive]}>{g.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!seniorGrade && (
            <View style={{ marginTop: 22 }}>
              <Text style={styles.cardLabel}>Interests</Text>
              <View style={styles.interestRow}>
                {interestOptions.map((interest) => {
                  const active = selectedInterests.includes(interest.value);
                  return (
                    <TouchableOpacity
                      key={interest.value}
                      activeOpacity={0.85}
                      style={[styles.interestPill, active && styles.interestPillActive]}
                      onPress={() => toggleInterest(interest.value)}
                    >
                      <Text style={[styles.interestText, active && styles.interestTextActive]}>
                        {interest.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cta}
            onPress={continueToDashboard}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>PROCEED TO MAIN DASHBOARD</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View style={styles.card}>
          <View style={styles.previewHead}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.cardLabel}>
                {seniorGrade ? 'Top 3 Target Exams' : 'Upcoming Events'}
              </Text>
              <Text style={styles.previewTitle}>
                {seniorGrade
                  ? 'Focused exam pathways for senior secondary students'
                  : 'Interest-led opportunities near you'}
              </Text>
            </View>
            <View style={styles.previewIcon}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
            </View>
          </View>

          {loadingPreview ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 24 }} />
          ) : (
            <View style={{ gap: 12, marginTop: 4 }}>
              {previewItems.map((item) => (
                <View key={`${item.title}-${item.date}`} style={styles.previewCard}>
                  <View style={styles.previewCardTop}>
                    <Text style={styles.previewTag}>{item.tag || item.category}</Text>
                    <Text style={styles.previewDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.previewItemTitle}>{item.title}</Text>
                  {!!(item.detail || item.location) && (
                    <Text style={styles.previewItemSub}>{item.detail || item.location}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_SHADOW = {
  shadowColor: '#0A2A3F',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  /* Hero */
  hero: { backgroundColor: COLORS.slate, borderRadius: 26, padding: 24, overflow: 'hidden' },
  heroBlob: {
    position: 'absolute', top: -50, right: -40, width: 170, height: 170,
    borderRadius: 85, backgroundColor: 'rgba(59,190,232,0.18)',
  },
  heroBlob2: {
    position: 'absolute', bottom: -60, left: -30, width: 130, height: 130,
    borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.accent, letterSpacing: 1.5 },
  heroTitle: { fontSize: 27, fontWeight: '800', color: '#fff', lineHeight: 34, marginTop: 16, letterSpacing: -0.4 },
  heroSub: { fontSize: 13.5, lineHeight: 21, color: 'rgba(255,255,255,0.72)', marginTop: 12 },
  heroChip: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 12, marginTop: 20,
  },
  heroChipLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5 },
  heroChipValue: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 4 },

  /* Cards */
  card: {
    marginTop: 16, backgroundColor: COLORS.white, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, ...CARD_SHADOW,
  },
  cardLabel: { fontSize: 11, fontWeight: '800', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 1.2 },

  /* Grade grid */
  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  gradeCard: {
    width: '48%', borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 16,
  },
  gradeCardActive: { borderColor: COLORS.accent, backgroundColor: '#E4F4FB' },
  gradeText: { fontSize: 14, fontWeight: '700', color: COLORS.gray, marginTop: 12 },
  gradeTextActive: { color: COLORS.primary },

  /* Interests */
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  interestPill: {
    borderRadius: 22, paddingHorizontal: 20, paddingVertical: 11, backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  interestPillActive: { backgroundColor: COLORS.slate, borderColor: COLORS.slate },
  interestText: { fontSize: 13.5, fontWeight: '700', color: COLORS.gray },
  interestTextActive: { color: '#fff' },

  /* CTA */
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, marginTop: 24,
  },
  ctaText: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  /* Preview */
  previewHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  previewTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 8, lineHeight: 24 },
  previewIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#E4F4FB',
    justifyContent: 'center', alignItems: 'center',
  },
  previewCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  previewCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  previewTag: { fontSize: 11, fontWeight: '800', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 1 },
  previewDate: { fontSize: 12.5, fontWeight: '700', color: COLORS.gray },
  previewItemTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, lineHeight: 24 },
  previewItemSub: { fontSize: 13, lineHeight: 20, color: COLORS.gray, marginTop: 8 },
});
