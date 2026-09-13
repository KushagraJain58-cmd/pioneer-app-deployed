import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import axiosInstance from '../../lib/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const COLORS = { primary: '#004877', accent: '#3BBEE8', gray: '#8B909A', error: '#EF4444' };

interface Props {
  route: { params: { payload: object; verifyUrl: string; resendUrl: string } };
  navigation: any;
}

export default function OTPScreen({ route, navigation }: Props) {
  const { login } = useAuth();
  const { payload, verifyUrl, resendUrl } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length < 4) { setError('Enter a valid OTP'); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.post(verifyUrl, { ...payload, otp });
      await login(res.data.data.token, res.data.data.clientUser);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axiosInstance.post(resendUrl, payload);
      Alert.alert('OTP sent', 'A new OTP has been sent.');
    } catch { Alert.alert('Error', 'Could not resend OTP.'); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.sub}>Enter the 6-digit code sent to your registered contact.</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor={COLORS.gray}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>VERIFY</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Resend OTP</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
          <Text style={styles.link}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.primary, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 13, color: COLORS.gray, textAlign: 'center', marginBottom: 24 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12,
    paddingVertical: 14, fontSize: 20, letterSpacing: 8, color: '#111',
    backgroundColor: '#F9FAFB', marginBottom: 12,
  },
  error: { color: COLORS.error, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { textAlign: 'center', color: COLORS.primary, fontWeight: '500', fontSize: 13 },
});
