import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCareers, getShortlist, toggleCareerShortlist } from '../../lib/api';
import { Career } from '../../types';

const COLORS = {
  primary: '#004877', accent: '#3BBEE8', bg: '#F6FCFF', white: '#fff',
  text: '#1C2D37', gray: '#8B909A', indigo: '#4f46e5', border: '#E2E8F0',
};

const PAGE_SIZE = 50;

type IndustryBucket = { name: string; count: number };

export default function CareersScreen({ navigation }: any) {
  // selection / search (mirror of client state)
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  // careers (paginated, same /careers call as client)
  const [careers, setCareers] = useState<Career[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // shortlist
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [shortlistedCareers, setShortlistedCareers] = useState<Career[]>([]);
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  const requestRef = useRef(0);

  /* ---------- Debounce search ---------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* ---------- Shortlist ---------- */
  const refreshShortlist = useCallback(() => {
    getShortlist()
      .then((res) => {
        const list: Career[] = (res.data?.data?.shortlistedCareers || res.data?.data?.careers || []).filter(Boolean);
        setShortlistedCareers(list);
        setShortlisted(new Set(list.map((c) => c._id)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { refreshShortlist(); }, []);

  /* ---------- Fetch careers (same params as client) ---------- */
  const loadCareers = useCallback(
    async (pageNum: number, replace: boolean) => {
      const reqId = ++requestRef.current;
      if (replace) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await getCareers({
          keyword: debouncedSearch.trim() || undefined,
          industry: selectedIndustry || undefined,
          limit: PAGE_SIZE,
          page: pageNum,
        });

        if (reqId !== requestRef.current) return; // ignore stale

        const data: Career[] = res.data?.data || [];
        const tp = res.data?.totalPages || res.data?.totalpages || 1;

        setTotalPages(tp);
        setPage(pageNum);
        setCareers((prev) => (replace ? data : [...prev, ...data]));
      } catch {
        if (reqId === requestRef.current && replace) setCareers([]);
      } finally {
        if (reqId === requestRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedSearch, selectedIndustry]
  );

  // refetch page 1 whenever search or industry changes
  useEffect(() => {
    loadCareers(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedIndustry]);

  /* ---------- Derive industry buckets from loaded careers (like client) ---------- */
  const industries: IndustryBucket[] = useMemo(() => {
    const buckets = careers.reduce<Record<string, number>>((acc, career) => {
      if (!career?.industry) return acc;
      acc[career.industry] = (acc[career.industry] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [careers]);

  const handleEndReached = () => {
    console.log("HERE")
    // if (!selectedIndustry) return;
    if (loadingMore || loading) return;
    if (page >= totalPages) return;
    loadCareers(page + 1, false);
  };

  const toggleFav = async (id: string) => {
    // optimistic
    setShortlisted((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
    try {
      await toggleCareerShortlist(id);
      refreshShortlist(); // keep full objects in sync
    } catch {
      // revert
      setShortlisted((prev) => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
      });
    }
  };

  /* ---------- Renderers ---------- */
  const renderIndustry = ({ item }: { item: IndustryBucket }) => (
    <TouchableOpacity
      style={styles.industryCard}
      activeOpacity={0.85}
      onPress={() => setSelectedIndustry(item.name)}
    >
      <View style={styles.industryIcon}>
        <Ionicons name="business-outline" size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.industryName}>{item.name}</Text>
      <View style={styles.industryCta}>
        <Text style={styles.industryCtaText}>Explore {item.count} Pathways</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.indigo} />
      </View>
    </TouchableOpacity>
  );

  const renderCareer = ({ item }: { item: Career }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('CareerDetail', { career: item })}
    >
      <View style={styles.cardTop}>
        {item.industry ? <Text style={styles.badge}>{item.industry}</Text> : <View />}
        <TouchableOpacity
          onPress={() => toggleFav(item._id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={shortlisted.has(item._id) ? 'heart' : 'heart-outline'}
            size={20}
            color={shortlisted.has(item._id) ? '#f43f5e' : COLORS.gray}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsText}>DETAILS</Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Your Ideal Career Path</Text>
        <Text style={styles.subtitle}>
          Explore career trajectories curated for the modern Indian economy.
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search careers, skills, or industries..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={(t) => {
            setSearchQuery(t);
            setSelectedIndustry(null);
          }}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter bar */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, showShortlistOnly && styles.filterPillActive]}
          activeOpacity={0.8}
          onPress={() => {
            setShowShortlistOnly((v) => !v);
            setSelectedIndustry(null);
            setSearchQuery('');
          }}
        >
          <Ionicons
            name={showShortlistOnly ? 'heart' : 'heart-outline'}
            size={14}
            color={showShortlistOnly ? COLORS.white : '#f43f5e'}
          />
          <Text style={[styles.filterPillText, showShortlistOnly && styles.filterPillTextActive]}>
            Shortlisted
          </Text>
          {shortlistedCareers.length > 0 && (
            <View style={[styles.filterBadge, showShortlistOnly && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, showShortlistOnly && styles.filterBadgeTextActive]}>
                {shortlistedCareers.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Back to sectors (when industry selected) */}
      {selectedIndustry && !showShortlistOnly && (
        <View style={styles.backRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedIndustry(null)}>
            <Ionicons name="arrow-back" size={16} color={COLORS.text} />
            <Text style={styles.backText}>BACK TO SECTORS</Text>
          </TouchableOpacity>
          <Text style={styles.catalogue}>{selectedIndustry}</Text>
        </View>
      )}

      {showShortlistOnly ? (
        /* ---- SHORTLISTED CAREERS ---- */
        <FlatList
          data={shortlistedCareers}
          keyExtractor={(item) => item._id}
          renderItem={renderCareer}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>
              My Shortlisted Careers
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyShortlist}>
              <Ionicons name="heart-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyShortlistTitle}>No shortlisted careers yet</Text>
              <Text style={styles.emptyShortlistSub}>
                Tap the heart icon on any career to save it here.
              </Text>
            </View>
          }
        />
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : !selectedIndustry ? (
        /* ---- INDUSTRY SECTORS (derived from /careers response) ---- */
        <FlatList
          data={industries}
          keyExtractor={(item) => item.name}
          renderItem={renderIndustry}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={<Text style={styles.sectionLabel}>Industry Sectors</Text>}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : page >= totalPages && careers.length > 0 ? (
              <Text style={styles.endText}>You've reached the end</Text>
            ) : null
          }
          ListEmptyComponent={<Text style={styles.empty}>No careers in this sector yet.</Text>}
        />
      ) : (
        /* ---- CAREERS for selected industry (infinite scroll) ---- */
        <FlatList
          data={careers}
          keyExtractor={(item) => item._id}
          renderItem={renderCareer}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : page >= totalPages && careers.length > 0 ? (
              <Text style={styles.endText}>You've reached the end</Text>
            ) : null
          }
          ListEmptyComponent={<Text style={styles.empty}>No careers in this sector yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.gray, marginTop: 4, lineHeight: 18 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, marginHorizontal: 16,
    marginTop: 4, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, padding: 0 },
  backRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 8,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 12, fontWeight: '700', color: COLORS.text, letterSpacing: 0.5 },
  catalogue: { fontSize: 12, fontWeight: '700', color: COLORS.indigo, textTransform: 'uppercase' },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: COLORS.text,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  // industry card
  industryCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  industryIcon: {
    width: 44, height: 44, borderRadius: 10, backgroundColor: '#EFF3F8',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  industryName: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  industryCta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  industryCtaText: {
    fontSize: 12, fontWeight: '700', color: COLORS.indigo,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  // career card
  card: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  badge: {
    alignSelf: 'flex-start', backgroundColor: '#EEF2FF', color: COLORS.indigo,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    fontSize: 11, fontWeight: '700', overflow: 'hidden', textTransform: 'uppercase',
  },
  desc: { fontSize: 13, color: COLORS.gray, lineHeight: 19, marginBottom: 10 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { fontSize: 12, fontWeight: '700', color: COLORS.gray, letterSpacing: 0.5 },
  empty: { textAlign: 'center', color: COLORS.gray, marginTop: 40, fontSize: 15 },
  endText: { textAlign: 'center', color: COLORS.gray, marginVertical: 16, fontSize: 12 },
  // filter bar
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 8,
  },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#f43f5e', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.white,
  },
  filterPillActive: {
    backgroundColor: '#f43f5e', borderColor: '#f43f5e',
  },
  filterPillText: { fontSize: 13, fontWeight: '700', color: '#f43f5e' },
  filterPillTextActive: { color: COLORS.white },
  filterBadge: {
    backgroundColor: '#fecdd3', borderRadius: 10, minWidth: 20,
    height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  filterBadgeText: { fontSize: 11, fontWeight: '800', color: '#f43f5e' },
  filterBadgeTextActive: { color: COLORS.white },
  // empty shortlist
  emptyShortlist: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyShortlistTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptyShortlistSub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 20 },
});
