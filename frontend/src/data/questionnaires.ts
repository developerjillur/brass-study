// Questionnaire definitions for all onboarding assessments

export interface QuestionItem {
  id: string;
  text: string;
  options: { value: number; label: string }[];
  reverseScored?: boolean;
}

export interface QuestionnaireDefinition {
  id: string;
  title: string;
  description: string;
  instructions: string;
  questions: QuestionItem[];
  subscales?: { name: string; questionIds: string[] }[];
}

// ─── HADS (Hospital Anxiety and Depression Scale) ───
const hadsOptions = [
  { value: 3, label: "Most of the time" },
  { value: 2, label: "A lot of the time" },
  { value: 1, label: "From time to time" },
  { value: 0, label: "Not at all" },
];

const hadsReverseOptions = [
  { value: 0, label: "Most of the time" },
  { value: 1, label: "A lot of the time" },
  { value: 2, label: "From time to time" },
  { value: 3, label: "Not at all" },
];

export const HADS: QuestionnaireDefinition = {
  id: "hads",
  title: "Hospital Anxiety and Depression Scale (HADS)",
  description: "This questionnaire helps us understand how you have been feeling recently.",
  instructions: "Please read each item and select the reply which comes closest to how you have been feeling in the past week.",
  subscales: [
    { name: "anxiety", questionIds: ["hads_1", "hads_3", "hads_5", "hads_7", "hads_9", "hads_11", "hads_13"] },
    { name: "depression", questionIds: ["hads_2", "hads_4", "hads_6", "hads_8", "hads_10", "hads_12", "hads_14"] },
  ],
  questions: [
    { id: "hads_1", text: "I feel tense or wound up", options: hadsOptions },
    { id: "hads_2", text: "I still enjoy the things I used to enjoy", options: hadsReverseOptions, reverseScored: true },
    { id: "hads_3", text: "I get a sort of frightened feeling as if something awful is about to happen", options: hadsOptions },
    { id: "hads_4", text: "I can laugh and see the funny side of things", options: hadsReverseOptions, reverseScored: true },
    { id: "hads_5", text: "Worrying thoughts go through my mind", options: hadsOptions },
    { id: "hads_6", text: "I feel cheerful", options: hadsReverseOptions, reverseScored: true },
    { id: "hads_7", text: "I can sit at ease and feel relaxed", options: hadsReverseOptions, reverseScored: true },
    { id: "hads_8", text: "I feel as if I am slowed down", options: hadsOptions },
    { id: "hads_9", text: "I get a sort of frightened feeling like butterflies in the stomach", options: hadsOptions },
    { id: "hads_10", text: "I have lost interest in my appearance", options: hadsOptions },
    { id: "hads_11", text: "I feel restless as if I have to be on the move", options: hadsOptions },
    { id: "hads_12", text: "I look forward with enjoyment to things", options: hadsReverseOptions, reverseScored: true },
    { id: "hads_13", text: "I get sudden feelings of panic", options: hadsOptions },
    { id: "hads_14", text: "I can enjoy a good book or TV program", options: hadsReverseOptions, reverseScored: true },
  ],
};

// ─── PHQ-9 (Patient Health Questionnaire) ───
const phqOptions = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export const PHQ9: QuestionnaireDefinition = {
  id: "phq9",
  title: "Patient Health Questionnaire (PHQ-9)",
  description: "This questionnaire assesses symptoms of depression.",
  instructions: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  questions: [
    { id: "phq_1", text: "Little interest or pleasure in doing things", options: phqOptions },
    { id: "phq_2", text: "Feeling down, depressed, or hopeless", options: phqOptions },
    { id: "phq_3", text: "Trouble falling or staying asleep, or sleeping too much", options: phqOptions },
    { id: "phq_4", text: "Feeling tired or having little energy", options: phqOptions },
    { id: "phq_5", text: "Poor appetite or overeating", options: phqOptions },
    { id: "phq_6", text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", options: phqOptions },
    { id: "phq_7", text: "Trouble concentrating on things, such as reading the newspaper or watching television", options: phqOptions },
    { id: "phq_8", text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", options: phqOptions },
    { id: "phq_9", text: "Thoughts that you would be better off dead, or of hurting yourself in some way", options: phqOptions },
  ],
};

// ─── GAD-7 (Generalized Anxiety Disorder) ───
export const GAD7: QuestionnaireDefinition = {
  id: "gad7",
  title: "Generalized Anxiety Disorder Scale (GAD-7)",
  description: "This questionnaire assesses symptoms of anxiety.",
  instructions: "Over the last 2 weeks, how often have you been bothered by the following problems?",
  questions: [
    { id: "gad_1", text: "Feeling nervous, anxious, or on edge", options: phqOptions },
    { id: "gad_2", text: "Not being able to stop or control worrying", options: phqOptions },
    { id: "gad_3", text: "Worrying too much about different things", options: phqOptions },
    { id: "gad_4", text: "Trouble relaxing", options: phqOptions },
    { id: "gad_5", text: "Being so restless that it is hard to sit still", options: phqOptions },
    { id: "gad_6", text: "Becoming easily annoyed or irritable", options: phqOptions },
    { id: "gad_7", text: "Feeling afraid, as if something awful might happen", options: phqOptions },
  ],
};

// ─── PSS-10 (Perceived Stress Scale) ───
const pssOptions = [
  { value: 0, label: "Never" },
  { value: 1, label: "Almost never" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Fairly often" },
  { value: 4, label: "Very often" },
];

const pssReverseOptions = [
  { value: 4, label: "Never" },
  { value: 3, label: "Almost never" },
  { value: 2, label: "Sometimes" },
  { value: 1, label: "Fairly often" },
  { value: 0, label: "Very often" },
];

export const PSS10: QuestionnaireDefinition = {
  id: "pss10",
  title: "Perceived Stress Scale (PSS-10)",
  description: "This questionnaire measures your perception of stress.",
  instructions: "In the last month, how often have you felt or thought a certain way?",
  questions: [
    { id: "pss_1", text: "How often have you been upset because of something that happened unexpectedly?", options: pssOptions },
    { id: "pss_2", text: "How often have you felt that you were unable to control the important things in your life?", options: pssOptions },
    { id: "pss_3", text: "How often have you felt nervous and stressed?", options: pssOptions },
    { id: "pss_4", text: "How often have you felt confident about your ability to handle your personal problems?", options: pssReverseOptions, reverseScored: true },
    { id: "pss_5", text: "How often have you felt that things were going your way?", options: pssReverseOptions, reverseScored: true },
    { id: "pss_6", text: "How often have you found that you could not cope with all the things that you had to do?", options: pssOptions },
    { id: "pss_7", text: "How often have you been able to control irritations in your life?", options: pssReverseOptions, reverseScored: true },
    { id: "pss_8", text: "How often have you felt that you were on top of things?", options: pssReverseOptions, reverseScored: true },
    { id: "pss_9", text: "How often have you been angered because of things that were outside of your control?", options: pssOptions },
    { id: "pss_10", text: "How often have you felt difficulties were piling up so high that you could not overcome them?", options: pssOptions },
  ],
};

// Helper to calculate scores
export function calculateScores(
  questionnaire: QuestionnaireDefinition,
  responses: Record<string, number>
): { total: number; subscales?: Record<string, number> } {
  const total = Object.values(responses).reduce((sum, val) => sum + val, 0);

  if (!questionnaire.subscales) return { total };

  const subscales: Record<string, number> = {};
  for (const sub of questionnaire.subscales) {
    subscales[sub.name] = sub.questionIds.reduce(
      (sum, qId) => sum + (responses[qId] ?? 0),
      0
    );
  }
  return { total, subscales };
}
