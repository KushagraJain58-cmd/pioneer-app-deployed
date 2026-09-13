import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect } from '@react-navigation/native';
import { getSkillWeeks, getSkillAssessmentResult } from '../../lib/api';
import { COLORS, htmlToText } from './skillsTheme';

const MAX_ATTEMPTS = 5;

interface Submission {
  passed: boolean;
  percentage?: number;
  totalCorrect: number;
  totalQuestions: number;
  attemptNumber: number;
}

interface WeekData {
  title: string;
  description?: string;
  content?: string;
  resources?: { id: string; title: string; url: string }[];
  images?: { key: string; url: string; name?: string }[];
  videos?: { key: string; url: string }[];
  assessment?: { id: string; title: string; passingScore: number };
  questions?: any[];
  submission?: Submission | null;
}

function Collapsible({ title, icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpen(o => !o)}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name={icon} size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.gray} />
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function SkillWeekScreen({ route, navigation }: any) {
  const { skillId, weekNumber } = route.params;
  const [week, setWeek] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingResult, setFetchingResult] = useState(false);

  const fetchWeek = useCallback(() => {
    let active = true;
    setLoading(true);
    getSkillWeeks(skillId, weekNumber)
      .then(res => { if (active) setWeek(res.data?.data || null); })
      .catch(() => { if (active) setWeek(null); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [skillId, weekNumber]);

  useFocusEffect(fetchWeek);

  const openLink = (url: string) => WebBrowser.openBrowserAsync(url).catch(() => {});

  const startAssessment = () => {
    navigation.navigate('SkillQuiz', {
      mode: 'week',
      assessment: week?.assessment,
      questions: week?.questions || [],
      title: `Week ${weekNumber} Assessment`,
    });
  };

  const viewResponses = async () => {
    if (!week?.assessment?.id) return;
    setFetchingResult(true);
    try {
      const res = await getSkillAssessmentResult(week.assessment.id);
      if (res.data?.status) navigation.navigate('SkillResult', { result: res.data.data });
      else Alert.alert('Unavailable', 'No saved responses found.');
    } catch {
      Alert.alert('Error', 'Could not load your responses.');
    } finally {
      setFetchingResult(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  }

  if (!week) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={36} color={COLORS.gray} />
        <Text style={styles.muted}>Week content unavailable.</Text>
      </View>
    );
  }

  const sub = week.submission;
  const maxedOut = !!sub && (sub.passed || sub.attemptNumber >= MAX_ATTEMPTS);
  const contentText = htmlToText(week.content);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Week hero */}
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>WEEK {weekNumber}</Text>
          <Text style={styles.heroTitle}>{week.title}</Text>
          {!!week.description && <Text style={styles.heroDesc}>{week.description}</Text>}
        </View>

        {/* Content */}
        {!!contentText && (
          <Collapsible title="Lesson Content" icon="book-outline" defaultOpen>
            <Text style={styles.contentText}>{contentText}</Text>
          </Collapsible>
        )}

        {/* Resources */}
        {!!week.resources?.length && (
          <Collapsible title="Resources" icon="link-outline">
            {week.resources.map(r => (
              <TouchableOpacity key={r.id} style={styles.resourceRow} onPress={() => openLink(r.url)}>
                <Ionicons name="document-text-outline" size={16} color={COLORS.accent} />
                <Text style={styles.resourceText} numberOfLines={1}>{r.title}</Text>
                <Ionicons name="open-outline" size={15} color={COLORS.gray} />
              </TouchableOpacity>
            ))}
          </Collapsible>
        )}

        {/* Images */}
        {!!week.images?.length && (
          <Collapsible title="Images" icon="image-outline">
            <View style={styles.imageGrid}>
              {week.images.map(img => (
                <Image key={img.key} source={{ uri: img.url }} style={styles.image} contentFit="cover" />
              ))}
            </View>
          </Collapsible>
        )}

        {/* Videos */}
        {!!week.videos?.length && (
          <Collapsible title="Videos" icon="videocam-outline">
            {week.videos.map((v, i) => (
              <TouchableOpacity key={v.key} style={styles.videoRow} onPress={() => openLink(v.url)}>
                <View style={styles.videoIcon}>
                  <Ionicons name="play" size={16} color="#fff" />
                </View>
                <Text style={styles.videoText}>Play video {i + 1}</Text>
                <Ionicons name="open-outline" size={15} color={COLORS.gray} />
              </TouchableOpacity>
            ))}
          </Collapsible>
        )}

        {/* Assessment block */}
        {week.assessment && (
          <View style={styles.assessmentCard}>
            <View style={styles.assessmentHeader}>
              <View style={styles.assessmentIcon}>
                <Ionicons name="clipboard-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.assessmentTitle}>Week {weekNumber} Assessment</Text>
                <Text style={styles.assessmentPass}>Passing score: {week.assessment.passingScore}%</Text>
              </View>
            </View>

            {!sub && (
              <View style={styles.statusPill}>
                <Ionicons name="time-outline" size={14} color={COLORS.amber} />
                <Text style={[styles.statusPillText, { color: COLORS.amber }]}>Not attempted yet</Text>
              </View>
            )}

            {sub && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{sub.percentage?.toFixed(0) ?? 0}%</Text>
                  <Text style={styles.statLabel}>Score</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{sub.totalCorrect}/{sub.totalQuestions}</Text>
                  <Text style={styles.statLabel}>Correct</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{sub.attemptNumber}/{MAX_ATTEMPTS}</Text>
                  <Text style={styles.statLabel}>Attempts</Text>
                </View>
              </View>
            )}

            {sub && (
              <View style={[styles.resultPill, { backgroundColor: sub.passed ? COLORS.greenBg : COLORS.redBg }]}>
                <Ionicons
                  name={sub.passed ? 'checkmark-circle' : 'close-circle'}
                  size={15}
                  color={sub.passed ? COLORS.green : COLORS.red}
                />
                <Text style={[styles.resultPillText, { color: sub.passed ? COLORS.green : COLORS.red }]}>
                  {sub.passed ? 'Passed' : 'Not Passed'}
                </Text>
              </View>
            )}

            <View style={styles.btnCol}>
              <TouchableOpacity
                style={[styles.primaryBtn, maxedOut && styles.disabledBtn]}
                disabled={maxedOut}
                onPress={startAssessment}
              >
                <Text style={styles.primaryBtnText}>
                  {!sub ? 'Start Assessment'
                    : sub.passed ? 'Already Passed'
                    : sub.attemptNumber >= MAX_ATTEMPTS ? 'Max Attempts Reached'
                    : 'Re-attempt'}
                </Text>
              </TouchableOpacity>

              {sub && (
                <TouchableOpacity style={styles.outlineBtn} disabled={fetchingResult} onPress={viewResponses}>
                  {fetchingResult
                    ? <ActivityIndicator color={COLORS.primary} />
                    : <Text style={styles.outlineBtnText}>View Responses</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, gap: 10 },
  muted: { color: COLORS.gray, fontSize: 13 },
  container: { padding: 16, paddingBottom: 48 },

  hero: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 22, marginBottom: 18 },
  heroKicker: { color: '#9FC4DE', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroDesc: { color: '#BFD8EA', fontSize: 13, lineHeight: 20, marginTop: 8 },

  section: { backgroundColor: COLORS.white, borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  contentText: { fontSize: 14, color: COLORS.text, lineHeight: 23 },

  resourceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  resourceText: { flex: 1, fontSize: 13, color: COLORS.primary, fontWeight: '500' },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  image: { width: '47%', flexGrow: 1, height: 120, borderRadius: 12, backgroundColor: COLORS.border },

  videoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  videoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  videoText: { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: '500' },

  assessmentCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, marginTop: 6, borderWidth: 1, borderColor: '#D6E6F2' },
  assessmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  assessmentIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E6F1FA', justifyContent: 'center', alignItems: 'center' },
  assessmentTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  assessmentPass: { fontSize: 12, color: COLORS.gray, marginTop: 2 },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: COLORS.amberBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 14 },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statValue: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 2 },

  resultPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 14 },
  resultPillText: { fontSize: 13, fontWeight: '700' },

  btnCol: { gap: 10 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  disabledBtn: { backgroundColor: '#B8C4CC' },
  outlineBtn: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  outlineBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
