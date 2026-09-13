import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDishaC12Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const RIASEC_LABELS: Record<string, string> = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
const OCEAN: [string, string][] = [['O', 'Openness'], ['C', 'Conscientiousness'], ['E', 'Extraversion'], ['A', 'Agreeableness'], ['N', 'Neuroticism']];
const VALUE_LABELS: Record<string, string> = {
  Security: 'Security', Mastery: 'Mastery', Autonomy: 'Autonomy', Altruism: 'Altruism', WLB: 'Work-Life Balance',
  Intellectual: 'Intellectual Challenge', Prestige: 'Prestige', FamilyDuty: 'Family Duty', Societal: 'Nation-building',
  Innovation: 'Innovation', Voice: 'Voice / Influence', Stability: 'Stability',
};
const MOTIVATION_LABELS: Record<string, string> = {
  Power: 'Power / Impact', Achievement: 'Achievement', Affiliation: 'Affiliation', Mastery: 'Mastery / Learning',
  SocietalImpact: 'Societal Impact', Intrinsic: 'Intrinsic', Extrinsic: 'Extrinsic (family/social expectation)',
};
const bandColor = (b?: string) => (b === 'High' ? '#16A34A' : b === 'Moderate' ? '#EAB308' : '#EF4444');
const tPct = (t: number) => Math.max(0, Math.min(100, ((t - 20) / 60) * 100));

export default function DISHAC12ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDishaC12Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Your Career Direction" icon="flag-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const {
          academic, aptitude, personality, interests, valuesMotivations, context,
          scenarios, recommendations, examProbabilities, collegePathways, fiveYearVision, summary,
        } = r;

        const recTop12 = (recommendations || []).slice(0, 12);
        const topRecScore = recTop12.reduce((m: number, x: any) => Math.max(m, x.score), 0) || 100;
        const valueBars = (valuesMotivations?.valueScores || []).filter((v: any) => v.pct != null).sort((a: any, b: any) => b.pct - a.pct);
        const motivBars = (valuesMotivations?.motivationScores || []).filter((m: any) => m.pct != null);

        return (
          <>
            {summary?.explorationNeeded && (
              <Note tone="blue" title="Your top career choices are closely matched — genuinely useful" body="Several careers fit you well at this stage. Use this list to explore rather than rush a single choice — talk it through with your counsellor." />
            )}

            {/* Top recommendation */}
            <Card>
              <Text style={s.label}>Best Fit</Text>
              <Text style={s.fitBig}>{summary?.topScore ?? 0}<Text style={s.fitOf}>%</Text></Text>
              {!!summary?.topCareerTitle && <Text style={s.topCareer}>Top recommendation: {summary.topCareerTitle}</Text>}
              <Text style={s.meta}>These probabilities are a guide based on your appeal ratings, interests, values, life-design and context — not a final verdict.</Text>
            </Card>

            {/* Top 12 careers */}
            {recTop12.length > 0 && (
              <>
                <Text style={s.section}>Top Career Recommendations</Text>
                <Card>
                  {recTop12.map((rec: any, i: number) => (
                    <View key={rec.careerId || rec.title} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName} numberOfLines={2}>{rec.title}</Text><Text style={s.pillarVal}>{rec.score}</Text></View>
                      <Bar percent={Math.min(100, (rec.score / topRecScore) * 100)} color={i === 0 ? RC.accent : RC.primary} />
                    </View>
                  ))}
                  <View style={{ marginTop: 10, gap: 10 }}>
                    {(recommendations || []).slice(0, 3).map((rec: any) => (
                      <View key={`${rec.careerId || rec.title}-detail`} style={s.recTile}>
                        <View style={s.rowBetween}>
                          <Text style={s.recTitle}>{rec.title}</Text>
                          {!!rec.sector && <View style={s.sectorTag}><Text style={s.sectorTagText}>{rec.sector}</Text></View>}
                        </View>
                        {rec.modifiers?.length > 0 && <Text style={s.modifiers}>{rec.modifiers.join(' · ')}</Text>}
                        {!!rec.readinessFlag && <Text style={s.readiness}>{rec.readinessFlag}</Text>}
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* Academic trajectory */}
            {academic?.years?.length > 0 && (
              <>
                <Text style={s.section}>Academic Profile</Text>
                <Card>
                  <View style={s.tiles}>
                    {academic.years.map((y: any) => (
                      <View key={y.label} style={s.tile}><Text style={s.tileLabel}>{y.label}</Text><Text style={s.tileVal}>{y.pct}%</Text></View>
                    ))}
                    <View style={s.tile}><Text style={s.tileLabel}>Trend</Text><Text style={s.tileValSm}>{academic.trendLabel}</Text></View>
                  </View>
                  {academic.class12Predicted && <Text style={s.meta}>Some Class 12 marks are predicted estimates and will update as actual results come in.</Text>}
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
                </Card>
              </>
            )}

            {/* Personality */}
            {personality && (
              <>
                <Text style={s.section}>Personality (OCEAN)</Text>
                <Card>
                  {OCEAN.map(([k, lbl]) => (
                    <View key={k} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{lbl}</Text><Text style={s.pillarVal}>T {personality[k]?.tScore ?? 50}</Text></View>
                      <Bar percent={tPct(personality[k]?.tScore ?? 50)} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* RIASEC */}
            {interests?.scores?.length > 0 && (
              <>
                <Text style={s.section}>Interest Profile (RIASEC){interests.hollandCode ? ` · ${interests.hollandCode}` : ''}</Text>
                <Card style={{ alignItems: 'center' }}>
                  <Text style={s.holland}>{interests.hollandCode}</Text>
                </Card>
                <Card>
                  {interests.scores.map((sc: any) => (
                    <View key={sc.type} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{RIASEC_LABELS[sc.type] || sc.type}</Text><Text style={s.pillarVal}>{sc.combined}</Text></View>
                      <Bar percent={sc.combined} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Values & motivations */}
            {(valueBars.length > 0 || motivBars.length > 0) && (
              <>
                <Text style={s.section}>Values & Motivations</Text>
                {valueBars.length > 0 && (
                  <Card>
                    <Text style={s.cardHead}>Top Values</Text>
                    <View style={s.chips}>
                      {valueBars.slice(0, 5).map((v: any, i: number) => (
                        <View key={v.scale} style={[s.valChip, i === 0 && s.valChipTop]}>
                          <Text style={[s.valChipText, i === 0 && s.valChipTextTop]}>{VALUE_LABELS[v.scale] || v.scale} ({v.pct})</Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                )}
                {motivBars.length > 0 && (
                  <Card>
                    <Text style={s.cardHead}>Motivations</Text>
                    <View style={s.chips}>
                      {motivBars.map((m: any) => (
                        <View key={m.scale} style={s.tag}><Text style={s.tagText}>{MOTIVATION_LABELS[m.scale] || m.scale} ({m.pct})</Text></View>
                      ))}
                    </View>
                    {valuesMotivations.intrinsicExtrinsicGap != null && (
                      <View style={{ marginTop: 10 }}>
                        <Note tone="blue" title="A gap worth noticing, not judging" body={
                          valuesMotivations.intrinsicExtrinsicGap >= 15
                            ? 'Your career thinking is strongly driven by your own genuine interest — a great sign of sustainable motivation.'
                            : valuesMotivations.intrinsicExtrinsicGap <= -15
                            ? 'Family and community expectations appear to be a major driver of your career thinking — common and valid in Indian families. Worth reflecting on which parts of your plan are genuinely yours.'
                            : 'Your career thinking blends genuine personal interest with family/community expectations in a fairly balanced way.'
                        } />
                      </View>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Entrance exam probability */}
            {examProbabilities?.length > 0 && (
              <>
                <Text style={s.section}>Entrance Exam Probability</Text>
                <Card>
                  <View style={s.tiles}>
                    {examProbabilities.map((e: any) => (
                      <View key={e.exam} style={s.examTile}>
                        <Text style={s.tileLabel}>{e.exam}</Text>
                        <Text style={s.tileValSm}>{e.probability != null ? `${e.probability}%` : e.rank != null ? `Rank ${e.rank}` : `${e.score}`}</Text>
                        <Text style={[s.examBand, { color: bandColor(e.band) }]}>{e.band}</Text>
                        <Text style={s.examSource}>{e.source === 'actual' ? 'Your actual score' : 'Estimate'}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* College pathways */}
            {collegePathways?.length > 0 && (
              <>
                <Text style={s.section}>College Pathway Categories</Text>
                <Card>
                  <View style={s.chips}>
                    {collegePathways.map((c: string) => <View key={c} style={s.tag}><Text style={s.tagText}>{c}</Text></View>)}
                  </View>
                </Card>
              </>
            )}

            {/* Context */}
            {context && (context.highParentalPressure || context.highFinancialUrgency || context.geographicallyConstrained) && (
              <>
                <Text style={s.section}>Your Context</Text>
                {context.highParentalPressure && <Note tone="blue" title="Family-Aligned Path" body="Your family has a strong career preference. Your recommendations already reflect your genuine interests, aptitude and values — use this report for a calm, data-backed conversation at home." />}
                {context.highFinancialUrgency && <Note tone="blue" title="Career timeline" body="Earning sooner matters to your family. Careers flagged with a quicker-income note may be worth prioritising, alongside longer-gestation paths via a staged plan." />}
                {context.geographicallyConstrained && <Note tone="blue" title="Geographic preference" body="You need to stay in or near your home city/state. Your college pathway categories already account for within-state and online options." />}
              </>
            )}

            {/* 5-year vision */}
            {fiveYearVision?.topCareerTitle && (
              <>
                <Text style={s.section}>Your 5-Year Vision</Text>
                <Card>
                  <Text style={s.body}>
                    In 5 years, you could be working as a <Text style={s.bold}>{fiveYearVision.topCareerTitle}</Text>
                    {fiveYearVision.orgType ? <>, in a setting like <Text style={s.bold}>{fiveYearVision.orgType.split(' — ')[0].toLowerCase()}</Text></> : ''}
                    {fiveYearVision.geoExpectation ? <>, based in <Text style={s.bold}>{fiveYearVision.geoExpectation.toLowerCase()}</Text></> : ''}.
                    {' '}What matters most to you along the way is <Text style={s.bold}>{VALUE_LABELS[fiveYearVision.topValue] || fiveYearVision.topValue}</Text>,
                    driven by <Text style={s.bold}>{MOTIVATION_LABELS[fiveYearVision.topMotivation] || fiveYearVision.topMotivation}</Text>.
                    {fiveYearVision.riskOriented ? " You're genuinely open to a higher-risk, higher-learning path if the opportunity is right." : ''}
                  </Text>
                </Card>
              </>
            )}

            {/* Scenarios */}
            {scenarios?.results?.length > 0 && (
              <>
                <Text style={s.section}>Career Scenarios</Text>
                <Card>
                  <Text style={s.body}>You aligned with the most balanced response in {scenarios.alignedCount} of {scenarios.totalAnswered} scenarios.</Text>
                  <View style={[s.chips, { marginTop: 10 }]}>
                    {scenarios.results.filter((r2: any) => r2.picked).map((r2: any) => (
                      <View key={r2.id} style={[s.scChip, r2.aligned && s.scChipAligned]}>
                        <Text style={[s.scChipText, r2.aligned && s.scChipTextAligned]}>{r2.title}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            <Text style={s.disclaimer}>
              A scientifically-informed guide, not a final verdict. Your effort, curiosity and choices
              always outweigh any single test score. For guidance only.
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
  topCareer: { fontSize: 15, fontWeight: '800', color: RC.text, marginTop: 10 },
  meta: { fontSize: 12, color: RC.gray, marginTop: 10, lineHeight: 17 },
  section: { fontSize: 13, fontWeight: '800', color: RC.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 },
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1 },
  pillarVal: { fontSize: 13, fontWeight: '800', color: RC.primary },
  cardHead: { fontSize: 14.5, fontWeight: '800', color: RC.text, marginBottom: 12 },
  recTile: { backgroundColor: RC.surface, borderRadius: 12, padding: 12 },
  recTitle: { fontSize: 14, fontWeight: '800', color: RC.text, flex: 1 },
  sectorTag: { backgroundColor: RC.white, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  sectorTagText: { fontSize: 10.5, fontWeight: '700', color: RC.gray },
  modifiers: { fontSize: 12, color: '#16A34A', marginTop: 6, lineHeight: 17 },
  readiness: { fontSize: 12, color: '#F97316', marginTop: 4, lineHeight: 17 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '47.5%', backgroundColor: RC.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  examTile: { width: '31%', backgroundColor: RC.surface, borderRadius: 12, padding: 10, alignItems: 'center' },
  tileLabel: { fontSize: 10.5, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  tileVal: { fontSize: 18, fontWeight: '800', color: RC.primary, marginTop: 4 },
  tileValSm: { fontSize: 14, fontWeight: '800', color: RC.primary, marginTop: 4, textAlign: 'center' },
  examBand: { fontSize: 10.5, fontWeight: '800', marginTop: 3 },
  examSource: { fontSize: 9.5, color: RC.faint, marginTop: 2 },
  holland: { fontSize: 34, fontWeight: '800', color: RC.primary, letterSpacing: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valChip: { backgroundColor: RC.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  valChipTop: { backgroundColor: '#E4F4FB' },
  valChipText: { fontSize: 12.5, fontWeight: '700', color: RC.gray },
  valChipTextTop: { color: RC.primary },
  tag: { backgroundColor: RC.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 12, fontWeight: '700', color: RC.text },
  body: { fontSize: 14, color: RC.text, lineHeight: 22 },
  bold: { fontWeight: '800', color: RC.primary },
  scChip: { backgroundColor: RC.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  scChipAligned: { backgroundColor: '#DCFCE7' },
  scChipText: { fontSize: 12, fontWeight: '700', color: RC.gray },
  scChipTextAligned: { color: '#166534' },
  note: { borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 6 },
  noteTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 4 },
  noteBody: { fontSize: 12.5, lineHeight: 18 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
