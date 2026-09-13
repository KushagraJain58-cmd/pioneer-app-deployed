import React, { useEffect, useMemo, useState } from 'react';
import SurveyAssessment, { SurveyQuestion } from './components/SurveyAssessment';
import { getCareerQuestions, submitCareerAssessment } from '../../lib/api';

const OPTIONS = [
  { label: 'Agree', value: 'A' },
  { label: 'Disagree', value: 'D' },
];

export default function CareerAssessmentScreen({ navigation }: any) {
  const [raw, setRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCareerQuestions()
      .then((res) => setRaw(res.data?.data || res.data || []))
      .catch(() => setRaw([]))
      .finally(() => setLoading(false));
  }, []);

  const questions: SurveyQuestion[] = useMemo(
    () => raw.map((q) => ({ id: q.id ?? q._id, text: q.text ?? q.questionText ?? q.question })),
    [raw]
  );

  return (
    <SurveyAssessment
      title="Career Maturity Inventory"
      questions={questions}
      options={OPTIONS}
      loading={loading}
      navigation={navigation}
      resultScreen="CareerResult"
      buildPayload={(answered, completionTimeSeconds) => ({
        completionTimeSeconds,
        answers: answered.map((a) => ({ questionId: a.id, selectedOption: a.value })),
      })}
      submit={(payload) => submitCareerAssessment(payload).then(() => {})}
    />
  );
}
