import { format, differenceInDays, startOfWeek, subWeeks, addWeeks, isBefore, isAfter } from 'date-fns';

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy');
}

export function formatShortDate(dateStr: string): string {
  return format(new Date(dateStr), 'M/d');
}

export function daysBetween(dateStr1: string, dateStr2: string): number {
  return Math.abs(differenceInDays(new Date(dateStr1), new Date(dateStr2)));
}

export function getWeekStarts(numWeeks: number, referenceDate?: Date): string[] {
  const ref = referenceDate ?? new Date();
  const currentWeekStart = startOfWeek(ref, { weekStartsOn: 1 });
  const weeks: string[] = [];

  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekStart = subWeeks(currentWeekStart, i);
    weeks.push(format(weekStart, 'yyyy-MM-dd'));
  }

  return weeks;
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
