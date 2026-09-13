import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResultShell, { Bar, Card, RC, levelColor } from '../components/ResultShell';
import { getAcademicResult } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function AcademicResultScreen({ navigation }: any) {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    getAcademicResult(user._id)
      .then((res) => setResult(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ResultShell title="Academic Self-Efficacy" icon="school-outline" loading={loading} result={result} navigation={navigation}>
      {(r) => (
        <>
          <Card>
            <Text style={styles.label}>Overall Performance</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.bigLevel}>{r.level}</Text>
              <Text style={styles.pct}>{Math.round(r.percentage)}%</Text>
            </View>
            <Bar percent={r.percentage} color={levelColor(r.level)} />
            {r.totalScore !== undefined && <Text style={styles.meta}>Total score: {r.totalScore}</Text>}
          </Card>

          {Array.isArray(r.dimensions) && (
            <>
              <Text style={styles.sectionHead}>Dimension Breakdown</Text>
              {r.dimensions.map((d: any, i: number) => (
                <Card key={i}>
                  <View style={styles.dimTop}>
                    <Text style={styles.dimName}>{d.name}</Text>
                    <Text style={[styles.dimLevel, { color: levelColor(d.level) }]}>{d.level}</Text>
                  </View>
                  <Bar percent={d.percentage} color={levelColor(d.level)} />
                  <Text style={styles.meta}>{d.score} / {d.maxScore}</Text>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </ResultShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '800', color: RC.faint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  bigLevel: { fontSize: 26, fontWeight: '800', color: RC.primary },
  pct: { fontSize: 20, fontWeight: '800', color: RC.text },
  meta: { fontSize: 12.5, color: RC.gray, marginTop: 8, fontWeight: '600' },
  sectionHead: { fontSize: 13, fontWeight: '800', color: RC.text, marginTop: 8, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  dimTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dimName: { fontSize: 15, fontWeight: '700', color: RC.text, flex: 1 },
  dimLevel: { fontSize: 12.5, fontWeight: '800' },
});
