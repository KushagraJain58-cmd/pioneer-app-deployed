import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { submitMbtiAssessment } from '../../lib/api';
import { MBTI_QUESTIONS, getColumn } from '../../data/mbtiQuestions';

const COLORS = {
  primary: '#004877',
  accent: '#3BBEE8',
  bg: '#F6FCFF',
  white: '#FFFFFF',
  text: '#12303F',
  gray: '#6B7A86',
  faint: '#9AA7B1',
  border: '#E4EDF3',
  surface: '#F0F7FB',
};

interface MbtiAnswer {
  question_id: number;
  column: number;
  response: 'A' | 'B';
}

export default function MBTIAssessmentScreen({ navigation }: any) {
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const answersRef = useRef<MbtiAnswer[]>([]);
  const startTime = useRef(Date.now());

  const total = MBTI_QUESTIONS.length;
  const question = MBTI_QUESTIONS[current];
  const progress = ((current + (submitting ? 1 : 0)) / total) * 100;

  const submit = async (finalAnswers: MbtiAnswer[]) => {
    setSubmitting(true);
    try {
      const completionTimeSeconds = Math.floor((Date.now() - startTime.current) / 1000);
      await submitMbtiAssessment({ completionTimeSeconds, answers: finalAnswers });
      navigation.replace('MBTIResult');
    } catch {
      Alert.alert('Error', 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const answer = (response: 'A' | 'B') => {
    if (submitting) return;
    const entry: MbtiAnswer = { question_id: question.id, column: getColumn(question.id), response };
    const updated = [...answersRef.current, entry];
    answersRef.current = updated;
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      submit(updated);
    }
  };

  const goBack = () => {
    if (current === 0 || submitting) return;
    answersRef.current = answersRef.current.slice(0, -1);
    setCurrent((c) => c - 1);
  };

  if (submitting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.submittingText}>Scoring your personality type…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.body}>
        <Text style={styles.counter}>Question {current + 1} of {total}</Text>
        <Text style={styles.prompt}>{question.text}</Text>

        <View style={styles.choices}>
          <TouchableOpacity style={styles.choice} activeOpacity={0.85} onPress={() => answer('A')}>
            <Text style={styles.choiceLetter}>A</Text>
            <Text style={styles.choiceText}>{question.a}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.choice} activeOpacity={0.85} onPress={() => answer('B')}>
            <Text style={styles.choiceLetter}>B</Text>
            <Text style={styles.choiceText}>{question.b}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Answer quickly — do not overthink.</Text>

        {current > 0 && (
          <TouchableOpacity style={styles.backLink} onPress={goBack}>
            <Text style={styles.backLinkText}>← Previous</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, gap: 14 },
  submittingText: { fontSize: 14, color: COLORS.gray, fontWeight: '600' },
  progressTrack: { height: 5, backgroundColor: COLORS.border, width: '100%' },
  progressFill: { height: 5, backgroundColor: COLORS.accent },
  body: { flex: 1, padding: 22, justifyContent: 'center' },
  counter: { fontSize: 12, fontWeight: '700', color: COLORS.accent, textAlign: 'center', letterSpacing: 0.5, marginBottom: 18 },
  prompt: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', lineHeight: 30, marginBottom: 34, letterSpacing: -0.3 },
  choices: { gap: 14 },
  choice: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    paddingVertical: 18, paddingHorizontal: 18,
    shadowColor: '#0A2A3F', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  choiceLetter: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surface, color: COLORS.primary,
    textAlign: 'center', lineHeight: 34, fontWeight: '800', fontSize: 15, overflow: 'hidden',
  },
  choiceText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '600', lineHeight: 21 },
  hint: { fontSize: 12.5, color: COLORS.faint, textAlign: 'center', marginTop: 24 },
  backLink: { alignSelf: 'center', marginTop: 18, padding: 8 },
  backLinkText: { fontSize: 14, color: COLORS.gray, fontWeight: '600' },
});
