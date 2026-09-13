import { Ionicons } from '@expo/vector-icons';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

export interface PsychoTest {
  key: string;
  title: string;
  description: string;
  icon: IonName;
  assessmentScreen: string;
  resultScreen: string;
  resultKey: 'academic' | 'mbti' | 'career' | 'riasec' | 'disha1' | 'disha2' | 'disha3' | 'disha4' | 'disha5' | 'disha6' | 'disha7' | 'disha8' | 'dishac10' | 'dishac12';
  featured?: boolean;
  intro: {
    tagline: string;
    meta: string[];
    measures: { icon: IonName; title: string; desc: string }[];
    ethics: string;
  };
}

// Tests exposed in pioneer-client-deploy's Psychometric hub (DISHA 1 & 2 + 4 classic).
export const PSYCHO_TESTS: PsychoTest[] = [
  {
    key: 'disha1',
    title: 'DISHA — Career Direction',
    description:
      'The flagship Indian assessment combining your academic marks with aptitude, personality (OCEAN), interests (RIASEC), work values and situational judgment across 11 modules.',
    icon: 'compass-outline',
    assessmentScreen: 'DISHA1Assessment',
    resultScreen: 'DISHA1Result',
    resultKey: 'disha1',
    featured: true,
    intro: {
      tagline: 'Differential Intelligence & Scholastic Horizon Assessment — where your marks count as much as your aptitude.',
      meta: ['11 modules · ~185 items', 'Class 9–12', '65–80 minutes'],
      measures: [
        { icon: 'school-outline', title: 'Academic Marks', desc: 'Your real subject performance and trends — weighted 25–30% of your career match.' },
        { icon: 'bulb-outline', title: 'Aptitude (10 dimensions)', desc: 'Verbal, numerical, logical, spatial, abstract, clerical, mechanical, memory & creativity.' },
        { icon: 'sparkles-outline', title: 'Personality (OCEAN)', desc: 'Big Five traits with India-specific facets like exam-grit and joint-family comfort.' },
        { icon: 'navigate-outline', title: 'Interests (RIASEC)', desc: 'Your Holland Code from forced-choice and rating items, India-localised throughout.' },
        { icon: 'heart-outline', title: 'Work Values & Context', desc: 'What you want from work, plus the family and contextual factors that shape your path.' },
        { icon: 'reader-outline', title: 'Situational Judgment', desc: '15 real Indian dilemmas measuring resilience, assertiveness and decision-making.' },
      ],
      ethics:
        'This is not an IQ test and there are no perfect answers — answer what is true for you, not what seems impressive. For guidance only, never for admissions or selection.',
    },
  },
  {
    key: 'disha2',
    title: 'DISHA Test 2 — Interests & Motivations',
    description:
      'Maps what you enjoy, value and find meaningful — RIASEC activity preferences, 60 Indian career ratings, work values, career motivations, work-environment fit and situational judgment.',
    icon: 'sparkles-outline',
    assessmentScreen: 'DISHA2Assessment',
    resultScreen: 'DISHA2Result',
    resultKey: 'disha2',
    featured: true,
    intro: {
      tagline: 'Discover what genuinely interests, motivates and matters to you — the WHY behind your choices.',
      meta: ['6 modules', 'Class 9–12', '~45 minutes'],
      measures: [
        { icon: 'color-palette-outline', title: 'Activity & Occupation Interests', desc: 'What you enjoy doing and which real Indian careers appeal to you.' },
        { icon: 'heart-outline', title: 'Work Values', desc: 'Rate, weigh and rank what matters most to you in a future career.' },
        { icon: 'flame-outline', title: 'Career Motivations', desc: 'The intrinsic and extrinsic drivers behind what you want.' },
        { icon: 'business-outline', title: 'Work Environment Fit', desc: 'Sector, setting and work-style preferences used to personalise recommendations.' },
        { icon: 'reader-outline', title: 'Situational Judgment', desc: 'Values-in-action scenarios interpreted against your own values — never marked right or wrong.' },
      ],
      ethics:
        'Answer for yourself — not your parents’ ideal career, but yours. There are no right or wrong answers; this is for reflection and counselling only.',
    },
  },
  {
    key: 'disha3',
    title: 'DISHA Test 3 — Academic Performance',
    description:
      'Grounds everything in your real marks — Subject Strength Index, trends, learning styles, study habits, exam preparedness, stream recommendation and entrance-exam probability estimates.',
    icon: 'bar-chart-outline',
    assessmentScreen: 'DISHA3Assessment',
    resultScreen: 'DISHA3Result',
    resultKey: 'disha3',
    featured: true,
    intro: {
      tagline: 'Turn your real marks into a clear picture of your academic strengths and next steps.',
      meta: ['6 sections', 'Class 9–12', '~45 minutes'],
      measures: [
        { icon: 'school-outline', title: 'Academic Marks', desc: 'Recency-weighted Subject Strength Index, trends and consistency from your actual marks.' },
        { icon: 'happy-outline', title: 'Subject Proficiency', desc: 'Your comfort and enjoyment per subject, cross-checked with performance to surface hidden interests.' },
        { icon: 'book-outline', title: 'Learning Styles & Study Habits', desc: 'How you learn best and how you actually study — to personalise your study plan.' },
        { icon: 'timer-outline', title: 'Exam Preparedness', desc: 'Preparation quality, test strategy and exam anxiety.' },
        { icon: 'git-branch-outline', title: 'Stream & Exam Fit', desc: 'Stream recommendation and entrance-exam probability estimates from your marks.' },
        { icon: 'reader-outline', title: 'Situational Judgment', desc: 'Real academic dilemmas measuring your decision-making.' },
      ],
      ethics:
        'Enter your marks honestly — they are private and used only to personalise your recommendations. Weak or declining marks are solvable patterns, not fixed limits.',
    },
  },
  {
    key: 'disha4',
    title: 'DISHA Test 4 — Emotional Intelligence',
    description:
      'Measures emotional intelligence, resilience, grit, empathy and cultural adaptability through 5 sections and 15 real Indian scenarios — the skills that sustain success under pressure.',
    icon: 'heart-outline',
    assessmentScreen: 'DISHA4Assessment',
    resultScreen: 'DISHA4Result',
    resultKey: 'disha4',
    featured: true,
    intro: {
      tagline: 'The emotional skills that sustain success under pressure — every one of them can be developed.',
      meta: ['6 sections', 'Class 9–12', '~35 minutes'],
      measures: [
        { icon: 'eye-outline', title: 'Self-Awareness & Regulation', desc: 'How well you understand and manage your own emotions under pressure.' },
        { icon: 'barbell-outline', title: 'Resilience, Grit & Mindset', desc: 'How you bounce back from setbacks and pursue long-term goals.' },
        { icon: 'people-outline', title: 'Empathy & Interpersonal', desc: 'Reading others, building relationships and a service orientation.' },
        { icon: 'globe-outline', title: 'Social & Cultural Adaptability', desc: 'Comfort with diversity, mobility and new environments.' },
        { icon: 'reader-outline', title: 'Emotional Scenarios', desc: '15 real Indian pressure scenarios showing how you respond in the moment.' },
      ],
      ethics:
        'There are no right or wrong answers, and this does not diagnose any condition — it measures functional emotional intelligence for guidance. Your responses are confidential.',
    },
  },
  {
    key: 'disha5',
    title: 'DISHA Test 5 — Future-Readiness',
    description:
      'Measures career adaptability (4Cs), growth mindset, decision-making style, learning agility, risk tolerance and AI-readiness — how well-equipped you are for India\'s 2030 career landscape.',
    icon: 'rocket-outline',
    assessmentScreen: 'DISHA5Assessment',
    resultScreen: 'DISHA5Result',
    resultKey: 'disha5',
    featured: true,
    intro: {
      tagline: 'How well-equipped are you for a fast-changing economy where skills have a 2–3 year half-life?',
      meta: ['7 sections', 'Class 9–12', '~40 minutes'],
      measures: [
        { icon: 'sync-outline', title: 'Career Adaptability (4Cs)', desc: "Savickas's concern, control, curiosity and confidence — how ready you are to manage change." },
        { icon: 'trending-up-outline', title: 'Growth Mindset', desc: 'Whether you see ability as fixed or something you can build with effort.' },
        { icon: 'git-branch-outline', title: 'Decision-Making Style', desc: 'How you actually make big career decisions — no style is better than another.' },
        { icon: 'flash-outline', title: 'Learning Agility & Risk', desc: 'How eagerly you pick up new skills and how you handle uncertainty and calculated risk.' },
        { icon: 'planet-outline', title: 'Future Orientation & AI-Readiness', desc: 'How far ahead you think and how prepared you feel for India 2030.' },
        { icon: 'reader-outline', title: 'Career Scenarios', desc: 'Real transition and uncertainty scenarios showing how you navigate change.' },
      ],
      ethics:
        'No style is better than another — answer for who you are today. Your adaptability can grow with practice; this is for guidance only.',
    },
  },
  {
    key: 'disha6',
    title: 'DISHA Test 6 — Creativity & Entrepreneurship',
    description:
      '8 open-ended creative tasks plus innovation mindset, entrepreneurial readiness, problem-solving style and design sensitivity — discover your Creative Quotient and startup potential.',
    icon: 'bulb-outline',
    assessmentScreen: 'DISHA6Assessment',
    resultScreen: 'DISHA6Result',
    resultKey: 'disha6',
    featured: true,
    intro: {
      tagline: 'Creativity powers medicine, engineering, entrepreneurship and every future career — discover your Creative Quotient.',
      meta: ['7 sections', 'Class 9–12', '~45 minutes'],
      measures: [
        { icon: 'color-wand-outline', title: 'Creative Thinking Tasks', desc: 'Open-ended idea-generation tasks measuring fluency, flexibility, originality and elaboration.' },
        { icon: 'sparkles-outline', title: 'Innovation Mindset', desc: 'Your orientation toward finding and solving real-world problems.' },
        { icon: 'rocket-outline', title: 'Entrepreneurial Potential', desc: 'Opportunity recognition, risk tolerance, execution drive and business resilience.' },
        { icon: 'extension-puzzle-outline', title: 'Problem-Solving Style', desc: 'How you naturally approach problems — no style is better than another.' },
        { icon: 'shapes-outline', title: 'Design Sensitivity', desc: 'Aesthetic and design awareness that can unlock design-career pathways.' },
        { icon: 'reader-outline', title: 'Creative & Innovation Scenarios', desc: 'Real creative and startup dilemmas showing how you decide under pressure.' },
      ],
      ethics:
        'There are no right or wrong answers — write unusual ideas freely and answer for your real preferences. Creativity and entrepreneurial skill can all be developed.',
    },
  },
  {
    key: 'disha7',
    title: 'DISHA Test 7 — Leadership & Organisational Fit',
    description:
      'Leadership Potential Index, management aptitude, Belbin team-role profile, authority orientation, ethical leadership and organisational fit — where your leadership will thrive.',
    icon: 'ribbon-outline',
    assessmentScreen: 'DISHA7Assessment',
    resultScreen: 'DISHA7Result',
    resultKey: 'disha7',
    featured: true,
    intro: {
      tagline: 'Where — and how — will your leadership thrive? Not everyone leads the same way, and that\'s the point.',
      meta: ['8 sections', 'Class 9–12', '~40 minutes'],
      measures: [
        { icon: 'trophy-outline', title: 'Leadership Potential', desc: 'Vision, influence, decision-making under pressure and motivating others.' },
        { icon: 'briefcase-outline', title: 'Management Aptitude', desc: 'How you plan, organise and get things done through others.' },
        { icon: 'people-outline', title: 'Teamwork & Team Roles', desc: 'Your natural Belbin-adapted role within a team.' },
        { icon: 'shield-checkmark-outline', title: 'Authority & Ethics', desc: 'How you relate to power, and your ethical-leadership foundation.' },
        { icon: 'business-outline', title: 'Organisational Fit', desc: 'The kind of organisation — corporate, government, startup, NGO — where you\'d thrive.' },
        { icon: 'reader-outline', title: 'Leadership Scenarios', desc: 'Real Indian leadership, management and ethical dilemmas.' },
      ],
      ethics:
        'No orientation is better than another — answer for who you are, not who you think a leader should be. Leadership and ethical judgment can all be developed.',
    },
  },
  {
    key: 'disha8',
    title: 'DISHA Test 8 — Life Values & Lifestyle Fit',
    description:
      'The final DISHA test: your core life values, work-life balance needs, lifestyle goals, money mindset and long-term satisfaction predictors — what kind of life do you actually want to live?',
    icon: 'compass-outline',
    assessmentScreen: 'DISHA8Assessment',
    resultScreen: 'DISHA8Result',
    resultKey: 'disha8',
    featured: true,
    intro: {
      tagline: 'The capstone: what kind of life do you actually want to live? Your values moderate every other DISHA recommendation.',
      meta: ['8 sections', 'Class 9–12', '~45 minutes'],
      measures: [
        { icon: 'heart-outline', title: 'Core Life Values', desc: 'Rate and rank the values that genuinely matter most to you personally.' },
        { icon: 'sync-outline', title: 'Work-Life Balance', desc: 'How intense a career you can sustain, and what family life requires of it.' },
        { icon: 'home-outline', title: 'Lifestyle Goals & Money', desc: 'Where and how you want to live, and your real relationship with money and risk.' },
        { icon: 'happy-outline', title: 'Satisfaction Predictors', desc: 'The psychological needs a career must meet for you to feel sustainably satisfied.' },
        { icon: 'telescope-outline', title: 'Future Life Projection', desc: 'Imagine your life ahead — including your single most important non-negotiable.' },
        { icon: 'reader-outline', title: 'Life Design Dilemmas', desc: 'Real Indian dilemmas showing how you prioritise when values conflict.' },
      ],
      ethics:
        'Answer for what genuinely matters to you — not what you think you should value. What you value can evolve; this is for reflection and guidance only.',
    },
  },
  {
    key: 'dishac10',
    title: 'DISHA — Stream Selection (Class 10)',
    description:
      'A focused assessment for Class 10 students choosing a stream — combining marks, aptitude, interests, values and real-life scenarios into a Science PCM / PCB, Commerce or Humanities recommendation.',
    icon: 'git-branch-outline',
    assessmentScreen: 'DISHAC10Assessment',
    resultScreen: 'DISHAC10Result',
    resultKey: 'dishac10',
    featured: true,
    intro: {
      tagline: 'Which stream fits you for Class 11? A data-backed recommendation from your marks, aptitude, interests and values. (Class 10 only.)',
      meta: ['7 sections', 'Class 10 only', '~35–40 minutes'],
      measures: [
        { icon: 'school-outline', title: 'Academic Profile', desc: 'Your Subject Strength Index per subject, from your verified marks.' },
        { icon: 'bulb-outline', title: 'Aptitude Snapshot', desc: '14 timed reasoning questions (with optional hints) across four dimensions.' },
        { icon: 'color-palette-outline', title: 'Interests & Values', desc: 'What you enjoy doing and what matters most to you in a future career.' },
        { icon: 'git-compare-outline', title: 'Stream Preferences', desc: 'Forced-choice pairs that reveal your genuine pull between stream activities.' },
        { icon: 'reader-outline', title: 'Real-Life Scenarios', desc: 'Situations Class 10 students commonly face — how you navigate them.' },
      ],
      ethics:
        'No stream is ever blocked by your context answers. These probabilities are a guide, not a verdict — students succeed in any stream with effort and support.',
    },
  },
  {
    key: 'dishac12',
    title: 'DISHA — Career Selection (Class 12)',
    description:
      'A comprehensive assessment for Class 12 students finalising a career, college and entrance-exam path — 3-year academic trajectory, extended aptitude, full RIASEC, values, life design and Top 12 career recommendations.',
    icon: 'flag-outline',
    assessmentScreen: 'DISHAC12Assessment',
    resultScreen: 'DISHAC12Result',
    resultKey: 'dishac12',
    featured: true,
    intro: {
      tagline: 'Your final DISHA test: a data-backed Top 12 career shortlist from your 3-year academic trajectory, aptitude, personality, interests and values. (Class 12 only.)',
      meta: ['9 sections', 'Class 12 only', '~55–70 minutes'],
      measures: [
        { icon: 'school-outline', title: '3-Year Academic Trajectory', desc: 'Class 10, 11 and 12 marks (actual or predicted) plus any entrance-exam scores.' },
        { icon: 'bulb-outline', title: 'Extended Aptitude', desc: '20 harder reasoning questions across Numerical, Verbal, Logical and Abstract dimensions.' },
        { icon: 'sparkles-outline', title: 'Personality & Interests', desc: 'Your OCEAN profile and full RIASEC Holland Code.' },
        { icon: 'briefcase-outline', title: 'Career Titles & Values', desc: 'How appealing real careers sound, plus your work values and motivations.' },
        { icon: 'home-outline', title: 'Life Design', desc: 'Where and how you want to live and work over the next decade.' },
        { icon: 'reader-outline', title: 'Career Scenarios', desc: 'Real high-stakes situations Class 12 students commonly face.' },
      ],
      ethics:
        'No career option is ever blocked by your context answers. These probabilities are a guide, not a final verdict — your effort and choices always outweigh any single score.',
    },
  },
  {
    key: 'academic',
    title: 'Academic Self-Efficacy',
    description:
      'Measure your confidence in academic abilities across 12 key dimensions including learning, memory, exam skills, and critical thinking.',
    icon: 'school-outline',
    assessmentScreen: 'AcademicAssessment',
    resultScreen: 'AcademicResult',
    resultKey: 'academic',
    intro: {
      tagline: 'How confident are you in your academic abilities?',
      meta: ['12 dimensions', '5-point self-rating', '~10 minutes'],
      measures: [
        { icon: 'book-outline', title: 'Learning & Memory', desc: 'Your belief in how well you absorb and retain new material.' },
        { icon: 'create-outline', title: 'Exam Skills', desc: 'Confidence in preparation, time management and performing under pressure.' },
        { icon: 'bulb-outline', title: 'Critical Thinking', desc: 'How capable you feel at reasoning, analysis and problem-solving.' },
      ],
      ethics:
        'There are no right or wrong answers — rate what is genuinely true for you. This is for self-awareness and guidance only.',
    },
  },
  {
    key: 'mbti',
    title: 'MBTI Personality Test',
    description:
      'Discover your 4-letter personality type based on 70 forced-choice questions measuring E/I, S/N, T/F, and J/P.',
    icon: 'people-outline',
    assessmentScreen: 'MBTIAssessment',
    resultScreen: 'MBTIResult',
    resultKey: 'mbti',
    intro: {
      tagline: 'Discover your four-letter personality type.',
      meta: ['70 questions', 'Forced choice A / B', '~12 minutes'],
      measures: [
        { icon: 'sunny-outline', title: 'Energy (E / I)', desc: 'Where you draw energy — the outer world or your inner world.' },
        { icon: 'eye-outline', title: 'Information (S / N)', desc: 'How you take in information — facts and details, or patterns and ideas.' },
        { icon: 'git-compare-outline', title: 'Decisions (T / F)', desc: 'How you decide — through logic, or through values and people.' },
        { icon: 'calendar-outline', title: 'Lifestyle (J / P)', desc: 'How you approach life — planned and settled, or flexible and open.' },
      ],
      ethics: 'Answer quickly and honestly — do not overthink. Go with your first instinct for each pair.',
    },
  },
  {
    key: 'career',
    title: 'Career Maturity Inventory',
    description:
      'Evaluate your readiness to make informed career decisions across four dimensions: concern, curiosity, confidence, and consultation.',
    icon: 'briefcase-outline',
    assessmentScreen: 'CareerAssessment',
    resultScreen: 'CareerResult',
    resultKey: 'career',
    intro: {
      tagline: 'How ready are you to make career decisions?',
      meta: ['4 dimensions', 'Agree / Disagree', '~8 minutes'],
      measures: [
        { icon: 'compass-outline', title: 'Concern', desc: 'How oriented you are toward planning your future.' },
        { icon: 'search-outline', title: 'Curiosity', desc: 'How actively you explore careers and the world of work.' },
        { icon: 'ribbon-outline', title: 'Confidence', desc: 'Your belief in your ability to make sound career choices.' },
        { icon: 'chatbubbles-outline', title: 'Consultation', desc: 'How well you seek and use advice from others.' },
      ],
      ethics: 'Respond honestly — this maps your current readiness so you know where to grow next.',
    },
  },
  {
    key: 'riasec',
    title: 'RIASEC Career Interest Test',
    description:
      'Discover your Holland Code (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) and identify matching careers.',
    icon: 'navigate-outline',
    assessmentScreen: 'RIASECAssessment',
    resultScreen: 'RIASECResult',
    resultKey: 'riasec',
    intro: {
      tagline: 'Find the careers that match your interests.',
      meta: ['6 interest areas', 'Agree / Disagree', '~8 minutes'],
      measures: [
        { icon: 'construct-outline', title: 'Realistic & Investigative', desc: 'Hands-on, practical work and analytical, research-driven thinking.' },
        { icon: 'color-palette-outline', title: 'Artistic & Social', desc: 'Creative self-expression and helping, teaching or guiding people.' },
        { icon: 'trending-up-outline', title: 'Enterprising & Conventional', desc: 'Leading and persuading, plus organising and working with structure.' },
      ],
      ethics: 'Answer based on what genuinely interests you — not what sounds impressive or what others expect.',
    },
  },
];

export const getTest = (key: string) => PSYCHO_TESTS.find((t) => t.key === key);
