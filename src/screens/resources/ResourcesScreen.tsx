import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStudentExperience } from '../../lib/api';
import RichText from './RichText';

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
};

type IonName = React.ComponentProps<typeof Ionicons>['name'];

interface MediaFile {
  publicUrl?: string;
  mimetype?: string;
  name?: string;
  guid?: string;
  key?: string;
}

interface Resource {
  _id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  categoryLabel?: string;
  dateLabel?: string;
  gradeCategories?: string[];
  interestTags?: string[];
  locationLabel?: string;
  cityName?: string;
  actionLabel?: string;
  actionLink?: string;
  mediaFiles?: MediaFile[];
}

// Ported verbatim from the client so behavior matches when the API returns nothing.
const fallbackResources: Resource[] = [
  {
    _id: 'resource-1',
    title: 'Career Roadmap Workbook',
    subtitle: 'A practical worksheet for stream and goal planning',
    description:
      '<p>Compare streams, courses, and long-term goals with a structured workbook designed for students and mentors.</p><ul><li>Reflection prompts</li><li>Goal setting sections</li><li>Course planning guide</li></ul>',
    categoryLabel: 'Downloadable Guides',
    dateLabel: 'Workbook · Class 9-12 · 8 min read',
    actionLabel: 'Download PDF',
    actionLink: '#',
    mediaFiles: [],
  },
  {
    _id: 'resource-2',
    title: 'New-Age Careers Atlas',
    subtitle: 'Explore emerging industries and future pathways',
    description:
      '<p>Discover fast-growing careers across AI, sustainability, design, healthcare, and public policy.</p>',
    categoryLabel: 'Career Awareness Material',
    dateLabel: 'Career awareness · Class 11-12 · 6 min read',
    actionLabel: 'View Library',
    actionLink: '#',
    mediaFiles: [],
  },
];

const iconMap: Record<string, IonName> = {
  'Downloadable Guides': 'document-text-outline',
  'Educational Content': 'book-outline',
  'Career Awareness Material': 'globe-outline',
};

const stripHtml = (value = '') =>
  String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncateText = (value = '', maxLength = 180) =>
  value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;

const formatValue = (value: any, fallback: string) => {
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
  return value || fallback;
};

const openLink = (url?: string) => {
  if (!url || url === '#') return;
  Linking.openURL(url).catch(() => {});
};

const isVideoFile = (f?: MediaFile) => f?.mimetype?.startsWith('video');

/* ---------------- Media ---------------- */
function Media({ file, height }: { file?: MediaFile; height?: number }) {
  if (!file?.publicUrl) return null;
  if (isVideoFile(file)) {
    return (
      <TouchableOpacity activeOpacity={0.9} style={[styles.videoBox, height ? { height } : styles.mediaRatio]} onPress={() => openLink(file.publicUrl)}>
        <View style={styles.playCircle}>
          <Ionicons name="play" size={26} color="#fff" />
        </View>
        <Text style={styles.videoHint}>Tap to play video</Text>
      </TouchableOpacity>
    );
  }
  return (
    <Image
      source={{ uri: file.publicUrl }}
      style={[styles.mediaImg, height ? { height } : styles.mediaRatio]}
      resizeMode="cover"
    />
  );
}

/* ---------------- Read-More modal ---------------- */
function ResourceModal({ resource, onClose }: { resource: Resource | null; onClose: () => void }) {
  if (!resource) return null;

  const media = resource.mediaFiles || [];
  const primary = media[0];
  const isDownload = resource.actionLabel?.toLowerCase().includes('download');

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        {/* Dark header */}
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderTop}>
            <Text style={styles.modalEyebrow}>{formatValue(resource.categoryLabel, 'Resource')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>{resource.title}</Text>
          {!!resource.subtitle && <Text style={styles.modalSubtitle}>{resource.subtitle}</Text>}
        </View>

        <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
          {primary && (
            <View style={styles.modalMediaWrap}>
              <Media file={primary} />
            </View>
          )}

          <View style={styles.descCard}>
            <Text style={styles.descLabel}>Description</Text>
            <RichText html={resource.description} />
          </View>

          {media.length > 1 && (
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.descLabel, { marginBottom: 12 }]}>Media Gallery</Text>
              <View style={{ gap: 12 }}>
                {media.slice(1).map((file, i) => (
                  <View key={file.guid || file.key || i} style={styles.galleryItem}>
                    <Media file={file} height={180} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {resource.actionLabel && resource.actionLink && (
            <TouchableOpacity style={styles.modalActionBtn} activeOpacity={0.9} onPress={() => openLink(resource.actionLink)}>
              <Ionicons name={isDownload ? 'download-outline' : 'open-outline'} size={16} color="#fff" />
              <Text style={styles.modalActionText}>{resource.actionLabel}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/* ---------------- Screen ---------------- */
export default function ResourcesScreen() {
  const [records, setRecords] = useState<Resource[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Resource | null>(null);

  useEffect(() => {
    getStudentExperience({ contentScope: 'RESOURCES', contentType: 'RESOURCE', activeOnly: true })
      .then((res) => setRecords(res.data?.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const sections = useMemo(() => {
    const data = records && records.length ? records : fallbackResources;
    const grouped = data.reduce<Record<string, Resource[]>>((acc, item) => {
      const title = item.categoryLabel || 'Resource Library';
      (acc[title] = acc[title] || []).push(item);
      return acc;
    }, {});
    return Object.entries(grouped).map(([title, items]) => ({
      title,
      icon: iconMap[title] || 'document-text-outline',
      items,
    }));
  }, [records]);

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
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroEyebrow}>RESOURCE LIBRARY</Text>
          <Text style={styles.heroTitle}>
            Downloadable guides, learning content, and career awareness material in one hub.
          </Text>
          <Text style={styles.heroSub}>
            Every resource can include rich text, images or videos so you quickly know what's
            relevant to you.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section) => (
          <View key={section.title} style={{ marginTop: 24 }}>
            <View style={styles.sectionHead}>
              <View style={styles.sectionIcon}>
                <Ionicons name={section.icon as IonName} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={{ gap: 14, marginTop: 14 }}>
              {section.items.map((item) => {
                const preview = truncateText(stripHtml(item.description), 200);
                const primary = item.mediaFiles?.[0];
                const isDownload = item.actionLabel?.toLowerCase().includes('download');

                return (
                  <View key={item._id || item.title} style={styles.card}>
                    {primary && (
                      <View style={styles.cardMedia}>
                        <Media file={primary} />
                      </View>
                    )}
                    <View style={styles.cardBody}>
                      <View style={styles.badgeRow}>
                        <Text style={styles.badgePrimary}>
                          {formatValue(item.categoryLabel, 'Career awareness material')}
                        </Text>
                        <Text style={styles.badgeMuted}>{formatValue(item.dateLabel, 'Not set')}</Text>
                      </View>

                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {!!item.subtitle && <Text style={styles.cardSubtitle}>{item.subtitle}</Text>}

                      <Text style={styles.cardPreview}>{preview || 'No description available.'}</Text>

                      <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.readMoreBtn} activeOpacity={0.85} onPress={() => setSelected(item)}>
                          <Text style={styles.readMoreText}>Read More</Text>
                          <Ionicons name="chevron-forward" size={15} color={COLORS.primary} />
                        </TouchableOpacity>

                        {item.actionLabel && item.actionLink && (
                          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={() => openLink(item.actionLink)}>
                            <Ionicons name={isDownload ? 'download-outline' : 'open-outline'} size={15} color="#fff" />
                            <Text style={styles.actionText}>{item.actionLabel}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <ResourceModal resource={selected} onClose={() => setSelected(null)} />
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
  hero: { backgroundColor: COLORS.slate, borderRadius: 24, padding: 22, overflow: 'hidden' },
  heroBlob: {
    position: 'absolute', top: -50, right: -40, width: 160, height: 160,
    borderRadius: 80, backgroundColor: 'rgba(59,190,232,0.16)',
  },
  heroEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.accent, letterSpacing: 1.8 },
  heroTitle: { fontSize: 23, fontWeight: '800', color: '#fff', lineHeight: 30, marginTop: 12, letterSpacing: -0.4 },
  heroSub: { fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.72)', marginTop: 12 },

  /* Section */
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E4F4FB', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2, flex: 1 },

  /* Card */
  card: { backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', ...CARD_SHADOW },
  cardMedia: { width: '100%' },
  cardBody: { padding: 18 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badgePrimary: {
    backgroundColor: '#E4F4FB', color: COLORS.primary, fontSize: 10, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, overflow: 'hidden',
  },
  badgeMuted: {
    backgroundColor: COLORS.surface, color: COLORS.gray, fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, overflow: 'hidden',
  },
  cardTitle: { fontSize: 19, fontWeight: '800', color: COLORS.text, lineHeight: 25 },
  cardSubtitle: { fontSize: 13, fontWeight: '600', color: COLORS.gray, marginTop: 6 },
  cardPreview: { fontSize: 13.5, lineHeight: 21, color: COLORS.gray, marginTop: 12 },

  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  readMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11,
  },
  readMoreText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11,
  },
  actionText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  /* Media */
  mediaRatio: { aspectRatio: 16 / 8 },
  mediaImg: { width: '100%', backgroundColor: COLORS.surface },
  videoBox: { width: '100%', backgroundColor: COLORS.slate, justifyContent: 'center', alignItems: 'center', gap: 10 },
  playCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center' },
  videoHint: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  /* Modal */
  modalSafe: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { backgroundColor: COLORS.slate, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 22 },
  modalHeaderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.accent, letterSpacing: 1.6, textTransform: 'uppercase', flex: 1 },
  closeBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 25, fontWeight: '800', color: '#fff', marginTop: 14, lineHeight: 32, letterSpacing: -0.4 },
  modalSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.72)', marginTop: 8, lineHeight: 20 },
  modalBody: { padding: 16, paddingBottom: 32 },
  modalMediaWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 20 },
  descCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18 },
  descLabel: { fontSize: 11, fontWeight: '800', color: COLORS.faint, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
  galleryItem: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  modalActionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, marginTop: 22,
  },
  modalActionText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
