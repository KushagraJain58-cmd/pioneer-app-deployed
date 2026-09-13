import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, BulletList, Card, RC } from '../components/ResultShell';
import { getMbtiResult } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { MBTI_TYPES } from '../../../data/mbtiTypes';

const TYPES = MBTI_TYPES as Record<string, { title: string; description: string; strengths: string[]; weaknesses: string[]; careers: string[] }>;

const DIMS = [
  { key: 'EI', label: 'Extraversion vs Introversion', a: 'E', b: 'I' },
  { key: 'SN', label: 'Sensing vs Intuition', a: 'S', b: 'N' },
  { key: 'TF', label: 'Thinking vs Feeling', a: 'T', b: 'F' },
  { key: 'JP', label: 'Judging vs Perceiving', a: 'J', b: 'P' },
] as const;

export default function MBTIResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getMbtiResult(user._id)
      .then((res) => setResult(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="MBTI Personality" icon="people-outline" loading={loading} result={result} navigation={navigation}>
      {(r) => {
        const info = TYPES[r.mbti_type];
        const scores = r.scores || {};
        const pct = r.percentages || {};
        return (
          <>
            <Card style={{ alignItems: 'center' }}>
              <Text style={styles.label}>Your Personality Type</Text>
              <Text style={styles.type}>{r.mbti_type}</Text>
              {info?.title && <Text style={styles.typeTitle}>{info.title}</Text>}
              {r.completionTimeSeconds ? <Text style={styles.meta}>Completed in {r.completionTimeSeconds}s</Text> : null}
            </Card>

            {info?.description && (
              <Card>
                <Text style={styles.desc}>{info.description}</Text>
              </Card>
            )}

            <Text style={styles.sectionHead}>Personality Dimensions</Text>
            {DIMS.map((d) => (
              <Card key={d.key}>
                <Text style={styles.dimName}>{d.label}</Text>
                <Bar percent={pct[d.key] ?? 50} />
                <Text style={styles.meta}>{d.a}: {scores[d.a] ?? 0}   |   {d.b}: {scores[d.b] ?? 0}</Text>
              </Card>
            ))}

            <BulletList title="Strengths" items={info?.strengths} color={RC.green} />
            <BulletList title="Growth Areas" items={info?.weaknesses} color={RC.amber} />
            <BulletList title="Recommended Careers" items={info?.careers} color={RC.primary} />

            <BulletList title="Your Strengths" items={r.strengths} color={RC.green} />
            <BulletList title="Your Growth Areas" items={r.growthAreas} color={RC.amber} />
            <BulletList title="Recommendations" items={r.recommendations} color={RC.primary} />
          </>
        );
      }}
    </ResultShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '800', color: RC.faint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  type: { fontSize: 44, fontWeight: '800', color: RC.primary, letterSpacing: 2 },
  typeTitle: { fontSize: 15, fontWeight: '700', color: RC.text, marginTop: 8, textAlign: 'center' },
  desc: { fontSize: 14.5, lineHeight: 23, color: RC.text },
  meta: { fontSize: 12.5, color: RC.gray, marginTop: 8, fontWeight: '600' },
  sectionHead: { fontSize: 13, fontWeight: '800', color: RC.text, marginTop: 8, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  dimName: { fontSize: 14.5, fontWeight: '700', color: RC.text },
});
