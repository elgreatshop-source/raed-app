import React, { useState } from 'react';
import {
  TeacherProfile,
  WeeklyTimetable,
  TimetableSlot,
  AgendaDayEvent,
  AgendaEventType,
} from '../../types';
import {
  DAYS_OF_WEEK,
  generateDefaultTimetable,
  calculatePedagogicalMetrics,
} from '../../data/timetableTemplates';
import { OfficialTimetableDocument } from '../OfficialTimetableDocument';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react';

interface TeacherAgendaViewProps {
  profile: TeacherProfile;
  timetable: WeeklyTimetable;
  onSaveTimetable: (updated: WeeklyTimetable) => void;
  agendaEvents: AgendaDayEvent[];
  onSaveAgendaEvents: (events: AgendaDayEvent[]) => void;
  onNavigateToIngest: (selectedDate: string) => void;
  initialTab?: 'calendar' | 'timetable';
}

export const TeacherAgendaView: React.FC<TeacherAgendaViewProps> = ({
  profile,
  timetable,
  onSaveTimetable,
  agendaEvents,
  onSaveAgendaEvents,
  onNavigateToIngest,
  initialTab = 'calendar',
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'timetable'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [timetablePhase, setTimetablePhase] = useState<'tarl_remediation' | 'explicit_instruction'>('explicit_instruction');

  // Month navigation - starts September 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 is September

  // Simple Day Event Modal
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);
  const [modalEventType, setModalEventType] = useState<AgendaEventType>('teaching_day');
  const [modalEventNotes, setModalEventNotes] = useState<string>('');

  const monthNames = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'ماي',
    'يونيو',
    'يوليوز',
    'غشت',
    'شتنبر',
    'أكتوبر',
    'نونبر',
    'دجنبر',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate Exact Moroccan Calendar Grid (Week starts Monday)
  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: { dateStr: string; dayNum: number; isPadding?: boolean }[] = [];

    // Preceding padding days
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ dateStr: '', dayNum: 0, isPadding: true });
    }

    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      days.push({
        dateStr: `${y}-${m}-${d}`,
        dayNum: date.getDate(),
        isPadding: false,
      });
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  const handleOpenDayModal = (dateStr: string) => {
    setSelectedDateForModal(dateStr);
    const existing = agendaEvents.find((e) => e.date === dateStr);
    if (existing) {
      setModalEventType(existing.type);
      setModalEventNotes(existing.notes || '');
    } else {
      const metrics = calculatePedagogicalMetrics(
        dateStr,
        agendaEvents,
        profile.schoolStartDate || '2026-09-08'
      );
      setModalEventType(metrics.isTeachingDay ? 'teaching_day' : 'holiday');
      setModalEventNotes('');
    }
  };

  const handleSaveDayEvent = () => {
    if (!selectedDateForModal) return;

    const filtered = agendaEvents.filter((e) => e.date !== selectedDateForModal);
    if (modalEventType !== 'teaching_day' || modalEventNotes.trim()) {
      const defaultTitle =
        modalEventType === 'holiday'
          ? 'عطلة'
          : modalEventType === 'entry_signature'
          ? 'توقيع محاضر الدخول'
          : modalEventType === 'student_reception'
          ? 'استقبال التلميذات والتلاميذ'
          : modalEventType === 'training'
          ? 'تكوين مستمر'
          : modalEventType === 'sick_leave'
          ? 'رخصة'
          : modalEventType === 'evaluation'
          ? 'تقويم ودعم'
          : 'نشاط تربوي';

      const updatedEvents: AgendaDayEvent[] = [
        ...filtered,
        {
          date: selectedDateForModal,
          type: modalEventType,
          title: modalEventNotes.trim() || defaultTitle,
          notes: modalEventNotes,
        },
      ];
      onSaveAgendaEvents(updatedEvents);
    } else {
      onSaveAgendaEvents(filtered);
    }
    setSelectedDateForModal(null);
  };

  const handleSwitchTimetablePhase = (mode: 'tarl_remediation' | 'explicit_instruction') => {
    setTimetablePhase(mode);
    const generated = generateDefaultTimetable(profile, mode);
    onSaveTimetable(generated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Sleek Centered Orange Hub Header with Prominent Typography */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-amber-400 relative overflow-hidden transition-all text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-right sm:text-right flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                اليومية واستعمال الزمن الأسبوعي
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 font-bold mt-0.5">
                {profile.teacherName} • أول يوم عمل دراسي مع التلاميذ: {profile.schoolStartDate || '2026-09-08'} • {profile.academicYear || '2026/2027'}
              </p>
            </div>
          </div>

          {/* Switcher Tabs */}
          <div className="bg-stone-950/30 p-1.5 rounded-2xl border border-white/20 flex items-center gap-2 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>اليومية والمفكرة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'timetable'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>استعمال الزمن</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXACT CALENDAR & NOTEBOOK                                          */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Month Header Controls */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الشهر السابق</span>
            </button>

            <div className="text-center">
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                انقر على أي يوم لتدوين ملاحظة أو الاطلاع على التذكيرات المعتمدة
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <span>الشهر القادم</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Official Start Milestones Reference Card (Fixed in Application) */}
          <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-teal-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800 p-4 rounded-3xl border border-amber-200 dark:border-stone-800 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-amber-200/60 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-base">📌</span>
                <h3 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
                  المحطات الرسمية المعتمدة للدخول المدرسي 2026/2027 (مواعيد وتذكيرات ثابتة)
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold">
                مقرر تنظيم السنة الدراسية
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
              {/* Day 1: 02 Sep */}
              <div
                onClick={() => handleOpenDayModal('2026-09-02')}
                className="p-2.5 rounded-2xl bg-white dark:bg-stone-800/90 border border-teal-200 dark:border-teal-900 shadow-2xs hover:border-teal-500 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-teal-800 dark:text-teal-300">
                  <span>الأربعاء 02 شتنبر</span>
                  <span className="px-1.5 py-0.2 bg-teal-100 dark:bg-teal-950 rounded text-[9px]">📝 توقيع</span>
                </div>
                <h4 className="font-black text-stone-900 dark:text-stone-100 text-xs">توقيع محاضر الدخول</h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  توقيع المحاضر لهيئة التدريس واستلام جداول الحصص والتكليفات.
                </p>
              </div>

              {/* Day 2: 03 Sep */}
              <div
                onClick={() => handleOpenDayModal('2026-09-03')}
                className="p-2.5 rounded-2xl bg-white dark:bg-stone-800/90 border border-emerald-200 dark:border-emerald-900 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  <span>الخميس 03 شتنبر</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 rounded text-[9px]">🤝 استقبال</span>
                </div>
                <h4 className="font-black text-stone-900 dark:text-stone-100 text-xs">المستويين 1 و 2</h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  استقبال تلميذات وتلاميذ السنتين الأولى والثانية ابتدائي.
                </p>
              </div>

              {/* Day 3: 04 Sep */}
              <div
                onClick={() => handleOpenDayModal('2026-09-04')}
                className="p-2.5 rounded-2xl bg-white dark:bg-stone-800/90 border border-emerald-200 dark:border-emerald-900 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  <span>الجمعة 04 شتنبر</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 rounded text-[9px]">🤝 استقبال</span>
                </div>
                <h4 className="font-black text-stone-900 dark:text-stone-100 text-xs">المستويين 3 و 4</h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  استقبال تلميذات وتلاميذ السنتين الثالثة والرابعة ابتدائي وتوزيع الكراسات.
                </p>
              </div>

              {/* Day 4: 05 Sep */}
              <div
                onClick={() => handleOpenDayModal('2026-09-05')}
                className="p-2.5 rounded-2xl bg-white dark:bg-stone-800/90 border border-emerald-200 dark:border-emerald-900 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  <span>السبت 05 شتنبر</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 rounded text-[9px]">🤝 استقبال</span>
                </div>
                <h4 className="font-black text-stone-900 dark:text-stone-100 text-xs">المستويين 5 و 6</h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  استقبال تلميذات وتلاميذ السنتين الخامسة والسادسة ابتدائي.
                </p>
              </div>

              {/* Day 5: 08 Sep */}
              <div
                onClick={() => handleOpenDayModal('2026-09-08')}
                className="p-2.5 rounded-2xl bg-white dark:bg-stone-800/90 border border-amber-300 dark:border-amber-700 shadow-2xs hover:border-amber-500 cursor-pointer transition-all space-y-1 ring-1 ring-amber-400/50"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  <span>الثلاثاء 08 شتنبر</span>
                  <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 rounded text-[9px]">🟢 انطلاق</span>
                </div>
                <h4 className="font-black text-amber-950 dark:text-amber-200 text-xs">أول يوم دراسي مع التلاميذ</h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  الانطلاق الفعلي لحصص التدريس والأنشطة البيداغوجية ودعم طارل.
                </p>
              </div>
            </div>
          </div>

          {/* Moroccan Calendar Grid (7 columns: Mon -> Sun) */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-3.5 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-2xs">
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center">
              {[
                { full: 'الإثنين', short: 'إث' },
                { full: 'الثلاثاء', short: 'ثلا' },
                { full: 'الأربعاء', short: 'أرب' },
                { full: 'الخميس', short: 'خمي' },
                { full: 'الجمعة', short: 'جمع' },
                { full: 'السبت', short: 'سبت' },
                { full: 'الأحد', short: 'أحد' },
              ].map((d) => (
                <div
                  key={d.full}
                  className={`py-1 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg ${
                    d.full === 'الأحد'
                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
                      : 'text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/60'
                  }`}
                >
                  <span className="hidden sm:inline">{d.full}</span>
                  <span className="sm:hidden">{d.short}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map(({ dateStr, dayNum, isPadding }, idx) => {
                if (isPadding || !dateStr) {
                  return (
                    <div
                      key={`pad-${idx}`}
                      className="min-h-[65px] sm:min-h-[90px] rounded-xl bg-stone-50/20 dark:bg-stone-900/20 border border-transparent opacity-20"
                    />
                  );
                }

                const metrics = calculatePedagogicalMetrics(
                  dateStr,
                  agendaEvents,
                  profile.schoolStartDate || '2026-09-08'
                );

                const [y, m, d] = dateStr.split('-').map(Number);
                const dayDate = new Date(y, m - 1, d, 12, 0, 0);
                const isSunday = dayDate.getDay() === 0;
                const isHoliday = metrics.eventForDate?.type === 'holiday';
                const isTraining = metrics.eventForDate?.type === 'training';
                const isSick = metrics.eventForDate?.type === 'sick_leave';
                const isEntrySignature = metrics.eventForDate?.type === 'entry_signature';
                const isReception = metrics.eventForDate?.type === 'student_reception';
                const hasNotes = !!metrics.eventForDate?.notes;

                let cardBg = 'bg-stone-50 dark:bg-stone-800/60 hover:border-amber-500';
                if (isSunday) cardBg = 'bg-stone-100/50 dark:bg-stone-900/50 opacity-50';
                else if (isHoliday) cardBg = 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60';
                else if (isTraining) cardBg = 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60';
                else if (isSick) cardBg = 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60';
                else if (isEntrySignature) cardBg = 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/60';
                else if (isReception) cardBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60';

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleOpenDayModal(dateStr)}
                    className={`min-h-[65px] sm:min-h-[90px] p-1 sm:p-2 rounded-xl border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between items-center text-center transition-all cursor-pointer group ${cardBg}`}
                  >
                    {/* Top Status */}
                    <div className="w-full flex items-center justify-between text-[8px] sm:text-[9px]">
                      {isEntrySignature && (
                        <span className="px-1 py-0.2 rounded bg-teal-100 text-teal-800 font-bold truncate">محاضر الدخول</span>
                      )}
                      {isReception && (
                        <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold truncate">استقبال</span>
                      )}
                      {isTraining && (
                        <span className="px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">تكوين</span>
                      )}
                      {isSick && (
                        <span className="px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">رخصة</span>
                      )}
                      {isHoliday && (
                        <span className="px-1 py-0.2 rounded bg-red-100 text-red-800 font-bold truncate max-w-[85%]">
                          {metrics.eventForDate?.title || 'عطلة'}
                        </span>
                      )}
                      {!isEntrySignature && !isReception && !isTraining && !isSick && !isHoliday && <span />}
                      {hasNotes && <span className="text-amber-700 font-bold">📝</span>}
                    </div>

                    {/* Day Number */}
                    <div>
                      <span className="text-base sm:text-xl font-black text-stone-900 dark:text-stone-100 block leading-none">
                        {dayNum}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="w-full space-y-0.5">
                      {metrics.isTeachingDay ? (
                        <>
                          <span className="block text-[8px] sm:text-[9px] font-black text-amber-700 dark:text-amber-400 truncate">
                            {metrics.phase === 'intensive_remediation' ? 'طارل' : 'التدريس الصريح'}
                          </span>
                          <span className="block text-[8px] font-bold text-stone-600 dark:text-stone-300">
                            أ {metrics.pedagogicalWeek} • ي {metrics.pedagogicalDay}
                          </span>
                        </>
                      ) : isEntrySignature || isReception ? (
                        <span className="block text-[8px] sm:text-[9px] font-bold text-teal-800 dark:text-teal-300 truncate">
                          {isEntrySignature ? 'عمل: توقيع الدخول' : 'عمل: استقبال'}
                        </span>
                      ) : (
                        <span className="block text-[9px] text-stone-400 font-medium truncate">
                          {isSunday ? 'عطلة أسبوعية' : isHoliday ? 'عطلة' : 'توقف'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OFFICIAL TIMETABLE DOCUMENT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'timetable' && (
        <div className="animate-in fade-in duration-200">
          {/* Render the Official Moroccan Timetable Document with full gate & editor */}
          <OfficialTimetableDocument
            profile={profile}
            timetable={timetable}
            timetablePhase={timetablePhase}
            onUpdateTimetable={onSaveTimetable}
            onPhaseChange={handleSwitchTimetablePhase}
          />
        </div>
      )}

      {/* Simple Day Event Modal */}
      {selectedDateForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 dark:border-stone-800">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <h3 className="text-sm font-black">يومية: {selectedDateForModal}</h3>
              </div>
              <button
                onClick={() => setSelectedDateForModal(null)}
                className="p-1 rounded-xl hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">حالة اليوم الدراسي:</label>
                <select
                  value={modalEventType}
                  onChange={(e) => setModalEventType(e.target.value as AgendaEventType)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-bold"
                >
                  <option value="teaching_day">🟢 يوم عمل دراسي مع التلاميذ</option>
                  <option value="entry_signature">📝 توقيع محاضر الدخول</option>
                  <option value="student_reception">🤝 استقبال التلميذات والتلاميذ</option>
                  <option value="training">🔵 تكوين مستمر حضوري</option>
                  <option value="sick_leave">🟣 رخصة مرضية / غياب مبرر</option>
                  <option value="holiday">🔴 عطلة مدرسية أو وطنية</option>
                  <option value="evaluation">🟡 أسبوع التقويم والدعم</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">ملاحظات وتذكيرات (Notebook):</label>
                <textarea
                  rows={3}
                  value={modalEventNotes}
                  onChange={(e) => setModalEventNotes(e.target.value)}
                  placeholder="تدوين أي تذكير شخصي حول هذا اليوم..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const d = selectedDateForModal;
                    setSelectedDateForModal(null);
                    onNavigateToIngest(d);
                  }}
                  className="px-3 py-2 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>تحضير اليوم</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDateForModal(null)}
                    className="px-3 py-1.5 text-stone-600 dark:text-stone-400 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDayEvent}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
