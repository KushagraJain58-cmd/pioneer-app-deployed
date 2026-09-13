import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Counsellor } from '../../types';

const COLORS = { primary: '#004877', accent: '#3BBEE8', bg: '#F6FCFF', white: '#fff', text: '#1C2D37', gray: '#8B909A' };

const COUNSELLORS: Counsellor[] = [
  { id: '1', name: 'Dr. Priya Sharma', specialization: 'Career Guidance', experience: '8 years', rating: 4.8, slots: ['Mon 10:00 AM', 'Mon 2:00 PM', 'Wed 11:00 AM', 'Fri 3:00 PM'] },
  { id: '2', name: 'Mr. Arjun Mehta', specialization: 'Academic Counselling', experience: '5 years', rating: 4.6, slots: ['Tue 9:00 AM', 'Thu 1:00 PM', 'Sat 10:00 AM'] },
  { id: '3', name: 'Ms. Ananya Singh', specialization: 'Mental Wellness', experience: '6 years', rating: 4.9, slots: ['Mon 4:00 PM', 'Wed 9:00 AM', 'Fri 11:00 AM'] },
  { id: '4', name: 'Dr. Ravi Kumar', specialization: 'University Admissions', experience: '10 years', rating: 4.7, slots: ['Tue 2:00 PM', 'Thu 10:00 AM', 'Sat 2:00 PM'] },
];

export default function CounsellingScreen() {
  const [selected, setSelected] = useState<Counsellor | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>([]);

  const handleBook = () => {
    if (!slot) { Alert.alert('Select Slot', 'Please select a time slot.'); return; }
    setBooked(prev => [...prev, `${selected?.name} — ${slot}`]);
    setSelected(null);
    setSlot(null);
    Alert.alert('Booked!', `Session with ${selected?.name} at ${slot} has been confirmed.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Counselling</Text>
        <Text style={styles.sub}>Book a session with expert counsellors</Text>

        {booked.length > 0 && (
          <View style={styles.bookedBox}>
            <Text style={styles.bookedTitle}>Your Upcoming Sessions</Text>
            {booked.map((b, i) => (
              <Text key={i} style={styles.bookedItem}>✅ {b}</Text>
            ))}
          </View>
        )}

        {COUNSELLORS.map(c => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatarBox}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.spec}>{c.specialization}</Text>
                <Text style={styles.exp}>⭐ {c.rating} · {c.experience}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={() => { setSelected(c); setSlot(null); }}>
              <Text style={styles.bookBtnText}>Book Session</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select a Slot</Text>
            <Text style={styles.sheetSub}>{selected?.name}</Text>
            {selected?.slots?.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.slotBtn, slot === s && styles.slotBtnActive]}
                onPress={() => setSlot(s)}
              >
                <Text style={[styles.slotText, slot === s && styles.slotTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleBook}>
              <Text style={styles.confirmText}>Confirm Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelected(null)} style={{ marginTop: 12 }}>
              <Text style={{ textAlign: 'center', color: COLORS.gray }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  sub: { fontSize: 13, color: COLORS.gray, marginBottom: 20 },
  bookedBox: { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14, marginBottom: 16 },
  bookedTitle: { fontSize: 13, fontWeight: '700', color: '#065F46', marginBottom: 8 },
  bookedItem: { fontSize: 13, color: '#065F46', marginBottom: 4 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  avatarBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF8FF', justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  spec: { fontSize: 12, color: COLORS.accent, fontWeight: '600', marginTop: 2 },
  exp: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  bookBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  sheetSub: { fontSize: 13, color: COLORS.gray, marginBottom: 16 },
  slotBtn: { borderWidth: 1, borderColor: '#ccdae4', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8 },
  slotBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { fontSize: 14, color: COLORS.text },
  slotTextActive: { color: '#fff', fontWeight: '600' },
  confirmBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
