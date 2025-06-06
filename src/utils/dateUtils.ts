
import { eachDayOfInterval, isTuesday, startOfDay, nextTuesday, isAfter, isBefore, isSameDay, previousTuesday, isWithinInterval, eachWeekOfInterval } from 'date-fns';

/**
 * Get all Tuesdays in a given interval
 */
export const eachTuesdayOfInterval = (interval: { start: Date; end: Date }) => {
  return eachDayOfInterval(interval).filter(day => isTuesday(day));
};

/**
 * Get the start of the current Tuesday or previous Tuesday if today is not Tuesday
 */
export const startOfTuesday = (date: Date) => {
  const day = startOfDay(date);
  if (isTuesday(day)) {
    return day;
  }
  // Find the previous Tuesday
  return startOfDay(previousTuesday(day));
};

/**
 * Format a date to a string for comparison
 */
export const formatDateForComparison = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Re-export functions from date-fns that we need
export { isAfter, isBefore, isSameDay, previousTuesday, isWithinInterval, eachWeekOfInterval };
