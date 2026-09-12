import { TeacherProfile, WeeklyTimetable, TimetableSlot, AgendaDayEvent, PedagogicalPhase } from '../types';
import { moroccanOfficialHolidays } from './moroccanHolidays';

export const DAYS_OF_WEEK = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const initialMoroccanAcademicEvents: AgendaDayEvent[] = moroccanOfficialHolidays;

const MORNING_HOURS = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:15', end: '11:15' },
  { start: '11:15', end: '12:15' },
  { start: '12:15', end: '13:00' },
];

const AFTERNOON_HOURS = [
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:15', end: '16:15' },
  { start: '16:15', end: '17:15' },
  { start: '17:15', end: '18:00' },
];

const INTERMITTENT_HOURS = [
  { start: '08:30', end: '09:45' },
  { start: '10:00', end: '11:15' },
  { start: '11:15', end: '12:00' },
  { start: '14:30', end: '15:45' },
  { start: '16:00', end: '17:00' },
];

export function generateDefaultTimetable(
  profile: TeacherProfile,
  phaseMode: 'tarl_remediation' | 'explicit_instruction' = 'explicit_instruction'
): WeeklyTimetable {
  return {
    slots: [],
    phaseMode,
    scheduleType: profile.scheduleType || 'continuous',
    lastUpdated: new Date().toISOString(),
    timingConfig: {
      morning1Start: '08:00',
      morning1End: '10:15',
      morning2Start: '10:30',
      morning2End: '13:00',
      afternoon1Start: '13:00',
      afternoon1End: '15:15',
      afternoon2Start: '15:30',
      afternoon2End: '18:00',
    },
  };
}

export function calculatePedagogicalMetrics(
  targetDateStr: string,
  events: AgendaDayEvent[],
  schoolStartDateStr = '2026-09-08'
): {
  pedagogicalWeek: number;
  pedagogicalDay: number;
  isTeachingDay: boolean;
  isPreTeachingWorkDay?: boolean;
  eventForDate?: AgendaDayEvent;
  phase: PedagogicalPhase;
  phaseTitle: string;
} {
  const [ty, tm, td] = targetDateStr.split('-').map(Number);
  const [sy, sm, sd] = schoolStartDateStr.split('-').map(Number);

  const targetDate = new Date(ty, tm - 1, td, 12, 0, 0);
  const startDate = new Date(sy, sm - 1, sd, 12, 0, 0);

  const eventForDate = events.find((e) => e.date === targetDateStr);
  const isSpecialOff =
    eventForDate &&
    (eventForDate.type === 'holiday' ||
      eventForDate.type === 'training' ||
      eventForDate.type === 'sick_leave');

  const isPreTeachingWorkDay =
    eventForDate &&
    (eventForDate.type === 'entry_signature' || eventForDate.type === 'student_reception');

  let effectiveDaysCount = 0;
  const curr = new Date(sy, sm - 1, sd, 12, 0, 0);

  while (curr <= targetDate) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;
    const isSunday = curr.getDay() === 0;
    const ev = events.find((e) => e.date === dStr);
    const isDayOff =
      isSunday ||
      (ev && (ev.type === 'holiday' || ev.type === 'training' || ev.type === 'sick_leave'));

    if (!isDayOff) {
      effectiveDaysCount++;
    }
    curr.setDate(curr.getDate() + 1);
  }

  const isBeforeOfficialStart = targetDate < startDate;
  const pedagogicalWeek = isBeforeOfficialStart ? 0 : Math.max(1, Math.ceil(effectiveDaysCount / 6));
  const pedagogicalDay = isBeforeOfficialStart ? 0 : Math.max(1, effectiveDaysCount);
  const isTaRL = pedagogicalDay > 0 && pedagogicalDay <= 24;
  const phase: PedagogicalPhase = isTaRL ? 'intensive_remediation' : 'explicit_instruction';
  const phaseTitle = isBeforeOfficialStart
    ? (eventForDate?.title || 'أيام الدخول واستقبال التلاميذ')
    : isTaRL
    ? 'فترة الدعم المكثف طارل (TaRL)'
    : 'مرحلة إرساء الموارد بالتدريس الصريح';

  return {
    pedagogicalWeek,
    pedagogicalDay,
    isTeachingDay: !isSpecialOff && !isPreTeachingWorkDay && targetDate.getDay() !== 0 && targetDate >= startDate,
    isPreTeachingWorkDay: !!isPreTeachingWorkDay,
    eventForDate,
    phase,
    phaseTitle,
  };
}
