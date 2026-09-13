import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { changeMyPassword, getMyProfile, updateMyProfile } from '../../lib/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  primary: '#004877',
  primaryDeep: '#013152',
  accent: '#3BBEE8',
  bg: '#F6FCFF',
  white: '#FFFFFF',
  text: '#12303F',
  gray: '#6B7A86',
  faint: '#9AA7B1',
  border: '#E4EDF3',
  surface: '#F0F7FB',
  slate: '#0E2635',
  green: '#0FA968',
  red: '#E5484D',
};

type IonName = React.ComponentProps<typeof Ionicons>['name'];

interface FieldDef {
  name: string;
  label: string;
  keyboard?: 'default' | 'phone-pad' | 'email-address';
  options?: string[];
  date?: boolean;
}

interface SectionDef {
  key: string;
  title: string;
  subtitle: string;
  icon: IonName;
  tint: string;
  defaultOpen?: boolean;
  fields: FieldDef[];
}

const SECTIONS: SectionDef[] = [
  {
    key: 'personalInfo',
    title: 'Personal Information',
    subtitle: 'Full name, date of birth, gender',
    icon: 'id-card-outline',
    tint: COLORS.primary,
    defaultOpen: true,
    fields: [
      { name: 'fullName', label: 'Full Name' },
      { name: 'dateOfBirth', label: 'Date of Birth', date: true },
      { name: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other'] },
    ],
  },
  {
    key: 'academicInfo',
    title: 'Academic Information',
    subtitle: 'Grade, section, roll number',
    icon: 'school-outline',
    tint: COLORS.primary,
    defaultOpen: true,
    fields: [
      { name: 'classGrade', label: 'Class / Grade' },
      { name: 'section', label: 'Section' },
      { name: 'rollNumber', label: 'Roll Number' },
    ],
  },
  {
    key: 'addressInfo',
    title: 'Address Information',
    subtitle: 'State, city, address',
    icon: 'location-outline',
    tint: COLORS.primary,
    fields: [
      { name: 'state', label: 'State' },
      { name: 'city', label: 'City' },
      { name: 'address', label: 'Full Address' },
    ],
  },
  {
    key: 'contactInfo',
    title: 'Contact Information',
    subtitle: 'Mobile number, email address',
    icon: 'call-outline',
    tint: COLORS.primary,
    fields: [
      { name: 'mobileNumber', label: 'Mobile Number', keyboard: 'phone-pad' },
      { name: 'studentEmail', label: 'Email Address', keyboard: 'email-address' },
    ],
  },
  {
    key: 'familyInfo',
    title: 'Family Information',
    subtitle: 'Parents and guardian details',
    icon: 'people-outline',
    tint: COLORS.primary,
    fields: [
      { name: 'fatherName', label: "Father's Name" },
      { name: 'motherName', label: "Mother's Name" },
      { name: 'guardianName', label: 'Guardian Name' },
      { name: 'parentMobile', label: 'Parent Mobile', keyboard: 'phone-pad' },
      { name: 'parentEmail', label: 'Parent Email', keyboard: 'email-address' },
      { name: 'parentOccupation', label: 'Parent Occupation' },
    ],
  },
];

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    SECTIONS.reduce((acc, s) => ({ ...acc, [s.key]: !!s.defaultOpen }), {})
  );
  const [editSection, setEditSection] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data?.data || {});
    } catch {
      // keep whatever we have; auth user still powers the header
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const toggleSection = (key: string) => {
    animate();
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startEdit = (key: string) => {
    animate();
    setOpenSections((prev) => ({ ...prev, [key]: true }));
    setEditSection(key);
    setForm({ [key]: { ...(profile[key] || {}) } });
  };

  const cancelEdit = () => {
    animate();
    setEditSection(null);
    setForm({});
  };

  const handleChange = (section: string, field: string, value: string) =>
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      const res = await updateMyProfile({ [section]: form[section] });
      if (res.data?.status) {
        setProfile((prev: any) => ({ ...prev, [section]: form[section] }));
        setEditSection(null);
        setForm({});
        Alert.alert('Saved', 'Profile updated successfully.');
        loadProfile();
      } else {
        Alert.alert('Failed', res.data?.message || 'Failed to update.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (pwData.newPassword !== pwData.confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    if (pwData.newPassword.length < 6) {
      Alert.alert('Too short', 'Password must be at least 6 characters.');
      return;
    }
    setPwSaving(true);
    try {
      const res = await changeMyPassword({
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      });
      if (res.data?.status) {
        Alert.alert('Done', 'Password changed successfully.');
        setPwOpen(false);
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        Alert.alert('Failed', res.data?.message || 'Failed to change password.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const fullName = profile.personalInfo?.fullName || user?.firstName || 'Student';
  const initial = fullName.charAt(0)?.toUpperCase() || 'S';
  const academic = profile.academicInfo || {};
  const metaLine = [
    academic.classGrade && `Grade ${academic.classGrade}`,
    academic.section && `Sec ${academic.section}`,
    academic.rollNumber && `Roll ${academic.rollNumber}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const displayValue = (sectionKey: string, f: FieldDef) => {
    const raw = profile[sectionKey]?.[f.name];
    return raw ? (f.date ? String(raw).slice(0, 10) : String(raw)) : '—';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My Profile</Text>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.heroName}>{fullName}</Text>
          {!!metaLine && <Text style={styles.heroMeta}>{metaLine}</Text>}
          {!!profile.studentId && (
            <View style={styles.idChip}>
              <Text style={styles.idChipText}>ID: {profile.studentId}</Text>
            </View>
          )}
        </View>

        {/* Editable sections */}
        {SECTIONS.map((section) => {
          const open = openSections[section.key];
          const isEditing = editSection === section.key;
          return (
            <View key={section.key} style={styles.card}>
              <TouchableOpacity style={styles.cardHead} activeOpacity={0.7} onPress={() => toggleSection(section.key)}>
                <View style={styles.cardHeadLeft}>
                  <View style={[styles.cardIcon, { backgroundColor: section.tint }]}>
                    <Ionicons name={section.icon} size={16} color="#fff" />
                  </View>
                  <Text style={styles.cardTitle}>{section.title}</Text>
                </View>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.faint} />
              </TouchableOpacity>

              {open && (
                <View style={styles.cardBody}>
                  <View style={styles.subtitleRow}>
                    <Text style={styles.subtitle}>{section.subtitle}</Text>
                    {!isEditing && (
                      <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(section.key)}>
                        <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {section.fields.map((f) => {
                    const editing = isEditing;
                    const editVal = form[section.key]?.[f.name] ?? '';
                    const displayVal = displayValue(section.key, f);
                    return (
                      <View key={f.name} style={styles.field}>
                        <Text style={styles.fieldLabel}>{f.label}</Text>
                        {editing ? (
                          f.options ? (
                            <View style={styles.optionRow}>
                              {f.options.map((opt) => {
                                const active = editVal === opt;
                                return (
                                  <TouchableOpacity
                                    key={opt}
                                    style={[styles.optionPill, active && styles.optionPillActive]}
                                    onPress={() => handleChange(section.key, f.name, opt)}
                                  >
                                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          ) : (
                            <TextInput
                              style={styles.input}
                              value={f.date ? String(editVal).slice(0, 10) : String(editVal)}
                              onChangeText={(v) => handleChange(section.key, f.name, v)}
                              keyboardType={f.keyboard || 'default'}
                              placeholder={f.date ? 'YYYY-MM-DD' : f.label}
                              placeholderTextColor={COLORS.faint}
                              autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'sentences'}
                            />
                          )
                        ) : (
                          <Text style={[styles.fieldValue, displayVal === '—' && styles.fieldEmpty]}>{displayVal}</Text>
                        )}
                      </View>
                    );
                  })}

                  {isEditing && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(section.key)} disabled={saving}>
                        {saving ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                            <Text style={styles.saveText}>Save Changes</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit} disabled={saving}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Exam Results (read-only) */}
        {Array.isArray(profile.examResults) && profile.examResults.length > 0 && (
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardHead} activeOpacity={0.7} onPress={() => toggleSection('examResults')}>
              <View style={styles.cardHeadLeft}>
                <View style={[styles.cardIcon, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name="ribbon-outline" size={16} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Exam Results</Text>
              </View>
              <Ionicons name={openSections['examResults'] ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.faint} />
            </TouchableOpacity>
            {openSections['examResults'] && (
              <View style={styles.cardBody}>
                <Text style={styles.subtitle}>Academic performance records (read-only)</Text>
                <View style={{ gap: 10, marginTop: 12 }}>
                  {profile.examResults.map((exam: any, i: number) => (
                    <View key={i} style={styles.examRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.examType}>
                          {exam.examType} · {exam.academicYear}
                        </Text>
                        <Text style={styles.examMarks}>
                          {exam.totalMarks} / {exam.maxTotalMarks} marks
                        </Text>
                        {exam.percentage !== undefined && (
                          <Text style={styles.examPct}>{Number(exam.percentage).toFixed(1)}%</Text>
                        )}
                      </View>
                      <View style={[styles.resultPill, exam.resultStatus === 'PASS' ? styles.resultPass : styles.resultFail]}>
                        <Ionicons
                          name={exam.resultStatus === 'PASS' ? 'checkmark-circle' : 'close-circle'}
                          size={14}
                          color={exam.resultStatus === 'PASS' ? COLORS.green : COLORS.red}
                        />
                        <Text style={[styles.resultText, { color: exam.resultStatus === 'PASS' ? COLORS.green : COLORS.red }]}>
                          {exam.resultStatus}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Change Password */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHead} activeOpacity={0.7} onPress={() => { animate(); setPwOpen((v) => !v); }}>
            <View style={styles.cardHeadLeft}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="key-outline" size={16} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Change Password</Text>
            </View>
            <Ionicons name={pwOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.faint} />
          </TouchableOpacity>

          {pwOpen && (
            <View style={styles.cardBody}>
              {([
                ['current', 'Current Password', 'currentPassword'],
                ['new', 'New Password', 'newPassword'],
                ['confirm', 'Confirm New Password', 'confirmPassword'],
              ] as const).map(([k, label, dataKey]) => (
                <View key={k} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <View style={styles.pwWrap}>
                    <TextInput
                      style={styles.pwInput}
                      secureTextEntry={!showPw[k]}
                      value={pwData[dataKey]}
                      onChangeText={(v) => setPwData((d) => ({ ...d, [dataKey]: v }))}
                      placeholder={label}
                      placeholderTextColor={COLORS.faint}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPw((s) => ({ ...s, [k]: !s[k] }))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name={showPw[k] ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.faint} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {!!pwData.newPassword && !!pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword && (
                <Text style={styles.mismatch}>Passwords do not match</Text>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.slate }]} onPress={handlePasswordSave} disabled={pwSaving}>
                  {pwSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="key" size={15} color="#fff" />
                      <Text style={styles.saveText}>Update Password</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { animate(); setPwOpen(false); setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                  disabled={pwSaving}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Project Pioneer · © 2026 Singramau Innovation Labs</Text>
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
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 16, letterSpacing: -0.3 },

  /* Hero */
  hero: { backgroundColor: COLORS.slate, borderRadius: 24, padding: 24, alignItems: 'center', overflow: 'hidden', marginBottom: 16 },
  heroBlob: { position: 'absolute', top: -50, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(59,190,232,0.16)' },
  avatar: { width: 76, height: 76, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  heroName: { fontSize: 21, fontWeight: '800', color: '#fff', marginTop: 14, letterSpacing: -0.3 },
  heroMeta: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
  idChip: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  idChipText: { fontSize: 12, fontWeight: '700', color: COLORS.accent, letterSpacing: 0.5 },

  /* Card */
  card: { backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14, overflow: 'hidden', ...CARD_SHADOW },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  cardHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15.5, fontWeight: '800', color: COLORS.text },
  cardBody: { paddingHorizontal: 16, paddingBottom: 18, paddingTop: 2 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  subtitle: { fontSize: 12, color: COLORS.gray, flex: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontSize: 12.5, fontWeight: '800', color: COLORS.primary },

  /* Field */
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 10.5, fontWeight: '800', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  fieldValue: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  fieldEmpty: { color: COLORS.faint, fontWeight: '400' },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.surface },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  optionPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 13.5, fontWeight: '700', color: COLORS.gray },
  optionTextActive: { color: '#fff' },

  /* Actions */
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 6, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.surface },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  saveText: { fontSize: 13.5, fontWeight: '800', color: '#fff' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  cancelText: { fontSize: 13.5, fontWeight: '700', color: COLORS.gray },

  /* Exam results */
  examRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, gap: 12 },
  examType: { fontSize: 11, fontWeight: '800', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 0.6 },
  examMarks: { fontSize: 14.5, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  examPct: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  resultPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  resultPass: { backgroundColor: '#DCFCE7' },
  resultFail: { backgroundColor: '#FEE2E2' },
  resultText: { fontSize: 11.5, fontWeight: '800' },

  /* Password */
  pwWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, backgroundColor: COLORS.surface },
  pwInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: COLORS.text },
  mismatch: { fontSize: 12, color: COLORS.red, fontWeight: '600', marginBottom: 8 },

  /* Logout + footer */
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 15, marginTop: 6, marginBottom: 18 },
  logoutText: { color: COLORS.red, fontWeight: '800', fontSize: 15 },
  footer: { textAlign: 'center', color: COLORS.faint, fontSize: 11.5 },
});
