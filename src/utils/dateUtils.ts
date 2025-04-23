
import { eachDayOfInterval, isTuesday, startOfDay, nextTuesday, isAfter, isBefore, isSameDay } from 'date-fns';

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
  const prevTuesday = new Date(day);
  while (!isTuesday(prevTuesday)) {
    prevTuesday.setDate(prevTuesday.getDate() - 1);
  }
  return startOfDay(prevTuesday);
};

export { isAfter, isBefore, isSameDay };
