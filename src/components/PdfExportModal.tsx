import React, { useState, useRef } from 'react';
import {
  TeacherProfile,
  PrintTheme,
  DailyJournalData,
  MindMapArabic,
  MindMapMath,
  MindMapFrench,
  SavedDocumentPackage,
} from '../types';
import { DocumentPdfRenderer } from './DocumentPdfRenderer';
import {
  formatPdfFileName,
  generatePdfFromElement,
  downloadPdfBlob,
  sharePdfBlob,
} from '../utils/pdfExportService';
import { MAIN_COLOR_PRESETS } from '../data/themePresets';
import { logTechnicalError, getUserFriendlyErrorMessage } from '../utils/logger';
import {
  Printer,
  Download,
  Share2,
  X,
  FileSpreadsheet,
  BookOpen,
  Calculator,
  Globe,
  FileCheck,
  Palette,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  theme: PrintTheme;
  onThemeChange: (updated: PrintTheme) => void;
  defaultDocType?: 'all' | 'journal' | 'arabic' | 'math' | 'french';
  dailyJournal?: DailyJournalData;
  arabicMap?: MindMapArabic;
  mathMap?: MindMapMath;
  frenchMap?: MindMapFrench;
  documentPackage?: SavedDocumentPackage;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  profile,
  theme,
  onThemeChange,
  defaultDocType = 'all',
  dailyJournal,
  arabicMap,
  mathMap,
  frenchMap,
  documentPackage,
}) => {
  if (!isOpen) return null;

  const [activeDocType, setActiveDocType] = useState<'all' | 'journal' | 'arabic' | 'math' | 'french'>(defaultDocType);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState<number>(0.75);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Content availability check
  const curJournal = dailyJournal || documentPackage?.dailyJournal;
  const curArabic = arabicMap || documentPackage?.arabicMap;
  const curMath = mathMap || documentPackage?.mathMap;
  const curFrench = frenchMap || documentPackage?.frenchMap;

  const hasArabic = Boolean(curArabic?.lessonTitle?.trim());
  const hasMath = Boolean(curMath?.lessonTitle?.trim());
  const hasFrench = Boolean(curFrench?.lessonTitle?.trim());

  // Determine subject, lesson title, date for naming
  const getExportFileName = () => {
    let subject = 'تربوي';
    let lessonTitle = '';
    const date = curJournal?.date || documentPackage?.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];
    const level = profile.level || documentPackage?.level || 'الابتدائي';

    if (activeDocType === 'journal') {
      subject = 'المذكرة_اليومية';
    } else if (activeDocType === 'arabic') {
      subject = 'اللغة_العربية';
      lessonTitle = curArabic?.lessonTitle || '';
    } else if (activeDocType === 'math') {
      subject = 'الرياضيات';
      lessonTitle = curMath?.lessonTitle || '';
    } else if (activeDocType === 'french') {
      subject = 'Francais';
      lessonTitle = curFrench?.lessonTitle || '';
    } else if (activeDocType === 'all') {
      subject = 'حزمة_وثائق_الريادة';
    }

    return formatPdfFileName(activeDocType, subject, level, date, lessonTitle);
  };

  // Direct High-Resolution Structured PDF File Generation and Download
  const handleDownloadPdf = async () => {
    const docElement = document.getElementById('pdf-render-document-root');
    if (!docElement) {
      setExportError('تعذر العثور على محتوى الوثيقة للتصدير.');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      const fileName = getExportFileName();
      const { blob } = await generatePdfFromElement(docElement, fileName, {
        scale: 2.5,
        onProgress: (step) => setExportProgress(step),
      });

      downloadPdfBlob(blob, fileName);

      setExportSuccess(true);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });

      setTimeout(() => {
        setExportSuccess(false);
      }, 4000);
    } catch (err: any) {
      logTechnicalError('pdf', err, { action: 'download_pdf' });
      setExportError(getUserFriendlyErrorMessage(err, 'pdf', 'حدث خطأ غير متوقع أثناء معالجة ملف الـ PDF. يرجى المحاولة مرة أخرى.'));
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Share via Web Share API
  const handleSharePdf = async () => {
    const docElement = document.getElementById('pdf-render-document-root');
    if (!docElement) return;

    setIsSharing(true);
    setExportError(null);

    try {
      const fileName = getExportFileName();
      const { blob } = await generatePdfFromElement(docElement, fileName, {
        scale: 2.0,
        onProgress: (step) => setExportProgress(step),
      });

      const shared = await sharePdfBlob(blob, fileName, 'وثيقة تربوية من تطبيق رائد');
      if (!shared) {
        // Fallback: download if share dialog was dismissed or not supported
        downloadPdfBlob(blob, fileName);
      }
    } catch (err: any) {
      logTechnicalError('pdf', err, { action: 'share_pdf' });
      setExportError(getUserFriendlyErrorMessage(err, 'pdf', 'تعذر مشاركة الملف مباشرة. يمكنك تنزيل ملف الـ PDF بدلاً من ذلك.'));
    } finally {
      setIsSharing(false);
      setExportProgress('');
    }
  };

  // Native Vector Print Dialog
  const handleNativePrint = () => {
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
    });
    window.print();
  };

  const docTabs = [
    { id: 'all', label: 'الحزمة كاملة (ملف موحد)', icon: FileCheck, available: true },
    { id: 'journal', label: 'المذكرة اليومية', icon: FileSpreadsheet, available: Boolean(curJournal) },
    { id: 'arabic', label: 'خطاطة العربية', icon: BookOpen, available: hasArabic },
    { id: 'math', label: 'خطاطة الرياضيات', icon: Calculator, available: hasMath },
    { id: 'french', label: 'Carte de Français', icon: Globe, available: hasFrench },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  استوديو تصدير وطباعة وثائق PDF الرسمية (A4)
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30 hidden sm:inline">
                  جودة عالية 300 DPI
                </span>
              </div>
              <p className="text-xs text-stone-300">
                إنشاء وتنزيل ملف PDF منسق بيداغوجياً يدعم العربية والفرنسية وجاهز للسحب الورقي والمشاركة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY (TWO COLUMNS ON DESKTOP, STACKED ON MOBILE)                    */}
        {/* ========================================================================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-stone-100 dark:bg-stone-950">
          {/* LEFT/RIGHT SIDEBAR: CONTROLS & SETTINGS (4 COLUMNS) */}
          <div className="lg:col-span-4 p-4 sm:p-5 overflow-y-auto space-y-5 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            {/* 1. Document Selector */}
            <div>
              <label className="block text-xs font-black text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>1. تحديد الوثيقة المراد تصديرها:</span>
              </label>
              <div className="space-y-1.5">
                {docTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeDocType === tab.id;
                  const isAvailable = tab.available;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setActiveDocType(tab.id as any)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : isAvailable
                          ? 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                          : 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800/40 text-stone-400 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Theme Selector */}
            <div>
              <label className="block text-xs font-black text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>2. الطابع البصري ولون الترويسة:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MAIN_COLOR_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onThemeChange({
                        ...theme,
                        styleName: preset.id as any,
                        primaryColor: preset.primary,
                        accentColor: preset.accent,
                        borderColor: preset.border,
                      })
                    }
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      theme.primaryColor === preset.primary
                        ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 ring-1 ring-amber-500'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: preset.primary }}
                      />
                      {theme.primaryColor === preset.primary && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-stone-900 dark:text-stone-200 truncate">
                      {preset.label.split('(')[0].trim()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Official Header Toggle */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                <span>إظهار الترويسة الرسمية (المملكة المغربية):</span>
                <input
                  type="checkbox"
                  checked={theme.headerVisible !== false}
                  onChange={(e) => onThemeChange({ ...theme, headerVisible: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
              </label>
            </div>

            {/* File Naming Preview Card */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-xs">
              <div className="font-bold text-amber-950 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>اسم الملف المنظم عند التنزيل:</span>
              </div>
              <div className="font-mono text-[11px] text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-800 break-all text-left" dir="ltr">
                {getExportFileName()}
              </div>
            </div>

            {/* Error Message with Retry */}
            {exportError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-2">
                  <p>{exportError}</p>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة المحاولة</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT/CENTER: LIVE A4 DOCUMENT PREVIEW CANVAS (8 COLUMNS) */}
          <div className="lg:col-span-8 p-3 sm:p-6 flex flex-col justify-between overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between pb-3 text-xs font-bold text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>المعاينة المباشرة لصفحة A4 القياسية:</span>
              </span>

              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 px-2 py-1 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.max(0.4, s - 0.1))}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="تصغير المعاينة"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] px-1">{Math.round(previewScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.min(1.2, s + 0.1))}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="تكبير المعاينة"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScale(0.75)}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer text-stone-400 hover:text-stone-700"
                  title="إعادة الضبط"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Viewport with Scaled A4 Sheet */}
            <div
              ref={previewContainerRef}
              className="flex-1 overflow-auto bg-stone-200/80 dark:bg-stone-900/60 p-2 sm:p-6 rounded-2xl border border-stone-300 dark:border-stone-800 flex justify-center items-start shadow-inner"
            >
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="shadow-2xl rounded-lg bg-white"
              >
                <DocumentPdfRenderer
                  profile={profile}
                  theme={theme}
                  docType={activeDocType}
                  dailyJournal={curJournal}
                  arabicMap={curArabic}
                  mathMap={curMath}
                  frenchMap={curFrench}
                  documentPackage={documentPackage}
                  showPageNumbers={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER: ACTION BUTTONS (STICKY & RESPONSIVE)                         */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400">
            {exportProgress ? (
              <div className="flex items-center gap-2 text-amber-600 font-black animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{exportProgress}</span>
              </div>
            ) : exportSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600 font-black">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم تجهيز وتنزيل ملف الـ PDF بنجاح!</span>
              </div>
            ) : (
              <span>صيغة الإخراج: A4 Standard • تدعم العربية والفرنسية</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            {/* Native Share Button (Mobile / Web Share API) */}
            <button
              type="button"
              onClick={handleSharePdf}
              disabled={isExporting || isSharing}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-stone-200 dark:border-stone-700 cursor-pointer disabled:opacity-50 min-h-[44px]"
              title="مشاركة الملف مباشرة مع الزملاء أو عبر الواتساب"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <Share2 className="w-4 h-4 text-amber-600" />
              )}
              <span className="hidden sm:inline">مشاركة</span>
            </button>

            {/* Direct Native Print / Vector PDF Print Button */}
            <button
              type="button"
              onClick={handleNativePrint}
              disabled={isExporting}
              className="px-4 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
              title="الطباعة المباشرة باستخدام طابعة الجهاز أو حفظ PDF متجهي"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة فورية</span>
            </button>

            {/* Primary Action: Direct Structured PDF Download */}
            <button
              type="button"
              id="btn-confirm-download-pdf"
              onClick={handleDownloadPdf}
              disabled={isExporting || isSharing}
              className="flex-1 sm:flex-initial px-6 py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer border border-amber-500 disabled:opacity-50 min-h-[44px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري إنشاء الـ PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>تحميل PDF (A4)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
