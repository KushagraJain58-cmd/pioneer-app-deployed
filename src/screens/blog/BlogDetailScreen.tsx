import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlogPost } from '../../types';

const COLORS = { primary: '#004877', accent: '#3BBEE8', bg: '#F6FCFF', white: '#fff', text: '#1C2D37', gray: '#8B909A' };

export default function BlogDetailScreen({ route }: any) {
  const blog: BlogPost = route.params?.blog;
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{blog.title}</Text>
        <View style={styles.meta}>
          {blog.author && <Text style={styles.author}>✍️ {blog.author}</Text>}
          {blog.createdAt && <Text style={styles.date}>{new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>}
        </View>
        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tags}>
            {blog.tags.map((t, i) => <Text key={i} style={styles.tag}>{t}</Text>)}
          </View>
        )}
        <Text style={styles.content}>{blog.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.primary, lineHeight: 32, marginBottom: 12 },
  meta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  author: { fontSize: 13, color: COLORS.gray },
  date: { fontSize: 13, color: COLORS.gray },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: '#EFF8FF', color: COLORS.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: '600' },
  content: { fontSize: 15, color: COLORS.text, lineHeight: 26 },
});
