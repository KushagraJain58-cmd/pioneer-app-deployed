import React, { useEffect, useMemo, useState } from 'react';
import SurveyAssessment, { SurveyQuestion } from './components/SurveyAssessment';
import { getRiasecQuestions, submitRiasecAssessment } from '../../lib/api';

const OPTIONS = [
  { label: 'Agree', value: 'A' },
  { label: 'Disagree', value: 'D' },
];

export default function RIASECAssessmentScreen({ navigation }: any) {
  const [raw, setRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiasecQuestions()
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
      title="RIASEC Career Interest Test"
      questions={questions}
      options={OPTIONS}
      loading={loading}
      navigation={navigation}
      resultScreen="RIASECResult"
      buildPayload={(answered, completionTimeSeconds) => ({
        completionTimeSeconds,
        answers: answered.map((a) => ({ questionId: a.id, selectedOption: a.value })),
      })}
      submit={(payload) => submitRiasecAssessment(payload).then(() => {})}
    />
  );
}
