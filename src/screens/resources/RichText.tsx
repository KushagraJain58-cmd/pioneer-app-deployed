import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

// Minimal, dependency-free renderer for the small HTML subset the resource
// descriptions use: <p> <ul> <ol> <li> <strong>/<b> <em>/<i> <u> <a> <br>.

const COLORS = { text: '#334155', link: '#004877', bullet: '#6B7A86' };

interface Seg {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

function parseInline(html: string): Seg[] {
  const segs: Seg[] = [];
  const tagRe = /<(\/?)(strong|b|em|i|u|a)([^>]*)>/gi;
  const stack = { bold: 0, italic: 0, underline: 0, href: [] as string[] };
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  const push = (raw: string) => {
    const text = decode(raw.replace(/<[^>]+>/g, ''));
    if (!text) return;
    segs.push({
      text,
      bold: stack.bold > 0,
      italic: stack.italic > 0,
      underline: stack.underline > 0 || stack.href.length > 0,
      href: stack.href[stack.href.length - 1],
    });
  };

  while ((m = tagRe.exec(html))) {
    push(html.slice(lastIndex, m.index));
    lastIndex = tagRe.lastIndex;
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    if (tag === 'strong' || tag === 'b') stack.bold += closing ? -1 : 1;
    else if (tag === 'em' || tag === 'i') stack.italic += closing ? -1 : 1;
    else if (tag === 'u') stack.underline += closing ? -1 : 1;
    else if (tag === 'a') {
      if (closing) stack.href.pop();
      else {
        const href = /href=["']([^"']*)["']/i.exec(m[3] || '')?.[1] || '';
        stack.href.push(href);
      }
    }
  }
  push(html.slice(lastIndex));
  return segs;
}

const renderSegs = (segs: Seg[], keyBase: string) =>
  segs.map((s, i) => (
    <Text
      key={`${keyBase}-${i}`}
      style={[
        s.bold && styles.bold,
        s.italic && styles.italic,
        s.underline && styles.underline,
        !!s.href && styles.link,
      ]}
      onPress={s.href ? () => Linking.openURL(s.href!).catch(() => {}) : undefined}
    >
      {s.text}
    </Text>
  ));

export default function RichText({ html }: { html?: string }) {
  if (!html || !html.trim()) {
    return <Text style={styles.p}>No description available.</Text>;
  }

  const normalized = html.replace(/<br\s*\/?>/gi, '\n');
  const blocks: React.ReactNode[] = [];
  const blockRe = /<(p|ul|ol)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  const pushLoose = (raw: string) => {
    const t = decode(raw.replace(/<[^>]+>/g, '')).trim();
    if (t) blocks.push(<Text key={`l${key++}`} style={styles.p}>{t}</Text>);
  };

  while ((m = blockRe.exec(normalized))) {
    pushLoose(normalized.slice(lastIndex, m.index));
    lastIndex = blockRe.lastIndex;
    const tag = m[1].toLowerCase();
    const inner = m[3];

    if (tag === 'p') {
      blocks.push(
        <Text key={`p${key++}`} style={styles.p}>
          {renderSegs(parseInline(inner), `p${key}`)}
        </Text>
      );
    } else {
      const items = Array.from(inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((x) => x[1]);
      items.forEach((it, i) => {
        blocks.push(
          <View key={`li${key++}`} style={styles.liRow}>
            <Text style={styles.bullet}>{tag === 'ol' ? `${i + 1}.` : '•'}</Text>
            <Text style={[styles.p, styles.liText]}>{renderSegs(parseInline(it), `li${key}`)}</Text>
          </View>
        );
      });
    }
  }
  pushLoose(normalized.slice(lastIndex));
  if (!blocks.length) pushLoose(normalized);

  return <View>{blocks}</View>;
}

const styles = StyleSheet.create({
  p: { fontSize: 14, lineHeight: 23, color: COLORS.text, marginBottom: 12 },
  bold: { fontWeight: '800' },
  italic: { fontStyle: 'italic' },
  underline: { textDecorationLine: 'underline' },
  link: { color: COLORS.link, textDecorationLine: 'underline', fontWeight: '600' },
  liRow: { flexDirection: 'row', marginBottom: 8, paddingRight: 8 },
  bullet: { fontSize: 14, lineHeight: 23, color: COLORS.bullet, width: 22 },
  liText: { flex: 1, marginBottom: 0 },
});
