// Official 70 forced-choice MBTI questions + column mapping — ported verbatim
// from pioneer-client-deploy MBTIAssessment.js so scoring matches the backend.

export interface MbtiQuestion {
  id: number;
  text: string;
  a: string;
  b: string;
}

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  { id: 1, text: 'At a party do you:', a: 'Interact with many, including strangers', b: 'Interact with a few, known to you' },
  { id: 2, text: 'Are you more:', a: 'Realistic than speculative', b: 'Speculative than realistic' },
  { id: 3, text: 'Is it worse to:', a: 'Have your head in the clouds', b: 'Be in a rut' },
  { id: 4, text: 'Are you more impressed by:', a: 'Principles', b: 'Emotions' },
  { id: 5, text: 'Are you more drawn toward the:', a: 'Convincing', b: 'Touching' },
  { id: 6, text: 'Do you prefer to work:', a: 'To deadlines', b: 'Just whenever' },
  { id: 7, text: 'Do you tend to choose:', a: 'Rather carefully', b: 'Somewhat impulsively' },
  { id: 8, text: 'At parties do you:', a: 'Stay late, with increasing energy', b: 'Leave early with decreased energy' },
  { id: 9, text: 'Are you more attracted to:', a: 'Sensible people', b: 'Imaginative people' },
  { id: 10, text: 'Are you more interested in:', a: 'What is actual', b: 'What is possible' },
  { id: 11, text: 'In judging others are you more swayed by:', a: 'Laws than circumstances', b: 'Circumstances than laws' },
  { id: 12, text: 'In approaching others is your inclination to be somewhat:', a: 'Objective', b: 'Personal' },
  { id: 13, text: 'Are you more:', a: 'Punctual', b: 'Leisurely' },
  { id: 14, text: 'Does it bother you more having things:', a: 'Incomplete', b: 'Completed' },
  { id: 15, text: "In your social groups do you:", a: "Keep abreast of other's happenings", b: 'Get behind on the news' },
  { id: 16, text: 'In doing ordinary things are you more likely to:', a: 'Do it the usual way', b: 'Do it your own way' },
  { id: 17, text: 'Writers should:', a: 'Say what they mean and mean what they say', b: 'Express things more by use of analogy' },
  { id: 18, text: 'Which appeals to you more:', a: 'Consistency of thought', b: 'Harmonious human relationships' },
  { id: 19, text: 'Are you more comfortable in making:', a: 'Logical judgments', b: 'Value judgments' },
  { id: 20, text: 'Do you want things:', a: 'Settled and decided', b: 'Unsettled and undecided' },
  { id: 21, text: 'Would you say you are more:', a: 'Serious and determined', b: 'Easy-going' },
  { id: 22, text: 'In phoning do you:', a: 'Rarely question that it will all be said', b: "Rehearse what you'll say" },
  { id: 23, text: 'Facts:', a: 'Speak for themselves', b: 'Illustrate principles' },
  { id: 24, text: 'Are visionaries:', a: 'Somewhat annoying', b: 'Rather fascinating' },
  { id: 25, text: 'Are you more often:', a: 'A cool-headed person', b: 'A warm-hearted person' },
  { id: 26, text: 'Is it worse to be:', a: 'Unjust', b: 'Merciless' },
  { id: 27, text: 'Should one usually let events occur:', a: 'By careful selection and choice', b: 'Randomly and by chance' },
  { id: 28, text: 'Do you feel better about:', a: 'Having purchased', b: 'Having the option to buy' },
  { id: 29, text: 'In company do you:', a: 'Initiate conversation', b: 'Wait to be approached' },
  { id: 30, text: 'Common sense is:', a: 'Rarely questionable', b: 'Frequently questionable' },
  { id: 31, text: 'Children often do not:', a: 'Make themselves useful enough', b: 'Exercise their fantasy enough' },
  { id: 32, text: 'In making decisions do you feel more comfortable with:', a: 'Standards', b: 'Feelings' },
  { id: 33, text: 'Are you more:', a: 'Firm than gentle', b: 'Gentle than firm' },
  { id: 34, text: 'Which is more admirable:', a: 'The ability to organize and be methodical', b: 'The ability to adapt and make do' },
  { id: 35, text: 'Do you put more value on:', a: 'Infinite', b: 'Open-minded' },
  { id: 36, text: 'Does new interaction with others:', a: 'Stimulate and energize you', b: 'Tax your reserves' },
  { id: 37, text: 'Are you more frequently:', a: 'A practical sort of person', b: 'A fanciful sort of person' },
  { id: 38, text: 'Are you more likely to:', a: 'See how others are useful', b: 'See how others see' },
  { id: 39, text: 'Which is more satisfying:', a: 'To discuss an issue thoroughly', b: 'To arrive at agreement' },
  { id: 40, text: 'Which rules you more:', a: 'Your head', b: 'Your heart' },
  { id: 41, text: 'Are you more comfortable with work that is:', a: 'Contracted', b: 'Done casually' },
  { id: 42, text: 'Do you tend to look for:', a: 'The orderly', b: 'Whatever turns up' },
  { id: 43, text: 'Do you prefer:', a: 'Many friends with brief contact', b: 'Few friends with lengthy contact' },
  { id: 44, text: 'Do you go more by:', a: 'Facts', b: 'Principles' },
  { id: 45, text: 'Are you more interested in:', a: 'Production and distribution', b: 'Design and research' },
  { id: 46, text: 'Which is more of a compliment:', a: 'Very logical person', b: 'Very sentimental person' },
  { id: 47, text: 'Do you value more that you are:', a: 'Unwavering', b: 'Devoted' },
  { id: 48, text: 'Do you more often prefer:', a: 'Final statement', b: 'Tentative statement' },
  { id: 49, text: 'Are you more comfortable:', a: 'After a decision', b: 'Before a decision' },
  { id: 50, text: 'Do you:', a: 'Speak easily with strangers', b: 'Find little to say to strangers' },
  { id: 51, text: 'Are you more likely to trust your:', a: 'Experience', b: 'Hunch' },
  { id: 52, text: 'Do you feel:', a: 'More practical than ingenious', b: 'More ingenious than practical' },
  { id: 53, text: 'Which person is more to be complimented:', a: 'Clear reason', b: 'Strong feeling' },
  { id: 54, text: 'Are you inclined more to be:', a: 'Fair-minded', b: 'Sympathetic' },
  { id: 55, text: 'Is it preferable mostly to:', a: 'Make sure things are arranged', b: 'Just let things happen' },
  { id: 56, text: 'In relationships should most things be:', a: 'Re-negotiable', b: 'Random' },
  { id: 57, text: 'When the phone rings do you:', a: 'Hasten to get to it first', b: 'Hope someone else answers' },
  { id: 58, text: 'Do you prize more in yourself:', a: 'Strong sense of reality', b: 'Vivid imagination' },
  { id: 59, text: 'Are you drawn more to:', a: 'Fundamentals', b: 'Overtones' },
  { id: 60, text: 'Which seems the greater error:', a: 'To be too passionate', b: 'To be too objective' },
  { id: 61, text: 'Do you see yourself as:', a: 'Hard-headed', b: 'Soft-hearted' },
  { id: 62, text: 'Which situation appeals more:', a: 'Structured', b: 'Unstructured' },
  { id: 63, text: 'Are you more:', a: 'Routinized', b: 'Whimsical' },
  { id: 64, text: 'Are you more inclined to be:', a: 'Easy to approach', b: 'Reserved' },
  { id: 65, text: 'In writings do you prefer:', a: 'Literal', b: 'Figurative' },
  { id: 66, text: 'Is it harder to:', a: 'Identify with others', b: 'Utilize others' },
  { id: 67, text: 'Which do you wish more:', a: 'Clarity of reason', b: 'Strength of compassion' },
  { id: 68, text: 'Which is greater fault:', a: 'Being indiscriminate', b: 'Being critical' },
  { id: 69, text: 'Do you prefer:', a: 'Planned event', b: 'Unplanned event' },
  { id: 70, text: 'Do you tend to be more:', a: 'Deliberate', b: 'Spontaneous' },
];

export const getColumn = (id: number): number => {
  if ([1, 8, 15, 22, 29, 36, 43, 50, 57, 64].includes(id)) return 1;
  if ([2, 9, 16, 23, 30, 37, 44, 51, 58, 65].includes(id)) return 2;
  if ([3, 10, 17, 24, 31, 38, 45, 52, 59, 66].includes(id)) return 3;
  if ([4, 11, 18, 25, 32, 39, 46, 53, 60, 67].includes(id)) return 4;
  if ([5, 12, 19, 26, 33, 40, 47, 54, 61, 68].includes(id)) return 5;
  if ([6, 13, 20, 27, 34, 41, 48, 55, 62, 69].includes(id)) return 6;
  return 7; // [7,14,21,28,35,42,49,56,63,70]
};
