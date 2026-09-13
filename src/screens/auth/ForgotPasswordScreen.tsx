import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { requestResetPassword } from '../../lib/api';

const COLORS = { primary: '#004877', gray: '#8B909A', error: '#EF4444' };

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email.'); return; }
    setLoading(true);
    try {
      await requestResetPassword(email);
      Alert.alert('Email Sent', 'Check your inbox for password reset instructions.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.sub}>Enter your registered email to receive a reset link.</Text>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SEND RESET LINK</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={styles.link}>← Back to Login</Text>
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
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: '#111', backgroundColor: '#F9FAFB', marginBottom: 16,
  },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { textAlign: 'center', color: COLORS.primary, fontWeight: '500', fontSize: 13 },
});
