import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import { DC, ForcedChoice, ModuleIntro, PartHeading, QCard, QText, RankRow, ScaleRow, TextField } from './components/dishaControls';
import { getDisha8Questions, submitDisha8Assessment } from '../../lib/api';

const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];

const STEPS: WizardStep[] = [
  { id: 'lifeValues', code: 'A', name: 'Core Life Values' },
  { id: 'wlbPreferences', code: 'B', name: 'Work-Life Balance' },
  { id: 'lifestyleGoals', code: 'C', name: 'Lifestyle Goals & Life Design' },
  { id: 'moneyMindset', code: 'D', name: 'Financial Risk & Money Mindset' },
  { id: 'socialContribution', code: 'E', name: 'Social Contribution vs Success' },
  { id: 'satisfactionPredictors', code: 'F', name: 'Satisfaction Predictors' },
  { id: 'futureProjection', code: 'G', name: 'Future Life Projection' },
  { id: 'scenarios', code: 'H', name: 'Life Design Dilemmas' },
];

/* Single-choice scenario (DISHA 8 SJT records mostLikely only) */
function SingleScenario({ index, title, context, scenario, options, value, onChange }: any) {
  return (
    <View style={st.sjt}>
      <View style={st.sjtHead}>
        <Text style={st.sjtTitle}>{index}. {title}</Text>
        {!!context && <Text style={st.sjtCtx}>{context}</Text>}
      </View>
      <Text style={st.sjtScenario}>{scenario}</Text>
      <View style={{ gap: 8 }}>
        {options.map((opt: any) => {
          const active = value?.mostLikely === opt.key;
          return (
            <TouchableOpacity key={opt.key} activeOpacity={0.85} style={[st.opt, active && st.optActive]} onPress={() => onChange({ mostLikely: opt.key })}>
              <View style={[st.radio, active && st.radioOn]}>{active && <View style={st.radioDot} />}</View>
              <Text style={[st.optText, active && st.optTextActive]}><Text style={st.optKey}>{opt.key}. </Text>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function DISHA8AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [lifeValues, setLifeValues] = useState<Record<string, number>>({});
  const [lifeValuesRanking, setLifeValuesRanking] = useState<Record<string, number>>({});
  const [wlbPreferences, setWlbPreferences] = useState<Record<string, number>>({});
  const [wlbFc, setWlbFc] = useState<Record<string, string>>({});
  const [lifestyleGoals, setLifestyleGoals] = useState<Record<string, number>>({});
  const [lifeDesignOpen, setLifeDesignOpen] = useState<Record<string, string>>({});
  const [moneyMindset, setMoneyMindset] = useState<Record<string, number>>({});
  const [moneyFc, setMoneyFc] = useState<Record<string, string>>({});
  const [socialContribution, setSocialContribution] = useState<Record<string, number>>({});
  const [satisfactionPredictors, setSatisfactionPredictors] = useState<Record<string, number>>({});
  const [futureProjectionSliders, setFutureProjectionSliders] = useState<Record<string, number>>({});
  const [gp5, setGp5] = useState<Record<string, string>>({});
  const [sjt, setSjt] = useState<Record<string, { mostLikely?: string }>>({});
  const [validity, setValidity] = useState<Record<string, number>>({});

  useEffect(() => {
    getDisha8Questions()
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const usedRanks = useMemo(() => new Set(Object.values(lifeValuesRanking).filter((r) => r >= 1 && r <= 5)), [lifeValuesRanking]);

  const setRank = (key: string, r: number) =>
    setLifeValuesRanking((prev) => {
      const next = { ...prev };
      if (next[key] === r) { delete next[key]; return next; } // toggle off
      Object.keys(next).forEach((k) => { if (next[k] === r) delete next[k]; }); // rank unique
      next[key] = r;
      return next;
    });

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number }> = {};
    if (!data) return c;
    const likert = (items: any[], map: Record<string, number>) => ({ done: (items || []).filter((i: any) => map[i.id]).length, total: (items || []).length });
    const rankCount = Object.values(lifeValuesRanking).filter((r) => r >= 1 && r <= 5).length;
    c.lifeValues = { done: (data.lifeValues || []).filter((i: any) => lifeValues[i.id]).length + Math.min(rankCount, 5), total: (data.lifeValues || []).length + 5 };
    c.wlbPreferences = { done: (data.wlbPreferences || []).filter((i: any) => wlbPreferences[i.id]).length + (data.wlbFc || []).filter((p: any) => wlbFc[p.id]).length, total: (data.wlbPreferences || []).length + (data.wlbFc || []).length };
    c.lifestyleGoals = { done: (data.lifestyleGoals || []).filter((i: any) => lifestyleGoals[i.id]).length + (data.lifeDesignOpen || []).filter((q: any) => (lifeDesignOpen[q.id] || '').trim()).length, total: (data.lifestyleGoals || []).length + (data.lifeDesignOpen || []).length };
    c.moneyMindset = { done: (data.moneyMindset || []).filter((i: any) => moneyMindset[i.id]).length + (data.moneyFc || []).filter((p: any) => moneyFc[p.id]).length, total: (data.moneyMindset || []).length + (data.moneyFc || []).length };
    c.socialContribution = likert(data.socialContribution, socialContribution);
    c.satisfactionPredictors = likert(data.satisfactionPredictors, satisfactionPredictors);
    c.futureProjection = {
      done: (data.futureProjection || []).reduce((sum: number, sc: any) => sum + sc.elements.filter((el: any) => futureProjectionSliders[el.id] !== undefined).length, 0) + (gp5.GP5_good ? 1 : 0) + (gp5.GP5_wasted ? 1 : 0),
      total: (data.futureProjection || []).reduce((sum: number, sc: any) => sum + sc.elements.length, 0) + 2,
    };
    c.scenarios = { done: (data.sjt || []).filter((s: any) => sjt[s.id]?.mostLikely).length + (data.validity || []).filter((i: any) => validity[i.id]).length, total: (data.sjt || []).length + (data.validity || []).length };
    return c;
  }, [data, lifeValues, lifeValuesRanking, wlbPreferences, wlbFc, lifestyleGoals, lifeDesignOpen, moneyMindset, moneyFc, socialContribution, satisfactionPredictors, futureProjectionSliders, gp5, sjt, validity]);

  const handleSubmit = async () => {
    const pending = STEPS.filter((s) => progress[s.id] && progress[s.id].done < progress[s.id].total);
    if (pending.length) {
      Alert.alert('Incomplete', `Please complete all sections.\n\nPending: ${pending.map((s) => s.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === pending[0].id));
      return;
    }
    setSubmitting(true);
    try {
      await submitDisha8Assessment({
        lifeValues, lifeValuesRanking, wlbPreferences, wlbFc,
        lifestyleGoals, lifeDesignOpen, moneyMindset, moneyFc,
        socialContribution, satisfactionPredictors,
        futureProjectionSliders, gp5, sjt, validity,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHA8Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        <ActivityIndicator color={DC.primary} size="large" />
        <Text style={st.loadText}>{loading ? 'Preparing DISHA Test 8…' : 'Could not load the assessment.'}</Text>
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

  const renderLifeValues = () => (
    <View>
      {likertList(data.lifeValues, lifeValues, setLifeValues, 'Rate how important each is to you — not what you think you should value, but what genuinely matters most to you personally.')}
      <PartHeading>Life Values Priority Ranking</PartHeading>
      <ModuleIntro>From the values below, rank your top 5 in order of personal importance right now. 1 = most important.</ModuleIntro>
      {(data.lifeValuesRanking || []).map((v: any) => (
        <RankRow key={v.key} label={v.label} description={v.description} rank={lifeValuesRanking[v.key]} isUsed={(r) => usedRanks.has(r)} onPick={(r) => setRank(v.key, r)} />
      ))}
    </View>
  );

  const renderWlb = () => (
    <View>
      {likertList(data.wlbPreferences, wlbPreferences, setWlbPreferences, 'How intense a career can you sustain, and what does family life require of it?')}
      <PartHeading>Work-Life Trade-Off Pairs</PartHeading>
      <ModuleIntro>When these values conflict directly, which would you genuinely choose?</ModuleIntro>
      {fcList(data.wlbFc, wlbFc, setWlbFc)}
    </View>
  );

  const renderLifestyle = () => (
    <View>
      {likertList(data.lifestyleGoals, lifestyleGoals, setLifestyleGoals, 'Concrete preferences about where and how you want to live.')}
      <PartHeading>A few reflective questions</PartHeading>
      <ModuleIntro>These answers are for your counsellor's use — write honestly, in your own words.</ModuleIntro>
      {(data.lifeDesignOpen || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText>{q.question}</QText>
          <View style={{ marginTop: 10 }}>
            <TextField value={lifeDesignOpen[q.id]} onChange={(v) => setLifeDesignOpen((p) => ({ ...p, [q.id]: v }))} placeholder={q.format} rows={3} />
          </View>
        </QCard>
      ))}
    </View>
  );

  const renderMoney = () => (
    <View>
      {likertList(data.moneyMindset, moneyMindset, setMoneyMindset, 'Your real relationship with money, risk, and family financial responsibility.')}
      <PartHeading>Income Scenario Pairs</PartHeading>
      <ModuleIntro>When two paths to a financial future conflict, which would you genuinely choose?</ModuleIntro>
      {fcList(data.moneyFc, moneyFc, setMoneyFc)}
    </View>
  );

  const renderFutureProjection = () => (
    <View>
      <ModuleIntro>For each scenario, take 30–60 seconds to genuinely imagine yourself in this situation before responding. There is no time limit and no right answer.</ModuleIntro>
      {(data.futureProjection || []).map((sc: any, sIdx: number) => (
        <View key={sc.id} style={st.projCard}>
          <Text style={st.projTitle}>{sIdx + 1}. {sc.title}</Text>
          {!!sc.instruction && <Text style={st.projInstr}>{sc.instruction}</Text>}
          {sc.elements.map((el: any) => (
            <View key={el.id} style={{ marginBottom: 14 }}>
              <Text style={st.projLabel}>{el.label}</Text>
              <ScaleRow scale={el.spectrum.map((label: string, idx: number) => ({ value: idx, label }))} value={futureProjectionSliders[el.id]} onChange={(v) => setFutureProjectionSliders((p) => ({ ...p, [el.id]: v }))} />
            </View>
          ))}
        </View>
      ))}
      <View style={st.gp5Card}>
        <Text style={st.projTitle}>{(data.futureProjection || []).length + 1}. {data.gp5?.title}</Text>
        {!!data.gp5?.instruction && <Text style={st.projInstr}>{data.gp5.instruction}</Text>}
        {(data.gp5?.prompts || []).map((p: any) => (
          <View key={p.id} style={{ marginBottom: 12 }}>
            <Text style={st.projLabel}>{p.label}</Text>
            <TextField value={gp5[p.id]} onChange={(v) => setGp5((prev) => ({ ...prev, [p.id]: v }))} placeholder="Your honest answer…" rows={2} />
          </View>
        ))}
        <Text style={st.projNote}>This answer is shared only with you and your counsellor.</Text>
      </View>
    </View>
  );

  const renderScenarios = () => (
    <View>
      <ModuleIntro>For each situation, mark the option you would be most likely to choose. There are no right or wrong answers — these dilemmas reveal how you prioritise when values conflict.</ModuleIntro>
      {(data.sjt || []).map((sc: any, i: number) => (
        <SingleScenario key={sc.id} index={i + 1} title={sc.title} context={sc.context} scenario={sc.scenario} options={sc.options}
          value={sjt[sc.id]} onChange={(v: any) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
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
    stepId === 'lifeValues' ? renderLifeValues()
      : stepId === 'wlbPreferences' ? renderWlb()
      : stepId === 'lifestyleGoals' ? renderLifestyle()
      : stepId === 'moneyMindset' ? renderMoney()
      : stepId === 'socialContribution' ? likertList(data.socialContribution, socialContribution, setSocialContribution, "Neither orientation — personal success or social contribution — is 'better'. Answer honestly.")
      : stepId === 'satisfactionPredictors' ? likertList(data.satisfactionPredictors, satisfactionPredictors, setSatisfactionPredictors, 'What do you specifically need to feel sustainably satisfied in a career, long-term?')
      : stepId === 'futureProjection' ? renderFutureProjection()
      : renderScenarios();

  return (
    <DishaWizardShell
      title="DISHA Test 8"
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
  projCard: { borderWidth: 1, borderColor: DC.border, borderRadius: 14, padding: 16, marginBottom: 14, backgroundColor: DC.white },
  gp5Card: { borderWidth: 2, borderColor: DC.primary, borderRadius: 14, padding: 16, marginBottom: 8, backgroundColor: '#E4F4FB' },
  projTitle: { fontSize: 15, fontWeight: '800', color: DC.text, marginBottom: 6 },
  projInstr: { fontSize: 13, color: DC.gray, lineHeight: 19, marginBottom: 14 },
  projLabel: { fontSize: 13.5, fontWeight: '600', color: DC.text, marginBottom: 6 },
  projNote: { fontSize: 11.5, color: DC.faint, marginTop: 4 },
  sjt: { backgroundColor: DC.white, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: DC.border },
  sjtHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 },
  sjtTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: DC.text },
  sjtCtx: { fontSize: 10.5, fontWeight: '700', color: DC.gray, backgroundColor: DC.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  sjtScenario: { fontSize: 13.5, color: DC.text, lineHeight: 20, backgroundColor: DC.surface, borderRadius: 10, padding: 12, marginBottom: 12 },
  opt: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1.5, borderColor: DC.border, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: DC.surface },
  optActive: { backgroundColor: '#E4F4FB', borderColor: DC.primary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: DC.faint, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  radioOn: { borderColor: DC.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DC.primary },
  optText: { flex: 1, fontSize: 13.5, color: DC.text, lineHeight: 20 },
  optKey: { fontWeight: '800', color: DC.primary },
  optTextActive: { color: DC.text },
});
