import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getSkillByMonthYear } from '../../lib/api';
import { COLORS, MONTHS, WEEK_COLORS } from './skillsTheme';

interface Skill {
  id: string;
  title: string;
  description?: string;
  finalAssessmentStatus?: 'completed' | 'pending' | 'late_submitted' | null;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  completed: { label: 'Completed', color: COLORS.green, bg: COLORS.greenBg, icon: 'checkmark-circle' },
  pending: { label: 'In Progress', color: COLORS.amber, bg: COLORS.amberBg, icon: 'time' },
  late_submitted: { label: 'Late', color: '#EA580C', bg: '#FFEDD5', icon: 'alert-circle' },
};

export default function SkillsScreen({ navigation }: any) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthName = MONTHS.find(m => m.value === selectedMonth)?.name || '';

  const fetchSkill = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getSkillByMonthYear(selectedYear, selectedMonth)
      .then(res => {
        if (!active) return;
        if (!res.data?.status) throw new Error(res.data?.error?.message || 'Skill not found');
        setSkill(res.data.data);
      })
      .catch(err => {
        if (!active) return;
        setSkill(null);
        setError(err?.response?.data?.error?.message || 'No skill program assigned for this month.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [selectedYear, selectedMonth]);

  // Refetch on focus so completion badges refresh after taking an assessment.
  useFocusEffect(fetchSkill);

  const isFutureMonth = (monthValue: number) => {
    if (selectedYear > currentYear) return true;
    if (selectedYear === currentYear && monthValue > currentMonth) return true;
    return false;
  };

  const isUnlocked = (monthValue: number) => {
    if (!isFutureMonth(monthValue)) return true;
    return skill?.finalAssessmentStatus === 'completed';
  };

  const changeMonth = (dir: -1 | 1) => {
    setSelectedMonth(prev => {
      let m = prev + dir;
      if (m < 1) { m = 12; setSelectedYear(y => y - 1); }
      else if (m > 12) { m = 1; setSelectedYear(y => y + 1); }
      return m;
    });
  };

  const status = skill?.finalAssessmentStatus ? STATUS_META[skill.finalAssessmentStatus] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Page heading */}
        <Text style={styles.pageTitle}>Skill Readiness</Text>
        <Text style={styles.pageSub}>Build the skills employers and universities look for</Text>

        {/* Month / Year selector */}
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <View style={styles.selectorHeaderLeft}>
              <View style={styles.calIcon}>
                <Ionicons name="calendar" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.selectorLabel}>SELECT PERIOD</Text>
                <Text style={styles.selectorPeriod}>{monthName} {selectedYear}</Text>
              </View>
            </View>
            <View style={styles.navBtns}>
              <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)}>
                <Ionicons name="chevron-back" size={18} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)}>
                <Ionicons name="chevron-forward" size={18} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.monthGrid}>
            {MONTHS.map(m => {
              const unlocked = isUnlocked(m.value);
              const active = selectedMonth === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  disabled={!unlocked}
                  onPress={() => setSelectedMonth(m.value)}
                  style={[
                    styles.monthChip,
                    active && styles.monthChipActive,
                    !unlocked && styles.monthChipLocked,
                  ]}
                >
                  <Text style={[
                    styles.monthChipText,
                    active && styles.monthChipTextActive,
                    !unlocked && styles.monthChipTextLocked,
                  ]}>{m.label}</Text>
                  {!unlocked && <Ionicons name="lock-closed" size={9} color={COLORS.gray} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.muted}>Loading skill program…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={28} color={COLORS.gray} />
            </View>
            <Text style={styles.emptyTitle}>No Skill Program</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        )}

        {!loading && skill && (
          <>
            {/* Skill header card */}
            <View style={styles.skillCard}>
              <View style={styles.skillCardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <View style={styles.periodBadge}>
                      <Text style={styles.periodBadgeText}>{monthName} {selectedYear}</Text>
                    </View>
                    {status && (
                      <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                        <Ionicons name={status.icon} size={12} color="#fff" />
                        <Text style={styles.statusBadgeText}>{status.label}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.skillTitle}>{skill.title}</Text>
                  {!!skill.description && (
                    <Text style={styles.skillDesc} numberOfLines={3}>{skill.description}</Text>
                  )}
                </View>
                <View style={styles.trophyWrap}>
                  <Ionicons name="trophy" size={26} color="#fff" />
                </View>
              </View>
            </View>

            {/* Weekly modules */}
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sectionLabel}>WEEKLY MODULES</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.weekGrid}>
              {[1, 2, 3, 4].map(week => {
                const c = WEEK_COLORS[week - 1];
                return (
                  <TouchableOpacity
                    key={week}
                    activeOpacity={0.85}
                    style={[styles.weekCard, { backgroundColor: c.bg }]}
                    onPress={() => navigation.navigate('SkillWeek', {
                      skillId: skill.id,
                      weekNumber: week,
                      skillTitle: skill.title,
                    })}
                  >
                    <View style={styles.weekCardTop}>
                      <View style={styles.weekNumBubble}>
                        <Text style={[styles.weekNum, { color: c.tint }]}>{week}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={c.tint} />
                    </View>
                    <Text style={styles.weekKicker}>WEEK {week}</Text>
                    <Text style={styles.weekCardTitle}>Content & Assessment</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Final evaluation */}
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sectionLabel}>FINAL EVALUATION</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.finalCard}
              onPress={() => navigation.navigate('SkillFinalAssessment', {
                skillId: skill.id,
                skillTitle: skill.title,
              })}
            >
              <View style={styles.finalLeft}>
                <View style={styles.finalIcon}>
                  <Ionicons name="trophy" size={22} color="#fff" />
                </View>
                <View>
                  <Text style={styles.finalKicker}>Complete the Program</Text>
                  <Text style={styles.finalTitle}>Final Assessment</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 48 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  pageSub: { fontSize: 13, color: COLORS.gray, marginTop: 4, marginBottom: 18 },

  selectorCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  selectorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  selectorHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#E6F1FA', justifyContent: 'center', alignItems: 'center' },
  selectorLabel: { fontSize: 10, fontWeight: '700', color: COLORS.gray, letterSpacing: 0.8 },
  selectorPeriod: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  navBtns: { flexDirection: 'row', gap: 8 },
  navBtn: { width: 34, height: 34, borderRadius: 9, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  monthChip: { width: '22%', flexGrow: 1, paddingVertical: 9, borderRadius: 11, backgroundColor: '#F1F5F8', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 3 },
  monthChipActive: { backgroundColor: COLORS.primary },
  monthChipLocked: { backgroundColor: '#F8FAFB' },
  monthChipText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  monthChipTextActive: { color: '#fff' },
  monthChipTextLocked: { color: '#C5CCD3' },

  centerBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  muted: { color: COLORS.gray, fontSize: 13 },

  emptyCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 32, alignItems: 'center', marginTop: 8 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F1F5F8', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.gray, textAlign: 'center', lineHeight: 20 },

  skillCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 22, marginBottom: 22, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  skillCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  periodBadge: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  periodBadgeText: { color: '#DCEBF6', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  skillTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  skillDesc: { color: '#BFD8EA', fontSize: 13, lineHeight: 20 },
  trophyWrap: { width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', marginLeft: 14 },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: COLORS.gray, letterSpacing: 1 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },

  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  weekCard: { width: '47%', flexGrow: 1, borderRadius: 18, padding: 16 },
  weekCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  weekNumBubble: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  weekNum: { fontSize: 15, fontWeight: '800' },
  weekKicker: { fontSize: 10, fontWeight: '800', color: COLORS.gray, letterSpacing: 0.8, marginBottom: 2 },
  weekCardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  finalCard: { backgroundColor: COLORS.primary, borderRadius: 18, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 10, elevation: 3 },
  finalLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  finalIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  finalKicker: { color: '#BFD8EA', fontSize: 12, marginBottom: 2 },
  finalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
