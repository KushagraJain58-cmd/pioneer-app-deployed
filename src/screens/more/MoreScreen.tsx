import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { APP_ICONS } from '../../utils/appIcons';
import { MORE_ITEMS } from '../../utils/moreMenu';

const COLORS = { primary: '#004877', accent: '#3BBEE8', bg: '#F6FCFF', white: '#fff', text: '#1C2D37', gray: '#8B909A', surface: '#F0F7FB' };

export default function MoreScreen({ navigation }: any) {
  const { user } = useAuth();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            {user?.studentId && <Text style={styles.id}>ID: {user.studentId}</Text>}
          </View>
        </View>

        {MORE_ITEMS.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.row}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.rowIcon}>
              {item.png ? (
                <Image source={APP_ICONS[item.png]} style={styles.pngIcon} resizeMode="contain" />
              ) : (
                <Ionicons name={item.ion!} size={22} color={COLORS.primary} />
              )}
            </View>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  id: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  rowIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  pngIcon: { width: 22, height: 22, tintColor: COLORS.primary },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
});
