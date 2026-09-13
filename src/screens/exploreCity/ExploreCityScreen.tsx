import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWelcomeProfile } from '../../context/WelcomeProfileContext';
import { getStudentExperience } from '../../lib/api';
import { buildInterestEvents, targetExams } from '../../data/studentExperience';
import indianCitiesByState from '../../data/Indian_Cities_In_States.json';

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

/* ---- Static fallbacks (ported verbatim from the client) ---- */
const institutions = [
  { name: 'District Innovation & Skill Centre', type: 'Skill Institution', distance: '2.4 km away', cityName: 'New Delhi' },
  { name: 'City Central Library', type: 'Learning Hub', distance: '3.8 km away', cityName: 'Mumbai' },
  { name: 'Regional Science College', type: 'Higher Education', distance: '6.1 km away', cityName: 'Bengaluru' },
];

const nationalCompetitions = [
  { title: 'India Youth Innovation Challenge', level: 'National', deadline: '18 May 2026', cityName: 'New Delhi' },
  { title: 'National Essay & Policy Bowl', level: 'National', deadline: '25 May 2026', cityName: 'Mumbai' },
  { title: 'STEM HackSprint for Schools', level: 'Regional + National', deadline: '02 Jun 2026', cityName: 'Bengaluru' },
];

/* ---- City picker (mobile equivalent of the antd searchable Select) ---- */
function CityPicker({
  visible,
  cities,
  onSelect,
  onClose,
}: {
  visible: boolean;
  cities: string[];
  onSelect: (city: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? cities.filter((c) => c.toLowerCase().includes(q)) : cities;
  }, [query, cities]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.pickerSafe} edges={['top', 'bottom']}>
        <View style={styles.pickerHead}>
          <Text style={styles.pickerTitle}>Filter by City</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city"
            placeholderTextColor={COLORS.faint}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.faint} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.allCitiesRow} onPress={() => onSelect('')}>
          <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
          <Text style={styles.allCitiesText}>All Cities</Text>
        </TouchableOpacity>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.cityRow} onPress={() => onSelect(item)}>
              <Text style={styles.cityText}>{item}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.faint} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.pickerEmpty}>No matching cities.</Text>}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </SafeAreaView>
    </Modal>
  );
}

export default function ExploreCityScreen() {
  const { profile } = useWelcomeProfile();
  const interests = useMemo(() => profile?.interests || [], [profile?.interests]);

  const [selectedCity, setSelectedCity] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cityOptions = useMemo(
    () =>
      Array.from(new Set(Object.values(indianCitiesByState as Record<string, string[]>).flat()))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    []
  );

  /* ---- Same call as the client (interest + cityName) ---- */
  useEffect(() => {
    setLoading(true);
    getStudentExperience({
      contentScope: 'EXPLORE_CITY',
      interest: interests.join(','),
      cityName: selectedCity || undefined,
      activeOnly: true,
    })
      .then((res) => setRecords(res.data?.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [interests, selectedCity]);

  /* ---- Derived sections (identical fallback logic to the client) ---- */
  const nearbyEvents = useMemo(() => {
    const apiEvents = records
      .filter((r) => r.contentType === 'NEARBY_EVENT')
      .map((e) => ({ title: e.title, category: e.categoryLabel, date: e.dateLabel, location: e.locationLabel, cityName: e.cityName }));
    if (apiEvents.length) return apiEvents;
    if (selectedCity) return [];
    return buildInterestEvents(interests).map((e) => ({ ...e, cityName: 'All Cities' }));
  }, [records, selectedCity, interests]);

  const institutionCards = useMemo(() => {
    const apiInstitutions = records
      .filter((r) => r.contentType === 'INSTITUTION')
      .map((i) => ({ name: i.title, type: i.categoryLabel || 'Institution', distance: i.distanceLabel || i.locationLabel, cityName: i.cityName }));
    if (apiInstitutions.length) return apiInstitutions;
    if (selectedCity) return [];
    return institutions;
  }, [records, selectedCity]);

  const competitionCards = useMemo(() => {
    const apiCompetitions = records
      .filter((r) => r.contentType === 'COMPETITION')
      .map((i) => ({ title: i.title, level: i.categoryLabel, deadline: i.dateLabel, cityName: i.cityName }));
    if (apiCompetitions.length) return apiCompetitions;
    if (selectedCity) return [];
    return [
      ...nationalCompetitions,
      ...targetExams.slice(0, 1).map((t) => ({ title: t.title, level: t.tag, deadline: t.date, cityName: undefined as string | undefined })),
    ];
  }, [records, selectedCity]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setPickerOpen(false);
  };

  if (loading && !records.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero + city filter */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>LOCALIZED HUB</Text>
          <Text style={styles.heroTitle}>
            Discover nearby events, institutions, and opportunities in your district.
          </Text>
          <Text style={styles.heroSub}>
            Based on your onboarding preferences, we curate local happenings and national
            competitions so you can act quickly on relevant opportunities.
          </Text>

          <Text style={styles.filterLabel}>FILTER BY CITY</Text>
          <TouchableOpacity style={styles.cityBtn} activeOpacity={0.85} onPress={() => setPickerOpen(true)}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.cityBtnText, !selectedCity && styles.cityBtnPlaceholder]}>
              {selectedCity || 'All Cities'}
            </Text>
            {selectedCity ? (
              <TouchableOpacity onPress={() => setSelectedCity('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={COLORS.faint} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="chevron-down" size={18} color={COLORS.faint} />
            )}
          </TouchableOpacity>
          <Text style={styles.filterHint}>Leave blank to view opportunities from all cities.</Text>
        </View>

        {/* Nearby Events (dark) */}
        <View style={styles.darkSection}>
          <View style={styles.sectionHeadRow}>
            <View style={styles.sectionHead}>
              <View style={styles.darkIcon}>
                <Ionicons name="time-outline" size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.darkSectionTitle}>Nearby Events</Text>
            </View>
            <Ionicons name="sparkles" size={18} color={COLORS.accent} />
          </View>

          <View style={{ gap: 12, marginTop: 16 }}>
            {nearbyEvents.length ? (
              nearbyEvents.map((event, i) => (
                <View key={`${event.title}-${event.date}-${i}`} style={styles.eventCard}>
                  <View style={styles.eventTop}>
                    <Text style={styles.eventCategory}>{event.category}</Text>
                    <Text style={styles.eventDate}>{event.date}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {!!event.location && (
                    <View style={styles.eventLocRow}>
                      <Ionicons name="location-outline" size={15} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.eventLoc}>{event.location}</Text>
                    </View>
                  )}
                  <Text style={styles.eventCity}>City: {event.cityName || 'All Cities'}</Text>
                </View>
              ))
            ) : (
              <View style={styles.eventCard}>
                <Text style={styles.emptyDark}>No nearby events found for the selected city.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Nearby Institutions */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.lightIcon}>
              <Ionicons name="business-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Nearby Institutions</Text>
          </View>

          <View style={{ gap: 12, marginTop: 16 }}>
            {institutionCards.length ? (
              institutionCards.map((inst, i) => (
                <View key={`${inst.name}-${i}`} style={styles.tile}>
                  <Text style={styles.tileEyebrow}>{inst.type}</Text>
                  <Text style={styles.tileTitle}>{inst.name}</Text>
                  {!!inst.distance && <Text style={styles.tileMeta}>{inst.distance}</Text>}
                  <Text style={styles.tileCity}>City: {inst.cityName || 'All Cities'}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyLight}>No institutions found for the selected city.</Text>
            )}
          </View>
        </View>

        {/* Competitions & Events */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.lightIcon}>
              <Ionicons name="medal-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Competitions & Events</Text>
          </View>

          <View style={{ gap: 12, marginTop: 16 }}>
            {competitionCards.length ? (
              competitionCards.map((item, i) => (
                <View key={`${item.title}-${i}`} style={styles.tile}>
                  <Text style={styles.tileEyebrowMuted}>{item.level}</Text>
                  <Text style={styles.tileTitle}>{item.title}</Text>
                  {!!item.deadline && <Text style={styles.tileDeadline}>Deadline: {item.deadline}</Text>}
                  <Text style={styles.tileCity}>City: {item.cityName || 'All Cities'}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyLight}>No competitions or events found for the selected city.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <CityPicker
        visible={pickerOpen}
        cities={cityOptions}
        onSelect={handleCitySelect}
        onClose={() => setPickerOpen(false)}
      />
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

  /* Hero */
  hero: { backgroundColor: COLORS.white, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: COLORS.border, ...CARD_SHADOW },
  heroEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 1.8 },
  heroTitle: { fontSize: 23, fontWeight: '800', color: COLORS.text, lineHeight: 30, marginTop: 12, letterSpacing: -0.4 },
  heroSub: { fontSize: 13, lineHeight: 20, color: COLORS.gray, marginTop: 12 },
  filterLabel: { fontSize: 10, fontWeight: '800', color: COLORS.faint, letterSpacing: 1.4, marginTop: 22, marginBottom: 10 },
  cityBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.surface,
  },
  cityBtnText: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text },
  cityBtnPlaceholder: { color: COLORS.gray, fontWeight: '600' },
  filterHint: { fontSize: 12, color: COLORS.faint, marginTop: 8 },

  /* Section shells */
  section: { marginTop: 20, backgroundColor: COLORS.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, ...CARD_SHADOW },
  darkSection: { marginTop: 20, backgroundColor: COLORS.slate, borderRadius: 24, padding: 20 },
  sectionHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lightIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E4F4FB', justifyContent: 'center', alignItems: 'center' },
  darkIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2 },
  darkSectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },

  /* Nearby event cards (on dark) */
  eventCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 18 },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  eventCategory: { fontSize: 11, fontWeight: '800', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 1, flex: 1 },
  eventDate: { fontSize: 12.5, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  eventTitle: { fontSize: 19, fontWeight: '800', color: '#fff', marginTop: 8, lineHeight: 25 },
  eventLocRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  eventLoc: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  eventCity: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8 },
  emptyDark: { fontSize: 13.5, color: 'rgba(255,255,255,0.65)', lineHeight: 20 },

  /* Light tiles (institutions + competitions) */
  tile: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  tileEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  tileEyebrowMuted: { fontSize: 11, fontWeight: '800', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 1 },
  tileTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 8, lineHeight: 24 },
  tileMeta: { fontSize: 14, fontWeight: '600', color: COLORS.gray, marginTop: 10 },
  tileDeadline: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 12 },
  tileCity: { fontSize: 11, fontWeight: '700', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8 },
  emptyLight: { fontSize: 13.5, color: COLORS.gray, lineHeight: 20 },

  /* City picker */
  pickerSafe: { flex: 1, backgroundColor: COLORS.bg },
  pickerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  closeBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8,
    backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, padding: 0 },
  allCitiesRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  allCitiesText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  cityRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEF4F8',
  },
  cityText: { fontSize: 15, color: COLORS.text },
  pickerEmpty: { textAlign: 'center', color: COLORS.gray, marginTop: 40 },
});
