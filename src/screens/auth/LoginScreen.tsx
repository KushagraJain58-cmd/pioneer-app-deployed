import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { studentLogin } from '../../lib/api';

const COLORS = {
  primary: '#004877',
  accent: '#3BBEE8',
  bg: '#020617',
  white: '#FFFFFF',
  gray: '#8B909A',
  inputBg: '#1E293B',
  border: '#334155',
  error: '#EF4444',
};

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [usePhone, setUsePhone] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!password || (!studentId && !phone)) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const payload = usePhone
        ? { phone, password }
        : { studentId, password };
      const res = await studentLogin(payload);
      if (res.data?.message?.includes('OTP')) {
        navigation.navigate('OTP', { payload, verifyUrl: 'api/users/verify-otp-login', resendUrl: 'api/students/login' });
      } else {
        await login(res.data.data.token, res.data.data.clientUser);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.logo}>PROJECT PIONEER</Text>
          <Text style={styles.tagline}>Navigating Future Success</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{usePhone ? 'Phone Number' : 'Student ID / Email'}</Text>
            <TextInput
              style={styles.input}
              placeholder={usePhone ? 'Enter 10-digit phone' : 'Enter student ID or email'}
              placeholderTextColor={COLORS.gray}
              value={usePhone ? phone : studentId}
              onChangeText={usePhone ? setPhone : setStudentId}
              keyboardType={usePhone ? 'phone-pad' : 'default'}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={COLORS.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.row}>
            <TouchableOpacity onPress={() => { setUsePhone(!usePhone); setStudentId(''); setPhone(''); }}>
              <Text style={styles.link}>{usePhone ? 'Login with Student ID' : 'Login with Phone'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>LOGIN</Text>}
          </TouchableOpacity>

          <Text style={styles.footer}>© 2026 Singramau Innovation Labs</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: { fontSize: 22, fontWeight: '800', textAlign: 'center', color: COLORS.primary, letterSpacing: 1 },
  tagline: { fontSize: 13, color: COLORS.gray, textAlign: 'center', marginTop: 4, marginBottom: 28 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  link: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  error: { color: COLORS.error, fontSize: 12, marginBottom: 12, textAlign: 'center' },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  footer: { textAlign: 'center', color: COLORS.gray, fontSize: 11, marginTop: 24 },
});
