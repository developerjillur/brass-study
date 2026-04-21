/**
 * Lab result (renal panel) submission schedule for the 12-week PBM study.
 * Baseline is handled during screening.
 * Follow-up lab results are only collected at study completion (Week 12).
 */
export interface ScheduledLab {
  studyDay: number;
  timePoint: string;
  label: string;
}

export const LAB_SCHEDULE: ScheduledLab[] = [
  { studyDay: 90, timePoint: "week_12", label: "Week 12 Lab (Completion)" },
];

export const LAB_WINDOW_DAYS = 7;

/**
 * Get labs currently due (within ±7 day window) that haven't been submitted.
 */
export function getDueLabs(
  studyDay: number,
  submittedDates: string[],
  studyStartDate: string | null
): ScheduledLab[] {
  if (!studyStartDate) return [];

  return LAB_SCHEDULE.filter((lab) => {
    const inWindow =
      studyDay >= lab.studyDay - LAB_WINDOW_DAYS &&
      studyDay <= lab.studyDay + LAB_WINDOW_DAYS;
    if (!inWindow) return false;

    // Check if a lab was submitted within this window
    const start = new Date(studyStartDate);
    const windowStart = new Date(start);
    windowStart.setDate(windowStart.getDate() + lab.studyDay - LAB_WINDOW_DAYS);
    const windowEnd = new Date(start);
    windowEnd.setDate(windowEnd.getDate() + lab.studyDay + LAB_WINDOW_DAYS);

    const hasSubmission = submittedDates.some((d) => {
      const date = new Date(d);
      return date >= windowStart && date <= windowEnd;
    });

    return !hasSubmission;
  });
}

/**
 * Get the next upcoming lab (not yet in window).
 */
export function getNextUpcomingLab(
  studyDay: number,
  submittedDates: string[],
  studyStartDate: string | null
): ScheduledLab | null {
  return (
    LAB_SCHEDULE.find((lab) => lab.studyDay - LAB_WINDOW_DAYS > studyDay) ?? null
  );
}
