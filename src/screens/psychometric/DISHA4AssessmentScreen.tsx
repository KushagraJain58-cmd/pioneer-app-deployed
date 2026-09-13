import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import {
  DC, InfoNote, ModuleIntro, PartHeading, QCard, QText, ScaleRow, SJTBlock, SjtValue,
} from './components/dishaControls';
import { getDisha4Questions, submitDisha4Assessment } from '../../lib/api';

const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];

const STEPS: WizardStep[] = [
  { id: 'selfAwareness', code: 'A', name: 'Emotional Self-Awareness' },
  { id: 'selfRegulation', code: 'B', name: 'Emotional Self-Regulation' },
  { id: 'resilience', code: 'C', name: 'Resilience, Grit & Mindset' },
  { id: 'empathy', code: 'D', name: 'Empathy & Interpersonal' },
  { id: 'adaptability', code: 'E', name: 'Social & Cultural Adaptability' },
  { id: 'scenarios', code: 'F·G', name: 'Emotional Scenarios' },
];

const HINTS: Record<string, string> = {
  selfAwareness: 'Rate how accurately each statement describes you — focus on what is typically true for you, not what you think you should feel.',
  selfRegulation: 'How do you manage difficult emotions and pressure?',
  resilience: 'How do you respond to setbacks, and how do you pursue long-term goals?',
  empathy: 'How do you relate to and support the people around you?',
  adaptability: 'How comfortable are you with new people, places and cultures?',
};

export default function DISHA4AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [selfAwareness, setSelfAwareness] = useState<Record<string, number>>({});
  const [selfRegulation, setSelfRegulation] = useState<Record<string, number>>({});
  const [resilience, setResilience] = useState<Record<string, number>>({});
  const [empathy, setEmpathy] = useState<Record<string, number>>({});
  const [adaptability, setAdaptability] = useState<Record<string, number>>({});
  const [sjt, setSjt] = useState<Record<string, SjtValue>>({});
  const [validity, setValidity] = useState<Record<string, number>>({});
  const [crisisSelfCheck, setCrisisSelfCheck] = useState<number | null>(null);

  useEffect(() => {
    getDisha4Questions()
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const allSjt = useMemo(() => [...(data?.sjt?.blockF || []), ...(data?.sjt?.blockG || [])], [data]);

  const LIKERT_MAPS: Record<string, [any[], Record<string, number>, any]> = {
    selfAwareness: [data?.selfAwareness || [], selfAwareness, setSelfAwareness],
    selfRegulation: [data?.selfRegulation || [], selfRegulation, setSelfRegulation],
    resilience: [data?.resilience || [], resilience, setResilience],
    empathy: [data?.empathy || [], empathy, setEmpathy],
    adaptability: [data?.adaptability || [], adaptability, setAdaptability],
  };

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number }> = {};
    if (!data) return c;
    (['selfAwareness', 'selfRegulation', 'resilience', 'empathy', 'adaptability'] as const).forEach((k) => {
      const [items, map] = LIKERT_MAPS[k];
      c[k] = { done: items.filter((i: any) => map[i.id]).length, total: items.length };
    });
    c.scenarios = {
      done: allSjt.filter((s: any) => sjt[s.id]?.mostLikely && sjt[s.id]?.leastLikely).length + (data.validity || []).filter((i: any) => validity[i.id]).length,
      total: allSjt.length + (data.validity || []).length,
    };
    return c;
  }, [data, selfAwareness, selfRegulation, resilience, empathy, adaptability, sjt, validity, allSjt]);

  const handleSubmit = async () => {
    const pending = STEPS.filter((s) => progress[s.id] && progress[s.id].done < progress[s.id].total);
    if (pending.length) {
      Alert.alert('Incomplete', `Please complete all sections.\n\nPending: ${pending.map((s) => s.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === pending[0].id));
      return;
    }
    setSubmitting(true);
    try {
      await submitDisha4Assessment({
        selfAwareness, selfRegulation, resilience, empathy, adaptability,
        sjt, validity, crisisSelfCheck,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHA4Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        <ActivityIndicator color={DC.primary} size="large" />
        <Text style={st.loadText}>{loading ? 'Preparing DISHA Test 4…' : 'Could not load the assessment.'}</Text>
      </View>
    );
  }

  const likertList = (key: string) => {
    const [items, map, setter] = LIKERT_MAPS[key];
    return (
      <View>
        <ModuleIntro>{HINTS[key]}</ModuleIntro>
        {items.map((q: any, i: number) => (
          <QCard index={i + 1} key={q.id}>
            <QText india={q.indiaSpecific}>{q.text}</QText>
            <ScaleRow scale={AGREE} value={map[q.id]} onChange={(v) => setter((p: any) => ({ ...p, [q.id]: v }))} />
          </QCard>
        ))}
      </View>
    );
  };

  const renderScenarios = () => (
    <View>
      <ModuleIntro>
        For each situation, mark what you would be most likely and least likely to do. There are no
        right or wrong answers — these show how you tend to respond under pressure.
      </ModuleIntro>

      <PartHeading>Block 1 — Emotional Scenarios</PartHeading>
      {(data.sjt?.blockF || []).map((sc: any, i: number) => (
        <SJTBlock key={sc.id} index={i + 1} title={sc.title} classFocus={sc.context} scenario={sc.scenario} options={sc.options}
          value={sjt[sc.id]} onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
      ))}

      <PartHeading>Block 2 — Resilience & Social Scenarios</PartHeading>
      {(data.sjt?.blockG || []).map((sc: any, i: number) => (
        <SJTBlock key={sc.id} index={(data.sjt?.blockF || []).length + i + 1} title={sc.title} classFocus={sc.context} scenario={sc.scenario} options={sc.options}
          value={sjt[sc.id]} onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
      ))}

      <PartHeading>A few final statements</PartHeading>
      {(data.validity || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText>{q.text}</QText>
          <ScaleRow scale={AGREE} value={validity[q.id]} onChange={(v) => setValidity((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}

      {data.crisisSelfCheck && (
        <QCard index={(data.validity || []).length + 1}>
          <QText>{data.crisisSelfCheck.text}  <Text style={st.optional}>(optional)</Text></QText>
          <ScaleRow scale={AGREE} value={crisisSelfCheck ?? undefined} onChange={(v) => setCrisisSelfCheck(v)} />
          {crisisSelfCheck != null && crisisSelfCheck >= 4 && (
            <View style={{ marginTop: 12 }}>
              <InfoNote>
                We want to make sure you're okay. What you're describing is something many students go
                through, and support genuinely helps. Please consider speaking to your counsellor or a
                trusted adult, or calling iCall (9152987821) or the Vandrevala Foundation
                (1860-2662-345). Reaching out is a strength, not a weakness.
              </InfoNote>
            </View>
          )}
        </QCard>
      )}
    </View>
  );

  const stepId = STEPS[stepIdx].id;
  const body = stepId === 'scenarios' ? renderScenarios() : likertList(stepId);

  return (
    <DishaWizardShell
      title="DISHA Test 4"
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
  optional: { fontSize: 12, color: DC.faint, fontWeight: '600' },
});
