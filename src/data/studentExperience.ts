// Ported from pioneer-client-deploy/src/data/studentExperience.js so the mobile
// Dashboard derives the exact same fallback content and grade/interest logic.

export interface InterestEvent {
  title: string;
  category: string;
  date: string;
  location: string;
}

export interface TargetExam {
  title: string;
  tag: string;
  date: string;
  detail: string;
}

export const gradeCategories = [
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
];

export const interestOptions = [
  { value: 'sports', label: 'Sports' },
  { value: 'arts', label: 'Arts' },
  { value: 'hobbies', label: 'Hobbies' },
];

// Shape of a record returned by GET /api/student-experience (contentScope=DASHBOARD)
export interface ExperienceRecord {
  _id?: string;
  contentType?: 'UPCOMING_EVENT' | 'CONTINUE_ACTIVITY' | 'NEXT_STEP' | string;
  title?: string;
  description?: string;
  categoryLabel?: string;
  dateLabel?: string;
  actionLink?: string;
  actionLabel?: string;
}

export const targetExams: TargetExam[] = [
  {
    title: 'CUET',
    tag: 'University Pathway',
    date: 'May 2026',
    detail: 'Central universities entrance preparation tracker and mock plan.',
  },
  {
    title: 'JEE',
    tag: 'Engineering',
    date: 'January 2027',
    detail: 'Build your 90-day physics and mathematics concept sprint.',
  },
  {
    title: 'NEET',
    tag: 'Medical',
    date: 'May 2027',
    detail: 'Strengthen biology revision, test cadence, and NCERT coverage.',
  },
];

export const upcomingEventsByInterest: Record<string, InterestEvent[]> = {
  sports: [
    { title: 'District Athletics Camp', category: 'Sports', date: '12 Apr 2026', location: 'City Stadium' },
    { title: 'Inter-School Badminton League', category: 'Sports', date: '22 Apr 2026', location: 'Indoor Sports Complex' },
  ],
  arts: [
    { title: 'Youth Art Portfolio Workshop', category: 'Arts', date: '16 Apr 2026', location: 'District Art Centre' },
    { title: 'Creative Writing Showcase', category: 'Arts', date: '27 Apr 2026', location: 'Town Library Auditorium' },
  ],
  hobbies: [
    { title: 'Robotics Hobby Maker Day', category: 'Hobbies', date: '18 Apr 2026', location: 'Innovation Lab' },
    { title: 'Photography Story Walk', category: 'Hobbies', date: '30 Apr 2026', location: 'Heritage City Route' },
  ],
};

// Mirror of client: grade string may arrive as "Grade 12", "12", etc.
export const normalizeGrade = (grade?: string): string => {
  if (!grade) return '12';
  const digits = String(grade).replace(/\D/g, '');
  return digits || '12';
};

export const isSeniorGrade = (grade?: string): boolean =>
  ['11', '12'].includes(normalizeGrade(grade));

export const buildInterestEvents = (interests: string[] = []): InterestEvent[] => {
  const selectedInterests = interests.length ? interests : ['sports', 'arts'];
  return selectedInterests.flatMap((interest) => upcomingEventsByInterest[interest] || []);
};
