import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import {
  getAcademicResult, getCareerResult, getDisha2Result, getDisha3Result, getDisha4Result, getDisha5Result, getDisha6Result, getDisha7Result, getDisha8Result, getDishaC10Result, getDishaC12Result, getDishaResult, getMbtiResult, getRiasecResult,
} from '../../lib/api';
import { PSYCHO_TESTS } from '../../data/psychometricTests';

const COLORS = {
  primary: '#004877',
  accent: '#3BBEE8',
  bg: '#F6FCFF',
  white: '#FFFFFF',
  text: '#12303F',
  gray: '#6B7A86',
  faint: '#9AA7B1',
  border: '#E4EDF3',
  surface: '#F0F7FB',
  slate: '#0E2635',
  green: '#16A34A',
};

const RESULT_FETCHERS: Record<string, (id: string) => Promise<any>> = {
  disha1: getDishaResult,
  disha2: getDisha2Result,
  disha3: getDisha3Result,
  disha4: getDisha4Result,
  disha5: getDisha5Result,
  disha6: getDisha6Result,
  disha7: getDisha7Result,
  disha8: getDisha8Result,
  dishac10: getDishaC10Result,
  dishac12: getDishaC12Result,
  academic: getAcademicResult,
  mbti: getMbtiResult,
  career: getCareerResult,
  riasec: getRiasecResult,
};

export default function PsychometricHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [done, setDone] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      if (!user?._id) return;
      let active = true;
      Promise.all(
        PSYCHO_TESTS.map((t) =>
          RESULT_FETCHERS[t.resultKey](user._id!)
            // Backend returns { status:true, data:null } when the test was never taken.
            .then((res) => ({ key: t.resultKey, ok: !!res.data?.data }))
            .catch(() => ({ key: t.resultKey, ok: false }))
        )
      ).then((all) => {
        if (!active) return;
        const map: Record<string, boolean> = {};
        all.forEach((r) => { map[r.key] = r.ok; });
        setDone(map);
      });
      return () => { active = false; };
    }, [user])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroEyebrow}>PSYCHOMETRIC ASSESSMENTS</Text>
          <Text style={styles.heroTitle}>Explore who you are and where you fit</Text>
          <Text style={styles.heroSub}>
            Scientifically designed assessments to evaluate your academic confidence, personality,
            and career readiness.
          </Text>
        </View>

        {PSYCHO_TESTS.map((t) => {
          const completed = done[t.resultKey];
          return (
            <View key={t.key} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Ionicons name={t.icon} size={24} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  {t.featured && (
                    <View style={styles.flagChip}>
                      <Text style={styles.flagText}>FLAGSHIP</Text>
                    </View>
                  )}
                  <Text style={styles.cardTitle}>{t.title}</Text>
                  {completed && (
                    <View style={styles.completedRow}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.cardDesc}>{t.description}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.startBtn}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('TestInfo', { testKey: t.key })}
                >
                  <Text style={styles.startText}>{completed ? 'Retake' : 'Start Assessment'}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#fff" />
                </TouchableOpacity>
                {completed && (
                  <TouchableOpacity
                    style={styles.viewBtn}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate(t.resultScreen)}
                  >
                    <Text style={styles.viewText}>View Result</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 40 },

  hero: { backgroundColor: COLORS.slate, borderRadius: 24, padding: 22, marginBottom: 18, overflow: 'hidden' },
  heroBlob: { position: 'absolute', top: -50, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(59,190,232,0.16)' },
  heroEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.accent, letterSpacing: 1.6 },
  heroTitle: { fontSize: 23, fontWeight: '800', color: '#fff', marginTop: 12, lineHeight: 30, letterSpacing: -0.4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 10, lineHeight: 20 },

  card: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  iconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#E4F4FB', justifyContent: 'center', alignItems: 'center' },
  flagChip: { alignSelf: 'flex-start', backgroundColor: '#E4F4FB', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  flagText: { fontSize: 9.5, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  cardTitle: { fontSize: 16.5, fontWeight: '800', color: COLORS.text, lineHeight: 22 },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  completedText: { fontSize: 12, fontWeight: '700', color: COLORS.green },
  cardDesc: { fontSize: 13.5, color: COLORS.gray, lineHeight: 20, marginBottom: 16 },

  actions: { flexDirection: 'row', gap: 10 },
  startBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12,
  },
  startText: { fontSize: 13.5, fontWeight: '800', color: '#fff' },
  viewBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  viewText: { fontSize: 13.5, fontWeight: '800', color: COLORS.primary },
});
