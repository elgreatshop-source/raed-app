import React from 'react';
import { TeacherProfile, SavedDocumentPackage, AppScreen } from '../../types';
import {
  PlusCircle,
  Clock,
  User,
  Sparkles,
  TrendingUp,
  CalendarCheck,
  FolderOpen,
  CalendarDays,
  ClipboardCheck,
} from 'lucide-react';

interface DashboardHomeViewProps {
  profile: TeacherProfile;
  onStartNewDay: () => void;
  onOpenSavedDoc: (doc: SavedDocumentPackage) => void;
  onNavigateTab: (tab: AppScreen) => void;
  onNavigateToAgenda?: (initialTab?: 'calendar' | 'timetable') => void;
  savedPackages: SavedDocumentPackage[];
}

export function DashboardHomeView({
  profile,
  onStartNewDay,
  onOpenSavedDoc,
  onNavigateTab,
  onNavigateToAgenda,
  savedPackages,
}: DashboardHomeViewProps) {
  const recentPackages = savedPackages.slice(0, 4);

  // Stats calculation
  const totalCount = savedPackages.length;
  const lastSavedDate = savedPackages.length > 0 ? savedPackages[0].date : 'لم يتم بعد';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Action Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute -left-10 -bottom-10 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-3 py-1 rounded-full font-bold">
                الموسم الدراسي {profile.academicYear || '2026 - 2027'}
              </span>
              <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-3 py-1 rounded-full font-bold">
                {profile.school || 'المؤسسة التعليمية'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
              مرحباً بك، {profile.teacherName || 'الأستاذ(ة)'} 🌸
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium mt-1.5 max-w-2xl leading-relaxed">
              مساحتك البيداغوجية المتكاملة لإعداد المذكرات اليومية، الخطاطات الذهنية، جداول الحصص وشبكات التقويم باحترافية وسرعة وتصديرها بصيغة PDF جاهزة للطباعة.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-xl">
                <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-stone-800 dark:text-stone-200 font-bold">{profile.level}</span>
                {profile.classGroup && (
                  <>
                    <span className="text-stone-300 dark:text-stone-600">•</span>
                    <span>{profile.classGroup}</span>
                  </>
                )}
              </div>

              {profile.teachingMode && (
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-xl font-bold">
                  <span>
                    {profile.teachingMode === 'bilingual'
                      ? 'مزدوج (عربية + فرنسية + رياضيات)'
                      : profile.teachingMode === 'binome_french_math'
                      ? 'تفويج (فرنسية + رياضيات)'
                      : profile.teachingMode === 'binome_arabic'
                      ? 'تفويج (لغة عربية)'
                      : profile.teachingMode === 'specialist_arabic'
                      ? 'تخصص: لغة عربية'
                      : profile.teachingMode === 'specialist_french'
                      ? 'تخصص: لغة فرنسية'
                      : 'تخصص: رياضيات'}
                  </span>
                </div>
              )}

              <button
                onClick={() => onNavigateTab('onboarding')}
                className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline font-bold transition-colors cursor-pointer"
              >
                تعديل بطاقة الأستاذ
              </button>
            </div>
          </div>

          {/* Primary Quick Start Action Buttons (3 Buttons: New Day, Timetable, Academic Agenda) */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              id="btn-start-new-day"
              onClick={onStartNewDay}
              className="bg-amber-600 hover:bg-amber-700 active:scale-98 text-white px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>تحضير يوم دراسي جديد</span>
            </button>

            <button
              id="btn-nav-timetable"
              onClick={() => {
                if (onNavigateToAgenda) {
                  onNavigateToAgenda('timetable');
                } else {
                  onNavigateTab('agenda');
                }
              }}
              className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-200 dark:border-stone-700"
            >
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>استعمال الزمن</span>
            </button>

            <button
              id="btn-nav-agenda"
              onClick={() => {
                if (onNavigateToAgenda) {
                  onNavigateToAgenda('calendar');
                } else {
                  onNavigateTab('agenda');
                }
              }}
              className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-200 dark:border-stone-700"
            >
              <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>اليومية المدرسية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Practical Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">إجمالي الأيام المحضرة</span>
            <span className="text-lg font-black text-stone-900 dark:text-stone-100">{totalCount} مذكرة يومية</span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">تاريخ آخر تحضير منجز</span>
            <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 truncate block">
              {lastSavedDate}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">جاهزية التوليد والتصدير</span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 block">
              A4 جاهز للطباعة والـ PDF
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {recentPackages.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">آخر المذكرات المحفوظة</h3>
            </div>
            <button
              onClick={() => onNavigateTab('archive')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-bold cursor-pointer"
            >
              عرض السجل الكامل ({savedPackages.length})
            </button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {recentPackages.map((pkg) => (
              <div key={pkg.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{pkg.title || 'مذكرة يومية'}</span>
                    <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-full font-medium">
                      {pkg.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {pkg.arabicMap?.lessonTitle || 'درس لغة عربية'} • {pkg.mathMap?.lessonTitle || 'درس رياضيات'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSavedDoc(pkg)}
                    className="text-xs bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    فتح ومعاينة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl p-6 border border-dashed border-amber-300 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                جاهز لتحضير أول يوم دراسي؟
              </h4>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                اضغط على الزر للبدء، التقط صورة لصفحات الدروس أو أدخل عناوينها، وسيتم بناء الخطاطات والمذكرة تلقائياً.
              </p>
            </div>
          </div>

          <button
            onClick={onStartNewDay}
            className="bg-amber-600 hover:bg-amber-700 active:scale-98 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>بدء التحضير الآن</span>
          </button>
        </div>
      )}
    </div>
  );
}
