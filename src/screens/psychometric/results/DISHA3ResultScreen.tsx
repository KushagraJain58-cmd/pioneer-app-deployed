import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDisha3Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const SUBJECT_LABELS: Record<string, string> = {
  mathematics: 'Mathematics', physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology', english: 'English',
  science: 'Science', socialScience: 'Social Science', hindi: 'Hindi / 2nd Lang', thirdLanguage: '3rd Language',
  computerScience: 'Computer Science', physicalEducation: 'Phys. Ed', optional: 'Optional', fifthSubject: '5th Subject',
  accountancy: 'Accountancy', businessStudies: 'Business Studies', economics: 'Economics', history: 'History',
  polsci: 'Pol Science', geography: 'Geography', psychology: 'Psychology', vocationalSubject: 'Vocational',
};
const subjLabel = (k: string) => SUBJECT_LABELS[k] || k;
const VARK: Record<string, string> = { Visual: 'Visual', Auditory: 'Auditory', ReadWrite: 'Read/Write', Kinesthetic: 'Kinesthetic' };
const EXAM: Record<string, string> = { jeeMains: 'JEE Mains', neet: 'NEET', clat: 'CLAT', caFoundation: 'CA Foundation', cuet: 'CUET' };
const PILLARS: [string, string][] = [
  ['academic', 'Academic profile / marks (50%)'], ['studyQuality', 'Study quality (30%)'], ['examReadiness', 'Exam readiness (20%)'],
];
const SCALE_NAME = (s: string) =>
  s.replace('AcadMot_I', 'Motivation (Intrinsic)').replace('AcadMot_E', 'Motivation (Extrinsic)').replace('CoachDep', 'Coaching Dependence')
    .replace('ExamPrep', 'Preparation Quality').replace('TestAnxiety', 'Test Anxiety').replace('TestStrategy', 'Test Strategy');

const zoneColor = (z?: string) => (z === 'Exceptional' ? '#16A34A' : z === 'Strong' ? '#22C55E' : z === 'Average' ? '#EAB308' : z === 'Developing' ? '#F97316' : '#EF4444');
const bandColor = (b?: string) => (b === 'High' ? '#16A34A' : b === 'Moderate' ? '#EAB308' : '#EF4444');

export default function DISHA3ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDisha3Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Academic Performance Report" icon="bar-chart-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { marks, proficiency, learningStyles, studyHabits, examPrep, sjt, streams, examProbabilities, summary } = r;
        const topSjt = sjt?.competencies?.[0]?.score || 1;
        const examList = Object.entries(examProbabilities || {}).filter(([, v]) => v).map(([k, v]: any) => ({ exam: EXAM[k] || k, ...v }));
        return (
          <>
            {/* Summary */}
            {summary && (
              <Card>
                <Text style={s.label}>Academic Readiness</Text>
                <Text style={s.fitBig}>{summary.overall ?? 0}<Text style={s.fitOf}> / 100</Text></Text>
                {summary.preliminary && <Text style={s.prelim}>Preliminary (Test 3 only)</Text>}
                <View style={{ marginTop: 12, gap: 10 }}>
                  {PILLARS.map(([k, lbl]) => (
                    <View key={k}>
                      <View style={s.rowBetween}><Text style={s.pillarLabel}>{lbl}</Text><Text style={s.pillarVal}>{summary.pillars?.[k] ?? 0}</Text></View>
                      <Bar percent={summary.pillars?.[k] ?? 0} />
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Academic dashboard */}
            {marks?.subjects?.length > 0 && (
              <>
                <Text style={s.section}>Academic Dashboard</Text>
                <Card>
                  {marks.subjects.map((sub: any) => (
                    <View key={sub.subjectKey} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}>
                        <Text style={s.dimName}>{subjLabel(sub.subjectKey)}</Text>
                        <Text style={[s.zone, { color: zoneColor(sub.zone) }]}>SSI {sub.ssi} · {sub.trendLabel || sub.zone}</Text>
                      </View>
                      <Bar percent={sub.ssi} color={zoneColor(sub.zone)} />
                    </View>
                  ))}
                  <View style={s.tiles}>
                    <Tile label="Academic (APS)" value={marks.aps} />
                    <Tile label="Composite SSI" value={marks.composite} />
                    <Tile label="Consistency" value={marks.consistencyScore} />
                    <Tile label="Trajectory" value={marks.trajectory} />
                  </View>
                </Card>
              </>
            )}

            {/* Confidence vs performance */}
            {(proficiency?.impostorSubjects?.length || proficiency?.overconfidenceSubjects?.length || proficiency?.hiddenInterestSubjects?.length) ? (
              <>
                <Text style={s.section}>Confidence vs Performance</Text>
                {proficiency.impostorSubjects?.length > 0 && <Note tone="blue" title="Possible underconfidence" body={`You rate yourself lower than your marks suggest in: ${proficiency.impostorSubjects.map(subjLabel).join(', ')}.`} />}
                {proficiency.overconfidenceSubjects?.length > 0 && <Note tone="amber" title="Worth a closer look" body={`Your confidence is higher than current marks in: ${proficiency.overconfidenceSubjects.map(subjLabel).join(', ')}.`} />}
                {proficiency.hiddenInterestSubjects?.length > 0 && <Note tone="green" title="Hidden interest" body={`You enjoy these but marks lag: ${proficiency.hiddenInterestSubjects.map(subjLabel).join(', ')}.`} />}
              </>
            ) : null}

            {/* Streams */}
            {streams?.length > 0 && (
              <>
                <Text style={s.section}>Stream Recommendation</Text>
                <Card>
                  {streams.map((st2: any, i: number) => (
                    <View key={st2.stream} style={{ marginBottom: 14 }}>
                      <View style={s.rowBetween}>
                        <Text style={s.dimName}>{st2.label}{i === 0 ? '  ★ Best fit' : ''}</Text>
                        <Text style={s.pillarVal}>{st2.probability < 35 ? '<35%' : st2.probability > 90 ? '>90%' : `${st2.probability}%`}</Text>
                      </View>
                      <Bar percent={st2.probability} color={i === 0 ? RC.accent : RC.primary} />
                      {(st2.drivers?.length > 0 || st2.concerns?.length > 0) && (
                        <Text style={s.driverText}>
                          {st2.drivers?.length > 0 ? `Drivers: ${st2.drivers.join(', ')}. ` : ''}
                          {st2.concerns?.length > 0 ? `Watch: ${st2.concerns.join(', ')}.` : ''}
                        </Text>
                      )}
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Exam probabilities */}
            {examList.length > 0 && (
              <>
                <Text style={s.section}>Exam Probability Estimates</Text>
                <Card>
                  <View style={s.tiles}>
                    {examList.map((e: any) => (
                      <View key={e.exam} style={s.examTile}>
                        <Text style={s.examName}>{e.exam}</Text>
                        <Text style={s.examPct}>{e.probability}%</Text>
                        <Text style={[s.examBand, { color: bandColor(e.band) }]}>{e.band}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* Learning style */}
            {learningStyles?.varkProfile?.length > 0 && (
              <>
                <Text style={s.section}>Learning Style{learningStyles.dominantStyle ? ` · ${VARK[learningStyles.dominantStyle] || learningStyles.dominantStyle}` : ''}</Text>
                <Card>
                  {learningStyles.varkProfile.map((v: any) => (
                    <View key={v.scale} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{VARK[v.scale] || v.scale}</Text><Text style={s.pillarVal}>{v.pct}</Text></View>
                      <Bar percent={v.pct} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Study habits + exam prep */}
            {(studyHabits?.subScales?.length > 0 || examPrep?.subScales?.length > 0) && (
              <>
                <Text style={s.section}>Study Habits & Exam Preparedness</Text>
                {studyHabits?.subScales?.length > 0 && (
                  <Card>
                    <Text style={s.cardHead}>Study Habits</Text>
                    {studyHabits.subScales.map((sc: any) => (
                      <View key={sc.scale} style={{ marginBottom: 10 }}>
                        <View style={s.rowBetween}><Text style={s.dimName}>{SCALE_NAME(sc.scale)}</Text><Text style={s.pillarVal}>{sc.pct}</Text></View>
                        <Bar percent={sc.pct} />
                      </View>
                    ))}
                  </Card>
                )}
                {examPrep?.subScales?.length > 0 && (
                  <Card>
                    <Text style={s.cardHead}>Exam Preparedness</Text>
                    {examPrep.subScales.map((sc: any) => (
                      <View key={sc.scale} style={{ marginBottom: 10 }}>
                        <View style={s.rowBetween}><Text style={s.dimName}>{SCALE_NAME(sc.scale)}</Text><Text style={s.pillarVal}>{sc.pct}</Text></View>
                        <Bar percent={sc.pct} color={sc.scale === 'TestAnxiety' ? '#F97316' : RC.primary} />
                      </View>
                    ))}
                    {examPrep.anxietyRisk === 'High' && <Note tone="amber" title="Exam anxiety is elevated" body="This is very common and manageable. Your report includes anxiety-management strategies; iCall and the Vandrevala Foundation can help." />}
                  </Card>
                )}
              </>
            )}

            {/* SJT */}
            {sjt?.competencies?.length > 0 && (
              <>
                <Text style={s.section}>Situational Judgment{sjt.percentage != null ? ` · ${sjt.percentage}%` : ''}</Text>
                <Card>
                  {sjt.competencies.map((c: any) => (
                    <View key={c.name} style={{ marginBottom: 12 }}>
                      <Text style={s.dimName}>{c.name}</Text>
                      <Bar percent={Math.min(100, (c.score / topSjt) * 100)} color={RC.accent} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            <Text style={s.disclaimer}>
              A scientifically-informed guide, not a destiny. Weak or declining marks are solvable
              patterns, not fixed limits. For guidance only — never for admissions or selection.
            </Text>
          </>
        );
      }}
    </ResultShell>
  );
}

function Tile({ label, value }: { label: string; value: any }) {
  return (
    <View style={s.tile}>
      <Text style={s.tileLabel}>{label}</Text>
      <Text style={s.tileVal}>{value ?? '—'}</Text>
    </View>
  );
}

function Note({ tone, title, body }: { tone: 'blue' | 'amber' | 'green'; title: string; body: string }) {
  const bg = tone === 'blue' ? '#E4F4FB' : tone === 'amber' ? '#FEF3C7' : '#DCFCE7';
  const fg = tone === 'blue' ? '#075985' : tone === 'amber' ? '#92400E' : '#166534';
  return (
    <View style={[s.note, { backgroundColor: bg }]}>
      <Text style={[s.noteTitle, { color: fg }]}>{title}</Text>
      <Text style={[s.noteBody, { color: fg }]}>{body}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '800', color: RC.faint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  fitBig: { fontSize: 40, fontWeight: '800', color: RC.primary },
  fitOf: { fontSize: 18, fontWeight: '700', color: RC.faint },
  prelim: { fontSize: 11.5, fontWeight: '700', color: RC.amber, marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pillarLabel: { fontSize: 13, color: RC.text, fontWeight: '600', flex: 1 },
  pillarVal: { fontSize: 13, fontWeight: '800', color: RC.primary },
  section: { fontSize: 13, fontWeight: '800', color: RC.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 12 },
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1 },
  zone: { fontSize: 12, fontWeight: '800' },
  cardHead: { fontSize: 14.5, fontWeight: '800', color: RC.text, marginBottom: 12 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tile: { width: '47.5%', backgroundColor: RC.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  tileLabel: { fontSize: 11, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  tileVal: { fontSize: 18, fontWeight: '800', color: RC.primary, marginTop: 4 },
  examTile: { width: '30%', backgroundColor: RC.surface, borderRadius: 12, padding: 10, alignItems: 'center' },
  examName: { fontSize: 11, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  examPct: { fontSize: 17, fontWeight: '800', color: RC.primary, marginTop: 3 },
  examBand: { fontSize: 10.5, fontWeight: '800', marginTop: 2 },
  driverText: { fontSize: 11.5, color: RC.gray, marginTop: 4, lineHeight: 16 },
  note: { borderRadius: 14, padding: 14, marginBottom: 10 },
  noteTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 4 },
  noteBody: { fontSize: 12.5, lineHeight: 18 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
