import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDisha4Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const SUBSCALE_LABELS: Record<string, string> = {
  Resilience: 'Resilience', Grit: 'Grit', GrowthMindset: 'Growth Mindset', Empathy: 'Empathy',
  CollEmpathy: 'Family / Collectivist Empathy', SocialSkill: 'Social Skills', SevaOrient: 'Service (Seva) Orientation',
  UrbanRural: 'Urban–Rural Comfort', DiversityOpen: 'Diversity Openness', InterGen: 'Inter-generational',
  LangAdapt: 'Language Adaptability', SocialFlex: 'Social Flexibility', TeamAdapt: 'Team Adaptability', GeoFlex: 'Geographic Flexibility',
};
const bandColor = (b?: string) => (b === 'Exceptional' ? '#16A34A' : b === 'Strong' ? '#22C55E' : b === 'Average' ? '#EAB308' : b === 'Developing' ? '#F97316' : '#EF4444');
const tColor = (t: number) => bandColor(t >= 65 ? 'Exceptional' : t >= 55 ? 'Strong' : t >= 45 ? 'Average' : t >= 35 ? 'Developing' : 'Critical');
const tPct = (t: number) => Math.max(0, Math.min(100, ((t - 20) / 60) * 100));

export default function DISHA4ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDisha4Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Emotional Intelligence Profile" icon="heart-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { selfAwareness, selfRegulation, resilience, empathy, adaptability, sjt, validity, overall, flags, summary } = r;
        const f = flags || {};
        const topSjt = sjt?.competencies?.[0]?.score || 1;

        const eiBars = [
          { dim: 'Self-Awareness', t: selfAwareness?.tScore ?? 50 },
          { dim: 'Self-Regulation', t: selfRegulation?.tScore ?? 50 },
          { dim: 'Resilience', t: resilience?.resilienceIndex ?? 50 },
          { dim: 'Empathy', t: empathy?.empathyScore ?? 50 },
          { dim: 'Adaptability', t: adaptability?.adaptabilityT ?? 50 },
        ];
        const resBars = [
          { scale: 'Resilience', t: resilience?.resilience?.tScore ?? 50 },
          { scale: 'Grit', t: resilience?.grit?.tScore ?? 50 },
          { scale: 'Growth Mindset', t: resilience?.growthMindset?.tScore ?? 50 },
        ];
        const empBars = ['empathy', 'collEmpathy', 'socialSkill', 'sevaOrient']
          .map((k) => empathy?.[k]).filter(Boolean)
          .map((sc: any) => ({ scale: SUBSCALE_LABELS[sc.scale] || sc.scale, t: sc.tScore }));
        const adaptBars = (adaptability?.subScales || []).map((sc: any) => ({ scale: SUBSCALE_LABELS[sc.scale] || sc.scale, t: sc.tScore }));

        return (
          <>
            {/* wellbeing banners */}
            {(f.crisisSupport || f.crisisSelfCheck) && (
              <Note tone="red" title="A wellbeing check-in comes first"
                body="Some responses suggest this may be a difficult period — support genuinely helps. Please consider talking to your counsellor or a trusted adult, or reaching out to iCall (9152987821), Vandrevala Foundation (1860-2662-345) or AASRA (9820466627). Career planning can wait — you matter more." />
            )}
            {f.burnoutRisk && !f.crisisSupport && (
              <Note tone="amber" title="Pace yourself"
                body="Your responses suggest you may be running low on emotional energy. Rest and self-care are part of performing well; your plan includes stress-management strategies." />
            )}
            {validity && validity.clean === false && (
              <Note tone="blue" title="A note on your responses"
                body="A few responses suggest an idealised self-presentation. This does not invalidate your report; your counsellor may explore some areas in more depth." />
            )}

            {/* EQ overview */}
            <Card>
              <Text style={s.label}>EQ T-score</Text>
              <Text style={[s.fitBig, { color: bandColor(overall?.band) }]}>{overall?.tScore ?? '—'}</Text>
              {overall?.band && <Text style={[s.band, { color: bandColor(overall.band) }]}>{overall.band}</Text>}
              <View style={{ marginTop: 14, gap: 12 }}>
                {eiBars.map((b: any) => (
                  <View key={b.dim}>
                    <View style={s.rowBetween}><Text style={s.dimName}>{b.dim}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                    <Bar percent={tPct(b.t)} color={tColor(b.t)} />
                  </View>
                ))}
              </View>
            </Card>

            {/* Self-awareness & regulation */}
            <Text style={s.section}>Self-Awareness & Regulation</Text>
            <View style={s.dual}>
              <StatTile label="Self-Awareness" value={selfAwareness?.tScore} band={selfAwareness?.band} />
              <StatTile label="Self-Regulation" value={selfRegulation?.tScore} band={selfRegulation?.band} />
            </View>
            {f.impulsivityRisk && <Note tone="amber" title="Impulse management" body="Your responses suggest emotions can run high under pressure — your plan includes practical impulse-management strategies (a real strength to build for high-stakes roles)." />}

            {/* Resilience */}
            {resilience && (
              <>
                <Text style={s.section}>Resilience, Grit & Growth Mindset{resilience.resilienceIndex != null ? ` · Index ${resilience.resilienceIndex}` : ''}</Text>
                <Card>
                  {resBars.map((b: any) => (
                    <View key={b.scale} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.scale}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                      <Bar percent={tPct(b.t)} color={tColor(b.t)} />
                    </View>
                  ))}
                  {resilience.fixedMindsetFlag && <Note tone="blue" title="Developing a growth mindset" body="Some responses lean toward seeing ability as fixed. A growth mindset is one of the most developable, high-impact mindsets for exams and careers — your plan includes resources for this." />}
                  {resilience.combinedCritical && <Note tone="amber" title="Highest-priority skill to build" body="Your resilience is currently below average — one of the most developable emotional skills, not a fixed limit. Your plan includes evidence-based strategies over the next 3 months." />}
                </Card>
              </>
            )}

            {/* Empathy */}
            {empBars.length > 0 && (
              <>
                <Text style={s.section}>Empathy & Interpersonal Skills</Text>
                <Card>
                  {empBars.map((b: any) => (
                    <View key={b.scale} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.scale}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                      <Bar percent={tPct(b.t)} />
                    </View>
                  ))}
                  {f.empathicOverInvolvement && <Note tone="blue" title="Your deep empathy is a strength" body="A foundation for careers in medicine, counselling, teaching and social work. The one skill worth building is protecting your own energy while serving others (boundary skills)." />}
                </Card>
              </>
            )}

            {/* Adaptability */}
            {adaptBars.length > 0 && (
              <>
                <Text style={s.section}>Social & Cultural Adaptability</Text>
                <Card>
                  {adaptBars.map((b: any) => (
                    <View key={b.scale} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.scale}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                      <Bar percent={tPct(b.t)} color={RC.accent} />
                    </View>
                  ))}
                  {adaptability?.lowGeoFilter && <Note tone="blue" title="Geographic preferences and career fit" body="You lean toward staying closer to home — a completely valid value. Your recommendations will prioritise careers with excellent options within that preference." />}
                </Card>
              </>
            )}

            {/* SJT */}
            {sjt?.competencies?.length > 0 && (
              <>
                <Text style={s.section}>Emotional Scenarios{sjt.percentage != null ? ` · ${sjt.percentage}%` : ''}</Text>
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

            {/* Wellbeing resources */}
            <View style={s.wellCard}>
              <Text style={s.wellTitle}>Wellbeing resources — for everyone</Text>
              <Text style={s.wellText}>Reaching out for support is a sign of emotional intelligence, not weakness.</Text>
              <View style={s.wellChips}>
                <View style={s.wellChip}><Text style={s.wellChipText}>iCall · 9152987821</Text></View>
                <View style={s.wellChip}><Text style={s.wellChipText}>Vandrevala · 1860-2662-345</Text></View>
                <View style={s.wellChip}><Text style={s.wellChipText}>AASRA · 9820466627</Text></View>
              </View>
            </View>

            <Text style={s.disclaimer}>
              This report measures functional emotional intelligence for career guidance — it does not
              diagnose any mental-health condition. Every emotional skill here can be developed.
            </Text>
          </>
        );
      }}
    </ResultShell>
  );
}

function StatTile({ label, value, band }: { label: string; value?: number; band?: string }) {
  return (
    <View style={s.statTile}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statVal, { color: bandColor(band) }]}>{value ?? '—'}</Text>
      {!!band && <Text style={[s.statBand, { color: bandColor(band) }]}>{band}</Text>}
    </View>
  );
}

function Note({ tone, title, body }: { tone: 'blue' | 'amber' | 'green' | 'red'; title: string; body: string }) {
  const bg = tone === 'blue' ? '#E4F4FB' : tone === 'amber' ? '#FEF3C7' : tone === 'red' ? '#FEE2E2' : '#DCFCE7';
  const fg = tone === 'blue' ? '#075985' : tone === 'amber' ? '#92400E' : tone === 'red' ? '#991B1B' : '#166534';
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1 },
  pillarVal: { fontSize: 13, fontWeight: '800', color: RC.primary },
  section: { fontSize: 13, fontWeight: '800', color: RC.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 12 },
  dual: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  statTile: { flex: 1, backgroundColor: RC.white, borderRadius: 16, borderWidth: 1, borderColor: RC.border, padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 11.5, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  statVal: { fontSize: 30, fontWeight: '800', marginTop: 6 },
  statBand: { fontSize: 11.5, fontWeight: '800', marginTop: 2 },
  wellCard: { backgroundColor: '#ECFDF5', borderRadius: 16, borderWidth: 1, borderColor: '#BBF7D0', padding: 16, marginTop: 8, marginBottom: 8 },
  wellTitle: { fontSize: 14.5, fontWeight: '800', color: '#166534' },
  wellText: { fontSize: 13, color: '#166534', marginTop: 4, lineHeight: 19 },
  wellChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  wellChip: { backgroundColor: '#DCFCE7', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  wellChipText: { fontSize: 12, fontWeight: '700', color: '#15803D' },
  note: { borderRadius: 14, padding: 14, marginBottom: 10 },
  noteTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 4 },
  noteBody: { fontSize: 12.5, lineHeight: 18 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
