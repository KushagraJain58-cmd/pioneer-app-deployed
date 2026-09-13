import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DishaWizardShell, { WizardStep } from './components/DishaWizardShell';
import {
  CheckRow, ChipSelect, DC, InfoNote, ModuleIntro, MultiChipSelect, NumField, PartHeading, QCard, QText, ScaleRow, TextField,
} from './components/dishaControls';
import { getDishaC12Questions, submitDishaC12Assessment } from '../../lib/api';

const AGREE = [
  { value: 1, label: 'Strongly Disagree' }, { value: 2, label: 'Disagree' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' }, { value: 5, label: 'Strongly Agree' },
];
const LIKE = [
  { value: 1, label: 'Strongly Dislike' }, { value: 2, label: 'Dislike' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Like' }, { value: 5, label: 'Strongly Like' },
];
const APPEAL = [
  { value: 1, label: 'Not at all' }, { value: 2, label: 'Slightly' }, { value: 3, label: 'Neutral' },
  { value: 4, label: 'Appealing' }, { value: 5, label: 'Very appealing' },
];
const IMPORTANCE = [
  { value: 1, label: 'Not important' }, { value: 2, label: 'Slightly' }, { value: 3, label: 'Moderately' },
  { value: 4, label: 'Very' }, { value: 5, label: 'Extremely' },
];

const STEPS: WizardStep[] = [
  { id: 'academic', code: '1', name: 'Academic Profile' },
  { id: 'aptitude', code: '2', name: 'Aptitude (Extended)' },
  { id: 'personality', code: '3', name: 'Personality' },
  { id: 'interests', code: '4', name: 'Interests (RIASEC)' },
  { id: 'careerTitles', code: '5', name: 'Career Titles' },
  { id: 'valuesMotivations', code: '6', name: 'Values & Motivations' },
  { id: 'lifeDesign', code: '7', name: 'Life Design' },
  { id: 'context', code: '8', name: 'Your Context', optional: true },
  { id: 'scenarios', code: '9', name: 'Career Scenarios' },
];

/* MCQ option list */
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

export default function DISHAC12AssessmentScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const [class10Marks, setClass10Marks] = useState<Record<string, any>>({});
  const [class11Marks, setClass11Marks] = useState<Record<string, any>>({});
  const [class12Marks, setClass12Marks] = useState<Record<string, any>>({});
  const [attemptedScores, setAttemptedScores] = useState<Record<string, any>>({});
  const [aptitude, setAptitude] = useState<Record<string, { selected?: number; hintUsed?: boolean }>>({});
  const [hintOpen, setHintOpen] = useState<Record<string, boolean>>({});
  const [personality, setPersonality] = useState<Record<string, number>>({});
  const [interests, setInterests] = useState<Record<string, number>>({});
  const [careerAppeal, setCareerAppeal] = useState<Record<string, number>>({});
  const [values, setValues] = useState<Record<string, number>>({});
  const [motivations, setMotivations] = useState<Record<string, number>>({});
  const [lifeDesign, setLifeDesign] = useState<Record<string, any>>({});
  const [parentPreference, setParentPreference] = useState<number | null>(null);
  const [financialUrgency, setFinancialUrgency] = useState<number | null>(null);
  const [geographicConstraint, setGeographicConstraint] = useState<number | null>(null);
  const [secretInterest, setSecretInterest] = useState('');
  const [careerClarity, setCareerClarity] = useState<string | null>(null);
  const [targetExam, setTargetExam] = useState<string[]>([]);
  const [financialSituation, setFinancialSituation] = useState<string | null>(null);
  const [roleModelName, setRoleModelName] = useState('');
  const [roleModelAdmire, setRoleModelAdmire] = useState('');
  const [scenarios, setScenarios] = useState<Record<string, string>>({});

  useEffect(() => {
    getDishaC12Questions()
      .then((res) => setData(res.data?.data || null))
      .catch((e) => setErrorMsg(e?.response?.data?.error?.message || e?.response?.data?.message || 'Could not load the assessment.'))
      .finally(() => setLoading(false));
  }, []);

  const setSlotVal = (setter: any, slotKey: string, field: string, val: any) =>
    setter((p: any) => ({ ...p, [slotKey]: { ...p[slotKey], [field]: val } }));
  const setClass10Val = (subjKey: string, field: string, val: any) =>
    setClass10Marks((p) => ({ ...p, [subjKey]: { ...p[subjKey], [field]: val } }));

  const revealHint = (qid: string) => {
    setHintOpen((p) => ({ ...p, [qid]: true }));
    setAptitude((p) => ({ ...p, [qid]: { ...p[qid], hintUsed: true } }));
  };

  const class10Done = useMemo(
    () => (data?.academic?.class10Subjects || []).filter((s: any) => class10Marks[s.key]?.maximum && (class10Marks[s.key]?.obtained || class10Marks[s.key]?.obtained === 0)).length,
    [class10Marks, data]
  );

  const progress = useMemo(() => {
    const c: Record<string, { done: number; total: number; optional?: boolean }> = {};
    if (!data) return c;
    c.academic = { done: class10Done, total: (data.academic?.class10Subjects || []).length || 1 };
    c.aptitude = { done: (data.aptitude || []).filter((q: any) => aptitude[q.id]?.selected != null).length, total: (data.aptitude || []).length };
    c.personality = { done: (data.personality || []).filter((q: any) => personality[q.id]).length, total: (data.personality || []).length };
    c.interests = { done: (data.interests || []).filter((q: any) => interests[q.id]).length, total: (data.interests || []).length };
    c.careerTitles = { done: (data.careerTitles || []).filter((q: any) => careerAppeal[q.id]).length, total: (data.careerTitles || []).length };
    const valuesDone = (data.workValues || []).filter((q: any) => values[q.id]).length + (data.motivations || []).filter((q: any) => motivations[q.id]).length;
    c.valuesMotivations = { done: valuesDone, total: (data.workValues || []).length + (data.motivations || []).length };
    const ldItems: any[] = Object.values(data.lifeDesign || {});
    const ldDone = ldItems.filter((item: any) => lifeDesign[item.id] != null && lifeDesign[item.id] !== '').length;
    c.lifeDesign = { done: ldDone, total: ldItems.length || 1 };
    const ctxDone = [parentPreference, financialUrgency, geographicConstraint, careerClarity].filter((v) => v != null && v !== '').length;
    c.context = { done: ctxDone, total: 4, optional: true };
    c.scenarios = { done: (data.scenarios || []).filter((s: any) => scenarios[s.id]).length, total: (data.scenarios || []).length };
    return c;
  }, [data, class10Done, aptitude, personality, interests, careerAppeal, values, motivations, lifeDesign, parentPreference, financialUrgency, geographicConstraint, careerClarity, scenarios]);

  const handleSubmit = async () => {
    const required = ['aptitude', 'personality', 'interests', 'careerTitles', 'valuesMotivations', 'scenarios'];
    const missing = required.filter((g) => progress[g] && progress[g].done < progress[g].total);
    if (class10Done === 0) missing.unshift('academic');
    if (missing.length) {
      Alert.alert('Incomplete', `Please complete: ${missing.map((g) => STEPS.find((s) => s.id === g)?.name).join(', ')}`);
      setStepIdx(STEPS.findIndex((s) => s.id === missing[0]));
      return;
    }
    setSubmitting(true);
    try {
      await submitDishaC12Assessment({
        class10Marks, class11Marks, class12Marks, attemptedScores,
        aptitude, personality, interests, careerAppeal, values, motivations, lifeDesign,
        context: {
          parentPreference, financialUrgency, geographicConstraint, secretInterest,
          careerClarity, targetExam, financialSituation, roleModelName, roleModelAdmire,
        },
        scenarios,
        completionTimeSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      navigation.replace('DISHAC12Result');
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
            <Text style={st.loadText}>Preparing your Career Selection Test…</Text>
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

  const ld = data.lifeDesign || {};
  const ctx = data.context || {};

  const renderMarksGrid = (title: string, hint: string, slots: string[], marksState: Record<string, any>, setMarksState: any, showPredicted: boolean) => (
    <View style={st.subjCard}>
      <Text style={st.subjName}>{title}</Text>
      {!!hint && <Text style={st.gridHint}>{hint}</Text>}
      <View style={{ gap: 12, marginTop: 10 }}>
        {slots.map((slotKey, i) => (
          <View key={slotKey} style={st.slotRow}>
            <TextInput
              style={st.slotNameInput}
              placeholder={`Subject ${i + 1} name`}
              placeholderTextColor={DC.faint}
              value={marksState[slotKey]?.label || ''}
              onChangeText={(v) => setSlotVal(setMarksState, slotKey, 'label', v)}
            />
            <View style={st.termInputs}>
              <NumField value={marksState[slotKey]?.obtained} onChange={(v) => setSlotVal(setMarksState, slotKey, 'obtained', v)} placeholder="Got" />
              <Text style={st.slash}>/</Text>
              <NumField value={marksState[slotKey]?.maximum} onChange={(v) => setSlotVal(setMarksState, slotKey, 'maximum', v)} placeholder="Max" />
            </View>
            {showPredicted && (
              <CheckRow
                checked={!!marksState[slotKey]?.predicted}
                onToggle={() => setSlotVal(setMarksState, slotKey, 'predicted', !marksState[slotKey]?.predicted)}
                label="Predicted"
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderAcademic = () => (
    <View>
      <ModuleIntro>
        Enter marks for Class 10 (Board), Class 11 (Annual), and Class 12 (Actual or Predicted). If a
        Class 12 subject hasn't been examined yet, enter your realistic estimate and tick 'Predicted'.
      </ModuleIntro>

      <View style={st.subjCard}>
        <Text style={st.subjName}>Class 10 Board Results</Text>
        <View style={{ gap: 12, marginTop: 10 }}>
          {(data.academic?.class10Subjects || []).map((subj: any) => (
            <View key={subj.key} style={st.slotRow}>
              <Text style={st.fixedSubjName}>{subj.label}</Text>
              <View style={st.termInputs}>
                <NumField value={class10Marks[subj.key]?.obtained} onChange={(v) => setClass10Val(subj.key, 'obtained', v)} placeholder="Got" />
                <Text style={st.slash}>/</Text>
                <NumField value={class10Marks[subj.key]?.maximum} onChange={(v) => setClass10Val(subj.key, 'maximum', v)} placeholder="Max" />
              </View>
            </View>
          ))}
        </View>
      </View>

      {renderMarksGrid(
        'Class 11 — Annual Examination',
        'Enter marks for your stream subjects only. Name each slot (e.g. Physics, History, Accountancy).',
        data.academic?.class11Slots || [], class11Marks, setClass11Marks, false
      )}
      {renderMarksGrid(
        'Class 12 — Current Year (Actual or Predicted)',
        'For subjects not yet examined, enter your realistic estimate and tick Predicted.',
        data.academic?.class12Slots || [], class12Marks, setClass12Marks, true
      )}

      <View style={st.subjCard}>
        <Text style={st.subjName}>Entrance Exam Scores (if available)</Text>
        <Text style={st.gridHint}>Leave blank if not yet attempted.</Text>
        <View style={{ gap: 12, marginTop: 10 }}>
          {(data.academic?.entranceExamsAttempted || []).map((exam: any) => (
            <View key={exam.key} style={st.slotRow}>
              <Text style={st.fixedSubjName}>{exam.label}</Text>
              <NumField value={attemptedScores[exam.key]?.value} onChange={(v) => setSlotVal(setAttemptedScores, exam.key, 'value', v)} placeholder={exam.unit} />
              {!!exam.note && <Text style={st.examNote}>{exam.note}</Text>}
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderAptitude = () => (
    <View>
      <ModuleIntro>20 harder questions across Numerical, Verbal, Logical and Abstract reasoning. Correct = +1 · Wrong = −0.33 · Hint = −0.25 · Blank = 0.</ModuleIntro>
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

  const likertList = (items: any[], map: Record<string, number>, setter: any, scale: any[], hint?: string) => (
    <View>
      {!!hint && <ModuleIntro>{hint}</ModuleIntro>}
      {(items || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={scale} value={map[q.id]} onChange={(v) => setter((p: any) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderCareerTitles = () => (
    <View>
      <ModuleIntro>Rate how appealing each career sounds — regardless of whether you think you could get into it.</ModuleIntro>
      {(data.careerTitles || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <View style={st.occTitleRow}>
            <Text style={st.occTitle}>{q.title}</Text>
            <Text style={st.occSector}>{q.sector}</Text>
          </View>
          <ScaleRow scale={APPEAL} value={careerAppeal[q.id]} onChange={(v) => setCareerAppeal((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderValuesMotivations = () => (
    <View>
      <PartHeading>Part A — Work Values</PartHeading>
      <ModuleIntro>How important is each statement to your future career?</ModuleIntro>
      {(data.workValues || []).map((q: any, i: number) => (
        <QCard index={i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={IMPORTANCE} value={values[q.id]} onChange={(v) => setValues((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
      <PartHeading>Part B — Career Motivations</PartHeading>
      <ModuleIntro>How accurately does each statement describe what drives you?</ModuleIntro>
      {(data.motivations || []).map((q: any, i: number) => (
        <QCard index={(data.workValues || []).length + i + 1} key={q.id}>
          <QText india={q.indiaSpecific}>{q.text}</QText>
          <ScaleRow scale={AGREE} value={motivations[q.id]} onChange={(v) => setMotivations((p) => ({ ...p, [q.id]: v }))} />
        </QCard>
      ))}
    </View>
  );

  const renderLifeDesign = () => {
    let idx = 0;
    const next = () => { idx += 1; return idx; };
    const likertKeys = ['metroPreference', 'autonomyIn5Years', 'incomeAspiration', 'familyPresence'];
    const singleKeys = ['orgType', 'geoExpectation', 'workingStyle'];
    return (
      <View>
        <ModuleIntro>How do you want your career to fit into your life? These shape lifestyle compatibility, not just what you can do.</ModuleIntro>
        {likertKeys.map((k) =>
          ld[k] ? (
            <QCard index={next()} key={k}>
              <QText>{ld[k].text}</QText>
              {!!ld[k].note && <Text style={st.note}>{ld[k].note}</Text>}
              <ScaleRow scale={AGREE} value={lifeDesign[k]} onChange={(v) => setLifeDesign((p) => ({ ...p, [k]: v }))} />
            </QCard>
          ) : null
        )}
        {singleKeys.map((k) =>
          ld[k] ? (
            <QCard index={next()} key={k}>
              <QText>{ld[k].text}</QText>
              {!!ld[k].note && <Text style={st.note}>{ld[k].note}</Text>}
              <View style={{ marginTop: 10 }}>
                <ChipSelect options={ld[k].options || []} value={lifeDesign[k]} onChange={(v) => setLifeDesign((p) => ({ ...p, [k]: v }))} />
              </View>
            </QCard>
          ) : null
        )}
        {!!ld.riskTolerance && (
          <QCard index={next()}>
            <QText>{ld.riskTolerance.text}</QText>
            {!!ld.riskTolerance.note && <Text style={st.note}>{ld.riskTolerance.note}</Text>}
            <ScaleRow scale={AGREE} value={lifeDesign.riskTolerance} onChange={(v) => setLifeDesign((p) => ({ ...p, riskTolerance: v }))} />
          </QCard>
        )}
      </View>
    );
  };

  const renderContext = () => (
    <View>
      <ModuleIntro>Eight questions about your real-life situation. These personalise your results — no career option is ever blocked by any answer here.</ModuleIntro>
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
      {!!ctx.secretInterest && (
        <QCard index={4}>
          <QText>{ctx.secretInterest.text}</QText>
          {!!ctx.secretInterest.note && <Text style={st.note}>{ctx.secretInterest.note}</Text>}
          <View style={{ marginTop: 10 }}>
            <TextField value={secretInterest} onChange={setSecretInterest} placeholder="Optional — private to counsellor only" rows={3} />
          </View>
        </QCard>
      )}
      {!!ctx.careerClarity && (
        <QCard index={5}>
          <QText>{ctx.careerClarity.text}</QText>
          {!!ctx.careerClarity.note && <Text style={st.note}>{ctx.careerClarity.note}</Text>}
          <View style={{ marginTop: 10 }}>
            <ChipSelect options={ctx.careerClarity.options || []} value={careerClarity ?? undefined} onChange={setCareerClarity} />
          </View>
        </QCard>
      )}
      {!!ctx.targetExam && (
        <QCard index={6}>
          <QText>{ctx.targetExam.text}</QText>
          {!!ctx.targetExam.note && <Text style={st.note}>{ctx.targetExam.note}</Text>}
          <View style={{ marginTop: 10 }}>
            <MultiChipSelect options={ctx.targetExam.options || []} values={targetExam} onToggle={(o) => setTargetExam((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))} />
          </View>
        </QCard>
      )}
      {!!ctx.financialSituation && (
        <QCard index={7}>
          <QText>{ctx.financialSituation.text}</QText>
          {!!ctx.financialSituation.note && <Text style={st.note}>{ctx.financialSituation.note}</Text>}
          <View style={{ marginTop: 10 }}>
            <ChipSelect options={ctx.financialSituation.options || []} value={financialSituation ?? undefined} onChange={setFinancialSituation} />
          </View>
        </QCard>
      )}
      {!!ctx.roleModel && (
        <QCard index={8}>
          <QText>{ctx.roleModel.text}</QText>
          {!!ctx.roleModel.note && <Text style={st.note}>{ctx.roleModel.note}</Text>}
          <View style={{ marginTop: 10, gap: 10 }}>
            <TextInput
              style={st.slotNameInput}
              placeholder="Role model's name"
              placeholderTextColor={DC.faint}
              value={roleModelName}
              onChangeText={setRoleModelName}
            />
            <TextField value={roleModelAdmire} onChange={setRoleModelAdmire} placeholder="What I admire about their career (about 50 words)" rows={2} />
          </View>
        </QCard>
      )}
    </View>
  );

  const renderScenarios = () => (
    <View>
      <ModuleIntro>Five situations Class 12 students commonly face. Select the response you would MOST LIKELY choose.</ModuleIntro>
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
      : stepId === 'personality' ? likertList(data.personality, personality, setPersonality, AGREE, 'Rate how accurately each statement describes you. There are no right or wrong answers.')
      : stepId === 'interests' ? likertList(data.interests, interests, setInterests, LIKE, 'Rate how much you would ENJOY each activity — regardless of your aptitude, marks, or family\'s opinion.')
      : stepId === 'careerTitles' ? renderCareerTitles()
      : stepId === 'valuesMotivations' ? renderValuesMotivations()
      : stepId === 'lifeDesign' ? renderLifeDesign()
      : stepId === 'context' ? renderContext()
      : renderScenarios();

  return (
    <DishaWizardShell
      title="Career Selection"
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
  note: { fontSize: 11.5, color: DC.faint, marginTop: 4, marginBottom: 2, lineHeight: 16 },
  subjCard: { borderWidth: 1, borderColor: DC.border, borderRadius: 14, padding: 14, marginBottom: 14, backgroundColor: DC.white },
  subjName: { fontSize: 15, fontWeight: '800', color: DC.text },
  gridHint: { fontSize: 12, color: DC.gray, marginTop: 4, lineHeight: 17 },
  slotRow: { gap: 8 },
  slotNameInput: { borderWidth: 1.5, borderColor: DC.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13.5, color: DC.text, backgroundColor: DC.surface },
  fixedSubjName: { fontSize: 14, fontWeight: '700', color: DC.text },
  termInputs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slash: { color: DC.faint, fontWeight: '700' },
  examNote: { fontSize: 11, color: DC.faint, lineHeight: 15 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  diffTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  easy: { backgroundColor: '#DCFCE7' }, med: { backgroundColor: '#FEF3C7' }, hard: { backgroundColor: '#FEE2E2' },
  diffText: { fontSize: 10.5, fontWeight: '800' },
  easyT: { color: '#166534' }, medT: { color: '#92400E' }, hardT: { color: '#991B1B' },
  dimTag: { backgroundColor: DC.surface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  dimText: { fontSize: 10.5, fontWeight: '700', color: DC.gray },
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1.5, borderColor: '#FDE68A', backgroundColor: '#FEF9E7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  hintBtnText: { fontSize: 12.5, fontWeight: '700', color: DC.amber },
  occTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  occTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: DC.text },
  occSector: { fontSize: 10.5, fontWeight: '700', color: DC.gray, backgroundColor: DC.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
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
