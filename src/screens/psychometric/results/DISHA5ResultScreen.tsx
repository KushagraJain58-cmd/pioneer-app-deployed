import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDisha5Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const tBand = (t: number) => (t >= 60 ? 'High' : t >= 50 ? 'Moderate' : t >= 45 ? 'Developing' : 'Low');
const tColor = (t: number) => (t >= 60 ? '#16A34A' : t >= 50 ? '#22C55E' : t >= 45 ? '#EAB308' : '#F97316');
const tPct = (t: number) => Math.max(0, Math.min(100, ((t - 20) / 60) * 100));

const QUADRANT_DESC: Record<string, string> = {
  HighAdapt_HighRisk: 'You thrive in dynamic, uncertain, high-growth environments — comfortable navigating change and taking calculated risks.',
  HighAdapt_LowRisk: 'You adapt readily but prefer structured security — excellent at flexing within established, stable settings.',
  LowAdapt_HighRisk: 'You take risks within familiar, known domains — bold within territory you understand well.',
  LowAdapt_LowRisk: 'You value certainty, routine and established paths — and there are excellent careers built exactly for that strength.',
};
const PILLARS: [string, string][] = [
  ['adaptability', 'Career Adaptability (4Cs)'], ['learningAgility', 'Learning Agility'],
  ['futureOrientation', 'Future Orientation'], ['growthMindset', 'Growth Mindset'],
];
const cleanScale = (s: string) =>
  s.replace('LearnAgility', 'Core Agility').replace('FutureSkills', 'Future Skills')
    .replace('FutOrient', 'Future Thinking').replace('AIAware', 'AI-Readiness').replace('India2030', 'India 2030');

export default function DISHA5ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDisha5Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Career Adaptability & Future-Readiness" icon="rocket-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { adaptability, mindset, decisionStyle, learningAgility, ambiguityRisk, futureOrientation, sjt, validity, quadrant, summary } = r;
        const topSjt = sjt?.competencies?.[0]?.score || 1;
        const topStyle = decisionStyle?.styles?.reduce((m: number, s: any) => Math.max(m, s.score), 0) || 100;
        const riskBars = [
          { scale: 'Ambiguity Tolerance', t: ambiguityRisk?.ambigTol?.tScore ?? 50 },
          { scale: 'Risk-Taking', t: ambiguityRisk?.riskTake?.tScore ?? 50 },
          { scale: 'Stability Preference', t: ambiguityRisk?.stability?.tScore ?? 50 },
        ];

        return (
          <>
            {validity && validity.clean === false && (
              <Note tone="blue" title="A note on your responses"
                body="A few responses suggest an idealised self-presentation. This does not invalidate your report; your counsellor may explore some areas in more depth." />
            )}

            {/* Future-readiness overview */}
            {summary && (
              <Card>
                <Text style={s.label}>Future-Readiness</Text>
                <Text style={s.fitBig}>{summary.overall ?? 0}<Text style={s.fitOf}> / 100</Text></Text>
                {summary.preliminary && <Text style={s.prelim}>Preliminary (Test 5 only)</Text>}
                {quadrant && (
                  <View style={{ marginTop: 12 }}>
                    <View style={s.quadChip}><Text style={s.quadChipText}>{quadrant.label}</Text></View>
                    {!!QUADRANT_DESC[quadrant.quadrant] && <Text style={s.quadDesc}>{QUADRANT_DESC[quadrant.quadrant]}</Text>}
                  </View>
                )}
                <View style={{ marginTop: 14, gap: 10 }}>
                  {PILLARS.map(([k, lbl]) => (
                    <View key={k}>
                      <View style={s.rowBetween}><Text style={s.pillarLabel}>{lbl}</Text><Text style={s.pillarVal}>{summary.pillars?.[k] ?? 0}</Text></View>
                      <Bar percent={summary.pillars?.[k] ?? 0} />
                    </View>
                  ))}
                </View>
                {quadrant?.clusters?.length > 0 && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={s.clustersLabel}>Career clusters that fit your profile</Text>
                    <View style={s.chips}>
                      {quadrant.clusters.map((c: string) => (
                        <View key={c} style={s.cluster}><Text style={s.clusterText}>{c}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            )}

            {/* 4Cs */}
            {adaptability?.dimensions?.length > 0 && (
              <>
                <Text style={s.section}>Career Adaptability (4Cs){adaptability.overallT != null ? ` · ${adaptability.overallT} (${adaptability.band})` : ''}</Text>
                <Card>
                  {adaptability.dimensions.map((d: any) => (
                    <View key={d.scale} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{d.scale}</Text><Text style={[s.zone, { color: tColor(d.tScore) }]}>T {d.tScore} · {tBand(d.tScore)}</Text></View>
                      <Bar percent={tPct(d.tScore)} color={tColor(d.tScore)} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Growth mindset */}
            {mindset && (
              <>
                <Text style={s.section}>Growth vs Fixed Mindset{mindset.tScore != null ? ` · ${mindset.tScore} (${mindset.band})` : ''}</Text>
                <Card>
                  <Bar percent={tPct(mindset.tScore ?? 50)} color={tColor(mindset.tScore ?? 50)} />
                  {mindset.abilityBeliefChallenge && <Note tone="blue" title="An ability-belief worth revisiting" body="Some beliefs about ability and talent may be limiting how you see your options. Your plan includes evidence-based examples of Indians who built these skills from low starting points — this is about expanding possibilities." />}
                </Card>
              </>
            )}

            {/* Decision style */}
            {decisionStyle?.styles?.length > 0 && (
              <>
                <Text style={s.section}>Decision-Making Style{decisionStyle.dominant ? ` · ${decisionStyle.dominant}` : ''}{decisionStyle.secondary ? ` / ${decisionStyle.secondary}` : ''}</Text>
                <Card>
                  {decisionStyle.styles.map((st2: any) => (
                    <View key={st2.style} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{st2.style}</Text><Text style={s.pillarVal}>{st2.score}</Text></View>
                      <Bar percent={Math.min(100, (st2.score / topStyle) * 100)} color={st2.style === decisionStyle.dominant ? RC.accent : RC.primary} />
                    </View>
                  ))}
                  {decisionStyle.dependentFlag && <Note tone="blue" title="Strong family orientation" body="A genuine strength — this plan helps you navigate it so both family harmony and personal fit are honoured, with conversations that build trust and independence together." />}
                  {decisionStyle.avoidantFlag && <Note tone="amber" title="Decision avoidance is workable" body="Avoiding a big decision often signals you care about getting it right — not a flaw. Your plan includes a step-by-step protocol for moving from avoiding to deciding." />}
                </Card>
              </>
            )}

            {/* Learning agility */}
            {learningAgility && (
              <>
                <Text style={s.section}>Learning Agility{learningAgility.tScore != null ? ` · ${learningAgility.tScore} (${learningAgility.band})` : ''}</Text>
                <Card>
                  <View style={s.tiles}>
                    {(learningAgility.subScales || []).map((sc: any) => (
                      <View key={sc.scale} style={s.tile}><Text style={s.tileLabel}>{cleanScale(sc.scale)}</Text><Text style={s.tileVal}>{sc.score}</Text></View>
                    ))}
                  </View>
                  {learningAgility.highAgility && <Note tone="green" title="India 2030 emerging careers unlocked" body="Your high learning agility suits fast-evolving fields — AI & data, climate & green energy, health tech, space & defence tech, agri-tech and the creator economy." />}
                </Card>
              </>
            )}

            {/* Ambiguity & risk */}
            {ambiguityRisk && (
              <>
                <Text style={s.section}>Ambiguity & Risk{ambiguityRisk.profile ? ` · ${ambiguityRisk.profile}` : ''}</Text>
                <Card>
                  {riskBars.map((b: any) => (
                    <View key={b.scale} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.scale}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                      <Bar percent={tPct(b.t)} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Future orientation */}
            {futureOrientation && (
              <>
                <Text style={s.section}>Future Orientation & AI-Readiness{futureOrientation.tScore != null ? ` · ${futureOrientation.tScore} (${futureOrientation.band})` : ''}</Text>
                <Card>
                  <View style={s.tiles}>
                    {(futureOrientation.subScales || []).map((sc: any) => (
                      <View key={sc.scale} style={s.tile}><Text style={s.tileLabel}>{cleanScale(sc.scale)}</Text><Text style={s.tileVal}>{sc.score}</Text></View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* SJT */}
            {sjt?.competencies?.length > 0 && (
              <>
                <Text style={s.section}>Career Scenarios{sjt.percentage != null ? ` · ${sjt.percentage}%` : ''}</Text>
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
              A scientifically-informed guide, not a destiny. Your adaptability can grow with practice,
              and a preference for stability or family input is a genuine strength. For guidance only.
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
  fitOf: { fontSize: 18, fontWeight: '700', color: RC.faint },
  prelim: { fontSize: 11.5, fontWeight: '700', color: RC.amber, marginTop: 2 },
  quadChip: { alignSelf: 'flex-start', backgroundColor: RC.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  quadChipText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  quadDesc: { fontSize: 13, color: RC.text, lineHeight: 19, marginTop: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pillarLabel: { fontSize: 13, color: RC.text, fontWeight: '600', flex: 1 },
  pillarVal: { fontSize: 13, fontWeight: '800', color: RC.primary },
  clustersLabel: { fontSize: 12.5, fontWeight: '700', color: RC.text, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cluster: { backgroundColor: '#EEF2FF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  clusterText: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },
  section: { fontSize: 13, fontWeight: '800', color: RC.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 12 },
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1 },
  zone: { fontSize: 12, fontWeight: '800' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '47.5%', backgroundColor: RC.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  tileLabel: { fontSize: 11, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  tileVal: { fontSize: 18, fontWeight: '800', color: RC.primary, marginTop: 4 },
  note: { borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 4 },
  noteTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 4 },
  noteBody: { fontSize: 12.5, lineHeight: 18 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
