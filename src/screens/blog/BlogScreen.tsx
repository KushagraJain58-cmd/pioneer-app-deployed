import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createBlog,
  getApprovedBlogs,
  getPersonalBlogs,
  uploadBlogMedia,
} from '../../lib/api';
import { BlogMedia, BlogPagination, StudentBlog } from '../../types';

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
  red: '#E5484D',
  green: '#0FA968',
  amber: '#C98A00',
};

const LIMIT = 6;

type Tab = 'latest' | 'personal';

const authorName = (blog: StudentBlog) => {
  const s = blog.studentId;
  if (s && typeof s === 'object') return s.personalInfo?.fullName || 'Student';
  return 'Student';
};

const imgUri = (m?: BlogMedia) => m?.url || m?.publicUrl;

const fmtDate = (d?: string) => (d ? new Date(d).toDateString() : '');

/* ============ Create-blog form ("Voice of the Students") ============ */
function BlogForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<BlogMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });
    if (result.canceled) return;

    const formData = new FormData();
    result.assets.forEach((a, i) => {
      const name = a.fileName || a.uri.split('/').pop() || `image-${i}.jpg`;
      const type = a.mimeType || 'image/jpeg';
      formData.append('media', { uri: a.uri, name, type } as any);
    });

    try {
      setUploading(true);
      const res = await uploadBlogMedia(formData);
      const uploaded: BlogMedia[] = res.data?.data || [];
      setMedia((prev) => [...prev, ...uploaded]);
    } catch {
      Alert.alert('Upload failed', 'Could not upload the selected image(s).');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (idx: number) => setMedia((prev) => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing details', 'Please fill in both the title and your thoughts.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await createBlog({ title: title.trim(), description: content.trim(), media });
      if (res.data?.status) {
        Alert.alert('Submitted', 'Blog submitted for approval! Our team will review it.');
        setTitle('');
        setContent('');
        setMedia([]);
        onCreated();
      } else {
        Alert.alert('Failed', res.data?.message || 'Failed to submit blog.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong while submitting the blog.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.formCard}>
      <View style={styles.formBlob} />
      <Text style={styles.formTitle}>Voice of the Students</Text>
      <Text style={styles.formSub}>Share your journey, tips, and experiences with the community.</Text>

      <TextInput
        style={styles.input}
        placeholder="Blog Title"
        placeholderTextColor="rgba(255,255,255,0.55)"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Write your thoughts..."
        placeholderTextColor="rgba(255,255,255,0.55)"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.uploadBox} activeOpacity={0.85} onPress={pickImages} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={22} color={COLORS.accent} />
            <Text style={styles.uploadTitle}>Upload Blog Image</Text>
            <Text style={styles.uploadHint}>JPG, PNG allowed</Text>
          </>
        )}
      </TouchableOpacity>

      {media.length > 0 && (
        <View style={styles.previewRow}>
          {media.map((m, idx) => (
            <View key={m.guid || m.key || idx} style={styles.previewItem}>
              <Image source={{ uri: imgUri(m) }} style={styles.previewImg} />
              <TouchableOpacity style={styles.previewRemove} onPress={() => removeMedia(idx)}>
                <Ionicons name="close" size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.submitBtn} activeOpacity={0.9} onPress={submit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <Text style={styles.submitText}>Submit for Approval</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* ============ Blog detail modal ============ */
function BlogDetailModal({
  blog,
  isPersonalView,
  onClose,
}: {
  blog: StudentBlog | null;
  isPersonalView: boolean;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  if (!blog) return null;
  const images = blog.imageUrls || [];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderTop}>
            <Text style={styles.modalBadge}>STUDENT BLOG</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>{blog.title}</Text>
          <View style={styles.modalMeta}>
            <Text style={styles.modalMetaText}>By {authorName(blog)}</Text>
            <Text style={styles.modalDot}>•</Text>
            <Text style={styles.modalMetaText}>{fmtDate(blog.createdAt)}</Text>
            {isPersonalView && (
              <View style={[styles.statusPill, blog.isApproved ? styles.statusApproved : styles.statusPending]}>
                <Text style={[styles.statusText, { color: blog.isApproved ? '#7CFFC4' : '#FFE08A' }]}>
                  {blog.isApproved ? 'Approved' : 'Pending'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
          <View style={styles.descCard}>
            <View style={styles.descLabelRow}>
              <View style={styles.descBar} />
              <Text style={styles.descLabel}>Blog Description</Text>
            </View>
            <Text style={styles.descText}>{blog.description}</Text>
          </View>

          {images.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <View style={styles.descLabelRow}>
                <View style={styles.descBar} />
                <Text style={styles.descLabel}>Images ({images.length})</Text>
              </View>
              <View style={styles.imageGrid}>
                {images.map((img, i) => (
                  <TouchableOpacity key={img.key || i} activeOpacity={0.9} style={styles.gridImgWrap} onPress={() => setActiveImage(imgUri(img) || null)}>
                    <Image source={{ uri: imgUri(img) }} style={styles.gridImg} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Full-screen image viewer */}
        {activeImage && (
          <Modal transparent visible animationType="fade" onRequestClose={() => setActiveImage(null)}>
            <View style={styles.viewer}>
              <TouchableOpacity style={styles.viewerClose} onPress={() => setActiveImage(null)}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
              <Image source={{ uri: activeImage }} style={styles.viewerImg} resizeMode="contain" />
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
}

/* ============ Card ============ */
function BlogCard({ blog, isPersonalView, onOpen }: { blog: StudentBlog; isPersonalView: boolean; onOpen: (b: StudentBlog) => void }) {
  const cover = imgUri(blog.imageUrls?.[0]);
  const desc =
    blog.description && blog.description.length > 120 ? `${blog.description.slice(0, 120)}...` : blog.description;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onOpen(blog)}>
      {cover ? (
        <Image source={{ uri: cover }} style={styles.cardImg} />
      ) : (
        <View style={[styles.cardImg, styles.cardImgFallback]}>
          <Ionicons name="newspaper-outline" size={34} color="rgba(255,255,255,0.55)" />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>{blog.title}</Text>
          {isPersonalView && (
            <View style={[styles.badge, blog.isApproved ? styles.badgeApproved : styles.badgePending]}>
              <Text style={[styles.badgeText, { color: blog.isApproved ? COLORS.green : COLORS.amber }]}>
                {blog.isApproved ? 'Approved' : 'Pending'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.cardMeta}>
          {fmtDate(blog.createdAt)} • {authorName(blog)}
        </Text>

        {!!desc && <Text style={styles.cardDesc} numberOfLines={3}>{desc}</Text>}

        <View style={styles.readMoreRow}>
          <Text style={styles.readMore}>READ MORE</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.red} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ============ Screen ============ */
export default function BlogScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState<StudentBlog[]>([]);
  const [pagination, setPagination] = useState<BlogPagination>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudentBlog | null>(null);

  const fetchBlogs = useCallback(async (tab: Tab, pageNum: number) => {
    setLoading(true);
    try {
      const req = tab === 'latest' ? getApprovedBlogs : getPersonalBlogs;
      const res = await req(pageNum, LIMIT);
      setBlogs(res.data?.data?.blogs || []);
      setPagination(res.data?.data?.pagination || {});
    } catch {
      setBlogs([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs(activeTab, page);
  }, [activeTab, page, fetchBlogs]);

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
  };

  // After submitting, show the new (pending) post under "Your Blogs".
  const handleCreated = () => {
    if (activeTab === 'personal' && page === 1) fetchBlogs('personal', 1);
    else {
      setActiveTab('personal');
      setPage(1);
    }
  };

  const totalPages = pagination.totalPages || 1;

  const header = (
    <View>
      <Text style={styles.pageTitle}>Student Blogs</Text>

      <BlogForm onCreated={handleCreated} />

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['latest', 'personal'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={styles.tabBtn} onPress={() => switchTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'latest' ? 'Latest Stories' : 'Your Blogs'}
            </Text>
            {activeTab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const footer =
    !loading && blogs.length > 0 ? (
      <View style={styles.pager}>
        <TouchableOpacity
          style={[styles.pagerBtn, page <= 1 && styles.pagerBtnDisabled]}
          disabled={page <= 1}
          onPress={() => setPage((p) => p - 1)}
        >
          <Ionicons name="chevron-back" size={16} color={page <= 1 ? COLORS.faint : COLORS.primary} />
          <Text style={[styles.pagerText, page <= 1 && styles.pagerTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pagerInfo}>
          Page {pagination.currentPage || page} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.pagerBtn, page >= totalPages && styles.pagerBtnDisabled]}
          disabled={page >= totalPages}
          onPress={() => setPage((p) => p + 1)}
        >
          <Text style={[styles.pagerText, page >= totalPages && styles.pagerTextDisabled]}>Next</Text>
          <Ionicons name="chevron-forward" size={16} color={page >= totalPages ? COLORS.faint : COLORS.primary} />
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={loading ? [] : blogs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BlogCard blog={item} isPersonalView={activeTab === 'personal'} onOpen={setSelected} />
        )}
        ListHeaderComponent={header}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator color={COLORS.primary} size="large" style={{ marginVertical: 40 }} />
          ) : (
            footer
          )
        }
        ListEmptyComponent={loading ? null : <Text style={styles.empty}>No blogs found.</Text>}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <BlogDetailModal blog={selected} isPersonalView={activeTab === 'personal'} onClose={() => setSelected(null)} />
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
  list: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 16, letterSpacing: -0.3 },
  empty: { textAlign: 'center', color: COLORS.gray, marginTop: 40, fontSize: 15 },

  /* Form */
  formCard: { backgroundColor: COLORS.slate, borderRadius: 24, padding: 22, overflow: 'hidden' },
  formBlob: { position: 'absolute', top: -50, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(59,190,232,0.14)' },
  formTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  formSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 8, marginBottom: 18, lineHeight: 19 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 14.5, marginBottom: 12,
  },
  textarea: { minHeight: 120 },
  uploadBox: {
    borderWidth: 1.5, borderColor: 'rgba(59,190,232,0.5)', borderStyle: 'dashed', borderRadius: 14,
    paddingVertical: 22, alignItems: 'center', gap: 4, marginBottom: 12,
  },
  uploadTitle: { fontSize: 13.5, fontWeight: '700', color: '#fff', marginTop: 4 },
  uploadHint: { fontSize: 11.5, color: 'rgba(255,255,255,0.55)' },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  previewItem: { width: 76, height: 76, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  previewImg: { width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' },
  previewRemove: {
    position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.red, justifyContent: 'center', alignItems: 'center',
  },
  submitBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  /* Tabs */
  tabs: { flexDirection: 'row', gap: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginTop: 24, marginBottom: 18 },
  tabBtn: { paddingBottom: 10 },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },
  tabUnderline: { height: 3, borderRadius: 2, backgroundColor: COLORS.primary, marginTop: 8, marginBottom: -11 },

  /* Card */
  card: { backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 16, ...CARD_SHADOW },
  cardImg: { width: '100%', height: 170, backgroundColor: COLORS.surface },
  cardImgFallback: { backgroundColor: COLORS.slate, justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.text, lineHeight: 24 },
  cardMeta: { fontSize: 11.5, color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8, fontWeight: '600' },
  cardDesc: { fontSize: 13.5, color: COLORS.gray, lineHeight: 20, marginTop: 10 },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14 },
  readMore: { fontSize: 12.5, fontWeight: '800', color: COLORS.red, letterSpacing: 0.6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeApproved: { backgroundColor: '#DCFCE7' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 10.5, fontWeight: '800' },

  /* Pager */
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 10 },
  pagerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: COLORS.white },
  pagerBtnDisabled: { opacity: 0.5 },
  pagerText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  pagerTextDisabled: { color: COLORS.faint },
  pagerInfo: { fontSize: 12.5, fontWeight: '600', color: COLORS.gray },

  /* Modal */
  modalSafe: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { backgroundColor: COLORS.slate, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 22 },
  modalHeaderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalBadge: { fontSize: 10.5, fontWeight: '800', color: COLORS.accent, letterSpacing: 1.6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, overflow: 'hidden' },
  closeBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 25, fontWeight: '800', color: '#fff', marginTop: 16, lineHeight: 32, letterSpacing: -0.4 },
  modalMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  modalMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.72)' },
  modalDot: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusApproved: { backgroundColor: 'rgba(15,169,104,0.22)' },
  statusPending: { backgroundColor: 'rgba(201,138,0,0.28)' },
  statusText: { fontSize: 11, fontWeight: '800' },
  modalBody: { padding: 16, paddingBottom: 32 },
  descCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  descLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  descBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: COLORS.accent },
  descLabel: { fontSize: 11, fontWeight: '800', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 1.2 },
  descText: { fontSize: 15, lineHeight: 24, color: COLORS.text },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridImgWrap: { width: '48%', borderRadius: 14, overflow: 'hidden' },
  gridImg: { width: '100%', height: 150, backgroundColor: COLORS.surface },

  /* Image viewer */
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  viewerClose: { position: 'absolute', top: 50, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  viewerImg: { width: '92%', height: '80%' },
});
