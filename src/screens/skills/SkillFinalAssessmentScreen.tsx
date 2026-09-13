import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getSkillFinalAssessment, getSkillFinalAssessmentResult } from '../../lib/api';
import { COLORS } from './skillsTheme';

const MAX_ATTEMPTS = 3;

interface FinalSubmission {
  passed: boolean;
  score?: number;
  totalCorrect: number;
  totalQuestions: number;
  attemptNumber: number;
}

interface FinalData {
  assessment: { id: string; title: string; passingScore: number };
  questions: any[];
  submission?: FinalSubmission | null;
}

export default function SkillFinalAssessmentScreen({ route, navigation }: any) {
  const { skillId } = route.params;
  const [data, setData] = useState<FinalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingResult, setFetchingResult] = useState(false);

  const fetchFinal = useCallback(() => {
    let active = true;
    setLoading(true);
    getSkillFinalAssessment(skillId)
      .then(res => { if (active) setData(res.data?.data || null); })
      .catch(() => { if (active) setData(null); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [skillId]);

  useFocusEffect(fetchFinal);

  const startExam = () => {
    navigation.navigate('SkillQuiz', {
      mode: 'final',
      assessment: data?.assessment,
      questions: data?.questions || [],
      title: data?.assessment?.title,
    });
  };

  const viewResponses = async () => {
    if (!data?.assessment?.id) return;
    setFetchingResult(true);
    try {
      const res = await getSkillFinalAssessmentResult(data.assessment.id);
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

  if (!data) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={36} color={COLORS.gray} />
        <Text style={styles.muted}>Final assessment unavailable.</Text>
      </View>
    );
  }

  const sub = data.submission;
  const maxedOut = !!sub && (sub.passed || sub.attemptNumber >= MAX_ATTEMPTS);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <Ionicons name="trophy" size={18} color="#9FC4DE" />
            <Text style={styles.heroKicker}>FINAL EVALUATION</Text>
          </View>
          <Text style={styles.heroTitle}>{data.assessment.title}</Text>
          <Text style={styles.heroPass}>Passing score: {data.assessment.passingScore}%</Text>
        </View>

        <View style={styles.card}>
          {!sub && (
            <View style={styles.statusPill}>
              <Ionicons name="time-outline" size={14} color={COLORS.amber} />
              <Text style={[styles.statusPillText, { color: COLORS.amber }]}>Not yet attempted</Text>
            </View>
          )}

          {sub && (
            <>
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

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{sub.score?.toFixed(0) ?? 0}%</Text>
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
            </>
          )}

          <View style={styles.btnCol}>
            <TouchableOpacity
              style={[styles.primaryBtn, maxedOut && styles.disabledBtn]}
              disabled={maxedOut}
              onPress={startExam}
            >
              <Text style={styles.primaryBtnText}>
                {!sub ? 'Start Final Assessment'
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
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  heroKicker: { color: '#9FC4DE', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroPass: { color: '#BFD8EA', fontSize: 13, marginTop: 8 },

  card: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.border },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: COLORS.amberBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16 },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  resultPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 14 },
  resultPillText: { fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statValue: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 2 },

  btnCol: { gap: 10 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  disabledBtn: { backgroundColor: '#B8C4CC' },
  outlineBtn: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  outlineBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
