import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTest } from '../../data/psychometricTests';

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
};

export default function TestInfoScreen({ route, navigation }: any) {
  const test = getTest(route.params?.testKey);
  if (!test) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.gray}>Test not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { intro } = test;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <View style={styles.heroIcon}>
            <Ionicons name={test.icon} size={26} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{test.title}</Text>
          <Text style={styles.heroTagline}>{intro.tagline}</Text>
          <View style={styles.metaRow}>
            {intro.meta.map((m) => (
              <View key={m} style={styles.metaChip}>
                <Text style={styles.metaText}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* What it measures */}
        <Text style={styles.sectionHead}>What it measures</Text>
        {intro.measures.map((m) => (
          <View key={m.title} style={styles.measureCard}>
            <View style={styles.measureIcon}>
              <Ionicons name={m.icon} size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.measureTitle}>{m.title}</Text>
              <Text style={styles.measureDesc}>{m.desc}</Text>
            </View>
          </View>
        ))}

        {/* Ethics */}
        <View style={styles.ethicsCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ethicsTitle}>A guide, not a verdict</Text>
            <Text style={styles.ethicsText}>{intro.ethics}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.9}
          onPress={() => navigation.replace(test.assessmentScreen)}
        >
          <Text style={styles.startText}>Start Assessment</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gray: { color: COLORS.gray, fontSize: 15 },
  container: { padding: 16, paddingBottom: 40 },

  hero: { backgroundColor: COLORS.slate, borderRadius: 24, padding: 22, overflow: 'hidden' },
  heroBlob: { position: 'absolute', top: -50, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(59,190,232,0.16)' },
  heroIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 14, letterSpacing: -0.4 },
  heroTagline: { fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 8, lineHeight: 20 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  metaChip: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  metaText: { fontSize: 11.5, fontWeight: '700', color: COLORS.accent, letterSpacing: 0.3 },

  sectionHead: { fontSize: 13, fontWeight: '800', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 24, marginBottom: 12 },
  measureCard: {
    flexDirection: 'row', gap: 14, backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  measureIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E4F4FB', justifyContent: 'center', alignItems: 'center' },
  measureTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  measureDesc: { fontSize: 13, color: COLORS.gray, lineHeight: 19 },

  ethicsCard: {
    flexDirection: 'row', gap: 12, backgroundColor: '#E4F4FB', borderRadius: 16, padding: 16,
    marginTop: 14, alignItems: 'flex-start',
  },
  ethicsTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  ethicsText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, marginTop: 24,
  },
  startText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
