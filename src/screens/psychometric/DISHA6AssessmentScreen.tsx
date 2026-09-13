import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import { DC, ForcedChoice, ModuleIntro, PartHeading, QCard, QText, ScaleRow, SJTBlock, SjtValue, TextField } from './components/dishaControls';
import { getDisha6Questions, submitDisha6Assessment } from '../../lib/api';

const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];

const STEPS: WizardStep[] = [
  { id: 'divergentTasks', code: 'A', name: 'Creative Thinking Tasks' },
  { id: 'creativeSelfReport', code: 'B', name: 'Creative Self-Report' },
  { id: 'innovationMindset', code: 'C', name: 'Innovation Mindset' },
  { id: 'entrepreneurial', code: 'D', name: 'Entrepreneurial Potential' },
  { id: 'problemSolvingStyle', code: 'E', name: 'Problem-Solving Style' },
  { id: 'designSensitivity', code: 'F', name: 'Design Sensitivity' },
  { id: 'scenarios', code: 'G·H', name: 'Creative & Innovation Scenarios' },
];

const HINTS: Record<string, string> = {
  creativeSelfReport: 'Rate how accurately each statement describes you.',
  entrepreneurial: 'There are no right or wrong answers — these are about your preferences and values, not whether you are "suited" to be an entrepreneur.',
  problemSolvingStyle: 'No style is better than another — the goal is insight into how you naturally work.',
  designSensitivity: '',
};

export default function DISHA6AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [divergentTasks, setDivergentTasks] = useState<Record<string, string>>({});
  const [creativeSelfReport, setCreativeSelfReport] = useState<Record<string, number>>({});
  const [innovationMindset, setInnovationMindset] = useState<Record<string, number>>({});
  const [innovationFc, setInnovationFc] = useState<Record<string, string>>({});
  const [entrepreneurial, setEntrepreneurial] = useState<Record<string, number>>({});
  const [problemSolvingStyle, setProblemSolvingStyle] = useState<Record<string, number>>({});
  const [designSensitivity, setDesignSensitivity] = useState<Record<string, number>>({});
  const [sjt, setSjt] = useState<Record<string, SjtValue>>({});
  const [validity, setValidity] = useState<Record<string, number>>({});

  useEffect(() => {
    getDisha6Questions()
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const allSjt = useMemo(() => [...(data?.sjt?.blockG || []), ...(data?.sjt?.blockH || [])], [data]);

  const LIKERT: Record<string, [Record<string, number>, any]> = {
    creativeSelfReport: [creativeSelfReport, setCreativeSelfReport],
    entrepreneurial: [entrepreneurial, setEntrepreneurial],
    problemSolvingStyle: [problemSolvingStyle, setProblemSolvingStyle],
    designSensitivity: [designSensitivity, setDesignSensitivity],
  };

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number }> = {};
    if (!data) return c;
    c.divergentTasks = {
      done: (data.divergentTasks || []).filter((t: any) => (divergentTasks[t.id] || '').trim().length > 0).length,
      total: (data.divergentTasks || []).length,
    };
    (['creativeSelfReport', 'entrepreneurial', 'problemSolvingStyle', 'designSensitivity'] as const).forEach((k) => {
      const [map] = LIKERT[k];
      const items = data[k] || [];
      c[k] = { done: items.filter((i: any) => map[i.id]).length, total: items.length };
    });
    c.innovationMindset = {
      done: (data.innovationMindset || []).filter((i: any) => innovationMindset[i.id]).length + (data.innovationFc || []).filter((p: any) => innovationFc[p.id]).length,
      total: (data.innovationMindset || []).length + (data.innovationFc || []).length,
    };
    c.scenarios = {
      done: allSjt.filter((s: any) => sjt[s.id]?.mostLikely && sjt[s.id]?.leastLikely).length + (data.validity || []).filter((i: any) => validity[i.id]).length,
      total: allSjt.length + (data.validity || []).length,
    };
    return c;
  }, [data, divergentTasks, creativeSelfReport, innovationMindset, innovationFc, entrepreneurial, problemSolvingStyle, designSensitivity, sjt, validity, allSjt]);

  const handleSubmit = async () => {
    const pending = STEPS.filter((s) => progress[s.id] && progress[s.id].done < progress[s.id].total);
    if (pending.length) {
      Alert.alert('Incomplete', `Please complete all sections.\n\nPending: ${pending.map((s) => s.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === pending[0].id));
      return;
    }
    setSubmitting(true);
    try {
      await submitDisha6Assessment({
        divergentTasks, creativeSelfReport, innovationMindset, innovationFc,
        entrepreneurial, problemSolvingStyle, designSensitivity, sjt, validity,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHA6Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        <ActivityIndicator color={DC.primary} size="large" />
        <Text style={st.loadText}>{loading ? 'Preparing DISHA Test 6…' : 'Could not load the assessment.'}</Text>
      </View>
    );
  }

  const likertList = (key: string) => {
    const [map, setter] = LIKERT[key];
    const hint = HINTS[key];
    return (
      <View>
        {!!hint && <ModuleIntro>{hint}</ModuleIntro>}
        {(data[key] || []).map((q: any, i: number) => (
          <QCard index={i + 1} key={q.id}>
            <QText india={q.indiaSpecific}>{q.text}</QText>
            <ScaleRow scale={AGREE} value={map[q.id]} onChange={(v) => setter((p: any) => ({ ...p, [q.id]: v }))} />
          </QCard>
        ))}
      </View>
    );
  };

  const renderDivergentTasks = () => (
    <View>
      <ModuleIntro>
        For each task, write as many ideas as you can — one idea per line. There are no right or wrong
        answers; unusual, creative or unexpected ideas are especially valued. Write quickly, don't
        filter your ideas.
      </ModuleIntro>
      {(data.divergentTasks || []).map((task: any, i: number) => (
        <View key={task.id} style={st.taskCard}>
          <View style={st.taskHead}>
            <Text style={st.taskTitle}>
              {i + 1}. {task.title}
              {task.indiaContextStars > 0 ? <Text style={st.star}>  {'★'.repeat(task.indiaContextStars)}</Text> : null}
            </Text>
            {!!task.timeSeconds && <Text style={st.timeTag}>{task.timeSeconds}s</Text>}
          </View>
          <Text style={st.taskPrompt}>{task.prompt}</Text>
          {!!task.substitutionNote && <Text style={st.subNote}>{task.substitutionNote}</Text>}
          <TextField value={divergentTasks[task.id]} onChange={(v) => setDivergentTasks((p) => ({ ...p, [task.id]: v }))} placeholder="One idea per line…" rows={6} />
        </View>
      ))}
    </View>
  );

  const renderInnovationMindset = () => (
    <View>
      <ModuleIntro>How do you approach problems and new ideas?</ModuleIntro>
      {(data.innovationMindset || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={AGREE} value={innovationMindset[q.id]} onChange={(v) => setInnovationMindset((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
      <PartHeading>When two approaches conflict, which resonates more?</PartHeading>
      {(data.innovationFc || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          {!!q.prompt && <QText>{q.prompt}</QText>}
          <View style={{ marginTop: q.prompt ? 10 : 0 }}>
            <ForcedChoice value={innovationFc[q.id]} onChange={(v) => setInnovationFc((p) => ({ ...p, [q.id]: v }))} optionA={q.optionA.text} optionB={q.optionB.text} />
          </View>
        </QCard>
      ))}
    </View>
  );

  const renderScenarios = () => (
    <View>
      <ModuleIntro>For each situation, mark what you would be most likely and least likely to do. There are no right or wrong answers.</ModuleIntro>
      <PartHeading>Block 1 — Creative & Entrepreneurial Dilemmas</PartHeading>
      {(data.sjt?.blockG || []).map((sc: any, i: number) => (
        <SJTBlock key={sc.id} index={i + 1} title={sc.title} classFocus={sc.context} scenario={sc.scenario} options={sc.options}
          value={sjt[sc.id]} onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
      ))}
      <PartHeading>Block 2 — Innovation & Startup Scenarios</PartHeading>
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
  const body =
    stepId === 'divergentTasks' ? renderDivergentTasks()
      : stepId === 'innovationMindset' ? renderInnovationMindset()
      : stepId === 'scenarios' ? renderScenarios()
      : likertList(stepId);

  return (
    <DishaWizardShell
      title="DISHA Test 6"
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
  taskCard: { borderWidth: 1, borderColor: DC.border, borderRadius: 14, padding: 16, marginBottom: 14, backgroundColor: DC.white },
  taskHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: DC.text },
  star: { color: DC.amber, fontWeight: '800' },
  timeTag: { fontSize: 11, fontWeight: '700', color: DC.primary, backgroundColor: '#E4F4FB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  taskPrompt: { fontSize: 13.5, color: DC.text, lineHeight: 20, marginBottom: 8 },
  subNote: { fontSize: 12, color: DC.faint, fontStyle: 'italic', marginBottom: 10, lineHeight: 17 },
});
