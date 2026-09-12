import React, { useState, useRef } from 'react';
import {
  TeacherProfile,
  PedagogicalPhase,
  MindMapArabic,
  MindMapMath,
  MindMapFrench,
  DailyJournalData,
  PrintTheme,
  WeeklyTimetable,
} from '../../types';
import { ArabicMindMapCard } from '../ArabicMindMapCard';
import { MathMindMapCard } from '../MathMindMapCard';
import { FrenchMindMapCard } from '../FrenchMindMapCard';
import { DailyJournalCard } from '../DailyJournalCard';
import { ThemeFontSettingsModal } from '../ThemeFontSettingsModal';
import { PdfExportModal } from '../PdfExportModal';
import {
  MAIN_COLOR_PRESETS,
  ARABIC_FONT_PRESETS,
  LATIN_FONT_PRESETS,
  FONT_SCALE_PRESETS,
} from '../../data/themePresets';
import {
  BookOpen,
  Calculator,
  Globe,
  FileSpreadsheet,
  Save,
  Printer,
  Palette,
  CheckCircle2,
  Sliders,
  Download,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileCheck,
  Type,
  Eye,
  Info,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PreviewCustomizerViewProps {
  profile: TeacherProfile;
  phase: PedagogicalPhase;
  arabicMap: MindMapArabic;
  onArabicMapChange: (map: MindMapArabic) => void;
  mathMap: MindMapMath;
  onMathMapChange: (map: MindMapMath) => void;
  frenchMap: MindMapFrench;
  onFrenchMapChange: (map: MindMapFrench) => void;
  dailyJournal: DailyJournalData;
  onDailyJournalChange: (journal: DailyJournalData) => void;
  timetable?: WeeklyTimetable;
  theme: PrintTheme;
  onThemeChange: (theme: PrintTheme) => void;
  onSaveToArchive: () => void;
}

export function PreviewCustomizerView({
  profile,
  phase,
  arabicMap,
  onArabicMapChange,
  mathMap,
  onMathMapChange,
  frenchMap,
  onFrenchMapChange,
  dailyJournal,
  onDailyJournalChange,
  timetable,
  theme,
  onThemeChange,
  onSaveToArchive,
}: PreviewCustomizerViewProps) {
  // Determine available tabs based strictly on user inputs and teacher assignment
  const hasArabicContent = Boolean(
    arabicMap?.lessonTitle?.trim() ||
    profile.teachingMode === 'binome_arabic' ||
    profile.teachingMode === 'specialist_arabic' ||
    (profile.teachingMode === 'bilingual' && arabicMap?.lessonTitle)
  );

  const hasMathContent = Boolean(
    mathMap?.lessonTitle?.trim() ||
    profile.teachingMode === 'binome_french_math' ||
    profile.teachingMode === 'specialist_math' ||
    (profile.teachingMode === 'bilingual' && mathMap?.lessonTitle)
  );

  const hasFrenchContent = Boolean(
    frenchMap?.lessonTitle?.trim() ||
    profile.teachingMode === 'binome_french_math' ||
    profile.teachingMode === 'specialist_french' ||
    (profile.teachingMode === 'bilingual' && frenchMap?.lessonTitle)
  );

  // Default active tab: 'journal'
  const [activeTab, setActiveTab] = useState<'journal' | 'arabic' | 'math' | 'french' | 'all'>('journal');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isThemeToolbarOpen, setIsThemeToolbarOpen] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // List of active selectable documents strictly: Daily Journal + Uploaded Mind Map(s)
  const activeTabsList: Array<{ id: 'journal' | 'arabic' | 'math' | 'french'; label: string; icon: any }> = [
    { id: 'journal', label: 'المذكرة اليومية', icon: FileSpreadsheet },
  ];

  if (hasArabicContent) {
    activeTabsList.push({ id: 'arabic', label: 'خطاطة اللغة العربية', icon: BookOpen });
  }
  if (hasMathContent) {
    activeTabsList.push({ id: 'math', label: 'خطاطة الرياضيات', icon: Calculator });
  }
  if (hasFrenchContent) {
    activeTabsList.push({ id: 'french', label: 'Carte de Français', icon: Globe });
  }

  // Get next and previous document IDs for quick stepping
  const currentTabIdx = activeTabsList.findIndex((t) => t.id === activeTab);
  const prevTab = currentTabIdx > 0 ? activeTabsList[currentTabIdx - 1] : null;
  const nextTab = currentTabIdx >= 0 && currentTabIdx < activeTabsList.length - 1 ? activeTabsList[currentTabIdx + 1] : null;

  const currentTabInfo = activeTabsList.find((t) => t.id === activeTab) || activeTabsList[0];

  // High-Res A4 PDF Download
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 2) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const docNameClean =
        activeTab === 'journal'
          ? 'المذكرة_اليومية'
          : activeTab === 'arabic'
          ? 'خطاطة_اللغة_العربية'
          : activeTab === 'math'
          ? 'خطاطة_الرياضيات'
          : activeTab === 'french'
          ? 'Carte_Francais'
          : 'وثائق_الريادة';

      const fileName = `${docNameClean}_${dailyJournal.date || 'اليوم'}_${profile.teacherName || 'الاستاذ'}.pdf`;

      pdf.save(fileName);

      setToastMessage(`تم تصدير ملف الـ PDF (${currentTabInfo.label}) بنجاح!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء تصدير ملف الـ PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Smart Subject Selector Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors print:hidden">
        {/* Navigation Selector Bar - Strictly Showing Daily Journal & Uploaded Subject */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
          {activeTabsList.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-2 px-3.5 sm:px-5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs scale-102'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-stone-700/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-stone-900 dark:bg-stone-700 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-stone-700/60'
            }`}
            title="معاينة وطباعة كافة الوثائق معاً"
          >
            <FileCheck className="w-4 h-4" />
            <span>عرض الحزمة كاملة</span>
          </button>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-2">
          {/* PDF Export Studio Button */}
          <button
            type="button"
            id="btn-export-pdf-preview"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
            title="تصدير الوثيقة الحالية أو الحزمة كاملة كـ PDF عالي الجودة"
          >
            <Download className="w-4 h-4" />
            <span>تصدير PDF</span>
          </button>

          {/* Customizer Panel Button */}
          <button
            type="button"
            id="btn-open-theme-settings-preview"
            onClick={() => setIsThemeToolbarOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 shadow-2xs"
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-white shrink-0 shadow-xs"
              style={{ backgroundColor: theme.primaryColor || '#d97706' }}
            />
            <Palette className="w-4 h-4 text-amber-500" />
            <span>الألوان والخطوط</span>
          </button>

          {/* Save to Archive */}
          <button
            type="button"
            onClick={onSaveToArchive}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ بالأرشيف</span>
          </button>
        </div>
      </div>

      {/* Theme and Font Settings Modal Dialog */}
      <ThemeFontSettingsModal
        isOpen={isThemeToolbarOpen}
        onClose={() => setIsThemeToolbarOpen(false)}
        currentTheme={theme}
        onApplyTheme={onThemeChange}
      />

      {/* PDF Export Studio Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        profile={profile}
        theme={theme}
        onThemeChange={onThemeChange}
        defaultDocType={activeTab === 'all' ? 'all' : activeTab === 'journal' ? 'journal' : activeTab === 'arabic' ? 'arabic' : activeTab === 'math' ? 'math' : 'french'}
        dailyJournal={dailyJournal}
        arabicMap={hasArabicContent ? arabicMap : undefined}
        mathMap={hasMathContent ? mathMap : undefined}
        frenchMap={hasFrenchContent ? frenchMap : undefined}
      />

      {/* Crystal-Clear Interactive Preview Guide Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 dark:from-amber-950/60 dark:to-stone-900 border-2 border-amber-400/80 dark:border-amber-700 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-stone-900 dark:text-stone-100 shadow-2xs print:hidden">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-300">
                المعاينة التفاعلية الحية المباشرة (Live Interactive Sheet)
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                جاهز للطباعة A4
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
              أستاذي الفاضل: جميع الجداول والأنشطة والتواريخ والتوقيتات بالأسفل <strong>قابلة للتعديل الفوري والمباشر بالنقر عليها</strong>. قم بمراجعة وتعديل ما يلزم على الورقة مباشرة، ثم انزل لزر الطباعة بالأسفل لسحب الوثيقة فورياً.
            </p>
          </div>
        </div>

        {/* Quick Theme Status Badge */}
        <button
          type="button"
          onClick={() => setIsThemeToolbarOpen(true)}
          className="shrink-0 flex items-center gap-2 bg-white dark:bg-stone-800 px-3.5 py-2 rounded-2xl border border-stone-300 dark:border-stone-700 text-xs font-bold hover:border-amber-500 transition-all cursor-pointer shadow-2xs text-stone-800 dark:text-stone-200"
        >
          <span
            className="w-3 h-3 rounded-full border border-white shadow-xs"
            style={{ backgroundColor: theme.primaryColor || '#d97706' }}
          />
          <span>تغيير الألوان والخطوط</span>
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SEAMLESS PRINTABLE PRODUCT CANVAS & DOCK CONTAINER                        */}
      {/* ========================================================================= */}
      <div className="bg-stone-100 dark:bg-stone-900/50 p-2 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-6">
        {/* Printable Document Sheet Canvas */}
        <div
          ref={printAreaRef}
          className="space-y-8 bg-white text-stone-950 p-3 sm:p-6 rounded-2xl shadow-sm border border-stone-300 print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Active Document Card Display */}
          {(activeTab === 'journal' || activeTab === 'all') && (
            <div className={activeTab === 'all' ? 'page-break-after mb-8' : ''}>
              <DailyJournalCard
                data={dailyJournal}
                profile={profile}
                theme={theme}
                timetable={timetable}
                onUpdate={onDailyJournalChange}
              />
            </div>
          )}

          {(activeTab === 'arabic' || activeTab === 'all') && hasArabicContent && (
            <div className={activeTab === 'all' ? 'page-break-after mb-8' : ''}>
              <ArabicMindMapCard
                data={arabicMap}
                profile={profile}
                theme={theme}
                onUpdate={onArabicMapChange}
              />
            </div>
          )}

          {(activeTab === 'math' || activeTab === 'all') && hasMathContent && (
            <div className={activeTab === 'all' ? 'page-break-after mb-8' : ''}>
              <MathMindMapCard
                data={mathMap}
                profile={profile}
                theme={theme}
                onUpdate={onMathMapChange}
              />
            </div>
          )}

          {(activeTab === 'french' || activeTab === 'all') && hasFrenchContent && (
            <div className={activeTab === 'all' ? 'page-break-after mb-8' : ''}>
              <FrenchMindMapCard
                data={frenchMap}
                profile={profile}
                theme={theme}
                onUpdate={onFrenchMapChange}
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SEAMLESS PRINTING BAR BELOW THE PRODUCT (خانة الطباعة الكبيرة اسفل المنتوج) */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-7 border-2 border-amber-500 shadow-md space-y-5 print:hidden">
          {/* Header of Action Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-black rounded-full border border-amber-300/60 dark:border-amber-700 mb-1">
                <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>إخراج وطباعة الوثيقة الحالية: {currentTabInfo.label}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                الوثيقة جاهزة للسحب الورقي أو التنزيل الرقمي بصيغة PDF
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
                تاريخ اليوم الدراسي: {dailyJournal.date || 'اليوم'}
              </span>
            </div>
          </div>

          {/* Big Action Buttons Row - Focused Strictly on PDF Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* High-Res PDF Download Button */}
            <button
              type="button"
              onClick={() => handleDownloadPdf()}
              disabled={isExportingPdf}
              className="w-full bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-black py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer text-sm sm:text-base border border-amber-500 disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <div className="text-right">
                    <span className="block font-black leading-tight">جاري تحويل الوثيقة إلى PDF...</span>
                    <span className="text-[11px] font-medium text-amber-100 block">معالجة أبعاد الصفحة بدقة A4</span>
                  </div>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6 text-white shrink-0" />
                  <div className="text-right">
                    <span className="block font-black leading-tight">تصدير وتحميل وثيقة PDF الرسمية (A4)</span>
                    <span className="text-[11px] font-medium text-amber-100 block">حفظ ملف رقمي جاهز للطباعة أو المشاركة</span>
                  </div>
                </>
              )}
            </button>

            {/* Step to Next Document Button (يمر إلى الخطاطة بالزر) */}
            {nextTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(nextTab.id)}
                className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-black py-4 px-6 rounded-2xl shadow-xs transition-all active:scale-98 flex items-center justify-between cursor-pointer text-sm border-2 border-stone-700"
              >
                <div className="text-right">
                  <span className="text-[11px] text-stone-300 font-bold block">المرور إلى الوثيقة التالية:</span>
                  <span className="block font-black text-white">{nextTab.label}</span>
                </div>
                <ArrowLeft className="w-5 h-5 text-amber-400 shrink-0" />
              </button>
            ) : prevTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(prevTab.id)}
                className="w-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-black py-4 px-6 rounded-2xl shadow-xs transition-all active:scale-98 flex items-center justify-between cursor-pointer text-sm border-2 border-stone-300 dark:border-stone-600"
              >
                <div className="text-right">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold block">العودة إلى:</span>
                  <span className="block font-black text-stone-900 dark:text-stone-100">{prevTab.label}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSaveToArchive}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer text-sm"
              >
                <Save className="w-5 h-5" />
                <span>حفظ المذكرة في الأرشيف</span>
              </button>
            )}
          </div>

          {/* Secondary Quick Switches Bar */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-stone-600 dark:text-stone-400">التنقل السريع بين الوثائق:</span>
              {activeTabsList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-50 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  setTimeout(() => window.print(), 200);
                }}
                className="text-amber-800 dark:text-amber-300 hover:text-amber-950 font-black underline underline-offset-4 cursor-pointer"
              >
                🖨️ طباعة الحزمة كاملة (المذكرة + جميع الخطاطات دفعة واحدة)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
