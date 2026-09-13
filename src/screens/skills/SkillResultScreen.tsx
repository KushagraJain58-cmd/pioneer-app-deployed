import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './skillsTheme';

interface ResultItem {
  questionText: string;
  userWrittenAnswer?: string | null;
  userSelectedOptionIds?: string[];
  correctAnswerText?: string | null;
  correctOptions?: string[];
  isCorrect?: boolean;
}

interface Result {
  score: number;
  passed: boolean;
  totalQuestions: number;
  totalCorrect: number;
  attemptNumber: number;
  results: ResultItem[];
}

export default function SkillResultScreen({ route, navigation }: any) {
  const result: Result | undefined = route.params?.result;

  if (!result) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-outline" size={36} color={COLORS.gray} />
        <Text style={styles.muted}>No result data found.</Text>
      </View>
    );
  }

  const { score, passed, totalQuestions, totalCorrect, results = [], attemptNumber } = result;
  const reveal = passed || attemptNumber >= 5;

  const formatUserAnswer = (item: ResultItem) =>
    item.userWrittenAnswer ||
    (item.userSelectedOptionIds?.length ? item.userSelectedOptionIds.join(', ') : 'Not answered');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Summary hero */}
        <View style={[styles.hero, { backgroundColor: passed ? COLORS.green : COLORS.primary }]}>
          <View style={styles.heroIcon}>
            <Ionicons name={passed ? 'trophy' : 'ribbon'} size={30} color="#fff" />
          </View>
          <Text style={styles.heroStatus}>{passed ? 'Congratulations!' : 'Keep Going!'}</Text>
          <Text style={styles.heroScore}>{score?.toFixed(1)}%</Text>
          <Text style={styles.heroSub}>{passed ? 'You passed the assessment' : 'You did not pass this time'}</Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{totalCorrect}/{totalQuestions}</Text>
              <Text style={styles.heroStatLabel}>Correct</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>Attempt {attemptNumber}</Text>
              <Text style={styles.heroStatLabel}>Number</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Question Breakdown</Text>

        {results.map((item, idx) => (
          <View key={idx} style={styles.qCard}>
            <Text style={styles.qText}>{idx + 1}. {item.questionText}</Text>

            <View style={styles.answerBlock}>
              <Text style={styles.answerLabel}>Your answer</Text>
              <Text style={styles.answerValue}>{formatUserAnswer(item)}</Text>
            </View>

            {reveal ? (
              <>
                <View style={styles.answerBlock}>
                  <Text style={[styles.answerLabel, { color: COLORS.green }]}>Correct answer</Text>
                  <Text style={[styles.answerValue, { color: COLORS.green }]}>
                    {item.correctAnswerText || item.correctOptions?.join(', ') || '—'}
                  </Text>
                </View>
                <View style={[styles.verdict, { backgroundColor: item.isCorrect ? COLORS.greenBg : COLORS.redBg }]}>
                  <Ionicons
                    name={item.isCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={15}
                    color={item.isCorrect ? COLORS.green : COLORS.red}
                  />
                  <Text style={[styles.verdictText, { color: item.isCorrect ? COLORS.green : COLORS.red }]}>
                    {item.isCorrect ? 'Correct' : 'Incorrect'}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.hidden}>Correct answers unlock once you pass the assessment.</Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Skills')}
        >
          <Text style={styles.backBtnText}>Back to Skill Readiness</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, gap: 10 },
  muted: { color: COLORS.gray, fontSize: 13 },
  container: { padding: 16, paddingBottom: 48 },

  hero: { borderRadius: 22, padding: 26, alignItems: 'center', marginBottom: 22 },
  heroIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  heroStatus: { color: '#fff', fontSize: 15, fontWeight: '700', opacity: 0.9 },
  heroScore: { color: '#fff', fontSize: 44, fontWeight: '900', marginVertical: 2 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  heroStat: { alignItems: 'center' },
  heroStatValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  heroStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  heroStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 24 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 12 },

  qCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  qText: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 21, marginBottom: 12 },
  answerBlock: { marginBottom: 10 },
  answerLabel: { fontSize: 11, fontWeight: '700', color: COLORS.gray, letterSpacing: 0.4, marginBottom: 3 },
  answerValue: { fontSize: 14, color: COLORS.text },
  verdict: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  verdictText: { fontSize: 12, fontWeight: '700' },
  hidden: { fontSize: 13, color: COLORS.gray, fontStyle: 'italic' },

  backBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
