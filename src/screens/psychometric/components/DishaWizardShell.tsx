import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DC } from './dishaControls';

export interface WizardStep {
  id: string;
  code: string;
  name: string;
  optional?: boolean;
}
export interface StepProgress { done: number; total: number; optional?: boolean }

interface Props {
  title: string;
  steps: WizardStep[];
  stepIdx: number;
  setStepIdx: (i: number) => void;
  progress: Record<string, StepProgress>;
  submitting: boolean;
  onSubmit: () => void;
  onExit: () => void;
  children: React.ReactNode;
}

export default function DishaWizardShell({
  title, steps, stepIdx, setStepIdx, progress, submitting, onSubmit, onExit, children,
}: Props) {
  const step = steps[stepIdx];
  const cur = progress[step.id] || { done: 0, total: 0 };
  const pct = cur.total ? Math.round((cur.done / cur.total) * 100) : 0;
  const isLast = stepIdx === steps.length - 1;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.brand}>{title}</Text>
        <TouchableOpacity style={s.exitBtn} onPress={onExit}>
          <Ionicons name="close" size={16} color={DC.red} />
          <Text style={s.exitText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Step rail */}
      <View style={s.rail}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.railContent}>
          {steps.map((st, idx) => {
            const sp = progress[st.id] || { done: 0, total: 0 };
            const complete = sp.total > 0 && sp.done >= sp.total;
            const active = idx === stepIdx;
            return (
              <TouchableOpacity
                key={st.id}
                style={[s.railChip, active ? s.railActive : complete && s.railComplete]}
                onPress={() => setStepIdx(idx)}
              >
                {complete && !active && <Ionicons name="checkmark-circle" size={13} color="#16A34A" />}
                <Text style={[s.railText, active && s.railTextActive, complete && !active && s.railTextComplete]}>
                  {st.code} · {st.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Module title + progress */}
      <View style={s.modHead}>
        <View style={s.modTitleRow}>
          <Text style={s.modTitle} numberOfLines={2}>Module {step.code}: {step.name}</Text>
          <Text style={s.modCount}>{cur.done}/{cur.total}{cur.optional ? ' (optional)' : ''}</Text>
        </View>
        <View style={s.track}><View style={[s.fill, { width: `${pct}%` }]} /></View>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.navBtn, stepIdx === 0 && s.navDisabled]}
          disabled={stepIdx === 0}
          onPress={() => setStepIdx(Math.max(0, stepIdx - 1))}
        >
          <Ionicons name="chevron-back" size={16} color={stepIdx === 0 ? DC.faint : DC.primary} />
          <Text style={[s.navText, stepIdx === 0 && s.navTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        <Text style={s.stepCount}>Step {stepIdx + 1} of {steps.length}</Text>

        {isLast ? (
          <TouchableOpacity style={s.primaryBtn} onPress={onSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.primaryText}>Submit</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.primaryBtn} onPress={() => setStepIdx(Math.min(steps.length - 1, stepIdx + 1))}>
            <Text style={s.primaryText}>Next</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DC.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: DC.white, borderBottomWidth: 1, borderBottomColor: DC.border },
  brand: { fontSize: 19, fontWeight: '800', color: DC.primary, letterSpacing: 0.3 },
  exitBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#FADADC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  exitText: { fontSize: 13, fontWeight: '700', color: DC.red },

  rail: { backgroundColor: DC.white, borderBottomWidth: 1, borderBottomColor: DC.border },
  railContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  railChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: DC.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  railActive: { backgroundColor: DC.primary },
  railComplete: { backgroundColor: '#DCFCE7' },
  railText: { fontSize: 12, fontWeight: '700', color: DC.gray },
  railTextActive: { color: '#fff' },
  railTextComplete: { color: '#15803D' },

  modHead: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  modTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  modTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: DC.text, letterSpacing: -0.3 },
  modCount: { fontSize: 12.5, color: DC.gray, fontWeight: '600', paddingTop: 3 },
  track: { height: 6, borderRadius: 3, backgroundColor: DC.border, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 3, backgroundColor: DC.primary },

  body: { padding: 16, paddingBottom: 32 },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: DC.white, borderTopWidth: 1, borderTopColor: DC.border },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 8 },
  navDisabled: { opacity: 0.5 },
  navText: { fontSize: 13.5, fontWeight: '700', color: DC.primary },
  navTextDisabled: { color: DC.faint },
  stepCount: { fontSize: 12, color: DC.faint, fontWeight: '600' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: DC.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11, minWidth: 96, justifyContent: 'center' },
  primaryText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
