import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const RC = {
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
  green: '#22C55E',
  amber: '#EAB308',
  red: '#EF4444',
};

export const levelColor = (level?: string) => {
  switch (level) {
    case 'High': return RC.green;
    case 'Moderate': return RC.amber;
    case 'Low': return RC.red;
    default: return RC.primary;
  }
};

export function Bar({ percent, color = RC.primary }: { percent: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function BulletList({ title, items, color = RC.primary }: { title: string; items?: string[]; color?: string }) {
  if (!items || !items.length) return null;
  return (
    <Card>
      <Text style={styles.cardLabel}>{title}</Text>
      {items.map((it, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.bulletText}>{it}</Text>
        </View>
      ))}
    </Card>
  );
}

interface ShellProps {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  loading: boolean;
  result: any;
  navigation: any;
  children: (r: any) => React.ReactNode;
}

export default function ResultShell({ title, icon, loading, result, navigation, children }: ShellProps) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={RC.primary} size="large" />
      </View>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.emptyWrap}>
          <Ionicons name="document-outline" size={54} color={RC.border} />
          <Text style={styles.emptyTitle}>No result yet</Text>
          <Text style={styles.emptySub}>Complete the assessment to see your report here.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('PsychometricHome')}>
            <Text style={styles.backText}>Back to Tests</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <View style={styles.heroIcon}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
        </View>

        {children(result)}

        <TouchableOpacity style={styles.backBtnWide} onPress={() => navigation.navigate('PsychometricHome')}>
          <Ionicons name="arrow-back" size={16} color={RC.primary} />
          <Text style={styles.backText}>Back to Tests</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: RC.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: RC.bg },
  container: { padding: 16, paddingBottom: 40 },
  hero: { backgroundColor: RC.slate, borderRadius: 22, padding: 22, marginBottom: 16, overflow: 'hidden' },
  heroBlob: { position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(59,190,232,0.16)' },
  heroIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 14, letterSpacing: -0.3 },
  card: { backgroundColor: RC.white, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: RC.border },
  cardLabel: { fontSize: 11, fontWeight: '800', color: RC.faint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  track: { height: 8, borderRadius: 4, backgroundColor: RC.surface, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 14, color: RC.text, lineHeight: 21 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: RC.text, marginTop: 16 },
  emptySub: { fontSize: 14, color: RC.gray, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  backBtn: { marginTop: 20, backgroundColor: RC.primary, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 12 },
  backBtnWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: RC.border, borderRadius: 14, paddingVertical: 14, marginTop: 4 },
  backText: { fontSize: 14, fontWeight: '800', color: RC.primary },
});
