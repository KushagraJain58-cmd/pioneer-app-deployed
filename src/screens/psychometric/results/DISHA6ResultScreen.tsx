import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDisha6Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const bandColor = (b?: string) => (b === 'Exceptional' ? '#16A34A' : b === 'Strong' ? '#22C55E' : b === 'Moderate' ? '#EAB308' : b === 'Developing' ? '#F97316' : '#EF4444');
const tPct = (t: number) => Math.max(0, Math.min(100, ((t - 20) / 60) * 100));

const ERI_DESC: Record<string, string> = {
  'Founder-Ready': 'The full profile of an entrepreneurially-ready individual — strong opportunity recognition, risk tolerance, execution drive and business resilience. Startup pathways are highlighted in your recommendations.',
  'Intrapreneur Profile': 'Strong innovation and execution abilities, but you prefer building within a structured organisation. Innovation teams, R&D, product management and corporate ventures are your ideal expression of entrepreneurial energy.',
  'Idea-Rich Profile': 'Excellent opportunity-sensing and ideation, but execution/drive suggests you may struggle to bring ideas to fruition alone. Build execution through small projects; consider a co-founder or team entrepreneurship.',
  'Entrepreneurial Curious': 'Genuine interest in entrepreneurship but not yet fully ready. Your plan includes experience-building steps: startup internships, hackathons, a micro-project.',
  'Stability Preferrer': 'Entrepreneurship is not your primary path right now — completely valid. Your profile is strong for building outstanding careers within established organisations; intrapreneurship channels creative energy with security.',
};

export default function DISHA6ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDisha6Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Creative Quotient Profile" icon="bulb-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { divergentTasks, creativeSelfReport, innovationMindset, entrepreneurial, problemSolvingStyle, designSensitivity, sjt, validity, cqProfile } = r;
        const topSjt = sjt?.competencies?.[0]?.score || 1;
        const topStyle = problemSolvingStyle?.styles?.reduce((m: number, s: any) => Math.max(m, s.pct), 0) || 100;

        const ttct = divergentTasks?.dimensions
          ? [
              { dim: 'Fluency', t: divergentTasks.dimensions.fluencyT },
              { dim: 'Flexibility', t: divergentTasks.dimensions.flexibilityT },
              { dim: 'Originality', t: divergentTasks.dimensions.originalityT },
              { dim: 'Elaboration', t: divergentTasks.dimensions.elaborationT },
            ]
          : [];
        const eriBars = entrepreneurial?.subScales
          ? Object.entries(entrepreneurial.subScales).map(([k, v]: any) => ({ scale: k, t: v.tScore }))
          : [];

        return (
          <>
            {divergentTasks?.engagementFlag && <Note tone="blue" title="A note on your open-ended responses" body="Idea generation was limited across most tasks — this may reflect exam-culture inhibition or the format, not low creativity. Your counsellor may ask about something creative you've done outside school." />}
            {creativeSelfReport?.highSuppressionFlag && <Note tone="amber" title="Your creativity may be stronger than your scores suggest" body="Exam culture systematically discourages creative expression for many Indian students. Your divergent-task performance is a more direct measure of your potential than how confident you feel." />}
            {validity && validity.clean === false && <Note tone="blue" title="A note on your responses" body="A few responses suggest an idealised self-presentation. This does not invalidate your report; your counsellor may explore some areas in more depth." />}

            {/* CQ overview */}
            <Card>
              <Text style={s.label}>Creative Quotient</Text>
              <Text style={[s.fitBig, { color: bandColor(cqProfile?.band) }]}>{cqProfile?.compositeT ?? '—'}</Text>
              {cqProfile?.band && <Text style={[s.band, { color: bandColor(cqProfile.band) }]}>{cqProfile.band}</Text>}
              {cqProfile?.suppressionAdjustmentApplied && <Text style={s.adj}>Adjusted for creativity suppression</Text>}
              {ttct.length > 0 && (
                <View style={{ marginTop: 14, gap: 12 }}>
                  {ttct.map((b: any) => (
                    <View key={b.dim}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.dim}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                      <Bar percent={tPct(b.t)} color={RC.accent} />
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {/* Entrepreneurial Readiness */}
            {eriBars.length > 0 && (
              <>
                <Text style={s.section}>Entrepreneurial Readiness{entrepreneurial.eri != null ? ` · ERI ${entrepreneurial.eri}` : ''}</Text>
                <Card>
                  {eriBars.map((b: any) => (
                    <View key={b.scale} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.scale}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                      <Bar percent={tPct(b.t)} />
                    </View>
                  ))}
                  {!!entrepreneurial.profile && <Note tone="blue" title={entrepreneurial.profile} body={ERI_DESC[entrepreneurial.profile] || ''} />}
                </Card>
              </>
            )}

            {/* Problem-solving style */}
            {problemSolvingStyle?.styles?.length > 0 && (
              <>
                <Text style={s.section}>Problem-Solving Style{problemSolvingStyle.dominant ? ` · ${problemSolvingStyle.dominant}` : ''}{problemSolvingStyle.secondary ? ` / ${problemSolvingStyle.secondary}` : ''}</Text>
                <Card>
                  {problemSolvingStyle.styles.map((st2: any) => (
                    <View key={st2.style} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{st2.style}</Text><Text style={s.pillarVal}>{st2.pct}</Text></View>
                      <Bar percent={Math.min(100, (st2.pct / topStyle) * 100)} color={st2.style === problemSolvingStyle.dominant ? RC.accent : RC.primary} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Innovation mindset */}
            {innovationMindset?.scales && (
              <>
                <Text style={s.section}>Innovation Mindset</Text>
                <Card>
                  <View style={s.tiles}>
                    {Object.entries(innovationMindset.scales).map(([k, v]: any) => (
                      <View key={k} style={s.tile}><Text style={s.tileLabel}>{k}</Text><Text style={s.tileVal}>{v}</Text></View>
                    ))}
                  </View>
                  {innovationMindset.styleTally && Object.keys(innovationMindset.styleTally).length > 0 && (
                    <View style={[s.chips, { marginTop: 12 }]}>
                      {Object.entries(innovationMindset.styleTally).map(([k, v]: any) => (
                        <View key={k} style={s.tallyChip}><Text style={s.tallyText}>{k} × {v}</Text></View>
                      ))}
                    </View>
                  )}
                </Card>
              </>
            )}

            {/* Design sensitivity */}
            {designSensitivity?.subScales && (
              <>
                <Text style={s.section}>Design Sensitivity{designSensitivity.designSensitivityT != null ? ` · ${designSensitivity.designSensitivityT}` : ''}</Text>
                <Card>
                  <View style={s.tiles}>
                    {Object.entries(designSensitivity.subScales).map(([k, v]: any) => (
                      <View key={k} style={s.tile}><Text style={s.tileLabel}>{k}</Text><Text style={s.tileVal}>{v}</Text></View>
                    ))}
                  </View>
                  {designSensitivity.designClusterUnlocked && <Note tone="green" title="Design Career Cluster unlocked" body="NID, NIFT and MIT-ID entrance pathways, UI/UX design, architecture, industrial design and fashion design are strongly featured in your recommendations." />}
                </Card>
              </>
            )}

            {/* Creative self-report */}
            {creativeSelfReport && (
              <>
                <Text style={s.section}>Creative Self-Report</Text>
                <Card>
                  <View style={s.tiles}>
                    {['CreativeIdentity', 'CreativeHistory', 'CreativeConfidence', 'Aesthetic', 'DivergentDisp'].map((k) => (
                      <View key={k} style={s.tile}><Text style={s.tileLabel}>{k}</Text><Text style={s.tileVal}>{creativeSelfReport[k]?.pct ?? 0}</Text></View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* SJT */}
            {sjt?.competencies?.length > 0 && (
              <>
                <Text style={s.section}>Creative Scenarios{sjt.percentage != null ? ` · ${sjt.percentage}%` : ''}</Text>
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
              A scientifically-informed guide, not a destiny. Creativity, innovation and entrepreneurial
              skill can all be developed with practice. For guidance only.
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
  fitBig: { fontSize: 44, fontWeight: '800' },
  band: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  adj: { fontSize: 11, fontWeight: '700', color: RC.amber, marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pillarVal: { fontSize: 13, fontWeight: '800', color: RC.primary },
  section: { fontSize: 13, fontWeight: '800', color: RC.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 12 },
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '31%', backgroundColor: RC.surface, borderRadius: 12, padding: 10, alignItems: 'center' },
  tileLabel: { fontSize: 10.5, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  tileVal: { fontSize: 17, fontWeight: '800', color: RC.primary, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tallyChip: { backgroundColor: RC.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  tallyText: { fontSize: 12, fontWeight: '700', color: RC.text },
  note: { borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 6 },
  noteTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 4 },
  noteBody: { fontSize: 12.5, lineHeight: 18 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
