import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDishaResult } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const APT_LABELS: Record<string, string> = {
  verbal: 'Verbal', numerical: 'Numerical', logical: 'Logical', spatial: 'Spatial', abstract: 'Abstract',
  closure: 'Closure', clerical: 'Clerical', mechanical: 'Mechanical', memory: 'Memory', creativity: 'Creativity',
};
const OCEAN: [string, string][] = [
  ['O', 'Openness'], ['C', 'Conscientiousness'], ['E', 'Extraversion'], ['A', 'Agreeableness'], ['N', 'Neuroticism'],
];
const RIASEC_LABELS: Record<string, string> = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional',
};
const PILLARS: [string, string][] = [
  ['aptitude', 'Aptitude & Cognitive (35%)'], ['marks', 'Academic Marks (30%)'],
  ['personality', 'Personality (15%)'], ['interests', 'Interests (15%)'], ['values', 'Values (5%)'],
];

const zoneColor = (zone?: string) => {
  switch (zone) {
    case 'Exceptional': case 'Excellent': return '#16A34A';
    case 'Strong': case 'Good': return '#22C55E';
    case 'Average': return '#EAB308';
    case 'Developing': case 'Below-average': return '#F97316';
    default: return '#EF4444';
  }
};
const tPct = (t: number) => Math.max(0, Math.min(100, ((t - 20) / 60) * 100));

export default function DISHA1ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDishaResult(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Career Direction Report" icon="compass-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { aptitude, personality, riasec, workValues, sjt, academic, ccre } = r;
        const topSjt = sjt?.competencies?.[0]?.score || 1;
        return (
          <>
            {/* CCRE fit */}
            {ccre && (
              <Card>
                <Text style={s.label}>Career Fit Index</Text>
                <Text style={s.fitBig}>{ccre.overall ?? 0}<Text style={s.fitOf}> / 100</Text></Text>
                {ccre.preliminary && <Text style={s.prelim}>Preliminary (Test 1 only)</Text>}
                <View style={{ marginTop: 12, gap: 10 }}>
                  {PILLARS.map(([k, lbl]) => (
                    <View key={k}>
                      <View style={s.rowBetween}>
                        <Text style={s.pillarLabel}>{lbl}</Text>
                        <Text style={s.pillarVal}>{ccre.pillars?.[k] ?? 0}</Text>
                      </View>
                      <Bar percent={ccre.pillars?.[k] ?? 0} />
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Academic */}
            {academic?.subjects?.length > 0 && (
              <>
                <Text style={s.section}>Academic Performance</Text>
                <Card>
                  {academic.subjects.map((sub: any) => (
                    <View key={sub.subjectKey} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}>
                        <Text style={s.dimName}>{String(sub.subjectKey).replace(/([A-Z])/g, ' $1')}</Text>
                        <Text style={[s.zone, { color: zoneColor(sub.zone) }]}>{sub.zone} · SSI {sub.ssi}</Text>
                      </View>
                      <Bar percent={sub.ssi} color={zoneColor(sub.zone)} />
                    </View>
                  ))}
                  <Text style={s.meta}>Composite SSI {academic.composite} · Overall average {academic.overallAverage}%</Text>
                </Card>
              </>
            )}

            {/* Aptitude */}
            {aptitude?.dimensions?.length > 0 && (
              <>
                <Text style={s.section}>Aptitude Profile</Text>
                <Card>
                  {aptitude.dimensions.map((d: any) => (
                    <View key={d.dim} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}>
                        <Text style={s.dimName}>{APT_LABELS[d.dim] || d.dim}</Text>
                        <Text style={[s.zone, { color: zoneColor(d.zone) }]}>T {d.tScore} · {d.zone}</Text>
                      </View>
                      <Bar percent={tPct(d.tScore)} color={zoneColor(d.zone)} />
                    </View>
                  ))}
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
                      <View style={s.rowBetween}>
                        <Text style={s.dimName}>{lbl}</Text>
                        <Text style={s.pillarVal}>T {personality[k]?.tScore ?? 50}</Text>
                      </View>
                      <Bar percent={tPct(personality[k]?.tScore ?? 50)} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* RIASEC */}
            {riasec && (
              <>
                <Text style={s.section}>Interests (RIASEC)</Text>
                <Card style={{ alignItems: 'center' }}>
                  <Text style={s.holland}>{riasec.hollandCode}</Text>
                </Card>
                <Card>
                  {(riasec.scores || []).map((sc: any) => (
                    <View key={sc.type} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}>
                        <Text style={s.dimName}>{RIASEC_LABELS[sc.type] || sc.type}</Text>
                        <Text style={s.pillarVal}>{sc.combined}</Text>
                      </View>
                      <Bar percent={sc.combined} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Work values */}
            {workValues?.topValues?.length > 0 && (
              <>
                <Text style={s.section}>Work Values</Text>
                <Card>
                  <View style={s.chips}>
                    {workValues.topValues.map((v: string, i: number) => (
                      <View key={v} style={[s.valChip, i === 0 && s.valChipTop]}>
                        <Text style={[s.valChipText, i === 0 && s.valChipTextTop]}>{i + 1}. {v}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
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
              A scientifically-informed guide, not a destiny. For guidance only — never for admissions,
              scholarship, or employment decisions.
            </Text>
          </>
        );
      }}
    </ResultShell>
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
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1, textTransform: 'capitalize' },
  zone: { fontSize: 12, fontWeight: '800' },
  meta: { fontSize: 12.5, color: RC.gray, marginTop: 6, fontWeight: '600' },
  holland: { fontSize: 34, fontWeight: '800', color: RC.primary, letterSpacing: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valChip: { backgroundColor: RC.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  valChipTop: { backgroundColor: '#E4F4FB' },
  valChipText: { fontSize: 12.5, fontWeight: '700', color: RC.gray },
  valChipTextTop: { color: RC.primary },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
