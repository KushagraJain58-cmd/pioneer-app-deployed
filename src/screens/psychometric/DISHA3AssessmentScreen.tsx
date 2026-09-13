import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import {
  CheckRow, ChipSelect, DC, ForcedChoice, InfoNote, ModuleIntro, NumField, PartHeading, QCard, QText, ScaleRow, SJTBlock, SjtValue, TextField,
} from './components/dishaControls';
import { getDisha3Questions, submitDisha3Assessment } from '../../lib/api';

const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];
const RATING = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }));

const STEPS: WizardStep[] = [
  { id: 'marks', code: '1', name: 'Academic Marks' },
  { id: 'proficiency', code: '2', name: 'Subject Proficiency', optional: true },
  { id: 'learningStyles', code: '3', name: 'Learning Styles' },
  { id: 'studyHabits', code: '4', name: 'Study Habits' },
  { id: 'examPrep', code: '5', name: 'Exam Preparedness' },
  { id: 'sjt', code: '6', name: 'Situational Judgment' },
];

interface SubjOpt { value: string; label: string }

/* Subject chips that display a label but store the subject key */
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

export default function DISHA3AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [profile, setProfile] = useState<any>({ currentClass: '', board: '', stream: '', appearedBoard: '', coaching: '', marksVerified: false });
  const [marks, setMarks] = useState<Record<string, any>>({});
  const [marksSupp, setMarksSupp] = useState<Record<string, any>>({});
  const [proficiency, setProficiency] = useState<Record<string, any>>({});
  const [identity, setIdentity] = useState<Record<string, any>>({});
  const [lsLikert, setLsLikert] = useState<Record<string, number>>({});
  const [lsFc, setLsFc] = useState<Record<string, string>>({});
  const [studyHabits, setStudyHabits] = useState<Record<string, number>>({});
  const [examPrep, setExamPrep] = useState<Record<string, number>>({});
  const [validity, setValidity] = useState<Record<string, number>>({});
  const [sjt, setSjt] = useState<Record<string, SjtValue>>({});

  useEffect(() => {
    getDisha3Questions()
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const intakeOptions = (id: string) => data?.marks?.intake?.find((i: any) => i.id === id)?.options || [];

  const { activeSubjects, activeTerms } = useMemo(() => {
    if (!data) return { activeSubjects: [] as any[], activeTerms: [] as any[] };
    const cls = profile.currentClass;
    const rules = data.marks?.subjectSetRules || {};
    let subjectSetKey = 'core_9_10';
    let termSetKey = '10';
    if (cls === 'Class 9') { subjectSetKey = 'core_9_10'; termSetKey = '9'; }
    else if (cls === 'Class 10') { subjectSetKey = 'core_9_10'; termSetKey = '10'; }
    else if (cls === 'Class 11' || cls === 'Class 12' || cls === 'Passed Class 12') {
      subjectSetKey = (rules.streamToSet || {})[profile.stream] || 'pcm';
      termSetKey = '11-12';
    }
    return {
      activeSubjects: data.marks?.subjectSets?.[subjectSetKey] || [],
      activeTerms: data.marks?.termSets?.[termSetKey] || [],
    };
  }, [data, profile.currentClass, profile.stream]);

  const subjectOptions: SubjOpt[] = useMemo(() => activeSubjects.map((s: any) => ({ value: s.key, label: s.label })), [activeSubjects]);

  const subjectsWithMarks = useMemo(
    () => Object.entries(marks).filter(([, m]: any) => m?.terms && Object.values(m.terms).some((t: any) => t && t.maximum && (t.obtained || t.obtained === 0))),
    [marks]
  );

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number; optional?: boolean }> = {};
    if (!data) return c;
    c.marks = { done: subjectsWithMarks.length, total: activeSubjects.length || 1 };
    c.proficiency = { done: activeSubjects.filter((s: any) => proficiency[s.key]?.comfort && proficiency[s.key]?.enjoyment).length, total: activeSubjects.length || 1, optional: true };
    const lik = data.learningStyles?.likert || [], fc = data.learningStyles?.forcedChoice || [];
    c.learningStyles = { done: lik.filter((i: any) => lsLikert[i.id]).length + fc.filter((p: any) => lsFc[p.id]).length, total: lik.length + fc.length };
    c.studyHabits = { done: (data.studyHabits || []).filter((i: any) => studyHabits[i.id]).length, total: (data.studyHabits || []).length };
    c.examPrep = { done: (data.examPrep || []).filter((i: any) => examPrep[i.id]).length + (data.validity || []).filter((i: any) => validity[i.id]).length, total: (data.examPrep || []).length + (data.validity || []).length };
    c.sjt = { done: (data.sjt || []).filter((s: any) => sjt[s.id]?.mostLikely && sjt[s.id]?.leastLikely).length, total: (data.sjt || []).length };
    return c;
  }, [data, subjectsWithMarks, activeSubjects, proficiency, lsLikert, lsFc, studyHabits, examPrep, validity, sjt]);

  const setMarkVal = (subjKey: string, termKey: string, field: string, val: any) =>
    setMarks((p) => ({ ...p, [subjKey]: { ...p[subjKey], terms: { ...p[subjKey]?.terms, [termKey]: { ...p[subjKey]?.terms?.[termKey], [field]: val } } } }));

  const handleSubmit = async () => {
    if (!profile.currentClass || !profile.marksVerified) {
      Alert.alert('Section 1 required', 'Please select your class and confirm the self-declaration in Section 1.');
      setStepIdx(0);
      return;
    }
    if (!subjectsWithMarks.length) {
      Alert.alert('Marks required', 'Please enter marks for at least one subject in Section 1.');
      setStepIdx(0);
      return;
    }
    const required = ['learningStyles', 'studyHabits', 'examPrep', 'sjt'];
    const pending = required.filter((g) => progress[g] && progress[g].done < progress[g].total);
    if (pending.length) {
      Alert.alert('Incomplete', `Please complete: ${pending.map((g) => STEPS.find((s) => s.id === g)?.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === pending[0]));
      return;
    }
    setSubmitting(true);
    try {
      await submitDisha3Assessment({
        profile, marks, marksSupplementary: marksSupp, proficiency, subjectIdentity: identity,
        learningStyles: lsLikert, learningStyleFc: lsFc, studyHabits, examPrep, validity, sjt,
        streamSubjects: null,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHA3Result');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={st.center}>
        <ActivityIndicator color={DC.primary} size="large" />
        <Text style={st.loadText}>{loading ? 'Preparing DISHA Test 3…' : 'Could not load the assessment.'}</Text>
      </View>
    );
  }

  const renderMarks = () => (
    <View>
      <View style={{ gap: 12, marginBottom: 16 }}>
        <Field label="Current Class"><ChipSelect options={intakeOptions('M-INT-01')} value={profile.currentClass} onChange={(v) => setProfile((p: any) => ({ ...p, currentClass: v }))} /></Field>
        <Field label="School Board"><ChipSelect options={intakeOptions('M-INT-02')} value={profile.board} onChange={(v) => setProfile((p: any) => ({ ...p, board: v }))} /></Field>
        {['Class 11', 'Class 12', 'Passed Class 12'].includes(profile.currentClass) && (
          <Field label="Stream"><ChipSelect options={intakeOptions('M-INT-03')} value={profile.stream} onChange={(v) => setProfile((p: any) => ({ ...p, stream: v }))} /></Field>
        )}
        <Field label="Appeared for Class 10 Board?"><ChipSelect options={intakeOptions('M-INT-04')} value={profile.appearedBoard} onChange={(v) => setProfile((p: any) => ({ ...p, appearedBoard: v }))} /></Field>
        <Field label="Coaching classes"><ChipSelect options={intakeOptions('M-INT-05')} value={profile.coaching} onChange={(v) => setProfile((p: any) => ({ ...p, coaching: v }))} /></Field>
      </View>

      {!profile.currentClass ? (
        <InfoNote>Select your class (and stream for Class 11–12) above to load your subject marks grid.</InfoNote>
      ) : (
        <>
          <ModuleIntro>Enter your actual marks (Obtained / Maximum) for each subject and term you have. Leave blank what doesn't apply — recent terms weigh more.</ModuleIntro>
          {activeSubjects.map((subj: any) => (
            <View key={subj.key} style={st.subjCard}>
              <Text style={st.subjName}>{subj.label}</Text>
              <View style={st.termsWrap}>
                {activeTerms.map((term: any) => (
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

          <PartHeading>A few quick questions</PartHeading>
          {(data.marks?.supplementary || []).map((q: any) => (
            <View key={q.id} style={{ marginBottom: 14 }}>
              <Text style={st.fieldLabel}>{q.text}</Text>
              {q.control === 'numeric' ? (
                <NumField value={marksSupp[q.id]} onChange={(v) => setMarksSupp((p) => ({ ...p, [q.id]: v }))} placeholder={q.min != null ? `${q.min} – ${q.max}` : ''} />
              ) : q.control === 'dropdown' ? (
                <ChipSelect options={q.options || []} value={marksSupp[q.id]} onChange={(v) => setMarksSupp((p) => ({ ...p, [q.id]: v }))} />
              ) : q.control === 'subject_dropdown' ? (
                <SubjChips options={subjectOptions} value={marksSupp[q.id]} onChange={(v) => setMarksSupp((p) => ({ ...p, [q.id]: v }))} />
              ) : (
                <TextField value={marksSupp[q.id]} onChange={(v) => setMarksSupp((p) => ({ ...p, [q.id]: v }))} rows={2} />
              )}
            </View>
          ))}

          <View style={{ marginTop: 8 }}>
            <CheckRow
              checked={!!profile.marksVerified}
              onToggle={() => setProfile((p: any) => ({ ...p, marksVerified: !p.marksVerified }))}
              label="I confirm these marks are accurate to the best of my knowledge."
            />
          </View>
        </>
      )}
    </View>
  );

  const renderProficiency = () => (
    <View>
      <ModuleIntro>For each subject, rate your comfort / proficiency and your enjoyment / interest (1 = Very Low, 5 = Very High). Optional but recommended.</ModuleIntro>
      {activeSubjects.length === 0 && <InfoNote>Select your class in Section 1 first to load your subjects.</InfoNote>}
      {activeSubjects.map((subj: any, i: number) => (
        <QCard index={i + 1} key={subj.key}>
          <QText>{subj.label}</QText>
          <Text style={st.subLabel}>Comfort / Proficiency</Text>
          <ScaleRow scale={RATING} value={proficiency[subj.key]?.comfort} onChange={(v) => setProficiency((p) => ({ ...p, [subj.key]: { ...p[subj.key], comfort: v } }))} />
          <Text style={[st.subLabel, { marginTop: 10 }]}>Enjoyment / Interest</Text>
          <ScaleRow scale={RATING} value={proficiency[subj.key]?.enjoyment} onChange={(v) => setProficiency((p) => ({ ...p, [subj.key]: { ...p[subj.key], enjoyment: v } }))} />
        </QCard>
      ))}

      <PartHeading>Subject Identity</PartHeading>
      <ModuleIntro>A few short questions about your relationship with your subjects. Optional.</ModuleIntro>
      {(data.proficiency?.identity || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText>{q.text}</QText>
          <View style={{ marginTop: 10 }}>
            {q.control === 'text' ? (
              <TextField value={identity[q.id]} onChange={(v) => setIdentity((p) => ({ ...p, [q.id]: v }))} rows={2} />
            ) : q.control === 'subject_dropdown_direction' ? (
              <View style={{ gap: 10 }}>
                <SubjChips options={subjectOptions} value={identity[q.id]?.subject} onChange={(v) => setIdentity((p) => ({ ...p, [q.id]: { ...p[q.id], subject: v } }))} />
                <ChipSelect options={q.directions || []} value={identity[q.id]?.direction} onChange={(v) => setIdentity((p) => ({ ...p, [q.id]: { ...p[q.id], direction: v } }))} />
              </View>
            ) : (
              <SubjChips options={subjectOptions} value={typeof identity[q.id] === 'object' ? identity[q.id]?.subject : identity[q.id]} onChange={(v) => setIdentity((p) => ({ ...p, [q.id]: v }))} />
            )}
          </View>
        </QCard>
      ))}
    </View>
  );

  const likertList = (items: any[], map: Record<string, number>, setter: any, hint?: string) => (
    <View>
      {hint && <ModuleIntro>{hint}</ModuleIntro>}
      {items.map((q, i) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={AGREE} value={map[q.id]} onChange={(v) => setter((p: any) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderLearningStyles = () => (
    <View>
      <ModuleIntro>How do you learn best? This personalises your study plan — it's not used to judge ability.</ModuleIntro>
      <PartHeading>Part 1 — How much do you agree?</PartHeading>
      {(data.learningStyles?.likert || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={AGREE} value={lsLikert[q.id]} onChange={(v) => setLsLikert((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
      <PartHeading>Part 2 — Which approach fits you better?</PartHeading>
      {(data.learningStyles?.forcedChoice || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          {!!q.prompt && <QText>{q.prompt}</QText>}
          <View style={{ marginTop: q.prompt ? 10 : 0 }}>
            <ForcedChoice value={lsFc[q.id]} onChange={(v) => setLsFc((p) => ({ ...p, [q.id]: v }))} optionA={q.optionA.text} optionB={q.optionB.text} />
          </View>
        </QCard>
      ))}
    </View>
  );

  const renderExamPrep = () => (
    <View>
      {likertList(data.examPrep || [], examPrep, setExamPrep, 'How you prepare for and handle exams. Answer honestly — there are no right answers.')}
      <PartHeading>A few final statements</PartHeading>
      {(data.validity || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText>{q.text}</QText>
          <ScaleRow scale={AGREE} value={validity[q.id]} onChange={(v) => setValidity((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderSjt = () =>
    (data.sjt || []).map((sc: any, i: number) => (
      <SJTBlock key={sc.id} index={i + 1} title={sc.title} classFocus={sc.context} scenario={sc.scenario} options={sc.options}
        value={sjt[sc.id]} onChange={(v) => setSjt((p) => ({ ...p, [sc.id]: v }))} />
    ));

  const stepId = STEPS[stepIdx].id;
  const body =
    stepId === 'marks' ? renderMarks()
      : stepId === 'proficiency' ? renderProficiency()
      : stepId === 'learningStyles' ? renderLearningStyles()
      : stepId === 'studyHabits' ? likertList(data.studyHabits || [], studyHabits, setStudyHabits, 'How do you actually study? Answer for what is true now, not what you wish were true.')
      : stepId === 'examPrep' ? renderExamPrep()
      : renderSjt();

  return (
    <DishaWizardShell
      title="DISHA Test 3"
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={st.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DC.bg, gap: 14, padding: 24 },
  loadText: { fontSize: 14, color: DC.gray, fontWeight: '600', textAlign: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: DC.text, marginBottom: 8 },
  subLabel: { fontSize: 11, fontWeight: '700', color: DC.faint, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  subjCard: { borderWidth: 1, borderColor: DC.border, borderRadius: 14, padding: 14, marginBottom: 12, backgroundColor: DC.white },
  subjName: { fontSize: 15, fontWeight: '800', color: DC.text, marginBottom: 10 },
  termsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  termCol: { width: '47%' },
  termLabel: { fontSize: 11.5, color: DC.gray, marginBottom: 5, fontWeight: '600' },
  termInputs: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slash: { color: DC.faint, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: DC.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: DC.surface },
  chipOn: { backgroundColor: DC.primary, borderColor: DC.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: DC.gray },
  chipTextOn: { color: '#fff' },
});
