import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDisha8Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const VALUE_LABEL: Record<string, string> = {
  Family: 'Family & Relationships', Achievement: 'Achievement & Mastery', Security: 'Security & Stability',
  Autonomy: 'Autonomy & Freedom', Seva: 'Seva (Service)', Status: 'Status & Recognition',
  Adventure: 'Adventure & Novelty', Spirituality: 'Spirituality', Intellectual: 'Intellectual Growth', Dharma: 'Dharma (Family Duty)',
};
const PURPOSE_DESC: Record<string, string> = {
  Integration: 'You are drawn to careers that deliver both personal achievement AND genuine social value — the rarest, most integrated profile. Social entrepreneurship, impact-focused leadership and institution-building fit you well.',
  'Seva-Oriented': 'Your career motivation leans strongly toward contribution and service. Public service, NGOs, education, healthcare and community development will be your most sustaining paths — because they will genuinely satisfy you.',
  'Personal-Success-Oriented': 'Your motivation leans toward personal achievement, mastery and recognition — completely valid. Corporate leadership, entrepreneurship, finance and competitive professional fields will sustain you.',
  Balanced: 'You hold both service and personal-achievement motivations without a strong lean — real flexibility in the kind of career culture that will suit you.',
};
const WLB_DESC: Record<string, string> = {
  HighIntensity: 'You are genuinely energised by demanding, high-stakes work — an intense, high-commitment career will likely suit you better than a slower-paced one.',
  Balance: 'You genuinely prioritise a well-integrated life over career intensity — a real preference, not a lack of ambition — and it should shape which roles you target.',
  Mixed: 'You show real pull toward both career intensity and life balance — common, and worth exploring rather than assuming one will win out.',
};
const regretColor = (l?: string) => (l === 'Low' ? '#16A34A' : l === 'Moderate' ? '#EAB308' : '#EF4444');

export default function DISHA8ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDisha8Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Life Values & Lifestyle Profile" icon="compass-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { lifeValues, wlb, lifestyle, money, purpose, spi, futureProjection, sjt, validity, regretRisk, summary } = r;
        const top3 = summary?.top3Values || [];
        const valuesBars = lifeValues?.dims
          ? Object.entries(lifeValues.dims).map(([k, v]: any) => ({ label: VALUE_LABEL[k] || k, t: v.tScore, key: k })).sort((a: any, b: any) => b.t - a.t)
          : [];

        return (
          <>
            {validity?.idealisationNote && <Note tone="blue" title="A note on your responses" body={validity.idealisationNote} />}
            {validity?.tensions?.length > 0 && (
              <View style={s.noteBlue}>
                <Text style={s.noteTitleBlue}>Real tensions worth exploring</Text>
                {validity.tensions.map((t: any) => (
                  <View key={t.pattern} style={s.bulletRow}><Text style={s.bulletDot}>•</Text><Text style={s.bulletText}>{t.note}</Text></View>
                ))}
              </View>
            )}

            {/* Top 5 values */}
            <Card>
              <Text style={s.cardHead}>Your Top 5 Life Values</Text>
              <Text style={s.sub}>These values moderate every career recommendation across your DISHA reports.</Text>
              <View style={[s.chips, { marginTop: 12, marginBottom: valuesBars.length ? 14 : 0 }]}>
                {(summary?.top5Values || []).map((v: string, i: number) => (
                  <View key={v} style={[s.valChip, i < 3 && s.valChipTop]}>
                    <Text style={[s.valChipText, i < 3 && s.valChipTextTop]}>#{i + 1} {VALUE_LABEL[v] || v}</Text>
                  </View>
                ))}
              </View>
              {valuesBars.map((b: any) => (
                <View key={b.key} style={{ marginBottom: 12 }}>
                  <View style={s.rowBetween}><Text style={s.dimName}>{b.label}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                  <Bar percent={Math.max(0, Math.min(100, ((b.t - 20) / 60) * 100))} color={top3.includes(b.key) ? RC.accent : RC.primary} />
                </View>
              ))}
            </Card>

            {/* Purpose */}
            {purpose?.profile && (
              <>
                <Text style={s.section}>Purpose Orientation</Text>
                <Card>
                  <Note tone="blue" title={purpose.profile} body={PURPOSE_DESC[purpose.profile] || ''} />
                  <Text style={s.meta}>Seva {purpose.sevaT} · Personal Success {purpose.personalSuccessT} · Integration {purpose.integrationT}</Text>
                </Card>
              </>
            )}

            {/* WLB */}
            {wlb?.orientation && (
              <>
                <Text style={s.section}>Work-Life Balance</Text>
                <Card>
                  <Note tone="blue" title={`${wlb.orientation} Orientation`} body={WLB_DESC[wlb.orientation] || ''} />
                  <Text style={s.meta}>High-Intensity Comfort {wlb.highIntensityT} · Balance Preference {wlb.balanceT} · Family-Career Integration {wlb.familyCareerIntegrationT}</Text>
                </Card>
              </>
            )}

            {/* Lifestyle */}
            {lifestyle && (
              <>
                <Text style={s.section}>Lifestyle & Life Design</Text>
                <Card>
                  <View style={s.tiles}>
                    <Tile label="Geographic Preference" value={lifestyle.topGeoPreference} />
                    <Tile label="Family Structure" value={lifestyle.familyStructurePreference} />
                    <Tile label="International Mobility" value={lifestyle.intlMobilityT} />
                    <Tile label="Career Flexibility Need" value={lifestyle.careerFlexT} />
                  </View>
                </Card>
              </>
            )}

            {/* Money */}
            {money?.orientation && (
              <>
                <Text style={s.section}>Money Mindset</Text>
                <Card>
                  <View style={s.styleChip}><Text style={s.styleChipText}>{money.orientation}-Oriented</Text></View>
                  <Text style={s.body}>
                    {money.orientation === 'Security'
                      ? 'A guaranteed, predictable income matters more to you than a higher but variable ceiling — pointing toward stable government, PSU or established-organisation roles.'
                      : money.orientation === 'Growth'
                      ? 'You are comfortable with variable, back-loaded income for a higher long-term ceiling — pointing toward entrepreneurial, sales, equity-linked or startup compensation.'
                      : 'You hold both security and growth orientations without a strong lean — a range of compensation structures could work for you.'}
                  </Text>
                  <Text style={s.meta}>Money Security {money.moneySecurityT} · Money Growth {money.moneyGrowthT} · Family Financial Responsibility {money.familyFinRespT}</Text>
                </Card>
              </>
            )}

            {/* SPI */}
            {spi?.top3Needs && (
              <>
                <Text style={s.section}>Satisfaction Prediction Index</Text>
                <Card>
                  <View style={s.chips}>
                    {spi.top3Needs.map((n: string) => (
                      <View key={n} style={s.needChip}><Text style={s.needText}>{n.replace('Need', ' Need')}</Text></View>
                    ))}
                  </View>
                  <View style={[s.tiles, { marginTop: 12 }]}>
                    {['IntrinsicNeed', 'GrowthNeed', 'AutonomyNeed', 'RelatednessNeed', 'PurposeNeed'].map((k) => (
                      <View key={k} style={s.tile5}><Text style={s.tileLabel}>{k.replace('Need', '')}</Text><Text style={s.tileVal}>{spi[k]}</Text></View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* Regret risk */}
            {regretRisk && (
              <>
                <Text style={s.section}>Career Regret Prevention Check</Text>
                <Card>
                  <View style={[s.styleChip, { backgroundColor: `${regretColor(regretRisk.level)}22` }]}>
                    <Text style={[s.styleChipText, { color: regretColor(regretRisk.level) }]}>{regretRisk.level} Regret Risk</Text>
                  </View>
                  {regretRisk.factors?.length > 0 ? (
                    <View style={{ marginTop: 10, gap: 8 }}>
                      {regretRisk.factors.map((f: any) => <Note key={f.factor} tone="amber" title="" body={f.note} />)}
                    </View>
                  ) : (
                    <Text style={s.body}>No significant regret-risk factors were detected — your career direction and life values appear well-aligned so far.</Text>
                  )}
                </Card>
              </>
            )}

            {/* Future life vision */}
            {futureProjection?.nonNegotiable && (
              <>
                <Text style={s.section}>Your Non-Negotiable Life Design</Text>
                <Card>
                  <View style={s.visionRow}>
                    <View style={[s.visionDot, { backgroundColor: '#16A34A' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.visionLabel}>A genuinely good life at 40 would mean…</Text>
                      <Text style={s.visionText}>{futureProjection.nonNegotiable.goodLife || '—'}</Text>
                    </View>
                  </View>
                  <View style={s.visionRow}>
                    <View style={[s.visionDot, { backgroundColor: '#EF4444' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.visionLabel}>A wasted life at 40 would mean…</Text>
                      <Text style={s.visionText}>{futureProjection.nonNegotiable.wastedLife || '—'}</Text>
                    </View>
                  </View>
                </Card>
              </>
            )}

            {/* SJT alignment */}
            {sjt?.alignmentPct !== undefined && (
              <>
                <Text style={s.section}>Life Design Dilemmas · {sjt.alignmentPct}%</Text>
                <Card>
                  <Bar percent={sjt.alignmentPct} color={RC.accent} />
                  <Text style={s.meta}>How closely your choices in realistic dilemmas matched your own stated top values — not a universal answer key.</Text>
                </Card>
              </>
            )}

            <Text style={s.disclaimer}>
              A scientifically-informed guide, not a destiny. What you value can evolve — revisit this
              test periodically. For guidance only.
            </Text>
          </>
        );
      }}
    </ResultShell>
  );
}

function Tile({ label, value }: { label: string; value: any }) {
  return (
    <View style={s.tile}><Text style={s.tileLabel}>{label}</Text><Text style={s.tileValSm}>{value ?? '—'}</Text></View>
  );
}
function Note({ tone, title, body }: { tone: 'blue' | 'amber' | 'green'; title: string; body: string }) {
  const bg = tone === 'blue' ? '#E4F4FB' : tone === 'amber' ? '#FEF3C7' : '#DCFCE7';
  const fg = tone === 'blue' ? '#075985' : tone === 'amber' ? '#92400E' : '#166534';
  return (
    <View style={[s.note, { backgroundColor: bg }]}>
      {!!title && <Text style={[s.noteTitle, { color: fg }]}>{title}</Text>}
      <Text style={[s.noteBody, { color: fg }]}>{body}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  cardHead: { fontSize: 16, fontWeight: '800', color: RC.text },
  sub: { fontSize: 12.5, color: RC.gray, marginTop: 4, lineHeight: 18 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pillarVal: { fontSize: 13, fontWeight: '800', color: RC.primary },
  section: { fontSize: 13, fontWeight: '800', color: RC.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 12 },
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1 },
  body: { fontSize: 13.5, color: RC.text, lineHeight: 20, marginTop: 10 },
  meta: { fontSize: 12.5, color: RC.gray, marginTop: 10, fontWeight: '600', lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valChip: { backgroundColor: RC.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  valChipTop: { backgroundColor: '#E4F4FB' },
  valChipText: { fontSize: 12.5, fontWeight: '700', color: RC.gray },
  valChipTextTop: { color: RC.primary },
  needChip: { backgroundColor: '#E4F4FB', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  needText: { fontSize: 12, fontWeight: '700', color: RC.primary },
  styleChip: { alignSelf: 'flex-start', backgroundColor: '#E4F4FB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7 },
  styleChipText: { fontSize: 13.5, fontWeight: '800', color: RC.primary },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '47.5%', backgroundColor: RC.surface, borderRadius: 12, padding: 12, alignItems: 'center' },
  tile5: { width: '31%', backgroundColor: RC.surface, borderRadius: 12, padding: 10, alignItems: 'center' },
  tileLabel: { fontSize: 10.5, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  tileVal: { fontSize: 17, fontWeight: '800', color: RC.primary, marginTop: 4 },
  tileValSm: { fontSize: 14, fontWeight: '800', color: RC.primary, marginTop: 4, textAlign: 'center' },
  visionRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  visionDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  visionLabel: { fontSize: 11.5, fontWeight: '700', color: RC.faint, marginBottom: 4 },
  visionText: { fontSize: 14, color: RC.text, lineHeight: 20 },
  note: { borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 6 },
  noteTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 4 },
  noteBody: { fontSize: 12.5, lineHeight: 18 },
  noteBlue: { backgroundColor: '#E4F4FB', borderRadius: 14, padding: 14, marginBottom: 10 },
  noteTitleBlue: { fontSize: 13.5, fontWeight: '800', color: '#075985', marginBottom: 6 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  bulletDot: { fontSize: 13, color: '#075985' },
  bulletText: { flex: 1, fontSize: 12.5, color: '#075985', lineHeight: 18 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
