import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import { DC, ModuleIntro, PartHeading, QCard, QText, ScaleRow, SJTBlock, SjtValue } from './components/dishaControls';
import { getDisha5Questions, submitDisha5Assessment } from '../../lib/api';

const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];
const STRENGTH = [
  { value: 1, label: 'Not strong at all' }, { value: 2, label: 'Slightly' }, { value: 3, label: 'Moderately' },
  { value: 4, label: 'Strong' }, { value: 5, label: 'Very strong' },
];

const STEPS: WizardStep[] = [
  { id: 'adaptability', code: 'A', name: 'Career Adaptability' },
  { id: 'mindset', code: 'B', name: 'Growth Mindset' },
  { id: 'decisionStyle', code: 'C', name: 'Decision-Making Style' },
  { id: 'learningAgility', code: 'D', name: 'Learning Agility' },
  { id: 'ambiguityRisk', code: 'E', name: 'Ambiguity & Risk' },
  { id: 'futureOrientation', code: 'F', name: 'Future Orientation' },
  { id: 'scenarios', code: 'G·H', name: 'Career Scenarios' },
];

const SECTION_META: Record<string, { scale: typeof AGREE; hint: string }> = {
  adaptability: { scale: STRENGTH, hint: 'For each statement, rate how strong this ability is for you currently — not what it should be, but how it actually describes you today.' },
  mindset: { scale: AGREE, hint: 'How much do you agree with each statement about ability and effort?' },
  decisionStyle: { scale: AGREE, hint: 'How do you actually make big career decisions? There are no better or worse styles — the goal is insight.' },
  learningAgility: { scale: AGREE, hint: 'How quickly and eagerly do you take on new skills?' },
  ambiguityRisk: { scale: AGREE, hint: 'How comfortable are you with uncertainty and calculated risk?' },
  futureOrientation: { scale: AGREE, hint: 'How far ahead do you think, and how prepared do you feel for a changing economy?' },
};

export default function DISHA5AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [adaptability, setAdaptability] = useState<Record<string, number>>({});
  const [mindset, setMindset] = useState<Record<string, number>>({});
  const [decisionStyle, setDecisionStyle] = useState<Record<string, number>>({});
  const [learningAgility, setLearningAgility] = useState<Record<string, number>>({});
  const [ambiguityRisk, setAmbiguityRisk] = useState<Record<string, number>>({});
  const [futureOrientation, setFutureOrientation] = useState<Record<string, number>>({});
  const [sjt, setSjt] = useState<Record<string, SjtValue>>({});
  const [validity, setValidity] = useState<Record<string, number>>({});

  useEffect(() => {
    getDisha5Questions()
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const allSjt = useMemo(() => [...(data?.sjt?.blockG || []), ...(data?.sjt?.blockH || [])], [data]);

  const SECTIONS: Record<string, [Record<string, number>, any]> = {
    adaptability: [adaptability, setAdaptability],
    mindset: [mindset, setMindset],
    decisionStyle: [decisionStyle, setDecisionStyle],
    learningAgility: [learningAgility, setLearningAgility],
    ambiguityRisk: [ambiguityRisk, setAmbiguityRisk],
    futureOrientation: [futureOrientation, setFutureOrientation],
  };

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number }> = {};
    if (!data) return c;
    Object.keys(SECTION_META).forEach((k) => {
      const [map] = SECTIONS[k];
      const items = data[k] || [];
      c[k] = { done: items.filter((i: any) => map[i.id]).length, total: items.length };
    });
    c.scenarios = {
      done: allSjt.filter((s: any) => sjt[s.id]?.mostLikely && sjt[s.id]?.leastLikely).length + (data.validity || []).filter((i: any) => validity[i.id]).length,
      total: allSjt.length + (data.validity || []).length,
    };
    return c;
  }, [data, adaptability, mindset, decisionStyle, learningAgility, ambiguityRisk, futureOrientation, sjt, validity, allSjt]);

  const handleSubmit = async () => {
    const pending = STEPS.filter((s) => progress[s.id] && progress[s.id].done < progress[s.id].total);
    if (pending.length) {
      Alert.alert('Incomplete', `Please complete all sections.\n\nPending: ${pending.map((s) => s.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === pending[0].id));
      return;
    }
    setSubmitting(true);
    try {
      await submitDisha5Assessment({
        adaptability, mindset, decisionStyle, learningAgility, ambiguityRisk, futureOrientation,
        sjt, validity,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHA5Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        <ActivityIndicator color={DC.primary} size="large" />
        <Text style={st.loadText}>{loading ? 'Preparing DISHA Test 5…' : 'Could not load the assessment.'}</Text>
      </View>
    );
  }

  const likertList = (key: string) => {
    const [map, setter] = SECTIONS[key];
    const meta = SECTION_META[key];
    return (
      <View>
        <ModuleIntro>{meta.hint}</ModuleIntro>
        {(data[key] || []).map((q: any, i: number) => (
          <QCard index={i + 1} key={q.id}>
            <QText india={q.indiaSpecific}>{q.text}</QText>
            <ScaleRow scale={meta.scale} value={map[q.id]} onChange={(v) => setter((p: any) => ({ ...p, [q.id]: v }))} />
          </QCard>
        ))}
      </View>
    );
  };

  const renderScenarios = () => (
    <View>
      <ModuleIntro>
        For each situation, mark what you would be most likely and least likely to do. There are no
        right or wrong answers — these reveal how you navigate career change and uncertainty.
      </ModuleIntro>

      <PartHeading>Block 1 — Career Transition Scenarios</PartHeading>
      {(data.sjt?.blockG || []).map((sc: any, i: number) => (
        <SJTBlock key={sc.id} index={i + 1} title={sc.title} classFocus={sc.context} scenario={sc.scenario} options={sc.options}
          value={sjt[sc.id]} onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
      ))}

      <PartHeading>Block 2 — Future & Uncertainty Scenarios</PartHeading>
      {(data.sjt?.blockH || []).map((sc: any, i: number) => (
        <SJTBlock key={sc.id} index={(data.sjt?.blockG || []).length + i + 1} title={sc.title} classFocus={sc.context} scenario={sc.scenario} options={sc.options}
          value={sjt[sc.id]} onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
      ))}

      <PartHeading>A few final statements</PartHeading>
      {(data.validity || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText>{q.text}</QText>
          <ScaleRow scale={AGREE} value={validity[q.id]} onChange={(v) => setValidity((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const stepId = STEPS[stepIdx].id;
  const body = stepId === 'scenarios' ? renderScenarios() : likertList(stepId);

  return (
    <DishaWizardShell
      title="DISHA Test 5"
      steps={STEPS}
      stepIdx={stepIdx}
      setStepIdx={setStepIdx}
      progress={progress}
      submitting={submitting}
      onSubmit={handleSubmit}
      onExit={() => navigation.goBack()}
    >
      {body}
    </DishaWizardShell>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DC.bg, gap: 14, padding: 24 },
  loadText: { fontSize: 14, color: DC.gray, fontWeight: '600', textAlign: 'center' },
});
