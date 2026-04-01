import { HADS, PHQ9, GAD7, PSS10, type QuestionnaireDefinition } from "./questionnaires";

export interface ScheduledAssessment {
  studyDay: number;
  timePoint: string;
  label: string;
  assessments: QuestionnaireDefinition[];
}

/**
 * Assessment schedule for the 12-week PBM study.
 * Baseline (day 0) is handled during study setup.
 * Follow-up questionnaires are completed only at study completion (week 12).
 */
export const ASSESSMENT_SCHEDULE: ScheduledAssessment[] = [
  { studyDay: 84, timePoint: "week_12", label: "Week 12 (Completion)", assessments: [HADS, PHQ9, GAD7, PSS10] },
];

/** Window in days: participants can complete assessments ±5 days from scheduled day */
export const ASSESSMENT_WINDOW_DAYS = 5;

/**
 * Given a study day, return assessments that are currently due (within window)
 * and haven't been completed yet.
 */
export function getDueAssessments(
  studyDay: number,
  completedTimePoints: string[]
): ScheduledAssessment[] {
  return ASSESSMENT_SCHEDULE.filter((scheduled) => {
    const isInWindow =
      studyDay >= scheduled.studyDay - ASSESSMENT_WINDOW_DAYS &&
      studyDay <= scheduled.studyDay + ASSESSMENT_WINDOW_DAYS;
    const isCompleted = completedTimePoints.includes(scheduled.timePoint);
    return isInWindow && !isCompleted;
  });
}

/**
 * Get the next upcoming assessment (not yet in window).
 */
export function getNextUpcoming(
  studyDay: number,
  completedTimePoints: string[]
): ScheduledAssessment | null {
  return (
    ASSESSMENT_SCHEDULE.find((s) => {
      return (
        s.studyDay - ASSESSMENT_WINDOW_DAYS > studyDay &&
        !completedTimePoints.includes(s.timePoint)
      );
    }) ?? null
  );
}
