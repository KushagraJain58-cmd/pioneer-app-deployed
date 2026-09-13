import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export interface SurveyQuestion {
  id: string | number;
  text: string;
}
export interface SurveyOption {
  label: string;
  value: number | string;
}

interface Props {
  title: string;
  questions: SurveyQuestion[];
  options: SurveyOption[];
  loading: boolean;
  navigation: any;
  resultScreen: string;
  buildPayload: (
    answered: { id: string | number; value: number | string }[],
    completionTimeSeconds: number
  ) => any;
  submit: (payload: any) => Promise<void>;
}

export default function SurveyAssessment({
  title,
  questions,
  options,
  loading,
  navigation,
  resultScreen,
  buildPayload,
  submit,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? answeredCount / questions.length : 0;

  const pick = (id: string | number, value: number | string) =>
    setAnswers((prev) => ({ ...prev, [String(id)]: value }));

  const orderedAnswered = useMemo(
    () =>
      questions
        .filter((q) => answers[String(q.id)] !== undefined)
        .map((q) => ({ id: q.id, value: answers[String(q.id)] })),
    [answers, questions]
  );

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const seconds = Math.floor((Date.now() - startTime.current) / 1000);
      await submit(buildPayload(orderedAnswered, seconds));
      navigation.replace(resultScreen);
    } catch {
      Alert.alert('Error', 'Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.progressLabel}>
        <Text style={styles.progressText}>
          {answeredCount} / {questions.length} answered
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>

        {questions.map((q, idx) => (
          <View key={String(q.id)} style={styles.qCard}>
            <View style={styles.qHead}>
              <View style={styles.qNumBadge}>
                <Text style={styles.qNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.qText}>{q.text}</Text>
            </View>
            <View style={styles.options}>
              {options.map((opt) => {
                const selected = answers[String(q.id)] === opt.value;
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    activeOpacity={0.85}
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => pick(q.id, opt.value)}
                  >
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Assessment</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  progressTrack: { height: 5, backgroundColor: COLORS.border, width: '100%' },
  progressFill: { height: 5, backgroundColor: COLORS.accent },
  progressLabel: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'flex-end' },
  progressText: { fontSize: 11.5, color: COLORS.gray, fontWeight: '600' },
  container: { paddingHorizontal: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 18, letterSpacing: -0.3 },
  qCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  qHead: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  qNumBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  qNumText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  qText: { flex: 1, fontSize: 14.5, color: COLORS.text, lineHeight: 21, fontWeight: '600', paddingTop: 3 },
  options: { gap: 9 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14, backgroundColor: COLORS.surface,
  },
  optionSelected: { backgroundColor: '#E4F4FB', borderColor: COLORS.primary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.faint, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  optionText: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600' },
  optionTextSelected: { color: COLORS.primary, fontWeight: '700' },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
