import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import {
  ChipSelect, DC, ForcedChoice, ModuleIntro, NumField, PartHeading, QCard, QText, ScaleRow, SJTBlock, SjtValue, TextField,
} from './components/dishaControls';
import { getDishaQuestions, submitDishaAssessment } from '../../lib/api';

const LIKERT = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];
const ENJOY = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }));

const STEPS: WizardStep[] = [
  { id: 'marks', code: '1', name: 'Academic Marks', optional: true },
  { id: 'verbal', code: '2A', name: 'Verbal Ability' },
  { id: 'numerical', code: '2B', name: 'Numerical & Logical' },
  { id: 'spatial', code: '2C', name: 'Spatial Reasoning' },
  { id: 'abstract', code: '2D', name: 'Abstract Reasoning' },
  { id: 'closure', code: '2E', name: 'Closure / Clerical' },
  { id: 'memory', code: '2F', name: 'Memory & Creativity', optional: true },
  { id: 'personality', code: '3', name: 'Personality (OCEAN)' },
  { id: 'interests', code: '4A', name: 'Interests (RIASEC)' },
  { id: 'values', code: '4B', name: 'Work Values & Context' },
  { id: 'sjt', code: '5', name: 'Situational Judgment' },
];

const APT_GROUPS = ['verbal', 'numerical', 'spatial', 'abstract', 'closure'];
const REQUIRED = ['verbal', 'numerical', 'spatial', 'abstract', 'closure', 'personality', 'interests', 'values', 'sjt'];

/* Vertical single-select option list (aptitude MCQ) */
function OptionList({ options, value, onChange }: { options: string[]; value?: number; onChange: (i: number) => void }) {
  return (
    <View style={{ gap: 8, marginTop: 10 }}>
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

export default function DISHA1AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [profile, setProfile] = useState<any>({ currentClass: '', board: '', competitiveExam: '' });
  const [aptitude, setAptitude] = useState<Record<string, any>>({});
  const [personality, setPersonality] = useState<Record<string, number>>({});
  const [riasecFc, setRiasecFc] = useState<Record<string, string>>({});
  const [riasecLikert, setRiasecLikert] = useState<Record<string, number>>({});
  const [wvLikert, setWvLikert] = useState<Record<string, number>>({});
  const [wvFc, setWvFc] = useState<Record<string, string>>({});
  const [ics, setIcs] = useState<Record<string, any>>({});
  const [sjt, setSjt] = useState<Record<string, SjtValue>>({});
  const [marks, setMarks] = useState<Record<string, any>>({});
  const [supplementary, setSupplementary] = useState<Record<string, string>>({});

  useEffect(() => {
    getDishaQuestions()
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const setApt = (id: string, v: any) => setAptitude((p) => ({ ...p, [id]: v }));
  const supOptions = (id: string) => data?.academic?.supplementary?.find((s: any) => s.id === id)?.options || [];

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number; optional?: boolean }> = {};
    if (!data) return c;
    APT_GROUPS.forEach((g) => {
      const items = data.aptitude?.[g] || [];
      c[g] = { done: items.filter((i: any) => aptitude[i.id] !== undefined && aptitude[i.id] !== '').length, total: items.length };
    });
    const mem = data.aptitude?.memory || [];
    c.memory = { done: mem.filter((i: any) => aptitude[i.id] !== undefined && aptitude[i.id] !== '').length, total: mem.length, optional: true };
    c.personality = { done: (data.personality || []).filter((i: any) => personality[i.id]).length, total: (data.personality || []).length };
    const fc = data.riasec?.forcedChoice || [], rl = data.riasec?.likert || [];
    c.interests = { done: fc.filter((i: any) => riasecFc[i.id]).length + rl.filter((i: any) => riasecLikert[i.id]).length, total: fc.length + rl.length };
    const wv = data.workValues || [];
    c.values = { done: wv.filter((i: any) => (i.type === 'forced_choice' ? wvFc[i.id] : wvLikert[i.id])).length, total: wv.length };
    c.sjt = { done: (data.sjt || []).filter((s: any) => sjt[s.id]?.mostLikely && sjt[s.id]?.leastLikely).length, total: (data.sjt || []).length };
    const subjDone = Object.values(marks).filter((m: any) => m?.terms && Object.values(m.terms).some((t: any) => t && t.maximum)).length;
    c.marks = { done: subjDone, total: (data.academic?.subjects || []).length, optional: true };
    return c;
  }, [data, aptitude, personality, riasecFc, riasecLikert, wvLikert, wvFc, sjt, marks]);

  const buildAcademicMarks = () =>
    Object.entries(marks)
      .map(([subjectKey, m]: any) => ({ subjectKey, terms: m.terms || {}, enjoyment: m.enjoyment ?? null }))
      .filter((m) => Object.values(m.terms).some((t: any) => t && t.maximum));

  const handleSubmit = async () => {
    const pending = REQUIRED.filter((g) => progress[g] && progress[g].done < progress[g].total);
    if (pending.length) {
      const names = pending.map((g) => STEPS.find((s) => s.id === g)?.name).join(', ');
      Alert.alert('Incomplete', `Please complete all scored sections before submitting.\n\nPending: ${names}`);
      const first = STEPS.findIndex((s) => s.id === pending[0]);
      if (first >= 0) setStepIdx(first);
      return;
    }
    setSubmitting(true);
    try {
      await submitDishaAssessment({
        profile,
        aptitude,
        personality,
        riasecForcedChoice: riasecFc,
        riasecLikert,
        workValuesLikert: wvLikert,
        workValuesForcedChoice: wvFc,
        ics,
        sjt,
        academicMarks: buildAcademicMarks(),
        supplementary,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHA1Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        <ActivityIndicator color={DC.primary} size="large" />
        <Text style={st.loadText}>{loading ? 'Preparing your DISHA assessment…' : 'Could not load the assessment.'}</Text>
      </View>
    );
  }

  const renderMcq = (group: string) =>
    (data.aptitude?.[group] || []).map((q: any, i: number) => (
      <QCard index={i + 1} key={q.id}>
        {!!q.subType && <Text style={st.subType}>{q.subType}</Text>}
        {!!q.imageUrl && <Image source={{ uri: q.imageUrl }} style={st.qimg} resizeMode="contain" />}
        <QText>{q.text}</QText>
        <OptionList options={q.options || []} value={aptitude[q.id]} onChange={(idx) => setApt(q.id, idx)} />
      </QCard>
    ));

  const renderMemory = () =>
    (data.aptitude?.memory || []).map((q: any, i: number) => (
      <QCard index={i + 1} key={q.id}>
        {!!q.subType && <Text style={st.subType}>{q.subType}</Text>}
        {!!q.imageUrl && <Image source={{ uri: q.imageUrl }} style={st.qimg} resizeMode="contain" />}
        <QText>{q.text}</QText>
        <View style={{ marginTop: 10 }}>
          {q.format === 'count' && <NumField value={aptitude[q.id]} onChange={(v) => setApt(q.id, v)} placeholder={`0 – ${q.maxCount ?? ''}`} />}
          {q.format === 'text_recall' && <TextField value={aptitude[q.id]} onChange={(v) => setApt(q.id, v)} placeholder="Type the sequence" rows={1} />}
          {q.format === 'open_list' && <TextField value={aptitude[q.id]} onChange={(v) => setApt(q.id, v)} placeholder="One idea per line" rows={4} />}
          {q.options && <OptionList options={q.options} value={aptitude[q.id]} onChange={(idx) => setApt(q.id, idx)} />}
        </View>
      </QCard>
    ));

  const renderMarks = () => (
    <View>
      <View style={{ gap: 12, marginBottom: 16 }}>
        <View>
          <Text style={st.fieldLabel}>Current / last completed class</Text>
          <ChipSelect options={supOptions('M1')} value={profile.currentClass} onChange={(v) => setProfile((p: any) => ({ ...p, currentClass: v }))} />
        </View>
        <View>
          <Text style={st.fieldLabel}>Board</Text>
          <ChipSelect options={supOptions('M2')} value={profile.board} onChange={(v) => setProfile((p: any) => ({ ...p, board: v }))} />
        </View>
        <View>
          <Text style={st.fieldLabel}>Competitive exam (if any)</Text>
          <ChipSelect options={supOptions('M3')} value={profile.competitiveExam} onChange={(v) => setProfile((p: any) => ({ ...p, competitiveExam: v }))} />
        </View>
      </View>

      <ModuleIntro>
        Enter marks for each subject and term you have (obtained / maximum). Leave blank what doesn't
        apply — recent terms weigh more. Rate how much you enjoy each subject. This module is optional.
      </ModuleIntro>

      {(data.academic?.subjects || []).map((subj: any) => (
        <View key={subj.key} style={st.subjCard}>
          <View style={st.subjHead}>
            <Text style={st.subjName}>{subj.label}</Text>
          </View>
          <Text style={st.enjoyLabel}>Enjoyment</Text>
          <ScaleRow
            scale={ENJOY}
            value={marks[subj.key]?.enjoyment}
            onChange={(v) => setMarks((p) => ({ ...p, [subj.key]: { ...p[subj.key], enjoyment: v } }))}
          />
          <View style={st.termsWrap}>
            {(data.academic?.terms || []).map((term: any) => (
              <View key={term.key} style={st.termCol}>
                <Text style={st.termLabel}>{term.label}</Text>
                <View style={st.termInputs}>
                  <NumField
                    value={marks[subj.key]?.terms?.[term.key]?.obtained}
                    onChange={(v) => setMarks((p) => ({ ...p, [subj.key]: { ...p[subj.key], terms: { ...p[subj.key]?.terms, [term.key]: { ...p[subj.key]?.terms?.[term.key], obtained: v } } } }))}
                    placeholder="Got"
                  />
                  <Text style={st.slash}>/</Text>
                  <NumField
                    value={marks[subj.key]?.terms?.[term.key]?.maximum}
                    onChange={(v) => setMarks((p) => ({ ...p, [subj.key]: { ...p[subj.key], terms: { ...p[subj.key]?.terms, [term.key]: { ...p[subj.key]?.terms?.[term.key], maximum: v } } } }))}
                    placeholder="Max"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <Text style={[st.fieldLabel, { marginTop: 8 }]}>Has any subject changed significantly in the last year? Why?</Text>
      <TextField value={supplementary.M6} onChange={(v) => setSupplementary((p) => ({ ...p, M6: v }))} rows={3} />
      <Text style={[st.fieldLabel, { marginTop: 14 }]}>Is there a subject you wish you'd studied harder? Why?</Text>
      <TextField value={supplementary.M7} onChange={(v) => setSupplementary((p) => ({ ...p, M7: v }))} rows={3} />
    </View>
  );

  const renderPersonality = () =>
    (data.personality || []).map((q: any, i: number) => (
      <QCard index={i + 1} key={q.id}>
        <QText india={q.indiaSpecific}>{q.text}</QText>
        <ScaleRow scale={LIKERT} value={personality[q.id]} onChange={(v) => setPersonality((p) => ({ ...p, [q.id]: v }))} />
      </QCard>
    ));

  const renderInterests = () => (
    <View>
      <PartHeading>Part A — Which appeals more to you?</PartHeading>
      {(data.riasec?.forcedChoice || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <ForcedChoice value={riasecFc[q.id]} onChange={(v) => setRiasecFc((p) => ({ ...p, [q.id]: v }))} optionA={q.optionA.text} optionB={q.optionB.text} />
        </QCard>
      ))}
      <PartHeading>Part B — How much do you agree?</PartHeading>
      {(data.riasec?.likert || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={LIKERT} value={riasecLikert[q.id]} onChange={(v) => setRiasecLikert((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderValues = () => (
    <View>
      <PartHeading>Work Values</PartHeading>
      {(data.workValues || []).map((q: any, i: number) =>
        q.type === 'forced_choice' ? (
          <QCard index={i + 1} key={q.id}>
            <QText india={q.indiaSpecific}>{q.text}</QText>
            <View style={{ marginTop: 10 }}>
              <ForcedChoice value={wvFc[q.id]} onChange={(v) => setWvFc((p) => ({ ...p, [q.id]: v }))} optionA={q.optionA.text} optionB={q.optionB.text} />
            </View>
          </QCard>
        ) : (
          <QCard index={i + 1} key={q.id}>
            <QText india={q.indiaSpecific}>{q.text}</QText>
            <ScaleRow scale={LIKERT} value={wvLikert[q.id]} onChange={(v) => setWvLikert((p) => ({ ...p, [q.id]: v }))} />
          </QCard>
        )
      )}

      <PartHeading>Your Context</PartHeading>
      <ModuleIntro>These help us personalise — not limit — your recommendations. Answer honestly.</ModuleIntro>
      {(data.ics || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText>{q.text}</QText>
          <View style={{ marginTop: 10 }}>
            {q.control === 'dropdown' ? (
              <ChipSelect options={q.options || []} value={ics[q.id]} onChange={(v) => setIcs((p) => ({ ...p, [q.id]: v }))} />
            ) : q.control === 'numeric' ? (
              <NumField value={ics[q.id]} onChange={(v) => setIcs((p) => ({ ...p, [q.id]: v }))} placeholder={q.min != null ? `${q.min} – ${q.max}` : ''} />
            ) : q.control === 'text' ? (
              <TextField value={ics[q.id]} onChange={(v) => setIcs((p) => ({ ...p, [q.id]: v }))} rows={2} />
            ) : q.control === 'yesno_text' ? (
              <ChipSelect options={['yes', 'no']} value={ics[q.id]} onChange={(v) => setIcs((p) => ({ ...p, [q.id]: v }))} />
            ) : (
              <ScaleRow scale={LIKERT} value={ics[q.id]} onChange={(v) => setIcs((p) => ({ ...p, [q.id]: v }))} />
            )}
          </View>
        </QCard>
      ))}
    </View>
  );

  const renderSjt = () =>
    (data.sjt || []).map((sc: any, i: number) => (
      <SJTBlock
        key={sc.id}
        index={i + 1}
        title={sc.title}
        classFocus={sc.classFocus}
        scenario={sc.scenario}
        options={sc.options}
        value={sjt[sc.id]}
        onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))}
      />
    ));

  const stepId = STEPS[stepIdx].id;
  const body =
    stepId === 'marks' ? renderMarks()
      : stepId === 'memory' ? renderMemory()
      : stepId === 'personality' ? renderPersonality()
      : stepId === 'interests' ? renderInterests()
      : stepId === 'values' ? renderValues()
      : stepId === 'sjt' ? renderSjt()
      : renderMcq(stepId);

  return (
    <DishaWizardShell
      title="DISHA"
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
  subType: { fontSize: 11, fontWeight: '700', color: DC.faint, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  qimg: { width: '100%', height: 200, borderRadius: 10, backgroundColor: DC.surface, marginVertical: 10, borderWidth: 1, borderColor: DC.border },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: DC.border, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: DC.surface },
  optActive: { backgroundColor: '#E4F4FB', borderColor: DC.primary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: DC.faint, justifyContent: 'center', alignItems: 'center' },
  radioOn: { borderColor: DC.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DC.primary },
  optText: { flex: 1, fontSize: 13.5, color: DC.text, fontWeight: '600' },
  optTextActive: { color: DC.primary, fontWeight: '700' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: DC.text, marginBottom: 8 },
  subjCard: { borderWidth: 1, borderColor: DC.border, borderRadius: 14, padding: 14, marginBottom: 12, backgroundColor: DC.white },
  subjHead: { marginBottom: 10 },
  subjName: { fontSize: 15, fontWeight: '800', color: DC.text },
  enjoyLabel: { fontSize: 11, fontWeight: '700', color: DC.faint, textTransform: 'uppercase', letterSpacing: 0.5 },
  termsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  termCol: { width: '47%' },
  termLabel: { fontSize: 11.5, color: DC.gray, marginBottom: 5, fontWeight: '600' },
  termInputs: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slash: { color: DC.faint, fontWeight: '700' },
});
