import React, { useEffect, useMemo, useState } from 'react';
import SurveyAssessment, { SurveyQuestion } from './components/SurveyAssessment';
import { getAcademicQuestions, submitAcademicAssessment } from '../../lib/api';

const OPTIONS = [
  { label: 'Exactly True', value: 5 },
  { label: 'Nearly True', value: 4 },
  { label: 'Neutral', value: 3 },
  { label: 'Nearly False', value: 2 },
  { label: 'Exactly False', value: 1 },
];

export default function AcademicAssessmentScreen({ navigation }: any) {
  const [raw, setRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAcademicQuestions()
      .then((res) => setRaw(res.data?.data || res.data || []))
      .catch(() => setRaw([]))
      .finally(() => setLoading(false));
  }, []);

  const questions: SurveyQuestion[] = useMemo(
    () => raw.map((q) => ({ id: q._id ?? q.id, text: q.questionText ?? q.text ?? q.question })),
    [raw]
  );

  return (
    <SurveyAssessment
      title="Academic Self-Efficacy"
      questions={questions}
      options={OPTIONS}
      loading={loading}
      navigation={navigation}
      resultScreen="AcademicResult"
      buildPayload={(answered, completionTimeSeconds) => ({
        completionTimeSeconds,
        answers: answered.map((a) => ({ questionId: a.id, selectedOption: a.value })),
      })}
      submit={(payload) => submitAcademicAssessment(payload).then(() => {})}
    />
  );
}
