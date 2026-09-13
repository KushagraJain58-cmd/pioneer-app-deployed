import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { submitSkillAssignment, submitSkillFinalAssessment } from '../../lib/api';
import { COLORS } from './skillsTheme';

interface Option { id: string; text: string }
interface Question {
  id: string;
  questionText: string;
  type: 'single' | 'multiple' | 'text' | 'number';
  options?: Option[];
}
interface Answer { selectedOptionIds?: string[]; writtenAnswer?: string }

export default function SkillQuizScreen({ route, navigation }: any) {
  const { mode, assessment, questions = [], title } = route.params as {
    mode: 'week' | 'final';
    assessment: { id: string; title: string };
    questions: Question[];
    title?: string;
  };

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectSingle = (qId: string, optId: string) =>
    setAnswers(prev => ({ ...prev, [qId]: { selectedOptionIds: [optId] } }));

  const toggleMultiple = (qId: string, optId: string) =>
    setAnswers(prev => {
      const current = prev[qId]?.selectedOptionIds || [];
      const updated = current.includes(optId)
        ? current.filter(id => id !== optId)
        : [...current, optId];
      return { ...prev, [qId]: { selectedOptionIds: updated } };
    });

  const setWritten = (qId: string, value: string) =>
    setAnswers(prev => ({ ...prev, [qId]: { writtenAnswer: value } }));

  const isComplete = useMemo(() => questions.every((q: Question) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.type === 'single' || q.type === 'multiple') return (a.selectedOptionIds?.length || 0) > 0;
    return !!a.writtenAnswer?.trim();
  }), [answers, questions]);

  const answeredCount = useMemo(
    () => questions.filter((q: Question) => {
      const a = answers[q.id];
      if (!a) return false;
      if (q.type === 'single' || q.type === 'multiple') return (a.selectedOptionIds?.length || 0) > 0;
      return !!a.writtenAnswer?.trim();
    }).length,
    [answers, questions],
  );

  const handleSubmit = async () => {
    if (!isComplete) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        assessmentId: assessment.id,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          selectedOptionIds: value.selectedOptionIds || [],
          writtenAnswer: value.writtenAnswer || null,
        })),
      };
      const res = mode === 'final'
        ? await submitSkillFinalAssessment(payload)
        : await submitSkillAssignment(payload);

      navigation.replace('SkillResult', { result: res.data?.data });
    } catch {
      Alert.alert('Submission failed', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length ? answeredCount / questions.length : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>
      <View style={styles.progressLabel}>
        <Text style={styles.progressText}>{answeredCount} / {questions.length} answered</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title || assessment?.title}</Text>

        {questions.map((q: Question, idx: number) => (
          <View key={q.id} style={styles.qCard}>
            <View style={styles.qHeader}>
              <View style={styles.qBadge}><Text style={styles.qBadgeText}>{idx + 1}</Text></View>
              <Text style={styles.qText}>{q.questionText}</Text>
            </View>

            {(q.type === 'single' || q.type === 'multiple') && (
              <View style={styles.optionsCol}>
                {q.type === 'multiple' && <Text style={styles.hint}>Select all that apply</Text>}
                {q.options?.map(opt => {
                  const selected = answers[q.id]?.selectedOptionIds?.includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.option, selected && styles.optionSelected]}
                      onPress={() => q.type === 'single'
                        ? selectSingle(q.id, opt.id)
                        : toggleMultiple(q.id, opt.id)}
                    >
                      <Ionicons
                        name={q.type === 'single'
                          ? (selected ? 'radio-button-on' : 'radio-button-off')
                          : (selected ? 'checkbox' : 'square-outline')}
                        size={20}
                        color={selected ? COLORS.primary : COLORS.gray}
                      />
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {(q.type === 'text' || q.type === 'number') && (
              <TextInput
                style={styles.input}
                value={answers[q.id]?.writtenAnswer || ''}
                onChangeText={v => setWritten(q.id, v)}
                placeholder="Type your answer"
                placeholderTextColor={COLORS.gray}
                keyboardType={q.type === 'number' ? 'numeric' : 'default'}
                multiline={q.type === 'text'}
              />
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitBtn, (!isComplete || submitting) && styles.submitDisabled]}
          disabled={!isComplete || submitting}
          onPress={handleSubmit}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Submit {mode === 'final' ? 'Final Assessment' : 'Assessment'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  progressBar: { height: 4, backgroundColor: COLORS.border, width: '100%' },
  progressFill: { height: 4, backgroundColor: COLORS.accent },
  progressLabel: { paddingVertical: 8, alignItems: 'flex-end', paddingRight: 16 },
  progressText: { fontSize: 11, color: COLORS.gray },
  container: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 18 },

  qCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  qHeader: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  qBadge: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#E6F1FA', justifyContent: 'center', alignItems: 'center' },
  qBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  qText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22, fontWeight: '600' },

  optionsCol: { gap: 9 },
  hint: { fontSize: 11, color: COLORS.gray, fontStyle: 'italic', marginBottom: 2 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 14 },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: '#EFF8FF' },
  optionText: { flex: 1, fontSize: 14, color: COLORS.text },
  optionTextSelected: { color: COLORS.primary, fontWeight: '600' },

  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 14, color: COLORS.text, minHeight: 50, textAlignVertical: 'top' },

  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitDisabled: { backgroundColor: '#B8C4CC' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
