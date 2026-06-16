import { Ancestor, ReminderItem, RitualReservation, Ritual } from '@/types';

export type CalendarEventType = 'birth' | 'death' | 'ritual' | 'reservation';

export interface CalendarEvent {
  type: CalendarEventType;
  ancestorId: string;
  ancestorName: string;
  date: string;
  label: string;
  id: string;
  ritualId?: string;
  reservationId?: string;
  location?: string;
}

export interface DayEvents {
  date: string;
  events: CalendarEvent[];
}

export const getCalendarDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  const startDate = new Date(year, month, 1 - startDayOfWeek);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
  }
  return days;
};

export const getEventsForMonth = (
  year: number,
  month: number,
  ancestors: Ancestor[],
  rituals: Ritual[],
  reservations: RitualReservation[]
): Map<string, CalendarEvent[]> => {
  const eventsMap = new Map<string, CalendarEvent[]>();

  const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const sameMonthDay = (dateStr: string, y: number, m: number) => {
    const d = new Date(dateStr);
    return d.getMonth() === m && d.getDate() >= 1 && d.getDate() <= 31;
  };

  const addEvent = (key: string, event: CalendarEvent) => {
    const existing = eventsMap.get(key) || [];
    existing.push(event);
    eventsMap.set(key, existing);
  };

  ancestors.forEach(ancestor => {
    const birthDate = new Date(ancestor.birthDate);
    if (birthDate.getMonth() === month) {
      const dayKey = dateKey(new Date(year, month, birthDate.getDate()));
      addEvent(dayKey, {
        type: 'birth',
        ancestorId: ancestor.id,
        ancestorName: ancestor.name,
        date: ancestor.birthDate,
        label: `${ancestor.name} 诞辰`,
        id: `${ancestor.id}-birth`,
      });
    }

    const deathDate = new Date(ancestor.deathDate);
    if (deathDate.getMonth() === month) {
      const dayKey = dateKey(new Date(year, month, deathDate.getDate()));
      addEvent(dayKey, {
        type: 'death',
        ancestorId: ancestor.id,
        ancestorName: ancestor.name,
        date: ancestor.deathDate,
        label: `${ancestor.name} 忌日`,
        id: `${ancestor.id}-death`,
      });
    }
  });

  rituals.forEach(ritual => {
    if (sameMonthDay(ritual.date, year, month)) {
      const d = new Date(ritual.date);
      const dayKey = dateKey(new Date(year, month, d.getDate()));
      addEvent(dayKey, {
        type: 'ritual',
        ancestorId: ritual.ancestorId,
        ancestorName: ritual.ancestorName || '',
        date: ritual.date,
        label: `${ritual.ancestorName || '先人'} 祭祀`,
        id: `ritual-${ritual.id}`,
        ritualId: ritual.id,
        location: ritual.location,
      });
    }
  });

  reservations.forEach(res => {
    if (res.status !== 'pending') return;
    if (sameMonthDay(res.date, year, month)) {
      const d = new Date(res.date);
      const dayKey = dateKey(new Date(year, month, d.getDate()));
      addEvent(dayKey, {
        type: 'reservation',
        ancestorId: res.ancestorId,
        ancestorName: res.ancestorName,
        date: res.date,
        label: `${res.ancestorName} 预约祭祀`,
        id: `reservation-${res.id}`,
        reservationId: res.id,
        location: res.location,
      });
    }
  });

  return eventsMap;
};

export const isToday = (date: Date): boolean => {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
};

export const isUpcoming = (date: Date, withinDays: number = 7): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= withinDays;
};

export const formatDate = (dateStr: string, format: 'full' | 'short' | 'year' = 'full'): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  
  if (format === 'year') {
    return date.getFullYear().toString();
  }
  
  if (format === 'short') {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const getLunarCalendar = (dateStr: string): string => {
  const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                     '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                     '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  
  const date = new Date(dateStr);
  const baseDate = new Date('1900-01-31');
  const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  ];
  
  let year = 1900;
  let month = 1;
  let day = 1;
  let leap = 0;
  let temp = 0;
  let offset = daysDiff;
  
  for (let i = 1900; i < 2100 && offset > 0; i++) {
    temp = lYearDays(i);
    offset -= temp;
    year = i;
  }
  
  if (offset < 0) {
    offset += temp;
    year--;
  }
  
  leap = leapMonth(year);
  let isLeap = false;
  
  for (let i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === leap + 1 && !isLeap) {
      --i;
      isLeap = true;
      temp = leapDays(year);
    } else {
      temp = monthDays(year, i);
    }
    
    if (isLeap && i === leap + 1) isLeap = false;
    offset -= temp;
    month = i;
  }
  
  if (offset === 0 && leap > 0 && month === leap + 1) {
    if (isLeap) {
      isLeap = false;
    } else {
      isLeap = true;
      --month;
    }
  }
  
  if (offset < 0) {
    offset += temp;
    --month;
  }
  
  day = offset + 1;
  
  return `${isLeap ? '闰' : ''}${lunarMonths[month - 1]}${lunarDays[day - 1]}`;
  
  function lYearDays(y: number): number {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
    }
    return sum + leapDays(y);
  }
  
  function leapMonth(y: number): number {
    return lunarInfo[y - 1900] & 0xf;
  }
  
  function leapDays(y: number): number {
    if (leapMonth(y)) {
      return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  }
  
  function monthDays(y: number, m: number): number {
    return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
  }
};

export const calculateDaysUntil = (targetDateStr: string): number => {
  const now = new Date();
  const target = new Date(targetDateStr);
  
  target.setFullYear(now.getFullYear());
  if (target < now) {
    target.setFullYear(now.getFullYear() + 1);
  }
  
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateDaysUntilFutureDate = (targetDateStr: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getAge = (birthDate: string, deathDate?: string): number => {
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getReminders = (
  ancestors: Ancestor[],
  reminderDays: number,
  reservations: RitualReservation[] = []
): ReminderItem[] => {
  const reminders: ReminderItem[] = [];
  
  ancestors.forEach(ancestor => {
    const birthDays = calculateDaysUntil(ancestor.birthDate);
    if (birthDays <= reminderDays) {
      reminders.push({
        id: `${ancestor.id}-birth`,
        ancestorId: ancestor.id,
        ancestorName: ancestor.name,
        type: 'birth',
        date: ancestor.birthDate,
        daysLeft: birthDays,
        dateStr: formatDate(ancestor.birthDate, 'short'),
      });
    }
    
    const deathDays = calculateDaysUntil(ancestor.deathDate);
    if (deathDays <= reminderDays) {
      reminders.push({
        id: `${ancestor.id}-death`,
        ancestorId: ancestor.id,
        ancestorName: ancestor.name,
        type: 'death',
        date: ancestor.deathDate,
        daysLeft: deathDays,
        dateStr: formatDate(ancestor.deathDate, 'short'),
      });
    }
  });
  
  reservations.forEach(reservation => {
    if (reservation.status !== 'pending') return;
    
    const daysLeft = calculateDaysUntilFutureDate(reservation.date);
    if (daysLeft >= 0 && daysLeft <= reminderDays) {
      reminders.push({
        id: `reservation-${reservation.id}`,
        ancestorId: reservation.ancestorId,
        ancestorName: reservation.ancestorName,
        type: 'reservation',
        date: reservation.date,
        daysLeft,
        dateStr: formatDate(reservation.date, 'short'),
        reservationId: reservation.id,
        location: reservation.location,
      });
    }
  });
  
  return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
};

export const getGenerationName = (generation: number): string => {
  const generations = ['高祖', '曾祖', '祖父', '父亲', '我辈', '子女', '孙辈', '曾孙', '玄孙'];
  const index = generation + 3;
  return generations[index] || `第${generation}代`;
};

export const groupByYear = <T extends { date: string }>(items: T[]): Record<string, T[]> => {
  return items.reduce((groups, item) => {
    const year = formatDate(item.date, 'year');
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};
