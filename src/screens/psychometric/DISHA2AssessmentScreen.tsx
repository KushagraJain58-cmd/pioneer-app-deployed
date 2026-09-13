import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import {
  DC, DifferentialRow, ForcedChoice, ModuleIntro, PartHeading, QCard, QText, ScaleRow, SJTBlock, SjtValue,
} from './components/dishaControls';
import { getDisha2Questions, submitDisha2Assessment } from '../../lib/api';

const LIKE = [
  { value: 1, label: 'Strongly Dislike' }, { value: 2, label: 'Dislike' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Like' }, { value: 5, label: 'Strongly Like' },
];
const APPEAL = [
  { value: 1, label: 'Not at all' }, { value: 2, label: 'Slightly' }, { value: 3, label: 'Somewhat' },
  { value: 4, label: 'Appealing' }, { value: 5, label: 'Very appealing' },
];
const IMPORTANCE = [
  { value: 1, label: 'Not important' }, { value: 2, label: 'Slightly' }, { value: 3, label: 'Moderately' },
  { value: 4, label: 'Very' }, { value: 5, label: 'Extremely' },
];
const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];

const STEPS: WizardStep[] = [
  { id: 'activities', code: 'A', name: 'Activity Preferences' },
  { id: 'occupations', code: 'B', name: 'Occupational Ratings' },
  { id: 'workValues', code: 'C', name: 'Work Values' },
  { id: 'motivations', code: 'D', name: 'Career Motivations' },
  { id: 'environment', code: 'E', name: 'Work Environment' },
  { id: 'sjt', code: 'F', name: 'Situational Judgment' },
];

export default function DISHA2AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [activities, setActivities] = useState<Record<string, number>>({});
  const [occupations, setOccupations] = useState<Record<string, number>>({});
  const [wvLikert, setWvLikert] = useState<Record<string, number>>({});
  const [wvFc, setWvFc] = useState<Record<string, string>>({});
  const [valueRanking, setValueRanking] = useState<string[]>([]);
  const [motivations, setMotivations] = useState<Record<string, number>>({});
  const [envSector, setEnvSector] = useState<Record<string, string>>({});
  const [workStyle, setWorkStyle] = useState<Record<string, number>>({});
  const [sjt, setSjt] = useState<Record<string, SjtValue>>({});

  useEffect(() => {
    getDisha2Questions()
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number }> = {};
    if (!data) return c;
    c.activities = { done: (data.activities || []).filter((i: any) => activities[i.id]).length, total: (data.activities || []).length };
    c.occupations = { done: (data.occupations || []).filter((o: any) => occupations[o.id]).length, total: (data.occupations || []).length };
    const lik = data.workValues?.likert || [], fc = data.workValues?.forcedChoice || [];
    c.workValues = {
      done: lik.filter((i: any) => wvLikert[i.id]).length + fc.filter((p: any) => wvFc[p.id]).length + (valueRanking.length >= 1 ? 1 : 0),
      total: lik.length + fc.length + 1,
    };
    c.motivations = { done: (data.motivations || []).filter((i: any) => motivations[i.id]).length, total: (data.motivations || []).length };
    const sec = data.environment?.sector || [], ws = data.environment?.workStyle || [];
    c.environment = { done: sec.filter((p: any) => envSector[p.id]).length + ws.filter((i: any) => workStyle[i.id]).length, total: sec.length + ws.length };
    c.sjt = { done: (data.sjt || []).filter((s: any) => sjt[s.id]?.mostLikely && sjt[s.id]?.leastLikely).length, total: (data.sjt || []).length };
    return c;
  }, [data, activities, occupations, wvLikert, wvFc, valueRanking, motivations, envSector, workStyle, sjt]);

  const toggleRank = (val: string) =>
    setValueRanking((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : prev.length >= 5 ? prev : [...prev, val]));

  const handleSubmit = async () => {
    const pending = STEPS.filter((s) => progress[s.id] && progress[s.id].done < progress[s.id].total);
    if (pending.length) {
      Alert.alert('Incomplete', `Please complete all sections before submitting.\n\nPending: ${pending.map((s) => s.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === pending[0].id));
      return;
    }
    setSubmitting(true);
    try {
      await submitDisha2Assessment({
        activities, occupations,
        workValuesLikert: wvLikert, workValuesForcedChoice: wvFc, valueRanking,
        motivations, envSector, workStyle, sjt,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHA2Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        <ActivityIndicator color={DC.primary} size="large" />
        <Text style={st.loadText}>{loading ? 'Preparing DISHA Test 2…' : 'Could not load the assessment.'}</Text>
      </View>
    );
  }

  const renderActivities = () => (
    <View>
      <ModuleIntro>Rate how much you would enjoy each activity — regardless of whether you're good at it or your family would approve.</ModuleIntro>
      {(data.activities || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={LIKE} value={activities[q.id]} onChange={(v) => setActivities((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderOccupations = () => (
    <View>
      <ModuleIntro>Rate how appealing each career sounds — regardless of whether you think you could get into it.</ModuleIntro>
      {(data.occupations || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <View style={st.occTitleRow}>
            <Text style={st.occTitle}>{q.title}</Text>
            <Text style={st.occSector}>{q.sector}</Text>
          </View>
          {!!q.description && <Text style={st.occDesc}>{q.description}</Text>}
          <ScaleRow scale={APPEAL} value={occupations[q.id]} onChange={(v) => setOccupations((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderWorkValues = () => (
    <View>
      <PartHeading>Part 1 — How important is this to you?</PartHeading>
      {(data.workValues?.likert || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={IMPORTANCE} value={wvLikert[q.id]} onChange={(v) => setWvLikert((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}

      <PartHeading>Part 2 — When two values conflict, which matters more?</PartHeading>
      {(data.workValues?.forcedChoice || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <ForcedChoice value={wvFc[q.id]} onChange={(v) => setWvFc((p) => ({ ...p, [q.id]: v }))} optionA={q.optionA.text} optionB={q.optionB.text} />
        </QCard>
      ))}

      <PartHeading>Part 3 — Rank your top 5 values</PartHeading>
      <ModuleIntro>Tap to add a value (1 = most important). Tap again to remove. Choose up to 5.</ModuleIntro>
      <View style={{ gap: 10 }}>
        {(data.workValues?.rankOptions || []).map((v: any) => {
          const rank = valueRanking.indexOf(v.value);
          const selected = rank >= 0;
          return (
            <TouchableOpacity key={v.value} activeOpacity={0.85} style={[st.rankCard, selected && st.rankCardOn]} onPress={() => toggleRank(v.value)}>
              <View style={[st.rankBadge, selected && st.rankBadgeOn]}>
                <Text style={[st.rankBadgeText, selected && st.rankBadgeTextOn]}>{selected ? rank + 1 : '+'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.rankLabel}>{v.label}{v.indiaSpecific ? <Text style={st.star}>  ★</Text> : null}</Text>
                {!!v.description && <Text style={st.rankDesc}>{v.description}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderMotivations = () => (
    <View>
      <ModuleIntro>Rate how much each statement describes your true motivations — not what you think you should feel.</ModuleIntro>
      {(data.motivations || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={AGREE} value={motivations[q.id]} onChange={(v) => setMotivations((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderEnvironment = () => (
    <View>
      <PartHeading>Part 1 — Which environment appeals more?</PartHeading>
      {(data.environment?.sector || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <ForcedChoice value={envSector[q.id]} onChange={(v) => setEnvSector((p) => ({ ...p, [q.id]: v }))} optionA={q.optionA.text} optionB={q.optionB.text} />
        </QCard>
      ))}
      <PartHeading>Part 2 — Where do you lean?</PartHeading>
      {(data.environment?.workStyle || []).map((q: any) => (
        <View key={q.id} style={st.wsCard}>
          <DifferentialRow left={q.left} right={q.right} value={workStyle[q.id]} onChange={(v) => setWorkStyle((p) => ({ ...p, [q.id]: v }))} />
        </View>
      ))}
    </View>
  );

  const renderSjt = () =>
    (data.sjt || []).map((sc: any, i: number) => (
      <SJTBlock key={sc.id} index={i + 1} title={sc.title} classFocus={sc.classFocus} scenario={sc.scenario} options={sc.options}
        value={sjt[sc.id]} onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
    ));

  const stepId = STEPS[stepIdx].id;
  const body =
    stepId === 'activities' ? renderActivities()
      : stepId === 'occupations' ? renderOccupations()
      : stepId === 'workValues' ? renderWorkValues()
      : stepId === 'motivations' ? renderMotivations()
      : stepId === 'environment' ? renderEnvironment()
      : renderSjt();

  return (
    <DishaWizardShell
      title="DISHA Test 2"
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
  occTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  occTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: DC.text },
  occSector: { fontSize: 10.5, fontWeight: '700', color: DC.gray, backgroundColor: DC.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  occDesc: { fontSize: 12.5, color: DC.gray, lineHeight: 18, marginTop: 6 },
  rankCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1.5, borderColor: DC.border, borderRadius: 12, padding: 14, backgroundColor: DC.white },
  rankCardOn: { borderColor: DC.primary, backgroundColor: '#E4F4FB' },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: DC.surface, justifyContent: 'center', alignItems: 'center' },
  rankBadgeOn: { backgroundColor: DC.primary },
  rankBadgeText: { fontSize: 14, fontWeight: '800', color: DC.faint },
  rankBadgeTextOn: { color: '#fff' },
  rankLabel: { fontSize: 14.5, fontWeight: '800', color: DC.text },
  rankDesc: { fontSize: 12.5, color: DC.gray, lineHeight: 18, marginTop: 3 },
  star: { color: DC.amber, fontWeight: '800' },
  wsCard: { borderWidth: 1, borderColor: DC.border, borderRadius: 12, padding: 14, marginBottom: 12, backgroundColor: DC.white },
});
