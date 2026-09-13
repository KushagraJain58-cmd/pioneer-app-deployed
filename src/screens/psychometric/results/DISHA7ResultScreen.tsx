import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getDisha7Result } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const bandColor = (b?: string) =>
  b === 'Exceptional Leader' ? '#16A34A' : b === 'Strong Leader' ? '#22C55E' : b === 'Emerging Leader' ? '#EAB308' : b === 'Collaborative Contributor' ? '#F97316' : '#6366F1';
const tPct = (t: number) => Math.max(0, Math.min(100, ((t - 20) / 60) * 100));

const LPI_NARRATIVE: Record<string, string> = {
  'Exceptional Leader': 'Your leadership potential is in the top tier of Indian students your age — vision, influence, decision-making under pressure and a strong ethical foundation.',
  'Strong Leader': 'Your leadership profile is well above average. You have genuine capacity to lead — your strongest dimensions and career matches are detailed below.',
  'Emerging Leader': 'You have solid leadership foundations and are developing the skills and confidence to lead effectively. Your plan includes activities to accelerate this.',
  'Collaborative Contributor': "You add greatest value as a high-quality team member or specialist. Not a limitation — India's most important careers don't all require leading others.",
  'Individual Achiever': 'Your profile is oriented toward individual achievement and depth of expertise — careers that let you be excellent at one thing rather than managing many people.',
};
const POWER_DESC: Record<string, string> = {
  'High Authority Leader': 'Comfortable holding and exercising authority within institutions. IAS/IPS/IFS, defence officer, hospital director, corporate C-suite and political leadership are highlighted — best combined with strong ethical leadership.',
  'Institutional Leader': 'You lead well within established structures. PSU management, government departments, bank management and school/college administration fit your profile.',
  'Entrepreneurial Leader': 'You want authority but dislike rigid hierarchy — you lead best where power comes from contribution, not title. Startup founder, family-business leadership and creative agency head are featured.',
  'Collaborative Leader': 'You lead through people and relationships rather than formal authority. NGO/social sector, teaching leadership, HR, community leadership and consulting fit your profile.',
  'Expert Contributor': 'You lead through expertise, not formal authority — a genuine strength. Research, technical specialisation, clinical medicine, architecture and writing are where you do your best work.',
};
const STABILITY_NOTE: Record<string, string> = {
  Stable: 'You do your best work in stable, predictable environments where you can build deep expertise.',
  Dynamic: 'You thrive in fast-changing environments with new challenges and shifting priorities.',
  Balanced: 'You are comfortable across both stable and rapidly-changing environments.',
};
const ORG_LABEL: Record<string, string> = { Corporate: 'Corporate / MNC', Govt: 'Government / PSU', Startup: 'Startup', NGO: 'NGO / Social Sector', FamilyBiz: 'Family Business' };
const ROLE_LABEL: Record<string, string> = {
  Coordinator: 'Coordinator', Implementer: 'Implementer', Shaper: 'Shaper', MonitorEvaluator: 'Monitor-Evaluator',
  Teamworker: 'Teamworker', ResourceInvestigator: 'Resource Investigator', Plant: 'Plant (Innovator)', Specialist: 'Specialist',
};

export default function DISHA7ResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getDisha7Result(user._id)
      .then((res) => setRecord(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Leadership Profile" icon="ribbon-outline" loading={loading} result={record} navigation={navigation}>
      {(rec) => {
        const r = rec.result || {};
        const { leadership, management, teamwork, power, ethical, workCulture, leadershipFc, sjt, lpi, style, validity, criticalFlags } = r;
        const topSjt = sjt?.competencies?.[0]?.score || 1;

        const lpiBars = leadership
          ? [
              { dim: 'Vision', t: leadership.subScales?.Vision?.tScore },
              { dim: 'Influence', t: leadership.subScales?.Influence?.tScore },
              { dim: 'Decision-Making', t: leadership.decisionMakingT },
              { dim: 'Motivation of Others', t: leadership.motivOthersT },
              { dim: 'Management', t: management?.managementT },
            ].filter((b) => b.t != null)
          : [];
        const orgBars = (workCulture?.fit || []).map((f: any) => ({ org: ORG_LABEL[f.archetype] || f.archetype, pct: f.pct }));
        const topOrg = orgBars.reduce((m: number, o: any) => Math.max(m, o.pct), 0) || 100;
        const roleBars = (teamwork?.roleScores || []).filter((r2: any) => r2.score > 0).slice(0, 6).map((r2: any) => ({ role: ROLE_LABEL[r2.role] || r2.role, score: r2.score }));
        const topRole = roleBars.reduce((m: number, o: any) => Math.max(m, o.score), 0) || 1;

        return (
          <>
            {validity && validity.clean === false && (
              <Note tone="blue" title="A note on your responses" body={validity.leadershipInflationFlag
                ? 'Your leadership self-ratings were uniformly very high. Your counsellor may ask you to describe 2–3 specific leadership experiences in detail to ground the profile.'
                : 'A few of your answers were slightly inconsistent. This does not invalidate your report; your counsellor may explore some areas in more depth.'} />
            )}
            {criticalFlags?.highPowerLowEthics && (
              <Note tone="amber" title="A development focus worth discussing" body="Your profile shows a strong drive for authority. Developing a strong ethical-leadership foundation alongside it is a valuable part of your growth plan — great authority is only powerful when it rests on trust." />
            )}
            {ethical && ethical.civilServiceBand !== 'High' && (
              <Note tone="blue" title="Ethical leadership — a development area" body="For civil services (IAS/IPS/IFS), ethical conduct is both a selection criterion and a daily requirement. Strengthening your ethical-leadership foundation would improve your fit for these careers." />
            )}

            {/* LPI overview */}
            <Card>
              <Text style={s.label}>Leadership Index</Text>
              <Text style={[s.fitBig, { color: bandColor(lpi?.band) }]}>{lpi?.compositeT ?? '—'}</Text>
              {lpi?.band && <Text style={[s.band, { color: bandColor(lpi.band) }]}>{lpi.band}</Text>}
              {lpi?.band && !!LPI_NARRATIVE[lpi.band] && <Text style={s.narr}>{LPI_NARRATIVE[lpi.band]}</Text>}
              {lpiBars.length > 0 && (
                <View style={{ marginTop: 14, gap: 12 }}>
                  {lpiBars.map((b: any) => (
                    <View key={b.dim}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.dim}</Text><Text style={s.pillarVal}>T {b.t}</Text></View>
                      <Bar percent={tPct(b.t)} color={RC.accent} />
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {/* Leadership style */}
            {style?.style && (
              <>
                <Text style={s.section}>Your Leadership Style</Text>
                <Card>
                  <View style={s.chips}>
                    <View style={s.styleChip}><Text style={s.styleChipText}>{style.style}</Text></View>
                    {!!leadershipFc?.leadVsFollow && <View style={s.tag}><Text style={s.tagText}>{leadershipFc.leadVsFollow === 'Lead' ? 'Prefers to lead' : leadershipFc.leadVsFollow === 'Follow' ? 'Prefers to contribute' : 'Balanced lead/contribute'}</Text></View>}
                    {!!leadershipFc?.resultsVsPeople && <View style={s.tag}><Text style={s.tagText}>{leadershipFc.resultsVsPeople}-oriented</Text></View>}
                  </View>
                  {!!style.indiaExpression && <Text style={s.body}>{style.indiaExpression}</Text>}
                  {!!style.roleModel && <Text style={s.meta}>Indian role model for this style: {style.roleModel}</Text>}
                </Card>
              </>
            )}

            {/* Power orientation */}
            {power?.profile && (
              <>
                <Text style={s.section}>Authority & Power Orientation</Text>
                <Card>
                  <Note tone="blue" title={power.profile} body={POWER_DESC[power.profile] || ''} />
                  <Text style={s.meta}>Power Drive {power.powerDriveT} · Hierarchy Comfort {power.hierarchyComfortT} · Flat-org Preference {power.flatPrefT}</Text>
                </Card>
              </>
            )}

            {/* Team roles */}
            {roleBars.length > 0 && (
              <>
                <Text style={s.section}>Team Role Profile{teamwork.primaryRole ? ` · ${ROLE_LABEL[teamwork.primaryRole] || teamwork.primaryRole}` : ''}{teamwork.secondaryRole ? ` / ${ROLE_LABEL[teamwork.secondaryRole] || teamwork.secondaryRole}` : ''}</Text>
                <Card>
                  {roleBars.map((b: any, i: number) => (
                    <View key={b.role} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.role}</Text><Text style={s.pillarVal}>{b.score}</Text></View>
                      <Bar percent={Math.min(100, (b.score / topRole) * 100)} color={i === 0 ? RC.accent : RC.primary} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Organisational fit */}
            {orgBars.length > 0 && (
              <>
                <Text style={s.section}>Organisational Fit{workCulture.topFit ? ` · ${ORG_LABEL[workCulture.topFit] || workCulture.topFit}` : ''}</Text>
                <Card>
                  {orgBars.map((b: any, i: number) => (
                    <View key={b.org} style={{ marginBottom: 12 }}>
                      <View style={s.rowBetween}><Text style={s.dimName}>{b.org}</Text><Text style={s.pillarVal}>{b.pct}</Text></View>
                      <Bar percent={Math.min(100, (b.pct / topOrg) * 100)} color={i === 0 ? RC.accent : RC.primary} />
                    </View>
                  ))}
                  {!!STABILITY_NOTE[workCulture.stabilityOrientation] && <Text style={s.meta}>{STABILITY_NOTE[workCulture.stabilityOrientation]}</Text>}
                </Card>
              </>
            )}

            {/* Ethical leadership */}
            {ethical?.subScales && (
              <>
                <Text style={s.section}>Ethical Leadership{ethical.ethicalT != null ? ` · ${ethical.ethicalT} (${ethical.civilServiceBand})` : ''}</Text>
                <Card>
                  <View style={s.tiles}>
                    {Object.entries(ethical.subScales).map(([k, v]: any) => (
                      <View key={k} style={s.tile}><Text style={s.tileLabel}>{k}</Text><Text style={s.tileVal}>{v.pct}</Text></View>
                    ))}
                  </View>
                  {ethical.civilServiceBand === 'High' && <Note tone="green" title="A genuine differentiator" body="Your strong ethical foundation is a core requirement for civil services, public-sector management and community leadership — where ethical conduct is both a requirement and a professional advantage." />}
                </Card>
              </>
            )}

            {/* Management */}
            {management?.subScales && (
              <>
                <Text style={s.section}>Management & Organisational Skills{management.managementT != null ? ` · ${management.managementT}` : ''}</Text>
                <Card>
                  <View style={s.tiles}>
                    {Object.entries(management.subScales).map(([k, v]: any) => (
                      <View key={k} style={s.tile}><Text style={s.tileLabel}>{k}</Text><Text style={s.tileVal}>{v.pct}</Text></View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* SJT */}
            {sjt?.competencies?.length > 0 && (
              <>
                <Text style={s.section}>Leadership Scenarios{sjt.percentage != null ? ` · ${sjt.percentage}%` : ''}</Text>
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
              A scientifically-informed guide, not a destiny. Leadership, management and ethical judgment
              can all be developed with practice and real responsibility. For guidance only.
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
  narr: { fontSize: 13, color: RC.text, lineHeight: 19, marginTop: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pillarVal: { fontSize: 13, fontWeight: '800', color: RC.primary },
  section: { fontSize: 13, fontWeight: '800', color: RC.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 12 },
  dimName: { fontSize: 14, fontWeight: '700', color: RC.text, flex: 1 },
  body: { fontSize: 13.5, color: RC.text, lineHeight: 20, marginTop: 10 },
  meta: { fontSize: 12.5, color: RC.gray, marginTop: 10, fontWeight: '600', lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleChip: { backgroundColor: '#E4F4FB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7 },
  styleChipText: { fontSize: 13.5, fontWeight: '800', color: RC.primary },
  tag: { backgroundColor: RC.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  tagText: { fontSize: 12.5, fontWeight: '700', color: RC.gray },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '31%', backgroundColor: RC.surface, borderRadius: 12, padding: 10, alignItems: 'center' },
  tileLabel: { fontSize: 10.5, color: RC.gray, fontWeight: '600', textAlign: 'center' },
  tileVal: { fontSize: 17, fontWeight: '800', color: RC.primary, marginTop: 4 },
  note: { borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 6 },
  noteTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 4 },
  noteBody: { fontSize: 12.5, lineHeight: 18 },
  disclaimer: { fontSize: 11.5, color: RC.faint, lineHeight: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});
