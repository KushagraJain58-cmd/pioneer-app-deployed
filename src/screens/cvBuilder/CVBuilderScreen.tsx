import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyProfile } from '../../lib/api';

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

/* ---------- Same theme + layout options as the client ---------- */
const THEME_OPTIONS = [
  { name: 'Indigo', primary: '#4F46E5', accent: '#EEF2FF' },
  { name: 'Slate', primary: '#0F172A', accent: '#F1F5F9' },
  { name: 'Emerald', primary: '#059669', accent: '#ECFDF5' },
] as const;

const LAYOUT_OPTIONS = ['Classic', 'Modern', 'Compact'] as const;

interface CvData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  classGrade: string;
  schoolName: string;
  boardScores: string;
  subjects: string;
  academicAchievements: string;
  coCurricularAchievements: string;
  careerObjective: string;
  theme: (typeof THEME_OPTIONS)[number];
  layoutStyle: (typeof LAYOUT_OPTIONS)[number];
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: 'person-outline' as const },
  { id: 2, title: 'Academics', icon: 'school-outline' as const },
  { id: 3, title: 'Achievements', icon: 'ribbon-outline' as const },
  { id: 4, title: 'Preview', icon: 'color-palette-outline' as const },
  { id: 5, title: 'Download', icon: 'checkmark-done-outline' as const },
];

const emptyCv = (): CvData => ({
  fullName: '', email: '', phone: '', location: '', classGrade: '',
  schoolName: '', boardScores: '', subjects: '',
  academicAchievements: '', coCurricularAchievements: '', careerObjective: '',
  theme: THEME_OPTIONS[0],
  layoutStyle: 'Modern',
});

/* ---------- Field components ---------- */
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.faint}
      />
    </View>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.faint}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );
}

/* ---------- Live-editable preview card (mirrors the client's editable preview) ---------- */
function PreviewCard({ cv, update }: { cv: CvData; update: (field: keyof CvData, value: string) => void }) {
  const compact = cv.layoutStyle === 'Compact';
  return (
    <View style={[styles.previewCard, compact && styles.previewCardCompact]}>
      <View style={[styles.previewHead, { backgroundColor: cv.theme.accent }]}>
        <TextInput
          style={[styles.previewName, { color: cv.theme.primary }]}
          value={cv.fullName}
          onChangeText={(v) => update('fullName', v)}
          placeholder="Your Full Name"
          placeholderTextColor={`${cv.theme.primary}88`}
        />
        <TextInput
          style={styles.previewGrade}
          value={cv.classGrade}
          onChangeText={(v) => update('classGrade', v)}
          placeholder="CLASS / GRADE"
          placeholderTextColor={COLORS.gray}
        />
        <TextInput
          style={styles.previewObjective}
          value={cv.careerObjective}
          onChangeText={(v) => update('careerObjective', v)}
          placeholder="Add your career objective or professional summary"
          placeholderTextColor={COLORS.faint}
          multiline
        />
        <View style={styles.previewContactBox}>
          <Text style={styles.previewContactText}>{cv.email || '—'}</Text>
          <Text style={styles.previewContactText}>{cv.phone || '—'}</Text>
          <Text style={styles.previewContactText}>{cv.location || '—'}</Text>
        </View>
      </View>

      <View style={styles.previewBody}>
        <View style={styles.previewSection}>
          <Text style={[styles.previewSectionTitle, { color: cv.theme.primary }]}>Academics</Text>
          <Text style={styles.previewSchool}>{cv.schoolName || 'Add your school name'}</Text>
          <Text style={styles.previewSmall}>{cv.boardScores || 'Add your board scores or academic summary'}</Text>
          <Text style={styles.previewSmall}>{cv.subjects || 'Add your core subjects'}</Text>
        </View>

        <View style={styles.previewSection}>
          <Text style={[styles.previewSectionTitle, { color: cv.theme.primary }]}>Achievements</Text>
          <TextInput
            style={styles.previewInlineArea}
            value={cv.academicAchievements}
            onChangeText={(v) => update('academicAchievements', v)}
            placeholder="Add academic achievements"
            placeholderTextColor={COLORS.faint}
            multiline
          />
          <View style={styles.previewDivider} />
          <TextInput
            style={styles.previewInlineArea}
            value={cv.coCurricularAchievements}
            onChangeText={(v) => update('coCurricularAchievements', v)}
            placeholder="Add co-curricular achievements"
            placeholderTextColor={COLORS.faint}
            multiline
          />
        </View>
      </View>
    </View>
  );
}

const escapeHtml = (s: string) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

const buildCvHtml = (cv: CvData) => `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; margin: 0; color: #1e293b; }
  .head { background: ${cv.theme.accent}; padding: 32px; }
  .name { font-size: 32px; font-weight: 800; color: ${cv.theme.primary}; margin: 0; }
  .grade { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #475569; margin-top: 8px; }
  .objective { font-size: 13px; line-height: 1.6; color: #334155; margin-top: 14px; max-width: 420px; }
  .contact { margin-top: 18px; background: rgba(255,255,255,0.8); border-radius: 16px; padding: 14px 18px; display: inline-block; font-size: 13px; color: #334155; }
  .contact div { margin: 2px 0; }
  .body { display: ${cv.layoutStyle === 'Modern' ? 'grid' : 'block'}; grid-template-columns: 1fr 1fr; gap: 20px; padding: 32px; }
  .section { background: #f8fafc; border-radius: 20px; padding: 22px; margin-bottom: ${cv.layoutStyle === 'Modern' ? '0' : '20px'}; }
  .section h3 { font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: ${cv.theme.primary}; margin: 0 0 12px; }
  .section p { font-size: 13px; line-height: 1.7; color: #334155; margin: 6px 0; }
  .school { font-size: 17px; font-weight: 700; color: #0f172a; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 14px 0; }
</style>
</head>
<body>
  <div class="head">
    <p class="name">${escapeHtml(cv.fullName) || 'Your Full Name'}</p>
    <p class="grade">${escapeHtml(cv.classGrade) || ''}</p>
    <p class="objective">${escapeHtml(cv.careerObjective) || ''}</p>
    <div class="contact">
      <div>${escapeHtml(cv.email)}</div>
      <div>${escapeHtml(cv.phone)}</div>
      <div>${escapeHtml(cv.location)}</div>
    </div>
  </div>
  <div class="body">
    <div class="section">
      <h3>Academics</h3>
      <p class="school">${escapeHtml(cv.schoolName) || 'Add your school name'}</p>
      <p>${escapeHtml(cv.boardScores) || ''}</p>
      <p>${escapeHtml(cv.subjects) || ''}</p>
    </div>
    <div class="section">
      <h3>Achievements</h3>
      <p>${escapeHtml(cv.academicAchievements) || ''}</p>
      <hr/>
      <p>${escapeHtml(cv.coCurricularAchievements) || ''}</p>
    </div>
  </div>
</body>
</html>`;

export default function CVBuilderScreen() {
  const [activeStep, setActiveStep] = useState(1);
  const [cv, setCv] = useState<CvData>(emptyCv());
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        const p = res.data?.data || {};
        const city = p.addressInfo?.city, state = p.addressInfo?.state;
        const location = [city, state].filter(Boolean).join(', ');
        const classGrade = p.academicInfo?.classGrade
          ? `${p.academicInfo.classGrade}${p.academicInfo?.section ? ` - Section ${p.academicInfo.section}` : ''}`
          : '';
        setCv((prev) => ({
          ...prev,
          fullName: p.personalInfo?.fullName || prev.fullName,
          email: p.contactInfo?.studentEmail || prev.email,
          phone: p.contactInfo?.mobileNumber || prev.phone,
          location: location || prev.location,
          classGrade: classGrade || prev.classGrade,
        }));
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const update = (field: keyof CvData, value: any) => setCv((prev) => ({ ...prev, [field]: value }));

  const html = useMemo(() => buildCvHtml(cv), [cv]);

  const handleDownload = async () => {
    setExporting(true);
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save or share your CV' });
      } else {
        Alert.alert('PDF ready', `Saved to: ${uri}`);
      }
    } catch {
      Alert.alert('Error', 'Could not generate the PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const goNext = () => setActiveStep((s) => Math.min(5, s + 1));
  const goBack = () => setActiveStep((s) => Math.max(1, s - 1));

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <View>
            <Field label="Full Name" value={cv.fullName} onChange={(v) => update('fullName', v)} placeholder="Enter your full name" />
            <Field label="Contact Number" value={cv.phone} onChange={(v) => update('phone', v)} placeholder="Enter phone number" />
            <Field label="Email Address" value={cv.email} onChange={(v) => update('email', v)} placeholder="Enter email" />
            <Field label="Class / Grade" value={cv.classGrade} onChange={(v) => update('classGrade', v)} placeholder="Example: 12th Grade" />
            <Field label="Location" value={cv.location} onChange={(v) => update('location', v)} placeholder="City, State" />
          </View>
        );
      case 2:
        return (
          <View>
            <Field label="School Details" value={cv.schoolName} onChange={(v) => update('schoolName', v)} placeholder="School name" />
            <Field label="Board Scores" value={cv.boardScores} onChange={(v) => update('boardScores', v)} placeholder="Board marks or GPA" />
            <Field label="Subjects" value={cv.subjects} onChange={(v) => update('subjects', v)} placeholder="List major subjects" />
          </View>
        );
      case 3:
        return (
          <View>
            <TextAreaField label="Academic Achievements" value={cv.academicAchievements} onChange={(v) => update('academicAchievements', v)} placeholder="Mention academic awards, Olympiads, research, or project work" />
            <TextAreaField label="Co-curricular Activities" value={cv.coCurricularAchievements} onChange={(v) => update('coCurricularAchievements', v)} placeholder="Mention leadership, clubs, sports, arts, volunteering, or competitions" />
            <TextAreaField label="Career Objective" value={cv.careerObjective} onChange={(v) => update('careerObjective', v)} placeholder="Write a concise professional summary" />
          </View>
        );
      case 4:
        return (
          <View>
            <View style={styles.customizeCard}>
              <Text style={styles.customizeLabel}>Customize CV</Text>

              <Text style={styles.customizeSub}>Colors</Text>
              <View style={{ gap: 10, marginTop: 10 }}>
                {THEME_OPTIONS.map((theme) => {
                  const active = cv.theme.name === theme.name;
                  return (
                    <TouchableOpacity
                      key={theme.name}
                      activeOpacity={0.85}
                      style={[styles.themeRow, active && styles.themeRowActive]}
                      onPress={() => update('theme', theme)}
                    >
                      <Text style={styles.themeRowText}>{theme.name}</Text>
                      <View style={[styles.themeSwatch, { backgroundColor: theme.primary }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.customizeSub, { marginTop: 20 }]}>Layout Style</Text>
              <View style={styles.layoutRow}>
                {LAYOUT_OPTIONS.map((layout) => {
                  const active = cv.layoutStyle === layout;
                  return (
                    <TouchableOpacity
                      key={layout}
                      activeOpacity={0.85}
                      style={[styles.layoutPill, active && styles.layoutPillActive]}
                      onPress={() => update('layoutStyle', layout)}
                    >
                      <Text style={[styles.layoutPillText, active && styles.layoutPillTextActive]}>{layout}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.customizeTip}>Tip: Edit your name, objective, and achievement text directly in the live preview below.</Text>
            </View>

            <PreviewCard cv={cv} update={update} />
          </View>
        );
      case 5:
        return (
          <View>
            <PreviewCard cv={cv} update={update} />
            <View style={styles.exportCard}>
              <Text style={styles.exportEyebrow}>EXPORT CV</Text>
              <Text style={styles.exportTitle}>Download your polished CV as a professional PDF.</Text>
              <Text style={styles.exportBody}>
                The preview above is rendered exactly into the exported PDF with your selected color theme and layout style.
              </Text>
              <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.9} onPress={handleDownload} disabled={exporting}>
                {exporting ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.downloadText}>Download PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>5-STEP GUIDED WIZARD</Text>
        <Text style={styles.title}>Create Your Professional CV</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsRow}>
          {STEPS.map((step) => {
            const active = activeStep === step.id;
            return (
              <TouchableOpacity
                key={step.id}
                activeOpacity={0.85}
                style={[styles.stepChip, active && styles.stepChipActive]}
                onPress={() => setActiveStep(step.id)}
              >
                <Ionicons name={step.icon} size={13} color={active ? '#fff' : COLORS.gray} />
                <Text style={[styles.stepChipText, active && styles.stepChipTextActive]}>{step.id}. {step.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.stepBody}>{renderStep()}</View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, activeStep === 1 && styles.navBtnDisabled]}
            onPress={goBack}
            disabled={activeStep === 1}
          >
            <Ionicons name="arrow-back" size={16} color={activeStep === 1 ? COLORS.faint : COLORS.text} />
            <Text style={[styles.navBtnText, activeStep === 1 && styles.navBtnTextDisabled]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtnPrimary, activeStep === 5 && styles.navBtnDisabled]}
            onPress={goNext}
            disabled={activeStep === 5}
          >
            <Text style={styles.navBtnPrimaryText}>Next Step</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_SHADOW = {
  shadowColor: '#0A2A3F',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 40 },
  eyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 1.4 },
  title: { fontSize: 23, fontWeight: '800', color: COLORS.text, marginTop: 6, marginBottom: 16, letterSpacing: -0.4 },

  stepsRow: { gap: 8, paddingBottom: 18 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  stepChipActive: { backgroundColor: COLORS.slate },
  stepChipText: { fontSize: 11.5, fontWeight: '700', color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.4 },
  stepChipTextActive: { color: '#fff' },

  stepBody: { minHeight: 200 },

  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  textarea: { minHeight: 96 },

  customizeCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 18, borderWidth: 1, borderColor: COLORS.border },
  customizeLabel: { fontSize: 11, fontWeight: '800', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 1.2 },
  customizeSub: { fontSize: 13.5, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12 },
  themeRowActive: { borderColor: COLORS.primary },
  themeRowText: { fontSize: 13.5, fontWeight: '700', color: COLORS.text },
  themeSwatch: { width: 20, height: 20, borderRadius: 10 },
  layoutRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  layoutPill: { backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1.5, borderColor: COLORS.border },
  layoutPillActive: { backgroundColor: COLORS.slate, borderColor: COLORS.slate },
  layoutPillText: { fontSize: 13, fontWeight: '700', color: COLORS.gray },
  layoutPillTextActive: { color: '#fff' },
  customizeTip: { fontSize: 11.5, color: COLORS.faint, lineHeight: 17, marginTop: 18 },

  /* Preview card (mirrors client editable preview) */
  previewCard: { backgroundColor: COLORS.white, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', ...CARD_SHADOW },
  previewCardCompact: { maxWidth: '100%' },
  previewHead: { padding: 22 },
  previewName: { fontSize: 26, fontWeight: '800', padding: 0, letterSpacing: -0.4 },
  previewGrade: { fontSize: 11, fontWeight: '700', color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 8, padding: 0 },
  previewObjective: { fontSize: 13, lineHeight: 20, color: COLORS.text, marginTop: 12, padding: 0, minHeight: 40 },
  previewContactBox: { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 16, padding: 14, marginTop: 16, alignSelf: 'flex-start' },
  previewContactText: { fontSize: 12.5, color: COLORS.text, marginBottom: 2 },
  previewBody: { padding: 20, gap: 16 },
  previewSection: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18 },
  previewSectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 12 },
  previewSchool: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  previewSmall: { fontSize: 12.5, color: COLORS.gray, marginTop: 6, lineHeight: 18 },
  previewInlineArea: { fontSize: 12.5, color: COLORS.text, lineHeight: 19, padding: 0, minHeight: 40 },
  previewDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },

  /* Export */
  exportCard: { backgroundColor: COLORS.slate, borderRadius: 22, padding: 20, marginTop: 18 },
  exportEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.accent, letterSpacing: 1.4 },
  exportTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 10, lineHeight: 27, letterSpacing: -0.3 },
  exportBody: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 10, lineHeight: 19 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, marginTop: 18 },
  downloadText: { fontSize: 14, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.6 },

  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, paddingTop: 18, borderTopWidth: 1, borderTopColor: COLORS.border },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 13.5, fontWeight: '700', color: COLORS.text },
  navBtnTextDisabled: { color: COLORS.faint },
  navBtnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.slate, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  navBtnPrimaryText: { fontSize: 13.5, fontWeight: '800', color: '#fff' },
});
