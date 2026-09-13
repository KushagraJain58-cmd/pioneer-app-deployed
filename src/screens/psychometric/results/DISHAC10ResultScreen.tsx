import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDishaC10Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const SUBJECT_LABELS: Record<string, string> = {
  mathematics: 'Mathematics', science: 'Science', english: 'English', socialScience: 'Social Science',
  hindi: 'Hindi / 2nd Lang', computerScience: 'Computer Science / IT',
};
const subjLabel = (k: string) => SUBJECT_LABELS[k] || k;
const RIASEC_LABELS: Record<string, string> = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
const VALUE_LABELS: Record<string, string> = {
  Security: 'Security', Growth: 'Growth / Intellectual', Altruism: 'Altruism', Prestige: 'Prestige',
  Autonomy: 'Autonomy', Seva: 'Seva / Nation-building', WLB: 'Work-Life Balance', Innovation: 'Innovation',
};
const bandColor = (p: number) => (p >= 65 ? '#16A34A' : p >= 50 ? '#22C55E' : p >= 40 ? '#EAB308' : '#F97316');
const examBand = (b?: string) => (b === 'High' ? '#16A34A' : b === 'Moderate' ? '#EAB308' : '#EF4444');

export default function DISHAC10ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDishaC10Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Recommended Stream" icon="git-branch-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { academic, aptitude, interests, values, context, scenarios, streams, examReadiness, summary, explorationNeeded } = r;
        const subjectBars = (academic?.subjects || []).filter((s: any) => s.ssi != null);
        const topStreamProb = (streams || []).reduce((m: number, s: any) => Math.max(m, s.probability), 0) || 100;

        return (
          <>
            {explorationNeeded && (
              <Note tone="blue" title="Your top streams are closely matched — and that's normal" body="Many students genuinely fit more than one stream at this stage. Talk it through with your counsellor and focus on which activities (not just subjects) engage you most." />
            )}

            {/* Top recommendation */}
            <Card>
              <Text style={s.label}>Best Fit</Text>
              <Text style={s.fitBig}>{summary?.topProbability ?? 0}<Text style={s.fitOf}>%</Text></Text>
              <View style={{ marginTop: 14, gap: 10 }}>
                {(streams || []).map((st2: any, i: number) => (
                  <View key={st2.stream}>
                    <View style={s.rowBetween}>
                      <Text style={s.dimName}>{st2.label}{i === 0 ? '  ★ Recommended' : ''}</Text>
                      <Text style={s.pillarVal}>{st2.probability}%</Text>
                    </View>
                    <Bar percent={Math.min(100, (st2.probability / topStreamProb) * 100)} color={i === 0 ? RC.accent : RC.primary} />
                  </View>
                ))}
              </View>
            </Card>

            {/* Academic */}
            {subjectBars.length > 0 && (
              <>
                <Text style={s.section}>Academic Profile</Text>
                <Card>
                  {subjectBars.map((sub: any) => (
                    <View key={sub.subjectKey} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{subjLabel(sub.subjectKey)}</Text><Text style={[s.zone, { color: bandColor(sub.ssi) }]}>SSI {sub.ssi}</Text></View>
                      <Bar percent={sub.ssi} color={bandColor(sub.ssi)} />
                    </View>
                  ))}
                  {!!academic?.inTheZoneSubject && <Text style={s.meta}>You feel most 'in the zone' with {subjLabel(academic.inTheZoneSubject)} — a strong signal worth weighing alongside your marks.</Text>}
                </Card>
              </>
            )}

            {/* Aptitude */}
            {aptitude?.dimensions?.length > 0 && (
              <>
                <Text style={s.section}>Aptitude Snapshot</Text>
                <Card>
                  <View style={s.tiles}>
                    {aptitude.dimensions.map((d: any) => (
                      <View key={d.dim} style={s.tile}><Text style={s.tileLabel}>{d.dim}</Text><Text style={s.tileVal}>{d.tScore}</Text></View>
                    ))}
                  </View>
                  <Text style={s.meta}>
                    {aptitude.totalCorrect} correct · {aptitude.totalWrong} incorrect · {aptitude.totalBlank} blank
                    {aptitude.totalHints > 0 ? ` · ${aptitude.totalHints} hint(s) used` : ''}
                  </Text>
                </Card>
              </>
            )}

            {/* Interests */}
            {interests?.scores?.length > 0 && (
              <>
                <Text style={s.section}>Interest Profile{interests.topTypes?.length ? ` · ${interests.topTypes.map((t: string) => RIASEC_LABELS[t] || t).join(' & ')}` : ''}</Text>
                <Card>
                  <View style={s.tiles}>
                    {interests.scores.map((sc: any) => (
                      <View key={sc.type} style={s.tile6}><Text style={s.tileLabel}>{RIASEC_LABELS[sc.type] || sc.type}</Text><Text style={s.tileVal}>{sc.pct}</Text></View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* Values */}
            {values?.scores?.length > 0 && (
              <>
                <Text style={s.section}>Values & Preferences</Text>
                <Card>
                  <View style={s.chips}>
                    {[...values.scores].sort((a: any, b: any) => b.pct - a.pct).slice(0, 4).map((v: any, i: number) => (
                      <View key={v.scale} style={[s.valChip, i === 0 && s.valChipTop]}>
                        <Text style={[s.valChipText, i === 0 && s.valChipTextTop]}>{VALUE_LABELS[v.scale] || v.scale} ({v.pct})</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* Exam readiness */}
            {examReadiness?.length > 0 && (
              <>
                <Text style={s.section}>Exam Readiness Signal</Text>
                <Card>
                  <View style={s.tiles}>
                    {examReadiness.map((e: any) => (
                      <View key={e.exam} style={s.examTile}>
                        <Text style={s.tileLabel}>{e.exam}</Text>
                        <Text style={s.tileVal}>{e.probability}%</Text>
                        <Text style={[s.examBandT, { color: examBand(e.band) }]}>{e.band}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* Context */}
            {context && (context.highParentalPressure || context.highFinancialUrgency || context.geographicallyConstrained) && (
              <>
                <Text style={s.section}>Your Context</Text>
                {context.highParentalPressure && <Note tone="blue" title="Family-Aligned Path" body="Your family has a strong stream preference. Your recommended stream already reflects your genuine marks, aptitude and interests — use it as evidence for a calm, data-backed conversation at home." />}
                {context.highFinancialUrgency && <Note tone="blue" title="Career timeline" body="Earning sooner matters to your family. Commerce and vocational-adjacent pathways typically offer earlier income; this doesn't rule out other streams, but timelines are worth discussing." />}
                {context.geographicallyConstrained && <Note tone="blue" title="Geographic preference" body="You need to stay in or near your home city/state. Your counsellor can filter college recommendations accordingly — every stream above has good options within that constraint." />}
              </>
            )}

            {/* Scenarios */}
            {scenarios?.results?.length > 0 && (
              <>
                <Text style={s.section}>Real-Life Scenarios</Text>
                <Card>
                  <Text style={s.body}>You aligned with the most balanced response in {scenarios.alignedCount} of {scenarios.totalAnswered} scenarios.</Text>
                  <View style={[s.chips, { marginTop: 10 }]}>
                    {scenarios.results.filter((r2: any) => r2.picked).map((r2: any) => (
                      <View key={r2.id} style={[s.scChip, r2.aligned && s.scChipAligned]}>
                        <Text style={[s.scChipText, r2.aligned && s.scChipTextAligned]}>{r2.title}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={s.meta}>There are no wrong answers here — these give your counsellor insight into how you decide under pressure.</Text>
                </Card>
              </>
            )}

            <Text style={s.disclaimer}>
              A scientifically-informed guide, not a final verdict. Your effort, curiosity and choices
              always outweigh any single test score. Students succeed in any stream with support.
            </Text>
          </>
        );
      }}
    </ResultShell>
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
  fitOf: { fontSize: 20, fontWeight: '700', color: RC.faint },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pillarVal: { fontSize: 13, fontWeight: '800', color: RC.primary },
  section: { fontSize: 13, fontWeight: '800', color: RC.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 12 },
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1 },
  zone: { fontSize: 12, fontWeight: '800' },
  body: { fontSize: 13.5, color: RC.text, lineHeight: 20 },
  meta: { fontSize: 12.5, color: RC.gray, marginTop: 10, fontWeight: '600', lineHeight: 18 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '47.5%', backgroundColor: RC.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  tile6: { width: '31%', backgroundColor: RC.surface, borderRadius: 12, padding: 10, alignItems: 'center' },
  examTile: { width: '31%', backgroundColor: RC.surface, borderRadius: 12, padding: 10, alignItems: 'center' },
  tileLabel: { fontSize: 10.5, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  tileVal: { fontSize: 17, fontWeight: '800', color: RC.primary, marginTop: 4 },
  examBandT: { fontSize: 10.5, fontWeight: '800', marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valChip: { backgroundColor: RC.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  valChipTop: { backgroundColor: '#E4F4FB' },
  valChipText: { fontSize: 12.5, fontWeight: '700', color: RC.gray },
  valChipTextTop: { color: RC.primary },
  scChip: { backgroundColor: RC.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  scChipAligned: { backgroundColor: '#DCFCE7' },
  scChipText: { fontSize: 12, fontWeight: '700', color: RC.gray },
  scChipTextAligned: { color: '#166534' },
  note: { borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 6 },
  noteTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 4 },
  noteBody: { fontSize: 12.5, lineHeight: 18 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
