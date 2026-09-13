import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDisha2Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const RIASEC_LABELS: Record<string, string> = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional',
};
const VALUE_LABELS: Record<string, string> = {
  Security: 'Security', Prestige: 'Prestige', FinGrowth: 'Financial Growth', WLB: 'Work-Life Balance',
  Altruism: 'Altruism', Autonomy: 'Autonomy', Innovation: 'Innovation', Intellectual: 'Intellectual',
  FamilyDuty: 'Family Duty', SocietalContribution: 'Societal Contribution', Stability: 'Stability',
};
const MOTIV_LABELS: Record<string, string> = {
  Achievement: 'Achievement', Power: 'Power / Influence', Affiliation: 'Affiliation', Mastery: 'Mastery / Learning',
  SocietalImpact: 'Societal Impact', Intrinsic: 'Intrinsic', Extrinsic: 'Extrinsic',
};
const ENV_LABELS: Record<string, string> = {
  GovtSector: 'Government sector', PrivateSector: 'Private sector', Startup: 'Startup / entrepreneurial',
  FamilyBusiness: 'Family business', SocialSector: 'Social sector / NGO', Independent: 'Independent professional',
  OfficeWork: 'Office-based work', FieldWork: 'Field work', Metro: 'Metro city', Tier2Rural: 'Tier-2 / rural',
};
const PILLARS: [string, string][] = [
  ['interests', 'Interest clarity (45%)'], ['values', 'Values clarity (30%)'], ['motivation', 'Intrinsic motivation (25%)'],
];

export default function DISHA2ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDisha2Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Interests, Values & Motivations" icon="sparkles-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { riasec, workValues, motivations, environment, sjt, summary } = r;
        const topSjt = sjt?.competencies?.[0]?.score || 1;
        const filter = environment?.filter || {};
        const envTags = [filter.sector, filter.ownership, filter.impactMode, filter.setting, filter.location].filter(Boolean);
        return (
          <>
            {summary && (
              <Card>
                <Text style={s.label}>Self-Fit Index</Text>
                <Text style={s.fitBig}>{summary.overall ?? 0}<Text style={s.fitOf}> / 100</Text></Text>
                {summary.preliminary && <Text style={s.prelim}>Preliminary (Test 2 only)</Text>}
                <View style={{ marginTop: 12, gap: 10 }}>
                  {PILLARS.map(([k, lbl]) => (
                    <View key={k}>
                      <View style={s.rowBetween}>
                        <Text style={s.pillarLabel}>{lbl}</Text>
                        <Text style={s.pillarVal}>{summary.pillars?.[k] ?? 0}</Text>
                      </View>
                      <Bar percent={summary.pillars?.[k] ?? 0} />
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {riasec && (
              <>
                <Text style={s.section}>Interests (RIASEC)</Text>
                <Card style={{ alignItems: 'center' }}>
                  <Text style={s.holland}>{riasec.hollandCode}</Text>
                  {!!riasec.consistency && (
                    <Text style={s.meta}>{riasec.consistency === 'consistent' ? 'Consistent profile' : 'Differentiated profile'}</Text>
                  )}
                </Card>
                <Card>
                  {(riasec.scores || []).map((sc: any) => (
                    <View key={sc.type} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}>
                        <Text style={s.dimName}>{RIASEC_LABELS[sc.type] || sc.type}</Text>
                        <Text style={s.pillarVal}>{sc.combined}{sc.zone ? ` · ${sc.zone}` : ''}</Text>
                      </View>
                      <Bar percent={sc.combined} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {workValues?.ranked?.length > 0 && (
              <>
                <Text style={s.section}>Work Values</Text>
                <Card>
                  <View style={s.chips}>
                    {(workValues.topValues || []).map((v: string, i: number) => (
                      <View key={v} style={[s.valChip, i === 0 && s.valChipTop]}>
                        <Text style={[s.valChipText, i === 0 && s.valChipTextTop]}>{i + 1}. {VALUE_LABELS[v] || v}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ marginTop: 14, gap: 12 }}>
                    {workValues.ranked.map((v: any) => (
                      <View key={v.scale}>
                        <View style={s.rowBetween}>
                          <Text style={s.dimName}>{VALUE_LABELS[v.scale] || v.scale}</Text>
                          <Text style={s.pillarVal}>{v.score}</Text>
                        </View>
                        <Bar percent={v.score} />
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {motivations?.motivationScores?.length > 0 && (
              <>
                <Text style={s.section}>Career Motivations</Text>
                <Card>
                  {motivations.motivationScores.map((m: any) => (
                    <View key={m.scale} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}>
                        <Text style={s.dimName}>{MOTIV_LABELS[m.scale] || m.scale}</Text>
                        <Text style={s.pillarVal}>{m.score}</Text>
                      </View>
                      <Bar percent={m.score} />
                    </View>
                  ))}
                  <View style={s.dual}>
                    <View style={s.dualBox}><Text style={s.dualLabel}>Intrinsic</Text><Text style={s.dualVal}>{motivations.intrinsic}</Text></View>
                    <View style={s.dualBox}><Text style={s.dualLabel}>Extrinsic</Text><Text style={s.dualVal}>{motivations.extrinsic}</Text></View>
                  </View>
                </Card>
              </>
            )}

            {environment?.filter && (
              <>
                <Text style={s.section}>Work Environment</Text>
                <Card>
                  <View style={s.chips}>
                    {envTags.map((k: string) => (
                      <View key={k} style={s.envChip}><Text style={s.envChipText}>{ENV_LABELS[k] || k}</Text></View>
                    ))}
                  </View>
                  <View style={{ marginTop: 14, gap: 12 }}>
                    {filter.teamworkPref != null && <Pref label="Independent ↔ Team" value={filter.teamworkPref} />}
                    {filter.travelPref != null && <Pref label="Stable ↔ Travel" value={filter.travelPref} />}
                    {filter.wfhPref != null && <Pref label="Office ↔ Remote" value={filter.wfhPref} />}
                  </View>
                </Card>
              </>
            )}

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
              A guide for reflection and counselling, not a destiny. For guidance only — never for
              admissions, scholarship, or employment decisions.
            </Text>
          </>
        );
      }}
    </ResultShell>
  );
}

function Pref({ label, value }: { label: string; value: number }) {
  return (
    <View>
      <Text style={s.prefLabel}>{label}</Text>
      <Bar percent={value * 10} color={RC.accent} />
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
  meta: { fontSize: 12.5, color: RC.gray, marginTop: 6, fontWeight: '600' },
  holland: { fontSize: 34, fontWeight: '800', color: RC.primary, letterSpacing: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valChip: { backgroundColor: RC.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  valChipTop: { backgroundColor: '#E4F4FB' },
  valChipText: { fontSize: 12.5, fontWeight: '700', color: RC.gray },
  valChipTextTop: { color: RC.primary },
  envChip: { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  envChipText: { fontSize: 12.5, fontWeight: '700', color: '#4F46E5' },
  dual: { flexDirection: 'row', gap: 12, marginTop: 8 },
  dualBox: { flex: 1, backgroundColor: RC.surface, borderRadius: 12, padding: 14 },
  dualLabel: { fontSize: 11.5, color: RC.gray, fontWeight: '600' },
  dualVal: { fontSize: 20, fontWeight: '800', color: RC.primary, marginTop: 4 },
  prefLabel: { fontSize: 12.5, color: RC.gray, fontWeight: '600', marginBottom: 2 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
