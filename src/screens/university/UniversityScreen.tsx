import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { getShortlist, getUniversities, toggleUniversityShortlist } from '../../lib/api';
import { University } from '../../types';

const COLORS = {
  primary: '#004877', accent: '#3BBEE8', bg: '#F6FCFF', white: '#fff',
  text: '#1C2D37', gray: '#8B909A', teal: '#0d9488', border: '#E2E8F0',
  rose: '#f43f5e',
};

const REGIONS = ['Tamil Nadu', 'West Bengal', 'Kerala', 'Maharashtra', 'Karnataka', 'Delhi'];
const PAGE_SIZE = 50;

export default function UniversityScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [statePickerVisible, setStatePickerVisible] = useState(false);

  const [universities, setUniversities] = useState<University[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [shortlistedUniversities, setShortlistedUniversities] = useState<University[]>([]);
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  const requestRef = useRef(0);

  /* ---------- Debounce ---------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* ---------- Shortlist ---------- */
  const refreshShortlist = useCallback(() => {
    getShortlist()
      .then((res) => {
        const list: University[] = (
          res.data?.data?.shortlistedUniversities || []
        ).filter(Boolean);
        setShortlistedUniversities(list);
        setShortlisted(new Set(list.map((u) => u._id)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { refreshShortlist(); }, []);

  /* ---------- Fetch universities ---------- */
  const loadUniversities = useCallback(
    async (pageNum: number, replace: boolean) => {
      const reqId = ++requestRef.current;
      if (replace) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await getUniversities({
          keyword: debouncedSearch.trim() || undefined,
          state: selectedState || undefined,
          limit: PAGE_SIZE,
          page: pageNum,
        });

        if (reqId !== requestRef.current) return;

        const data: University[] = res.data?.data || [];
        const tp = res.data?.totalPages || res.data?.totalpages || 1;

        setTotalPages(tp);
        setPage(pageNum);
        setUniversities((prev) => (replace ? data : [...prev, ...data]));
      } catch {
        if (reqId === requestRef.current && replace) setUniversities([]);
      } finally {
        if (reqId === requestRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedSearch, selectedState]
  );

  useEffect(() => {
    loadUniversities(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedState]);

  const handleEndReached = () => {
    if (loadingMore || loading || showShortlistOnly) return;
    if (page >= totalPages) return;
    loadUniversities(page + 1, false);
  };

  const toggleFav = async (id: string) => {
    setShortlisted((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
    try {
      await toggleUniversityShortlist(id);
      refreshShortlist();
    } catch {
      setShortlisted((prev) => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
      });
    }
  };

  const getInitial = (name = '') => name.charAt(0).toUpperCase();

  /* ---------- Card ---------- */
  const renderCard = ({ item }: { item: University }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('UniversityDetail', { university: item })}
    >
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(item.name)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFav(item._id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={shortlisted.has(item._id) ? 'heart' : 'heart-outline'}
            size={20}
            color={shortlisted.has(item._id) ? COLORS.rose : COLORS.gray}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>

      {(item.city || item.state) && (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.gray} />
          <Text style={styles.locationText} numberOfLines={1}>
            {[item.city, item.state].filter(Boolean).join(', ')}
          </Text>
        </View>
      )}

      {item.rankAccreditation && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{item.rankAccreditation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const listData = showShortlistOnly ? shortlistedUniversities : universities;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Universities</Text>
        <Text style={styles.subtitle}>Find the right college for your future.</Text>
      </View>

      {/* Search + State filter button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search 500+ top colleges..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.stateBtn, !!selectedState && styles.stateBtnActive]}
          onPress={() => setStatePickerVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="filter" size={16} color={selectedState ? COLORS.white : COLORS.teal} />
        </TouchableOpacity>
      </View>

      {/* Active state chip */}
      {selectedState && (
        <View style={styles.activeFilterRow}>
          <View style={styles.activeChip}>
            <Text style={styles.activeChipText}>{selectedState}</Text>
            <TouchableOpacity onPress={() => setSelectedState(null)}>
              <Ionicons name="close" size={14} color={COLORS.teal} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Shortlist filter pill */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, showShortlistOnly && styles.filterPillActive]}
          activeOpacity={0.8}
          onPress={() => setShowShortlistOnly((v) => !v)}
        >
          <Ionicons
            name={showShortlistOnly ? 'heart' : 'heart-outline'}
            size={14}
            color={showShortlistOnly ? COLORS.white : COLORS.rose}
          />
          <Text style={[styles.filterPillText, showShortlistOnly && styles.filterPillTextActive]}>
            Shortlisted
          </Text>
          {shortlistedUniversities.length > 0 && (
            <View style={[styles.filterBadge, showShortlistOnly && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeNum, showShortlistOnly && styles.filterBadgeNumActive]}>
                {shortlistedUniversities.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && !showShortlistOnly ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            showShortlistOnly
              ? <Text style={styles.sectionLabel}>My Shortlisted Universities</Text>
              : null
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : !showShortlistOnly && page >= totalPages && universities.length > 0 ? (
              <Text style={styles.endText}>You've seen all universities</Text>
            ) : null
          }
          ListEmptyComponent={
            showShortlistOnly ? (
              <View style={styles.emptyBox}>
                <Ionicons name="heart-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyTitle}>No shortlisted universities yet</Text>
                <Text style={styles.emptySub}>Tap the heart on any university to save it here.</Text>
              </View>
            ) : (
              <Text style={styles.empty}>No universities found.</Text>
            )
          }
        />
      )}

      {/* State picker bottom sheet */}
      <Modal
        visible={statePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStatePickerVisible(false)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Filter by State</Text>
          <ScrollView bounces={false}>
            <TouchableOpacity
              style={styles.stateOption}
              onPress={() => { setSelectedState(null); setStatePickerVisible(false); }}
            >
              <Text style={[styles.stateOptionText, !selectedState && styles.stateOptionTextActive]}>
                All States
              </Text>
              {!selectedState && <Ionicons name="checkmark" size={18} color={COLORS.teal} />}
            </TouchableOpacity>
            {REGIONS.map((region) => (
              <TouchableOpacity
                key={region}
                style={styles.stateOption}
                onPress={() => { setSelectedState(region); setStatePickerVisible(false); }}
              >
                <Text style={[styles.stateOptionText, selectedState === region && styles.stateOptionTextActive]}>
                  {region}
                </Text>
                {selectedState === region && <Ionicons name="checkmark" size={18} color={COLORS.teal} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  searchRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    marginTop: 8, marginBottom: 8, gap: 8,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, padding: 0 },
  stateBtn: {
    width: 46, height: 46, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.teal,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  stateBtnActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  activeFilterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 6 },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0fdfa', borderWidth: 1, borderColor: '#99f6e4',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  activeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.teal },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: COLORS.rose, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.white,
  },
  filterPillActive: { backgroundColor: COLORS.rose, borderColor: COLORS.rose },
  filterPillText: { fontSize: 13, fontWeight: '700', color: COLORS.rose },
  filterPillTextActive: { color: COLORS.white },
  filterBadge: {
    backgroundColor: '#fecdd3', borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 5,
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  filterBadgeNum: { fontSize: 11, fontWeight: '800', color: COLORS.rose },
  filterBadgeNumActive: { color: COLORS.white },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 10,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 6, lineHeight: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  locationText: {
    fontSize: 11, color: COLORS.gray,
    textTransform: 'uppercase', letterSpacing: 0.3, flex: 1,
  },
  rankBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primary,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  rankText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: COLORS.text,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 4,
  },
  empty: { textAlign: 'center', color: COLORS.gray, marginTop: 40, fontSize: 15 },
  endText: { textAlign: 'center', color: COLORS.gray, marginVertical: 16, fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, maxHeight: '70%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#CBD5E1',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  stateOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  stateOptionText: { fontSize: 15, color: COLORS.text },
  stateOptionTextActive: { color: COLORS.teal, fontWeight: '700' },
});
