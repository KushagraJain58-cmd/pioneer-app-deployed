import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC } from '../components/ResultShell';
import { getRiasecResult } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import riasecMap from '../../../data/riasecCodeMapping.json';

const MAP = riasecMap as Record<string, { title?: string; summary?: string; work_style?: string; student_guidance?: string }>;

const DIM_NAMES: Record<string, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
};

const MAX_PER_DIM = 7;

const dimColor = (score: number) => {
  const p = (score / MAX_PER_DIM) * 100;
  if (p >= 70) return RC.green;
  if (p >= 40) return RC.amber;
  return RC.red;
};

export default function RIASECResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getRiasecResult(user._id)
      .then((res) => setResult(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="RIASEC Career Interests" icon="navigate-outline" loading={loading} result={result} navigation={navigation}>
      {(r) => {
        const info = r.interestCode ? MAP[r.interestCode] : undefined;
        const scores = r.dimensionScores || {};
        return (
          <>
            <Card style={{ alignItems: 'center' }}>
              <Text style={styles.label}>Your Holland Code</Text>
              <Text style={styles.code}>{r.interestCode}</Text>
              <Text style={styles.meta}>Your dominant career interests</Text>
            </Card>

            {info && (
              <Card>
                {!!info.title && <Text style={styles.infoTitle}>{info.title}</Text>}
                {!!info.summary && <Text style={styles.infoText}>{info.summary}</Text>}
                {!!info.work_style && (
                  <>
                    <Text style={styles.infoHead}>Work Style</Text>
                    <Text style={styles.infoText}>{info.work_style}</Text>
                  </>
                )}
                {!!info.student_guidance && (
                  <>
                    <Text style={styles.infoHead}>Student Guidance</Text>
                    <Text style={styles.infoText}>{info.student_guidance}</Text>
                  </>
                )}
              </Card>
            )}

            <Card>
              <Text style={styles.label}>Overall Interest Score</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.total}>{r.totalScore} / 42</Text>
              </View>
              <Bar percent={((r.totalScore || 0) / 42) * 100} />
            </Card>

            <Text style={styles.sectionHead}>Interest Dimensions</Text>
            {Object.entries(scores).map(([key, score]: any) => (
              <Card key={key}>
                <View style={styles.dimTop}>
                  <Text style={styles.dimName}>{DIM_NAMES[key] || key}</Text>
                  <Text style={[styles.dimScore, { color: dimColor(score) }]}>{score} / {MAX_PER_DIM}</Text>
                </View>
                <Bar percent={(score / MAX_PER_DIM) * 100} color={dimColor(score)} />
              </Card>
            ))}
          </>
        );
      }}
    </ResultShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '800', color: RC.faint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  code: { fontSize: 40, fontWeight: '800', color: RC.primary, letterSpacing: 6 },
  meta: { fontSize: 12.5, color: RC.gray, marginTop: 8, fontWeight: '600' },
  infoTitle: { fontSize: 17, fontWeight: '800', color: RC.text, marginBottom: 10 },
  infoHead: { fontSize: 11, fontWeight: '800', color: RC.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 14, marginBottom: 6 },
  infoText: { fontSize: 14, lineHeight: 22, color: RC.text },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  total: { fontSize: 22, fontWeight: '800', color: RC.primary },
  sectionHead: { fontSize: 13, fontWeight: '800', color: RC.text, marginTop: 8, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  dimTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dimName: { fontSize: 15, fontWeight: '700', color: RC.text, flex: 1 },
  dimScore: { fontSize: 12.5, fontWeight: '800' },
});
