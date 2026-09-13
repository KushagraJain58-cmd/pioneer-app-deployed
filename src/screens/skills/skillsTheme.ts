export const COLORS = {
  primary: '#004877',
  accent: '#3BBEE8',
  bg: '#F6FCFF',
  white: '#FFFFFF',
  text: '#1C2D37',
  gray: '#8B909A',
  border: '#E2EAF0',
  green: '#16A34A',
  greenBg: '#DCFCE7',
  red: '#DC2626',
  redBg: '#FEE2E2',
  amber: '#D97706',
  amberBg: '#FEF3C7',
};

export const MONTHS = [
  { label: 'Jan', value: 1, name: 'January' },
  { label: 'Feb', value: 2, name: 'February' },
  { label: 'Mar', value: 3, name: 'March' },
  { label: 'Apr', value: 4, name: 'April' },
  { label: 'May', value: 5, name: 'May' },
  { label: 'Jun', value: 6, name: 'June' },
  { label: 'Jul', value: 7, name: 'July' },
  { label: 'Aug', value: 8, name: 'August' },
  { label: 'Sep', value: 9, name: 'September' },
  { label: 'Oct', value: 10, name: 'October' },
  { label: 'Nov', value: 11, name: 'November' },
  { label: 'Dec', value: 12, name: 'December' },
];

// Per-week accent palette to mirror the web client's coloured module cards.
export const WEEK_COLORS = [
  { bg: '#EFF6FF', tint: '#2563EB' },
  { bg: '#F5F3FF', tint: '#7C3AED' },
  { bg: '#ECFDF5', tint: '#059669' },
  { bg: '#FFFBEB', tint: '#D97706' },
];

/**
 * Lightweight HTML → plain text. The web client renders week content with
 * dangerouslySetInnerHTML; React Native has no HTML renderer installed, so we
 * strip tags while keeping paragraph / list breaks readable.
 */
export function htmlToText(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|h[1-6]|tr)\s*>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
