import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useWelcomeProfile } from '../../context/WelcomeProfileContext';
import { getShortlist, getStudentExperience } from '../../lib/api';
import {
  buildInterestEvents,
  ExperienceRecord,
  isSeniorGrade,
  normalizeGrade,
} from '../../data/studentExperience';

const COLORS = {
  primary: '#004877', // navy
  primaryDeep: '#013152',
  accent: '#3BBEE8', // sky blue
  bg: '#F6FCFF',
  white: '#FFFFFF',
  text: '#12303F',
  gray: '#6B7A86',
  faint: '#9AA7B1',
  border: '#E4EDF3',
  surface: '#F0F7FB',
  slate: '#0E2635', // dark shortlist card
  emerald: '#0FA968',
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Map client-style route strings (from the API actionLink) to mobile navigation.
const ROUTE_MAP: Record<string, [string] | [string, object]> = {
  '/careers': ['Careers'],
  '/university': ['University'],
  '/psychometric': ['Psychometric'],
  '/skills': ['More', { screen: 'Skills' }],
  '/counselling': ['More', { screen: 'Counselling' }],
  '/resources': ['More', { screen: 'Resources' }],
  '/explore-city': ['More', { screen: 'ExploreCity' }],
  '/blog': ['More', { screen: 'Blog' }],
  '/cv-builder': ['More', { screen: 'CVBuilder' }],
};

const modules: { label: string; icon: IconName; route: string }[] = [
  { label: 'Careers', icon: 'briefcase-outline', route: '/careers' },
  { label: 'University', icon: 'business-outline', route: '/university' },
  { label: 'Psychometric', icon: 'sparkles-outline', route: '/psychometric' },
  { label: 'Skills', icon: 'trending-up-outline', route: '/skills' },
  { label: 'Counselling', icon: 'people-outline', route: '/counselling' },
  { label: 'Resources', icon: 'library-outline', route: '/resources' },
  { label: 'Explore City', icon: 'map-outline', route: '/explore-city' },
  { label: 'Blog', icon: 'create-outline', route: '/blog' },
  { label: 'CV Builder', icon: 'document-text-outline', route: '/cv-builder' },
];

const academicPerformance = [
  { subject: 'Mathematics', percentage: 92 },
  { subject: 'Physics', percentage: 88 },
  { subject: 'Chemistry', percentage: 85 },
  { subject: 'English', percentage: 95 },
];

const activityIcons: IconName[] = ['flag-outline', 'play-circle-outline', 'document-text-outline'];

interface Props {
  navigation: any;
}

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { profile } = useWelcomeProfile();
  const firstName = user?.firstName || 'Student';
  // Prefer the personalized welcome profile (grade + interests), like the client Dashboard.
  const grade = normalizeGrade(profile?.grade || user?.grade);
  const interests = useMemo(
    () => (profile?.interests?.length ? profile.interests : user?.interests || []),
    [profile?.interests, user?.interests]
  );
  const seniorGrade = isSeniorGrade(grade);

  const [records, setRecords] = useState<ExperienceRecord[]>([]);
  const [shortlistedCareers, setShortlistedCareers] = useState<any[]>([]);
  const [shortlistedUniversities, setShortlistedUniversities] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------- Navigation helper (maps client routes → mobile stacks) ---------- */
  const go = useCallback(
    (route?: string) => {
      const key = (route || '/careers').replace(/\/$/, '') || '/careers';
      const target = ROUTE_MAP[key] || ROUTE_MAP['/careers'];
      // @ts-ignore — variadic navigate signature
      navigation.navigate(...target);
    },
    [navigation]
  );

  /* ---------- Data (same two calls as the client Dashboard) ---------- */
  const fetchData = useCallback(async () => {
    try {
      const [expRes, shortRes] = await Promise.allSettled([
        getStudentExperience({
          contentScope: 'DASHBOARD',
          grade,
          interest: interests.join(','),
          activeOnly: true,
        }),
        getShortlist(),
      ]);

      if (expRes.status === 'fulfilled') {
        setRecords(expRes.value.data?.data || []);
      }
      if (shortRes.status === 'fulfilled') {
        const d = shortRes.value.data?.data || {};
        setShortlistedCareers((d.shortlistedCareers || []).filter(Boolean));
        setShortlistedUniversities((d.shortlistedUniversities || []).filter(Boolean));
      }
    } catch {
      // silent — fallbacks below keep the screen useful offline
    }
  }, [grade, interests]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  /* ---------- Derived content (identical logic to client) ---------- */
  const priorityAction = useMemo(() => {
    const apiNextStep = records.find((r) => r.contentType === 'NEXT_STEP');
    if (apiNextStep) {
      return {
        label: apiNextStep.title || 'Continue',
        detail: apiNextStep.description || '',
        route: apiNextStep.actionLink || '/psychometric',
        buttonText: apiNextStep.actionLabel || 'Continue',
      };
    }
    return seniorGrade
      ? {
          label: 'Complete Career Quiz',
          detail: `Grade ${grade} profile is ready for exam-aligned career matching.`,
          route: '/psychometric',
          buttonText: 'Open Psychometric Test',
        }
      : {
          label: 'Apply for Event',
          detail: 'You have new local opportunities based on your selected interests.',
          route: '/explore-city',
          buttonText: 'Review Events',
        };
  }, [records, seniorGrade, grade]);

  const upcomingProgram = useMemo(() => {
    const apiEvent = records.find((r) => r.contentType === 'UPCOMING_EVENT');
    if (apiEvent) {
      return {
        title: apiEvent.title || 'Upcoming Session',
        date: apiEvent.dateLabel || 'Coming Soon',
        type: apiEvent.categoryLabel || 'Upcoming Session',
        route: apiEvent.actionLink || '/counselling',
      };
    }
    if (seniorGrade) {
      return {
        title: 'CUET strategy webinar with alumni mentors',
        date: '09 Apr 2026',
        type: 'Live Webinar',
        route: '/counselling',
      };
    }
    const firstInterestEvent = buildInterestEvents(interests)[0];
    return {
      title: firstInterestEvent?.title || 'District student portfolio workshop',
      date: firstInterestEvent?.date || '12 Apr 2026',
      type: 'Upcoming Local Session',
      route: '/explore-city',
    };
  }, [records, seniorGrade, interests]);

  const continueActivities = useMemo(() => {
    const apiActivities = records
      .filter((r) => r.contentType === 'CONTINUE_ACTIVITY')
      .map((r, i) => ({
        title: r.title || 'Activity',
        progress: r.description || r.categoryLabel || '',
        route: r.actionLink || '/resources',
        icon: activityIcons[i % activityIcons.length],
      }));

    if (apiActivities.length) return apiActivities.slice(0, 3);

    return [
      { title: 'Career Exploration', progress: '2 of 5 pathways shortlisted', route: '/careers', icon: activityIcons[0] },
      { title: 'Skill Course: Communication', progress: 'Week 2 content pending', route: '/skills', icon: activityIcons[1] },
      { title: 'Reading Module', progress: 'Resume your stream-selection guide', route: '/resources', icon: activityIcons[2] },
    ];
  }, [records]);

  const stats = [
    { label: 'Readiness Level', value: 'Tier 1', tag: 'Profile Strong', icon: 'shield-checkmark-outline' as IconName, tone: 'success' as const },
    { label: 'Skills Completed', value: '3', tag: 'Above Average', icon: 'trending-up-outline' as IconName, tone: 'plain' as const },
    { label: 'Active Modules', value: '2', tag: 'In Progress', icon: 'book-outline' as IconName, tone: 'plain' as const },
    {
      label: seniorGrade ? 'Next Exam' : 'Featured Event',
      value: seniorGrade ? 'CUET-UG' : 'District Camp',
      tag: seniorGrade ? 'MAY 2026' : 'APRIL 2026',
      icon: 'calendar-outline' as IconName,
      tone: 'dark' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Here's your next best move.</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('More', { screen: 'Settings' })}
          >
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats — horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {stats.map((s) => {
            const dark = s.tone === 'dark';
            return (
              <View key={s.label} style={[styles.statCard, dark && styles.statCardDark]}>
                <View style={styles.statTop}>
                  <Text style={[styles.statLabel, dark && styles.statLabelDark]}>{s.label}</Text>
                  <Ionicons name={s.icon} size={16} color={dark ? COLORS.accent : COLORS.faint} />
                </View>
                <Text style={[styles.statValue, dark && styles.statValueDark]}>{s.value}</Text>
                <View style={styles.statTagRow}>
                  {s.tone === 'success' && <View style={styles.dot} />}
                  <Text
                    style={[
                      styles.statTag,
                      s.tone === 'success' && { color: COLORS.emerald, fontWeight: '700' },
                      dark && styles.statTagDark,
                    ]}
                  >
                    {s.tag}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Next Step — hero */}
        <TouchableOpacity activeOpacity={0.92} style={styles.hero} onPress={() => go(priorityAction.route)}>
          <View style={styles.heroBlob} />
          <View style={styles.heroBlob2} />
          <Text style={styles.heroEyebrow}>NEXT STEP</Text>
          <Text style={styles.heroTitle}>{priorityAction.label}</Text>
          {!!priorityAction.detail && <Text style={styles.heroDetail}>{priorityAction.detail}</Text>}
          <View style={styles.heroBtn}>
            <Text style={styles.heroBtnText}>{priorityAction.buttonText}</Text>
            <Ionicons name="arrow-forward" size={15} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* Academic Performance */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardLabel}>Academic Performance</Text>
            <Text style={styles.cardAction}>TRANSCRIPT</Text>
          </View>
          {academicPerformance.map((item) => (
            <View key={item.subject} style={styles.subjectRow}>
              <View style={styles.subjectTop}>
                <Text style={styles.subjectName}>{item.subject}</Text>
                <Text style={styles.subjectPct}>{item.percentage}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${item.percentage}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Upcoming Talk / Event */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Upcoming Talk / Event</Text>
          <Text style={styles.eventTitle}>{upcomingProgram.title}</Text>
          <View style={styles.eventMeta}>
            <View style={styles.eventIcon}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.eventDate}>{upcomingProgram.date}</Text>
              <Text style={styles.eventType}>{upcomingProgram.type}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => go(upcomingProgram.route)}>
            <Text style={styles.outlineBtnText}>View Schedule</Text>
            <Ionicons name="arrow-forward" size={15} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Career Shortlist — dark */}
        <View style={styles.darkCard}>
          <Text style={styles.darkLabel}>Career Shortlist</Text>
          {shortlistedCareers.length ? (
            <View style={{ gap: 10, marginBottom: 16 }}>
              {shortlistedCareers.slice(0, 3).map((c) => (
                <View key={c._id} style={styles.shortlistPill}>
                  <Text style={styles.shortlistTitle}>{c.title}</Text>
                  {!!c.industry && <Text style={styles.shortlistSub}>{c.industry}</Text>}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.darkEmpty}>
              Shortlist your top 3 careers to unlock targeted prep.
            </Text>
          )}
          <TouchableOpacity style={styles.accentBtn} onPress={() => go('/careers')}>
            <Text style={styles.accentBtnText}>EXPLORE ALL PATHWAYS</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Activity */}
        <View style={styles.sectionHead}>
          <View style={styles.sectionIcon}>
            <Ionicons name="trophy-outline" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Continue Activity</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 16 }}
        >
          {continueActivities.map((a) => (
            <TouchableOpacity key={a.title} activeOpacity={0.9} style={styles.activityCard} onPress={() => go(a.route)}>
              <View style={styles.activityIcon}>
                <Ionicons name={a.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.activityTitle} numberOfLines={2}>{a.title}</Text>
              <Text style={styles.activityProgress} numberOfLines={2}>{a.progress}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* College Shortlist */}
        <View style={[styles.sectionHead, { marginTop: 26 }]}>
          <Text style={styles.sectionTitle}>College Shortlist</Text>
        </View>
        {shortlistedUniversities.length ? (
          <View style={{ gap: 10, marginBottom: 14 }}>
            {shortlistedUniversities.slice(0, 3).map((u) => (
              <View key={u._id} style={styles.collegeCard}>
                <Text style={styles.collegeName}>{u.name}</Text>
                <Text style={styles.collegeLoc}>
                  {u.city}
                  {u.state ? `, ${u.state}` : ''}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.mutedEmpty}>No colleges shortlisted yet.</Text>
        )}
        <TouchableOpacity style={styles.outlineBtnWide} onPress={() => go('/university')}>
          <Ionicons name="school-outline" size={16} color={COLORS.text} />
          <Text style={styles.outlineBtnWideText}>UNIVERSITY PREP</Text>
        </TouchableOpacity>

        {/* Explore Modules */}
        <Text style={[styles.sectionTitle, { marginTop: 28, marginBottom: 14 }]}>Explore Modules</Text>
        <View style={styles.grid}>
          {modules.map((m) => (
            <TouchableOpacity key={m.label} activeOpacity={0.85} style={styles.moduleCard} onPress={() => go(m.route)}>
              <View style={styles.moduleIcon}>
                <Ionicons name={m.icon} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.moduleLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
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
  container: { flex: 1, paddingHorizontal: 16 },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 14, paddingBottom: 18 },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  subGreeting: { fontSize: 13, color: COLORS.gray, marginTop: 3 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },

  /* Stats */
  statsRow: { gap: 12, paddingRight: 16, paddingBottom: 6 },
  statCard: {
    width: 150, backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, ...CARD_SHADOW,
  },
  statCardDark: { backgroundColor: COLORS.slate, borderColor: COLORS.slate },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 10, fontWeight: '700', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 0.8 },
  statLabelDark: { color: 'rgba(255,255,255,0.55)' },
  statValue: { fontSize: 30, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  statValueDark: { color: '#fff', fontSize: 24, marginTop: 4 },
  statTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.emerald },
  statTag: { fontSize: 12, color: COLORS.gray },
  statTagDark: { color: COLORS.accent, fontWeight: '700', letterSpacing: 0.5 },

  /* Hero / Next Step */
  hero: {
    marginTop: 18, backgroundColor: COLORS.primary, borderRadius: 24, padding: 22,
    overflow: 'hidden', ...CARD_SHADOW, shadowOpacity: 0.18,
  },
  heroBlob: {
    position: 'absolute', top: -40, right: -30, width: 150, height: 150,
    borderRadius: 75, backgroundColor: 'rgba(59,190,232,0.22)',
  },
  heroBlob2: {
    position: 'absolute', bottom: -50, right: 40, width: 110, height: 110,
    borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.accent, letterSpacing: 1.8 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 10, letterSpacing: -0.4, maxWidth: '92%' },
  heroDetail: { fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.82)', marginTop: 10, maxWidth: '94%' },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, marginTop: 20,
  },
  heroBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Generic card */
  card: {
    marginTop: 16, backgroundColor: COLORS.white, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, ...CARD_SHADOW,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  cardLabel: { fontSize: 11, fontWeight: '800', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 1.2 },
  cardAction: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },

  /* Academic */
  subjectRow: { marginBottom: 16 },
  subjectTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  subjectName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  subjectPct: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  track: { height: 7, borderRadius: 4, backgroundColor: COLORS.surface, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.primary },

  /* Event */
  eventTitle: { fontSize: 19, fontWeight: '800', color: COLORS.text, marginTop: 12, lineHeight: 25 },
  eventMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginTop: 16,
  },
  eventIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  eventDate: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  eventType: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingVertical: 13, marginTop: 16,
  },
  outlineBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },

  /* Dark shortlist */
  darkCard: { marginTop: 16, backgroundColor: COLORS.slate, borderRadius: 22, padding: 20 },
  darkLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 },
  shortlistPill: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13 },
  shortlistTitle: { fontSize: 14.5, fontWeight: '700', color: '#fff' },
  shortlistSub: { fontSize: 11, color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
  darkEmpty: { fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 20, marginBottom: 16 },
  accentBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  accentBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.primaryDeep, letterSpacing: 0.6 },

  /* Sections */
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26, marginBottom: 14 },
  sectionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#E4F4FB', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2 },

  /* Continue activity */
  activityCard: {
    width: 180, backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, ...CARD_SHADOW,
  },
  activityIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  activityTitle: { fontSize: 15.5, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  activityProgress: { fontSize: 12.5, color: COLORS.gray, lineHeight: 18 },

  /* College */
  collegeCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, ...CARD_SHADOW },
  collegeName: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  collegeLoc: { fontSize: 11.5, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6 },
  mutedEmpty: { fontSize: 13.5, color: COLORS.faint, marginBottom: 14 },
  outlineBtnWide: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingVertical: 14,
  },
  outlineBtnWideText: { fontSize: 13, fontWeight: '800', color: COLORS.text, letterSpacing: 0.6 },

  /* Modules grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleCard: {
    width: '31%', backgroundColor: COLORS.white, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...CARD_SHADOW,
  },
  moduleIcon: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  moduleLabel: { fontSize: 11.5, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
});
