import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const DC = {
  primary: '#004877',
  accent: '#3BBEE8',
  bg: '#F6FCFF',
  white: '#FFFFFF',
  text: '#12303F',
  gray: '#6B7A86',
  faint: '#9AA7B1',
  border: '#E4EDF3',
  surface: '#F0F7FB',
  red: '#E5484D',
  amber: '#D97706',
};

export interface Scale {
  value: number;
  label: string;
}

/* Numbered question card */
export function QCard({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <View style={s.qcard}>
      <View style={s.qhead}>
        <View style={s.qnum}><Text style={s.qnumText}>{index}</Text></View>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </View>
  );
}

export function QText({ children, india }: { children: React.ReactNode; india?: boolean }) {
  return (
    <Text style={s.qtext}>
      {children}
      {india ? <Text style={s.star}>  ★</Text> : null}
    </Text>
  );
}

/* Horizontal labeled scale (Likert-style) */
export function ScaleRow({ scale, value, onChange }: { scale: Scale[]; value?: number; onChange: (v: number) => void }) {
  return (
    <View style={s.scaleRow}>
      {scale.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.85}
            style={[s.scalePill, active && s.scalePillActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[s.scaleText, active && s.scaleTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* Numeric semantic-differential (1..5 dots between a left/right label) */
export function DifferentialRow({ left, right, value, onChange }: { left: string; right: string; value?: number; onChange: (v: number) => void }) {
  return (
    <View>
      <View style={s.diffLabels}>
        <Text style={[s.diffLabel, { textAlign: 'left' }]}>{left}</Text>
        <Text style={[s.diffLabel, { textAlign: 'right' }]}>{right}</Text>
      </View>
      <View style={s.diffDots}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <TouchableOpacity key={n} activeOpacity={0.85} style={[s.diffDot, active && s.diffDotActive]} onPress={() => onChange(n)}>
              {active && <View style={s.diffDotInner} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* Two big stacked A/B option buttons */
export function ForcedChoice({ value, onChange, optionA, optionB }: { value?: string; onChange: (v: string) => void; optionA: string; optionB: string }) {
  const opts: [string, string][] = [['A', optionA], ['B', optionB]];
  return (
    <View style={{ gap: 10 }}>
      {opts.map(([k, label]) => {
        const active = value === k;
        return (
          <TouchableOpacity key={k} activeOpacity={0.85} style={[s.fc, active && s.fcActive]} onPress={() => onChange(k)}>
            <View style={[s.fcKey, active && s.fcKeyActive]}>
              <Text style={[s.fcKeyText, active && s.fcKeyTextActive]}>{k}</Text>
            </View>
            <Text style={[s.fcText, active && s.fcTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* Multi-select chips (checkbox-group replacement) */
export function MultiChipSelect({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (v: string) => void }) {
  return (
    <View style={s.chips}>
      {options.map((o) => {
        const active = values.includes(o);
        return (
          <TouchableOpacity key={o} activeOpacity={0.85} style={[s.chip, active && s.chipActive]} onPress={() => onToggle(o)}>
            <Text style={[s.chipText, active && s.chipTextActive]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* Selectable chips (dropdown replacement) */
export function ChipSelect({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <View style={s.chips}>
      {options.map((o) => {
        const active = value === o;
        return (
          <TouchableOpacity key={o} activeOpacity={0.85} style={[s.chip, active && s.chipActive]} onPress={() => onChange(o)}>
            <Text style={[s.chipText, active && s.chipTextActive]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function NumField({ value, onChange, placeholder }: { value?: number; onChange: (v: number | undefined) => void; placeholder?: string }) {
  return (
    <TextInput
      style={s.num}
      keyboardType="number-pad"
      value={value === undefined || value === null ? '' : String(value)}
      onChangeText={(t) => {
        const n = t.replace(/[^0-9]/g, '');
        onChange(n === '' ? undefined : Number(n));
      }}
      placeholder={placeholder}
      placeholderTextColor={DC.faint}
    />
  );
}

export function TextField({ value, onChange, placeholder, rows = 3 }: { value?: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <TextInput
      style={[s.textArea, { minHeight: rows * 22 + 20 }]}
      multiline
      value={value || ''}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={DC.faint}
      textAlignVertical="top"
    />
  );
}

/* Situational-judgment block: pick Most-likely and Least-likely once each */
export interface SjtValue { mostLikely?: string; leastLikely?: string }
export function SJTBlock({
  index,
  title,
  classFocus,
  scenario,
  options,
  value,
  onChange,
}: {
  index: number;
  title: string;
  classFocus?: string;
  scenario: string;
  options: { key: string; text: string }[];
  value?: SjtValue;
  onChange: (v: SjtValue) => void;
}) {
  const cur = value || {};
  const setMost = (k: string) => onChange({ mostLikely: k, leastLikely: cur.leastLikely === k ? undefined : cur.leastLikely });
  const setLeast = (k: string) => onChange({ leastLikely: k, mostLikely: cur.mostLikely === k ? undefined : cur.mostLikely });

  return (
    <View style={s.sjt}>
      <View style={s.sjtHead}>
        <Text style={s.sjtTitle}>{index}. {title}</Text>
        {!!classFocus && <Text style={s.sjtFocus}>{classFocus}</Text>}
      </View>
      <Text style={s.sjtScenario}>{scenario}</Text>
      {options.map((opt) => {
        const most = cur.mostLikely === opt.key;
        const least = cur.leastLikely === opt.key;
        return (
          <View key={opt.key} style={s.sjtOpt}>
            <Text style={s.sjtOptText}><Text style={s.sjtOptKey}>{opt.key}. </Text>{opt.text}</Text>
            <View style={s.sjtToggles}>
              <TouchableOpacity style={[s.sjtTog, most && s.sjtMost]} onPress={() => setMost(opt.key)}>
                <Text style={[s.sjtTogText, most && s.sjtTogTextOn]}>Most</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.sjtTog, least && s.sjtLeast]} onPress={() => setLeast(opt.key)}>
                <Text style={[s.sjtTogText, least && s.sjtTogTextOn]}>Least</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function CheckRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={s.checkRow} onPress={onToggle}>
      <View style={[s.checkBox, checked && s.checkBoxOn]}>
        {checked && <Text style={s.checkMark}>✓</Text>}
      </View>
      <Text style={s.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function InfoNote({ children, tone = 'amber' }: { children: React.ReactNode; tone?: 'amber' | 'blue' }) {
  return (
    <View style={[s.note, tone === 'blue' ? s.noteBlue : s.noteAmber]}>
      <Text style={[s.noteText, tone === 'blue' ? s.noteTextBlue : s.noteTextAmber]}>{children}</Text>
    </View>
  );
}

/* Rank the given items 1..maxRank (each rank used once). ranks maps key -> rank. */
export function RankRow({
  label, description, rank, maxRank = 5, isUsed, onPick,
}: {
  label: string;
  description?: string;
  rank?: number;
  maxRank?: number;
  isUsed: (r: number) => boolean;
  onPick: (r: number) => void;
}) {
  return (
    <View style={s.rankRow}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={s.rankLabel}>{label}</Text>
        {!!description && <Text style={s.rankDesc}>{description}</Text>}
      </View>
      <View style={s.rankPills}>
        {Array.from({ length: maxRank }, (_, i) => i + 1).map((r) => {
          const active = rank === r;
          const disabled = !active && isUsed(r);
          return (
            <TouchableOpacity
              key={r}
              disabled={disabled}
              style={[s.rankPill, active && s.rankPillActive, disabled && s.rankPillDisabled]}
              onPress={() => onPick(r)}
            >
              <Text style={[s.rankPillText, active && s.rankPillTextActive, disabled && s.rankPillTextDisabled]}>{r}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function PartHeading({ children }: { children: React.ReactNode }) {
  return <Text style={s.partHeading}>{children}</Text>;
}

export function ModuleIntro({ children }: { children: React.ReactNode }) {
  return <Text style={s.moduleIntro}>{children}</Text>;
}

const s = StyleSheet.create({
  qcard: { backgroundColor: DC.white, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: DC.border },
  qhead: { flexDirection: 'row', gap: 12 },
  qnum: { width: 26, height: 26, borderRadius: 13, backgroundColor: DC.primary, justifyContent: 'center', alignItems: 'center' },
  qnumText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  qtext: { fontSize: 14.5, color: DC.text, lineHeight: 21, fontWeight: '600', paddingTop: 2 },
  star: { color: DC.amber, fontWeight: '800' },

  scaleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  scalePill: { borderWidth: 1.5, borderColor: DC.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: DC.surface },
  scalePillActive: { backgroundColor: DC.primary, borderColor: DC.primary },
  scaleText: { fontSize: 12.5, fontWeight: '700', color: DC.gray },
  scaleTextActive: { color: '#fff' },

  diffLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 10 },
  diffLabel: { flex: 1, fontSize: 12.5, color: DC.text, fontWeight: '600' },
  diffDots: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  diffDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: DC.border, justifyContent: 'center', alignItems: 'center' },
  diffDotActive: { borderColor: DC.primary },
  diffDotInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: DC.primary },

  fc: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: DC.border, borderRadius: 12, padding: 14, backgroundColor: DC.surface },
  fcActive: { borderColor: DC.primary, backgroundColor: '#E4F4FB' },
  fcKey: { width: 30, height: 30, borderRadius: 15, backgroundColor: DC.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: DC.border },
  fcKeyActive: { backgroundColor: DC.primary, borderColor: DC.primary },
  fcKeyText: { fontSize: 13, fontWeight: '800', color: DC.gray },
  fcKeyTextActive: { color: '#fff' },
  fcText: { flex: 1, fontSize: 14, color: DC.text, fontWeight: '600', lineHeight: 20 },
  fcTextActive: { color: DC.primary, fontWeight: '700' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: DC.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: DC.surface },
  chipActive: { backgroundColor: DC.primary, borderColor: DC.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: DC.gray },
  chipTextActive: { color: '#fff' },

  num: { borderWidth: 1.5, borderColor: DC.border, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, fontSize: 14, color: DC.text, backgroundColor: DC.white, minWidth: 64, textAlign: 'center' },
  textArea: { borderWidth: 1.5, borderColor: DC.border, borderRadius: 12, padding: 12, fontSize: 14, color: DC.text, backgroundColor: DC.white },

  sjt: { backgroundColor: DC.white, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: DC.border },
  sjtHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 },
  sjtTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: DC.text },
  sjtFocus: { fontSize: 10.5, fontWeight: '700', color: DC.gray, backgroundColor: DC.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  sjtScenario: { fontSize: 13.5, color: DC.text, lineHeight: 20, backgroundColor: DC.surface, borderRadius: 10, padding: 12, marginBottom: 12 },
  sjtOpt: { borderTopWidth: 1, borderTopColor: DC.surface, paddingVertical: 12, gap: 10 },
  sjtOptText: { fontSize: 13.5, color: DC.text, lineHeight: 20 },
  sjtOptKey: { fontWeight: '800', color: DC.primary },
  sjtToggles: { flexDirection: 'row', gap: 8 },
  sjtTog: { borderWidth: 1.5, borderColor: DC.border, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16 },
  sjtMost: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  sjtLeast: { backgroundColor: '#FEE2E2', borderColor: DC.red },
  sjtTogText: { fontSize: 12, fontWeight: '800', color: DC.gray },
  sjtTogTextOn: { color: DC.text },

  partHeading: { fontSize: 15, fontWeight: '800', color: DC.text, marginTop: 18, marginBottom: 12 },
  moduleIntro: { fontSize: 13, color: DC.gray, lineHeight: 19, marginBottom: 14 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: DC.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: DC.border },
  checkBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: DC.faint, justifyContent: 'center', alignItems: 'center', backgroundColor: DC.white },
  checkBoxOn: { backgroundColor: DC.primary, borderColor: DC.primary },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '900' },
  checkLabel: { flex: 1, fontSize: 13.5, color: DC.text, fontWeight: '600', lineHeight: 19 },

  note: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 14 },
  noteAmber: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  noteBlue: { backgroundColor: '#E4F4FB', borderColor: '#BAE6FD' },
  noteText: { fontSize: 13, lineHeight: 19 },
  noteTextAmber: { color: '#92400E' },
  noteTextBlue: { color: '#075985' },

  rankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: DC.white, borderWidth: 1, borderColor: DC.border, borderRadius: 12, padding: 12, marginBottom: 8 },
  rankLabel: { fontSize: 14, fontWeight: '700', color: DC.text },
  rankDesc: { fontSize: 11.5, color: DC.gray, marginTop: 3, lineHeight: 16 },
  rankPills: { flexDirection: 'row', gap: 5 },
  rankPill: { width: 30, height: 30, borderRadius: 8, borderWidth: 1.5, borderColor: DC.border, backgroundColor: DC.surface, justifyContent: 'center', alignItems: 'center' },
  rankPillActive: { backgroundColor: DC.primary, borderColor: DC.primary },
  rankPillDisabled: { opacity: 0.4 },
  rankPillText: { fontSize: 12.5, fontWeight: '800', color: DC.gray },
  rankPillTextActive: { color: '#fff' },
  rankPillTextDisabled: { color: DC.faint },
});
