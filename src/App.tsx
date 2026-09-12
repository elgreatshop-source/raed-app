import React, { useState, useEffect } from 'react';
import {
  TeacherProfile,
  PedagogicalPhase,
  MindMapArabic,
  MindMapMath,
  MindMapFrench,
  DailyJournalData,
  PrintTheme,
  SavedDocumentPackage,
  WeeklyTimetable,
} from './types';
import {
  defaultTeacherProfile,
  defaultTheme,
  sampleArabicMindMap,
  sampleMathMindMap,
  sampleFrenchMindMap,
  sampleDailyJournal,
} from './data/initialData';
import { generateDefaultTimetable } from './data/timetableTemplates';
import { DailyIngestionView } from './components/views/DailyIngestionView';
import { PreviewCustomizerView } from './components/views/PreviewCustomizerView';
import { ThemeFontSettingsModal } from './components/ThemeFontSettingsModal';
import { PdfExportModal } from './components/PdfExportModal';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProgressiveLoadingOverlay, LoadingStage } from './components/ProgressiveLoadingOverlay';
import { logTechnicalError, getUserFriendlyErrorMessage } from './utils/logger';
import { registerBackButtonListener } from './services/nativeBridge';
import {
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  Palette,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  // Screen state in Android V1: 'ingest' (home screen) or 'preview' (customizer & export screen)
  const [currentScreen, setCurrentScreen] = useState<'ingest' | 'preview'>('ingest');

  // Modals & Generation State
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [exportingPdfDoc, setExportingPdfDoc] = useState<SavedDocumentPackage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Android Hardware Back Button Handler
  useEffect(() => {
    let listenerHandle: any = null;

    registerBackButtonListener(() => {
      // 1. If PDF export modal is open, close it
      if (exportingPdfDoc) {
        setExportingPdfDoc(null);
        return true;
      }

      // 2. If Theme/Font modal is open, close it
      if (isThemeModalOpen) {
        setIsThemeModalOpen(false);
        return true;
      }

      // 3. If currently in preview screen, return back to ingest screen
      if (currentScreen === 'preview') {
        setCurrentScreen('ingest');
        return true;
      }

      // 4. In ingest screen (root), return false to let Android minimize or exit naturally
      return false;
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        listenerHandle.remove();
      }
    };
  }, [currentScreen, isThemeModalOpen, exportingPdfDoc]);

  // Dark Mode State with safe persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('pioneer_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pioneer_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pioneer_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Teacher Profile state (uses defaultTeacherProfile in V1 without requiring login)
  const [profile] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem('pioneer_teacher_profile');
    return saved ? JSON.parse(saved) : defaultTeacherProfile;
  });

  // Timetable State (cached locally if needed for pedagogical calculations)
  const [timetable] = useState<WeeklyTimetable>(() => {
    const saved = localStorage.getItem('pioneer_weekly_timetable_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return generateDefaultTimetable(defaultTeacherProfile);
      }
    }
    return generateDefaultTimetable(defaultTeacherProfile);
  });

  // Print Theme
  const [theme, setTheme] = useState<PrintTheme>(() => {
    const saved = localStorage.getItem('pioneer_print_theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('pioneer_print_theme', JSON.stringify(theme));
  }, [theme]);

  // Active Phase & Date for generation
  const [phase, setPhase] = useState<PedagogicalPhase>('intensive_remediation');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [dayName, setDayName] = useState<string>('الثلاثاء');

  // Generated Documents State
  const [arabicMap, setArabicMap] = useState<MindMapArabic>(sampleArabicMindMap);
  const [mathMap, setMathMap] = useState<MindMapMath>(sampleMathMindMap);
  const [frenchMap, setFrenchMap] = useState<MindMapFrench>(sampleFrenchMindMap);
  const [dailyJournal, setDailyJournal] = useState<DailyJournalData>(sampleDailyJournal);

  // Modals & Generation State
  const [generationStage, setGenerationStage] = useState<LoadingStage>('uploading');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // AI Generation Handler
  const handleAiGenerate = async (payload: {
    phase: PedagogicalPhase;
    date: string;
    dayName: string;
    arabicLessonInput: string;
    mathLessonInput: string;
    frenchLessonInput: string;
    customInstructions: string;
    imagesBase64: Array<{ data: string; mimeType: string }>;
    documentsText?: Array<{ name: string; type: string; text: string }>;
  }) => {
    setIsGenerating(true);
    setGenerationStage('uploading');

    try {
      const stageTimer = setTimeout(() => {
        setGenerationStage('analyzing');
      }, 700);

      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiBaseUrl}/api/ai/generate-pedagogical-pack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          teacherProfile: profile,
          timetable,
        }),
      });

      clearTimeout(stageTimer);
      setGenerationStage('preparing');

      const data = await res.json();
      if (data.success && data.data) {
        setGenerationStage('saving');
        const timestamp = Date.now();
        const newArabic = data.data.arabicMap
          ? { ...data.data.arabicMap, id: `arabic-${timestamp}` }
          : arabicMap;
        const newMath = data.data.mathMap
          ? { ...data.data.mathMap, id: `math-${timestamp}` }
          : mathMap;
        const newFrench = data.data.frenchMap
          ? { ...data.data.frenchMap, id: `french-${timestamp}` }
          : frenchMap;
        const newJournal = data.data.dailyJournal
          ? { ...data.data.dailyJournal, id: `journal-${timestamp}` }
          : dailyJournal;

        setArabicMap(newArabic);
        setMathMap(newMath);
        setFrenchMap(newFrench);
        setDailyJournal(newJournal);

        setGenerationStage('completed');
        showToast('تم توليد المذكرة والخطاطات الذهنية بنجاح!');
        setCurrentScreen('preview');
      } else {
        throw new Error(data.error || 'فشل في توليد الوثائق البيداغوجية');
      }
    } catch (err: any) {
      logTechnicalError('gemini', err, { action: 'generate_pedagogical_pack' });
      showToast(
        getUserFriendlyErrorMessage(
          err,
          'gemini',
          'حدث خطأ أثناء معالجة البيانات وتوليد الوثائق. يرجى المحاولة مجدداً.'
        ),
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900 transition-colors pb-safe"
        dir="rtl"
      >
        {/* Offline Connectivity Banner */}
        <NetworkStatusBanner />

        {/* Progressive AI Ingestion Loading Overlay */}
        <ProgressiveLoadingOverlay
          isOpen={isGenerating}
          currentStage={generationStage}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-300 text-white max-w-[90vw] ${
              toastMessage.type === 'error' ? 'bg-red-700' : 'bg-stone-900 border border-stone-700'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{toastMessage.text}</span>
          </div>
        )}

        {/* Android-First Top App Bar */}
        <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md print:hidden transition-colors h-14 sm:h-16 flex items-center">
          <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2">
            {/* Logo & Main Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm border border-white/20"
                style={{ backgroundColor: theme.primaryColor || '#d97706' }}
              >
                <span className="leading-none select-none">ر</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-black tracking-tight leading-none text-white">
                    رائد | مساعد الأستاذ
                  </h1>
                </div>
                <p className="text-[10px] text-stone-400 font-medium hidden xs:block mt-0.5">
                  توليد المذكرات والخطاطات وتصدير PDF
                </p>
              </div>
            </div>

            {/* Quick Actions (Screen Toggle, Theme Settings, Dark Mode) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {currentScreen === 'preview' ? (
                <button
                  type="button"
                  onClick={() => setCurrentScreen('ingest')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>تحضير درس جديد</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentScreen('preview')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="معاينة الوثيقة الأخيرة"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">معاينة وتعديل</span>
                </button>
              )}

              {/* Theme & Font Customizer */}
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(true)}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition-all cursor-pointer"
                title="تخصيص ألوان وخطوط الطباعة"
              >
                <Palette className="w-3.5 h-3.5 text-stone-300" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition-all cursor-pointer"
                title={isDarkMode ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
              >
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area (Clean Android V1 Workflow) */}
        <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-4">
          {currentScreen === 'ingest' ? (
            <div className="space-y-4">
              <DailyIngestionView
                phase={phase}
                onPhaseChange={setPhase}
                date={date}
                onDateChange={setDate}
                dayName={dayName}
                onDayNameChange={setDayName}
                teacherProfile={profile}
                timetable={timetable}
                onGenerate={handleAiGenerate}
                isGenerating={isGenerating}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Back to Input button bar */}
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('ingest')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لإدخال مورد آخر</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>يمكنك تعديل أي بطاقة مباشرة وتصديرها بصيغة PDF</span>
                </div>
              </div>

              <PreviewCustomizerView
                profile={profile}
                phase={phase}
                arabicMap={arabicMap}
                onArabicMapChange={setArabicMap}
                mathMap={mathMap}
                onMathMapChange={setMathMap}
                frenchMap={frenchMap}
                onFrenchMapChange={setFrenchMap}
                dailyJournal={dailyJournal}
                onDailyJournalChange={setDailyJournal}
                timetable={timetable}
                theme={theme}
                onThemeChange={setTheme}
                onSaveToArchive={() => {
                  showToast('تم تحديث بيانات الوثيقة الحالية بنجاح.');
                }}
              />
            </div>
          )}
        </main>

        {/* Theme & Font Settings Modal */}
        <ThemeFontSettingsModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentTheme={theme}
          onApplyTheme={(newTheme) => {
            setTheme(newTheme);
            showToast('تم تطبيق إعدادات الألوان والخطوط.');
          }}
        />

        {/* Direct PDF Export Modal */}
        <PdfExportModal
          isOpen={Boolean(exportingPdfDoc)}
          onClose={() => setExportingPdfDoc(null)}
          profile={profile}
          theme={theme}
          onThemeChange={setTheme}
          documentPackage={exportingPdfDoc || undefined}
        />
      </div>
    </ErrorBoundary>
  );
}

