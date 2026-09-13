import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import {
  ChipSelect, DC, ForcedChoice, InfoNote, ModuleIntro, MultiChipSelect, NumField, PartHeading, QCard, QText, ScaleRow, TextField,
} from './components/dishaControls';
import { getDishaC10Questions, submitDishaC10Assessment } from '../../lib/api';

const LIKE = [
  { value: 1, label: 'Strongly Dislike' }, { value: 2, label: 'Dislike' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Like' }, { value: 5, label: 'Strongly Like' },
];
const IMPORTANCE = [
  { value: 1, label: 'Not important' }, { value: 2, label: 'Slightly' }, { value: 3, label: 'Moderately' },
  { value: 4, label: 'Very' }, { value: 5, label: 'Extremely' },
];
const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];
const RATING = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }));

const STEPS: WizardStep[] = [
  { id: 'academic', code: '1', name: 'Academic Profile' },
  { id: 'aptitude', code: '2', name: 'Aptitude Snapshot' },
  { id: 'interests', code: '3', name: 'Interest Profile' },
  { id: 'values', code: '4', name: 'Values & Preferences' },
  { id: 'streamPreference', code: '5', name: 'Stream Preferences' },
  { id: 'context', code: '6', name: 'Your Context', optional: true },
  { id: 'scenarios', code: '7', name: 'Real-Life Scenarios' },
];

interface SubjOpt { value: string; label: string }
function SubjChips({ options, value, onChange }: { options: SubjOpt[]; value?: string; onChange: (v: string) => void }) {
  return (
    <View style={st.chips}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <TouchableOpacity key={o.value} activeOpacity={0.85} style={[st.chip, active && st.chipOn]} onPress={() => onChange(o.value)}>
            <Text style={[st.chipText, active && st.chipTextOn]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* MCQ option list (single-select, stores index) */
function OptionList({ options, value, onChange }: { options: string[]; value?: number; onChange: (i: number) => void }) {
  return (
    <View style={{ gap: 8, marginTop: 8 }}>
      {options.map((opt, idx) => {
        const active = value === idx;
        return (
          <TouchableOpacity key={idx} activeOpacity={0.85} style={[st.opt, active && st.optActive]} onPress={() => onChange(idx)}>
            <View style={[st.radio, active && st.radioOn]}>{active && <View style={st.radioDot} />}</View>
            <Text style={[st.optText, active && st.optTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function DISHAC10AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [marks, setMarks] = useState<Record<string, any>>({});
  const [enjoyment, setEnjoyment] = useState<Record<string, number>>({});
  const [inTheZoneSubject, setInTheZoneSubject] = useState<string | null>(null);
  const [aptitude, setAptitude] = useState<Record<string, { selected?: number; hintUsed?: boolean }>>({});
  const [hintOpen, setHintOpen] = useState<Record<string, boolean>>({});
  const [interests, setInterests] = useState<Record<string, number>>({});
  const [values, setValues] = useState<Record<string, number>>({});
  const [streamPreference, setStreamPreference] = useState<Record<string, string>>({});
  const [parentPreference, setParentPreference] = useState<number | null>(null);
  const [financialUrgency, setFinancialUrgency] = useState<number | null>(null);
  const [geographicConstraint, setGeographicConstraint] = useState<number | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<string | null>(null);
  const [examTargets, setExamTargets] = useState<string[]>([]);
  const [secretInterest, setSecretInterest] = useState('');
  const [scenarios, setScenarios] = useState<Record<string, string>>({});

  useEffect(() => {
    getDishaC10Questions()
      .then((res) => setData(res.data?.data || null))
      .catch((e) => setErrorMsg(e?.response?.data?.error?.message || e?.response?.data?.message || 'Could not load the assessment.'))
      .finally(() => setLoading(false));
  }, []);

  const subjectOptions: SubjOpt[] = useMemo(() => (data?.academic?.subjects || []).map((s: any) => ({ value: s.key, label: s.label })), [data]);

  const setMarkVal = (subjKey: string, termKey: string, field: string, val: any) =>
    setMarks((p) => ({ ...p, [subjKey]: { ...p[subjKey], terms: { ...p[subjKey]?.terms, [termKey]: { ...p[subjKey]?.terms?.[termKey], [field]: val } } } }));

  const revealHint = (qid: string) => {
    setHintOpen((p) => ({ ...p, [qid]: true }));
    setAptitude((p) => ({ ...p, [qid]: { ...p[qid], hintUsed: true } }));
  };

  const subjectsWithMarks = useMemo(
    () => Object.entries(marks).filter(([, m]: any) => m?.terms && Object.values(m.terms).some((t: any) => t && t.maximum && (t.obtained || t.obtained === 0))),
    [marks]
  );

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number; optional?: boolean }> = {};
    if (!data) return c;
    c.academic = { done: subjectsWithMarks.length, total: (data.academic?.subjects || []).length || 1 };
    c.aptitude = { done: (data.aptitude || []).filter((q: any) => aptitude[q.id]?.selected != null).length, total: (data.aptitude || []).length };
    c.interests = { done: (data.interests || []).filter((q: any) => interests[q.id]).length, total: (data.interests || []).length };
    c.values = { done: (data.values || []).filter((q: any) => values[q.id]).length, total: (data.values || []).length };
    c.streamPreference = { done: (data.streamPreference || []).filter((p: any) => streamPreference[p.id]).length, total: (data.streamPreference || []).length };
    const ctxDone = [parentPreference, financialUrgency, geographicConstraint, decisionStatus].filter((v) => v != null && v !== '').length;
    c.context = { done: ctxDone, total: 4, optional: true };
    c.scenarios = { done: (data.scenarios || []).filter((s: any) => scenarios[s.id]).length, total: (data.scenarios || []).length };
    return c;
  }, [data, subjectsWithMarks, aptitude, interests, values, streamPreference, parentPreference, financialUrgency, geographicConstraint, decisionStatus, scenarios]);

  const handleSubmit = async () => {
    const required = ['aptitude', 'interests', 'values', 'streamPreference', 'scenarios'];
    const missing = required.filter((g) => progress[g] && progress[g].done < progress[g].total);
    if (!subjectsWithMarks.length) missing.unshift('academic');
    if (missing.length) {
      Alert.alert('Incomplete', `Please complete: ${missing.map((g) => STEPS.find((s) => s.id === g)?.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === missing[0]));
      return;
    }
    setSubmitting(true);
    try {
      await submitDishaC10Assessment({
        marks, enjoyment, inTheZoneSubject, aptitude, interests, values, streamPreference,
        context: { parentPreference, financialUrgency, geographicConstraint, decisionStatus, examTargets, secretInterest },
        scenarios,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHAC10Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        {loading ? (
          <>
            <ActivityIndicator color={DC.primary} size="large" />
            <Text style={st.loadText}>Preparing your Stream Selection Test…</Text>
          </>
        ) : (
          <>
            <Ionicons name="lock-closed-outline" size={44} color={DC.faint} />
            <Text style={st.loadText}>{errorMsg}</Text>
            <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
              <Text style={st.backText}>Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  const ctx = data.context || {};

  const renderAcademic = () => (
    <View>
      <ModuleIntro>Check your marks (Obtained / Maximum) for each subject and term, correct anything wrong, then rate how much you genuinely enjoy each subject.</ModuleIntro>
      {(data.academic?.subjects || []).map((subj: any) => (
        <View key={subj.key} style={st.subjCard}>
          <Text style={st.subjName}>{subj.label}</Text>
          <Text style={st.enjoyLabel}>★ Enjoy?</Text>
          <ScaleRow scale={RATING} value={enjoyment[subj.key]} onChange={(v) => setEnjoyment((p) => ({ ...p, [subj.key]: v }))} />
          <View style={st.termsWrap}>
            {(data.academic?.terms || []).map((term: any) => (
              <View key={term.key} style={st.termCol}>
                <Text style={st.termLabel}>{term.label}</Text>
                <View style={st.termInputs}>
                  <NumField value={marks[subj.key]?.terms?.[term.key]?.obtained} onChange={(v) => setMarkVal(subj.key, term.key, 'obtained', v)} placeholder="Got" />
                  <Text style={st.slash}>/</Text>
                  <NumField value={marks[subj.key]?.terms?.[term.key]?.maximum} onChange={(v) => setMarkVal(subj.key, term.key, 'maximum', v)} placeholder="Max" />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
      <Text style={[st.fieldLabel, { marginTop: 8 }]}>Which subject do you feel most 'in the zone' with — where time passes quickly?</Text>
      <SubjChips options={subjectOptions} value={inTheZoneSubject ?? undefined} onChange={(v) => setInTheZoneSubject((prev) => (prev === v ? null : v))} />
    </View>
  );

  const renderAptitude = () => (
    <View>
      <ModuleIntro>14 questions — try your best. A hint is available for each but costs 0.25 marks. Correct = +1 · Wrong = −0.33 · Hint = −0.25 · Blank = 0.</ModuleIntro>
      {(data.aptitude || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <View style={st.tagRow}>
            <View style={[st.diffTag, q.difficulty === 'Easy' ? st.easy : q.difficulty === 'Hard' ? st.hard : st.med]}>
              <Text style={[st.diffText, q.difficulty === 'Easy' ? st.easyT : q.difficulty === 'Hard' ? st.hardT : st.medT]}>{q.difficulty}</Text>
            </View>
            {!!q.dim && <View style={st.dimTag}><Text style={st.dimText}>{q.dim}</Text></View>}
          </View>
          <QText>{q.text}</QText>
          <OptionList options={q.options || []} value={aptitude[q.id]?.selected} onChange={(idx) => setAptitude((p) => ({ ...p, [q.id]: { ...p[q.id], selected: idx } }))} />
          <View style={{ marginTop: 12 }}>
            {!hintOpen[q.id] ? (
              <TouchableOpacity style={st.hintBtn} onPress={() => revealHint(q.id)}>
                <Ionicons name="bulb-outline" size={15} color={DC.amber} />
                <Text style={st.hintBtnText}>Show hint (−0.25)</Text>
              </TouchableOpacity>
            ) : (
              <InfoNote>{q.hint}</InfoNote>
            )}
          </View>
        </QCard>
      ))}
    </View>
  );

  const renderContext = () => (
    <View>
      <ModuleIntro>A few questions about your situation. These personalise your results — no stream is ever blocked by any answer here.</ModuleIntro>
      {!!ctx.parentPreference && (
        <QCard index={1}>
          <QText>{ctx.parentPreference.text}</QText>
          {!!ctx.parentPreference.note && <Text style={st.note}>{ctx.parentPreference.note}</Text>}
          <ScaleRow scale={AGREE} value={parentPreference ?? undefined} onChange={setParentPreference} />
        </QCard>
      )}
      {!!ctx.financialUrgency && (
        <QCard index={2}>
          <QText>{ctx.financialUrgency.text}</QText>
          {!!ctx.financialUrgency.note && <Text style={st.note}>{ctx.financialUrgency.note}</Text>}
          <ScaleRow scale={AGREE} value={financialUrgency ?? undefined} onChange={setFinancialUrgency} />
        </QCard>
      )}
      {!!ctx.geographicConstraint && (
        <QCard index={3}>
          <QText>{ctx.geographicConstraint.text}</QText>
          {!!ctx.geographicConstraint.note && <Text style={st.note}>{ctx.geographicConstraint.note}</Text>}
          <ScaleRow scale={AGREE} value={geographicConstraint ?? undefined} onChange={setGeographicConstraint} />
        </QCard>
      )}
      {!!ctx.decisionStatus && (
        <QCard index={4}>
          <QText>{ctx.decisionStatus.text}</QText>
          {!!ctx.decisionStatus.note && <Text style={st.note}>{ctx.decisionStatus.note}</Text>}
          <View style={{ marginTop: 8 }}>
            <ChipSelect options={ctx.decisionStatus.options || []} value={decisionStatus ?? undefined} onChange={setDecisionStatus} />
          </View>
        </QCard>
      )}
      {!!ctx.examTargets && (
        <QCard index={5}>
          <QText>{ctx.examTargets.text}</QText>
          {!!ctx.examTargets.note && <Text style={st.note}>{ctx.examTargets.note}</Text>}
          <View style={{ marginTop: 8 }}>
            <MultiChipSelect options={ctx.examTargets.options || []} values={examTargets} onToggle={(o) => setExamTargets((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))} />
          </View>
        </QCard>
      )}
      {!!ctx.secretInterest && (
        <QCard index={6}>
          <QText>{ctx.secretInterest.text}</QText>
          {!!ctx.secretInterest.note && <Text style={st.note}>{ctx.secretInterest.note}</Text>}
          <View style={{ marginTop: 8 }}>
            <TextField value={secretInterest} onChange={setSecretInterest} placeholder="Optional — private to counsellor only" rows={3} />
          </View>
        </QCard>
      )}
    </View>
  );

  const renderScenarios = () => (
    <View>
      <ModuleIntro>Five situations Class 10 students commonly face. Select the response you would MOST LIKELY choose. There are no wrong answers.</ModuleIntro>
      {(data.scenarios || []).map((sc: any, i: number) => (
        <View key={sc.id} style={st.sjt}>
          <Text style={st.sjtTitle}>{i + 1}. {sc.title}</Text>
          <Text style={st.sjtScenario}>{sc.situation}</Text>
          <Text style={st.sjtPrompt}>What would you MOST LIKELY do?</Text>
          <View style={{ gap: 8 }}>
            {sc.options.map((opt: any) => {
              const active = scenarios[sc.id] === opt.key;
              return (
                <TouchableOpacity key={opt.key} activeOpacity={0.85} style={[st.opt, active && st.optActive]} onPress={() => setScenarios((p) => ({ ...p, [sc.id]: opt.key }))}>
                  <View style={[st.radio, active && st.radioOn]}>{active && <View style={st.radioDot} />}</View>
                  <Text style={[st.optText, active && st.optTextActive]}><Text style={st.optKey}>{opt.key}. </Text>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  const stepId = STEPS[stepIdx].id;
  const body =
    stepId === 'academic' ? renderAcademic()
      : stepId === 'aptitude' ? renderAptitude()
      : stepId === 'interests' ? (
        <View>
          <ModuleIntro>Rate how much you would enjoy each activity — regardless of whether you're good at it or your family would approve.</ModuleIntro>
          {(data.interests || []).map((q: any, i: number) => (
            <QCard index={i + 1} key={q.id}>
              <QText india={q.indiaSpecific}>{q.text}</QText>
              <ScaleRow scale={LIKE} value={interests[q.id]} onChange={(v) => setInterests((p) => ({ ...p, [q.id]: v }))} />
            </QCard>
          ))}
        </View>
      )
      : stepId === 'values' ? (
        <View>
          <ModuleIntro>Rate how important each is to your future career — not your parents' ideal career.</ModuleIntro>
          {(data.values || []).map((q: any, i: number) => (
            <QCard index={i + 1} key={q.id}>
              <QText india={q.indiaSpecific}>{q.text}</QText>
              <ScaleRow scale={IMPORTANCE} value={values[q.id]} onChange={(v) => setValues((p) => ({ ...p, [q.id]: v }))} />
            </QCard>
          ))}
        </View>
      )
      : stepId === 'streamPreference' ? (
        <View>
          <ModuleIntro>For each pair, choose the activity that appeals to you MORE — not the one that seems 'safer'.</ModuleIntro>
          {(data.streamPreference || []).map((q: any, i: number) => (
            <QCard index={i + 1} key={q.id}>
              <ForcedChoice value={streamPreference[q.id]} onChange={(v) => setStreamPreference((p) => ({ ...p, [q.id]: v }))} optionA={q.optionA.text} optionB={q.optionB.text} />
            </QCard>
          ))}
        </View>
      )
      : stepId === 'context' ? renderContext()
      : renderScenarios();

  return (
    <DishaWizardShell
      title="Stream Selection"
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
  loadText: { fontSize: 14, color: DC.gray, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  backBtn: { marginTop: 8, backgroundColor: DC.primary, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 11 },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: DC.text, marginBottom: 8 },
  note: { fontSize: 11.5, color: DC.faint, marginTop: 4, marginBottom: 2, lineHeight: 16 },
  subjCard: { borderWidth: 1, borderColor: DC.border, borderRadius: 14, padding: 14, marginBottom: 12, backgroundColor: DC.white },
  subjName: { fontSize: 15, fontWeight: '800', color: DC.text, marginBottom: 8 },
  enjoyLabel: { fontSize: 11, fontWeight: '700', color: DC.faint, textTransform: 'uppercase', letterSpacing: 0.5 },
  termsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  termCol: { width: '47%' },
  termLabel: { fontSize: 11.5, color: DC.gray, marginBottom: 5, fontWeight: '600' },
  termInputs: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slash: { color: DC.faint, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: DC.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: DC.surface },
  chipOn: { backgroundColor: DC.primary, borderColor: DC.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: DC.gray },
  chipTextOn: { color: '#fff' },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  diffTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  easy: { backgroundColor: '#DCFCE7' }, med: { backgroundColor: '#FEF3C7' }, hard: { backgroundColor: '#FEE2E2' },
  diffText: { fontSize: 10.5, fontWeight: '800' },
  easyT: { color: '#166534' }, medT: { color: '#92400E' }, hardT: { color: '#991B1B' },
  dimTag: { backgroundColor: DC.surface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  dimText: { fontSize: 10.5, fontWeight: '700', color: DC.gray },
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1.5, borderColor: '#FDE68A', backgroundColor: '#FEF9E7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  hintBtnText: { fontSize: 12.5, fontWeight: '700', color: DC.amber },
  opt: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1.5, borderColor: DC.border, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: DC.surface },
  optActive: { backgroundColor: '#E4F4FB', borderColor: DC.primary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: DC.faint, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  radioOn: { borderColor: DC.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DC.primary },
  optText: { flex: 1, fontSize: 13.5, color: DC.text, lineHeight: 20 },
  optKey: { fontWeight: '800', color: DC.primary },
  optTextActive: { color: DC.text },
  sjt: { backgroundColor: DC.white, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: DC.border },
  sjtTitle: { fontSize: 15, fontWeight: '800', color: DC.text, marginBottom: 8 },
  sjtScenario: { fontSize: 13.5, color: DC.text, lineHeight: 20, backgroundColor: DC.surface, borderRadius: 10, padding: 12, marginBottom: 12 },
  sjtPrompt: { fontSize: 12.5, fontWeight: '700', color: DC.gray, marginBottom: 8 },
});
