import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import { DC, ForcedChoice, ModuleIntro, PartHeading, QCard, QText, ScaleRow, SJTBlock, SjtValue } from './components/dishaControls';
import { getDisha7Questions, submitDisha7Assessment } from '../../lib/api';

const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];

const STEPS: WizardStep[] = [
  { id: 'leadershipPotential', code: 'A', name: 'Leadership Potential' },
  { id: 'managementSkills', code: 'B', name: 'Management & Organisation' },
  { id: 'teamwork', code: 'C', name: 'Teamwork & Team Roles' },
  { id: 'powerOrientation', code: 'D', name: 'Authority & Power' },
  { id: 'ethicalLeadership', code: 'E', name: 'Ethical Leadership' },
  { id: 'workCulture', code: 'F', name: 'Work Culture & Org Fit' },
  { id: 'leadershipFc', code: 'G', name: 'Leadership Preferences' },
  { id: 'scenarios', code: 'H·I', name: 'Leadership Scenarios' },
];

const HINTS: Record<string, string> = {
  leadershipPotential: 'Rate how accurately each statement describes you. There are no right or wrong answers.',
  managementSkills: 'These questions are about how you get things done through others.',
  powerOrientation: 'How do you relate to authority and power? No orientation is better than another — this maps you to the right kind of career.',
  ethicalLeadership: 'How you think about integrity, accountability and the responsibilities of authority.',
};

export default function DISHA7AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [leadershipPotential, setLeadershipPotential] = useState<Record<string, number>>({});
  const [managementSkills, setManagementSkills] = useState<Record<string, number>>({});
  const [teamwork, setTeamwork] = useState<Record<string, number>>({});
  const [teamworkFc, setTeamworkFc] = useState<Record<string, string>>({});
  const [powerOrientation, setPowerOrientation] = useState<Record<string, number>>({});
  const [ethicalLeadership, setEthicalLeadership] = useState<Record<string, number>>({});
  const [workCulture, setWorkCulture] = useState<Record<string, number>>({});
  const [workCultureFc, setWorkCultureFc] = useState<Record<string, string>>({});
  const [leadershipFc, setLeadershipFc] = useState<Record<string, string>>({});
  const [sjt, setSjt] = useState<Record<string, SjtValue>>({});
  const [validity, setValidity] = useState<Record<string, number>>({});

  useEffect(() => {
    getDisha7Questions()
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const allSjt = useMemo(() => [...(data?.sjt?.blockH || []), ...(data?.sjt?.blockI || [])], [data]);

  const LIKERT: Record<string, [Record<string, number>, any]> = {
    leadershipPotential: [leadershipPotential, setLeadershipPotential],
    managementSkills: [managementSkills, setManagementSkills],
    powerOrientation: [powerOrientation, setPowerOrientation],
    ethicalLeadership: [ethicalLeadership, setEthicalLeadership],
  };

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number }> = {};
    if (!data) return c;
    (['leadershipPotential', 'managementSkills', 'powerOrientation', 'ethicalLeadership'] as const).forEach((k) => {
      const [map] = LIKERT[k];
      const items = data[k] || [];
      c[k] = { done: items.filter((i: any) => map[i.id]).length, total: items.length };
    });
    c.teamwork = {
      done: (data.teamwork || []).filter((i: any) => teamwork[i.id]).length + (data.teamworkFc || []).filter((p: any) => teamworkFc[p.id]).length,
      total: (data.teamwork || []).length + (data.teamworkFc || []).length,
    };
    c.workCulture = {
      done: (data.workCulture || []).filter((i: any) => workCulture[i.id]).length + (data.workCultureFc || []).filter((p: any) => workCultureFc[p.id]).length,
      total: (data.workCulture || []).length + (data.workCultureFc || []).length,
    };
    c.leadershipFc = { done: (data.leadershipFc || []).filter((p: any) => leadershipFc[p.id]).length, total: (data.leadershipFc || []).length };
    c.scenarios = {
      done: allSjt.filter((s: any) => sjt[s.id]?.mostLikely && sjt[s.id]?.leastLikely).length + (data.validity || []).filter((i: any) => validity[i.id]).length,
      total: allSjt.length + (data.validity || []).length,
    };
    return c;
  }, [data, leadershipPotential, managementSkills, teamwork, teamworkFc, powerOrientation, ethicalLeadership, workCulture, workCultureFc, leadershipFc, sjt, validity, allSjt]);

  const handleSubmit = async () => {
    const pending = STEPS.filter((s) => progress[s.id] && progress[s.id].done < progress[s.id].total);
    if (pending.length) {
      Alert.alert('Incomplete', `Please complete all sections.\n\nPending: ${pending.map((s) => s.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === pending[0].id));
      return;
    }
    setSubmitting(true);
    try {
      await submitDisha7Assessment({
        leadershipPotential, managementSkills, teamwork, teamworkFc,
        powerOrientation, ethicalLeadership, workCulture, workCultureFc,
        leadershipFc, sjt, validity,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHA7Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        <ActivityIndicator color={DC.primary} size="large" />
        <Text style={st.loadText}>{loading ? 'Preparing DISHA Test 7…' : 'Could not load the assessment.'}</Text>
      </View>
    );
  }

  const likertList = (items: any[], map: Record<string, number>, setter: any, hint?: string) => (
    <View>
      {!!hint && <ModuleIntro>{hint}</ModuleIntro>}
      {(items || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={AGREE} value={map[q.id]} onChange={(v) => setter((p: any) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const fcList = (pairs: any[], map: Record<string, string>, setter: any) =>
    (pairs || []).map((q: any, i: number) => (
      <QCard index={i + 1} key={q.id}>
        {!!q.prompt && <QText>{q.prompt}</QText>}
        <View style={{ marginTop: q.prompt ? 10 : 0 }}>
          <ForcedChoice value={map[q.id]} onChange={(v) => setter((p: any) => ({ ...p, [q.id]: v }))} optionA={q.optionA.text} optionB={q.optionB.text} />
        </View>
      </QCard>
    ));

  const renderTeamwork = () => (
    <View>
      {likertList(data.teamwork, teamwork, setTeamwork, 'How do you naturally function within a team?')}
      <PartHeading>Team-role preferences</PartHeading>
      <ModuleIntro>In a school cultural-festival team with 8 members and 2 weeks to plan, which role do you most naturally gravitate toward?</ModuleIntro>
      {fcList(data.teamworkFc, teamworkFc, setTeamworkFc)}
    </View>
  );

  const renderWorkCulture = () => (
    <View>
      {likertList(data.workCulture, workCulture, setWorkCulture, "Which kind of organisation do you believe you'd perform best in?")}
      <PartHeading>Organisation preferences</PartHeading>
      <ModuleIntro>When two organisational types conflict, which environment would you genuinely prefer?</ModuleIntro>
      {fcList(data.workCultureFc, workCultureFc, setWorkCultureFc)}
    </View>
  );

  const renderScenarios = () => (
    <View>
      <ModuleIntro>For each situation, mark what you would be most likely and least likely to do. There are no right or wrong answers.</ModuleIntro>
      <PartHeading>Block 1 — Indian Leadership Dilemmas</PartHeading>
      {(data.sjt?.blockH || []).map((sc: any, i: number) => (
        <SJTBlock key={sc.id} index={i + 1} title={sc.title} classFocus={sc.context} scenario={sc.scenario} options={sc.options}
          value={sjt[sc.id]} onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
      ))}
      <PartHeading>Block 2 — Management & Ethical Scenarios</PartHeading>
      {(data.sjt?.blockI || []).map((sc: any, i: number) => (
        <SJTBlock key={sc.id} index={(data.sjt?.blockH || []).length + i + 1} title={sc.title} classFocus={sc.context} scenario={sc.scenario} options={sc.options}
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
    stepId === 'teamwork' ? renderTeamwork()
      : stepId === 'workCulture' ? renderWorkCulture()
      : stepId === 'leadershipFc' ? (
        <View>
          <ModuleIntro>For each pair, choose the option that genuinely appeals to you more — even if both are attractive.</ModuleIntro>
          {fcList(data.leadershipFc, leadershipFc, setLeadershipFc)}
        </View>
      )
      : stepId === 'scenarios' ? renderScenarios()
      : likertList(data[stepId], LIKERT[stepId][0], LIKERT[stepId][1], HINTS[stepId]);

  return (
    <DishaWizardShell
      title="DISHA Test 7"
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
