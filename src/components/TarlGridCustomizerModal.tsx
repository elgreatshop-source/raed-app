import React, { useState, useRef, useEffect } from 'react';
import { TeacherProfile } from '../types';
import { generatePdfFromElement, downloadPdfBlob, sharePdfBlob } from '../utils/pdfExportService';
import { logTechnicalError, getUserFriendlyErrorMessage } from '../utils/logger';
import {
  Printer,
  Download,
  Share2,
  X,
  Palette,
  Type,
  Users,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileSpreadsheet,
  Edit3,
  ListOrdered,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface TarlGridCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onUpdateProfile?: (updated: TeacherProfile) => void;
  showToast?: (msg: string) => void;
}

const COLOR_PRESETS = [
  {
    id: 'ministry_blue',
    name: 'الأزرق الوزاري (الأصلي)',
    primary: '#0284c7', // Sky / Cyan blue matching the uploaded official document
    headerBg: '#e0f2fe',
    border: '#0284c7',
    title: '#0369a1',
    badge: 'bg-sky-500',
  },
  {
    id: 'royal_navy',
    name: 'الكحلي الأكاديمي',
    primary: '#1e3a8a',
    headerBg: '#eff6ff',
    border: '#1e3a8a',
    title: '#1e3a8a',
    badge: 'bg-blue-900',
  },
  {
    id: 'emerald_green',
    name: 'الزمردي الرسمي',
    primary: '#047857',
    headerBg: '#ecfdf5',
    border: '#047857',
    title: '#065f46',
    badge: 'bg-emerald-700',
  },
  {
    id: 'burgundy',
    name: 'البورغندي الملكي',
    primary: '#9f1239',
    headerBg: '#fff1f2',
    border: '#9f1239',
    title: '#881337',
    badge: 'bg-rose-800',
  },
  {
    id: 'classic_black',
    name: 'الأسود الكلاسيكي',
    primary: '#18181b',
    headerBg: '#f4f4f5',
    border: '#27272a',
    title: '#09090b',
    badge: 'bg-stone-900',
  },
];

const FONT_PRESETS = [
  { id: 'Cairo', name: 'خط القاهرة (Cairo)', family: 'Cairo, sans-serif' },
  { id: 'Tajawal', name: 'خط تجوال (Tajawal)', family: 'Tajawal, sans-serif' },
  { id: 'Amiri', name: 'الخط الأميري (Amiri)', family: 'Amiri, serif' },
  { id: 'Alexandria', name: 'خط الإسكندرية (Alexandria)', family: 'Alexandria, sans-serif' },
  { id: 'Noto Kufi Arabic', name: 'الكوفي الحديث (Noto Kufi)', family: '"Noto Kufi Arabic", sans-serif' },
  { id: 'Almarai', name: 'خط المراعي (Almarai)', family: 'Almarai, sans-serif' },
];

export const TarlGridCustomizerModal: React.FC<TarlGridCustomizerModalProps> = ({
  isOpen,
  onClose,
  profile,
  showToast,
}) => {
  if (!isOpen) return null;

  // Mobile active tab ('controls' | 'preview')
  const [mobileTab, setMobileTab] = useState<'controls' | 'preview'>('controls');

  // Grid Config State
  const [studentCount, setStudentCount] = useState<number>(39);
  const [selectedColorPreset, setSelectedColorPreset] = useState(COLOR_PRESETS[0]);
  const [selectedFont, setSelectedFont] = useState(FONT_PRESETS[0]);
  
  // Header Meta editable fields
  const [metaInfo, setMetaInfo] = useState({
    school: profile.school || '',
    level: profile.level || 'السادس',
    classGroup: profile.classGroup || 'الفوج 1',
    academicYear: profile.academicYear || '2026 / 2027',
    testType: 'رائز الموضعة',
    teacherName: profile.teacherName || '',
    academy: profile.academy || 'مراكش - آسفي',
    direction: profile.direction || 'آسفي',
  });

  // Optional Student Names
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [namesInputMode, setNamesInputMode] = useState<boolean>(false);
  const [pastedNamesText, setPastedNamesText] = useState<string>('');

  // UI / Export states
  const [previewScale, setPreviewScale] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const printDocumentRef = useRef<HTMLDivElement>(null);

  // Auto-adjust scale on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPreviewScale(0.42); // Fits 800px document on mobile screen ~360-400px
      } else if (window.innerWidth < 1024) {
        setPreviewScale(0.65);
      } else {
        setPreviewScale(0.85);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply pasted names
  const handleApplyPastedNames = () => {
    const lines = pastedNamesText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      setStudentNames(lines);
      if (lines.length > studentCount) {
        setStudentCount(lines.length);
      }
      setNamesInputMode(false);
      showToast?.(`تم إدراج ${lines.length} اسم تلميذ بنجاح!`);
    } else {
      setStudentNames([]);
      setNamesInputMode(false);
    }
  };

  // PDF Export
  const handleDownloadPdf = async () => {
    if (!printDocumentRef.current) return;
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      const fileName = `شبكة_تفريغ_روائز_الموضعة_${metaInfo.level.replace(/\s+/g, '_')}_${metaInfo.classGroup.replace(/\s+/g, '_')}`;
      const { blob } = await generatePdfFromElement(printDocumentRef.current, fileName, {
        scale: 2.5,
        onProgress: (step) => setExportProgress(step),
      });

      downloadPdfBlob(blob, fileName);
      setExportSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      setTimeout(() => setExportSuccess(false), 4000);
      showToast?.('تم تحميل شبكة تفريغ نتائج روائز الموضعة بنجاح!');
    } catch (err: any) {
      logTechnicalError('pdf', err, { action: 'download_tarl_grid' });
      setExportError(getUserFriendlyErrorMessage(err, 'pdf', 'حدث خطأ أثناء تصدير ملف الشبكة. يرجى المحاولة ثانية.'));
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Share PDF
  const handleSharePdf = async () => {
    if (!printDocumentRef.current) return;
    setIsSharing(true);
    setExportError(null);

    try {
      const fileName = `شبكة_تفريغ_روائز_الموضعة_${metaInfo.level.replace(/\s+/g, '_')}`;
      const { blob } = await generatePdfFromElement(printDocumentRef.current, fileName, {
        scale: 2.0,
        onProgress: (step) => setExportProgress(step),
      });

      const shared = await sharePdfBlob(blob, fileName, 'شبكة تفريغ نتائج روائز الموضعة (TaRL)');
      if (!shared) {
        downloadPdfBlob(blob, fileName);
      }
    } catch (err: any) {
      setExportError('تعذر مشاركة الملف مباشرة.');
    } finally {
      setIsSharing(false);
      setExportProgress('');
    }
  };

  // Native Print
  const handleNativePrint = () => {
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.8 },
    });
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-stone-900 rounded-none sm:rounded-3xl shadow-2xl w-full max-w-7xl h-full sm:h-[95vh] flex flex-col overflow-hidden border-0 sm:border border-stone-200 dark:border-stone-800">
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="bg-stone-900 text-white p-3.5 sm:p-4 md:p-5 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs text-white shrink-0"
              style={{ backgroundColor: selectedColorPreset.primary }}
            >
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight truncate">
                  شبكة تفريغ نتائج روائز الموضعة (TaRL)
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                  A4 رسمي
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-300 hidden sm:block truncate">
                تخصيص عدد التلاميذ، الألوان، الخطوط، وتوليد شبكة مطابقة لدفتر مساطر وزارة التربية الوطنية.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE SEGMENT TABS (VISIBLE ON MOBILE ONLY)                              */}
        {/* ========================================================================= */}
        <div className="lg:hidden flex items-center bg-stone-100 dark:bg-stone-800 p-1.5 border-b border-stone-200 dark:border-stone-700 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('controls')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'controls'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span>1. التخصيص والإعدادات</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>2. معاينة الورقة A4</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY (RESPONSIVE DUAL-PANE: CONTROLS & A4 LIVE SHEET)                */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-stone-100 dark:bg-stone-950">
          {/* ======================================================================= */}
          {/* SIDEBAR: CONTROLS (FULL ON MOBILE IF ACTIVE, 4 COLS ON DESKTOP)         */}
          {/* ======================================================================= */}
          <div
            className={`lg:col-span-4 p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 ${
              mobileTab === 'controls' ? 'flex-1 block' : 'hidden lg:block'
            }`}
          >
            {/* 1. Student Count Slider */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>1. عدد التلاميذ بالقسم (الأسطر):</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={10}
                    max={45}
                    value={studentCount}
                    onChange={(e) => setStudentCount(Math.min(45, Math.max(10, parseInt(e.target.value) || 10)))}
                    className="w-14 text-center font-black text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg py-1 text-stone-900 dark:text-stone-100"
                  />
                  <span className="text-xs font-bold text-stone-500">تلميذ</span>
                </div>
              </div>

              <input
                type="range"
                min={10}
                max={45}
                value={studentCount}
                onChange={(e) => setStudentCount(parseInt(e.target.value))}
                className="w-full h-2.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold px-1">
                <span>10 تلاميذ (أفواج)</span>
                <span>39 (النموذج القياسي)</span>
                <span>45 تلميذ</span>
              </div>
            </div>

            {/* 2. Color Preset Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>2. نمط الألوان والتنسيق الوزاري:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedColorPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedColorPreset(preset)}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-amber-500'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                          {preset.name}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Font Family Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-600" />
                <span>3. نوع الخط العربي المستخدم:</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {FONT_PRESETS.map((f) => {
                  const isSelected = selectedFont.id === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFont(f)}
                      style={{ fontFamily: f.family }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                      }`}
                    >
                      {f.name.split('(')[0].trim()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Quick Edit of Header Fields */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <label className="block text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>4. معطيات الترويسة والشبكة (قابلة للتعديل):</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 block mb-0.5">المؤسسة:</span>
                  <input
                    type="text"
                    value={metaInfo.school}
                    onChange={(e) => setMetaInfo({ ...metaInfo, school: e.target.value })}
                    placeholder="اسم المؤسسة"
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 block mb-0.5">الأستاذ(ة):</span>
                  <input
                    type="text"
                    value={metaInfo.teacherName}
                    onChange={(e) => setMetaInfo({ ...metaInfo, teacherName: e.target.value })}
                    placeholder="اسم الأستاذ"
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 block mb-0.5">المستوى:</span>
                  <input
                    type="text"
                    value={metaInfo.level}
                    onChange={(e) => setMetaInfo({ ...metaInfo, level: e.target.value })}
                    placeholder="السادس"
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 block mb-0.5">مجموعة الاختبار (الفوج):</span>
                  <input
                    type="text"
                    value={metaInfo.classGroup}
                    onChange={(e) => setMetaInfo({ ...metaInfo, classGroup: e.target.value })}
                    placeholder="الفوج 1"
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 block mb-0.5">نوع الاختبار:</span>
                  <select
                    value={metaInfo.testType}
                    onChange={(e) => setMetaInfo({ ...metaInfo, testType: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold text-stone-900 dark:text-stone-100"
                  >
                    <option value="رائز الموضعة">رائز الموضعة</option>
                    <option value="الرائز المرحلي">الرائز المرحلي</option>
                    <option value="الرائز النهائي">الرائز النهائي</option>
                    <option value="رائز التقويم التشخيصي">رائز التقويم التشخيصي</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 block mb-0.5">الموسم الدراسي:</span>
                  <input
                    type="text"
                    value={metaInfo.academicYear}
                    onChange={(e) => setMetaInfo({ ...metaInfo, academicYear: e.target.value })}
                    placeholder="2026 / 2027"
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>

            {/* 5. Paste Student Names Option */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
                  <span>لائحة أسماء التلاميذ (اختياري):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setNamesInputMode(!namesInputMode)}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {namesInputMode ? 'إلغاء' : studentNames.length > 0 ? `مُدرج (${studentNames.length})` : '+ إدراج / لصق أسماء'}
                </button>
              </div>

              {namesInputMode ? (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] text-stone-500">
                    الصق أسماء التلاميذ هنا (كل اسم في سطر مستقل من مسار أو ملف Excel):
                  </p>
                  <textarea
                    rows={4}
                    value={pastedNamesText}
                    onChange={(e) => setPastedNamesText(e.target.value)}
                    placeholder="محمد بنعلي&#10;فاطمة الزهراء العلوي&#10;ياسين الإدريسي..."
                    className="w-full p-2 text-xs font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyPastedNames}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      تطبيق الأسماء على الجدول
                    </button>
                    {studentNames.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentNames([]);
                          setPastedNamesText('');
                          setNamesInputMode(false);
                        }}
                        className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        مسح الأسماء
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-stone-500 font-medium">
                  {studentNames.length > 0
                    ? `تم تعبئة ${studentNames.length} اسماً في الجدول تلقائياً.`
                    : 'الجدول جاهز بأسطر فارغة ومنقطة للكتابة اليدوية بالقلم.'}
                </p>
              )}
            </div>

            {/* Mobile quick button to preview */}
            <div className="lg:hidden pt-2">
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>معاينة الورقة بالكامل</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {exportError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <p>{exportError}</p>
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* MAIN CANVAS: LIVE A4 SHEET PREVIEW                                      */}
          {/* ======================================================================= */}
          <div
            className={`lg:col-span-8 p-2 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden ${
              mobileTab === 'preview' ? 'flex-1 block' : 'hidden lg:flex'
            }`}
          >
            {/* Toolbar with Zoom & Fit Screen */}
            <div className="flex items-center justify-between pb-2 text-xs font-bold text-stone-600 dark:text-stone-400 gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span>المعاينة المباشرة (A4 Portrait):</span>
              </span>

              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 px-2 py-1 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.max(0.3, Number((s - 0.08).toFixed(2))))}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] px-1 font-black">{Math.round(previewScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.min(1.3, Number((s + 0.08).toFixed(2))))}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.innerWidth < 640) setPreviewScale(0.42);
                    else if (window.innerWidth < 1024) setPreviewScale(0.65);
                    else setPreviewScale(0.85);
                  }}
                  className="px-2 py-0.5 text-[10px] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md cursor-pointer font-bold text-stone-700 dark:text-stone-300"
                  title="ملاءمة الشاشة"
                >
                  ملاءمة
                </button>
              </div>
            </div>

            {/* Scrollable Viewport with A4 Sheet Document */}
            <div className="flex-1 overflow-auto bg-stone-200/80 dark:bg-stone-900/70 p-2 sm:p-4 md:p-6 rounded-2xl border border-stone-300 dark:border-stone-800 flex justify-center items-start shadow-inner touch-pan-x touch-pan-y">
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="shadow-2xl rounded-sm bg-white shrink-0 my-1"
              >
                {/* ============================================================= */}
                {/* THE EXACT MOROCCAN OFFICIAL POSITIONING GRID (A4 PORTRAIT)     */}
                {/* ============================================================= */}
                <div
                  ref={printDocumentRef}
                  id="tarl-official-grid-document"
                  style={{
                    fontFamily: selectedFont.family,
                    width: '800px',
                    minHeight: '1130px',
                  }}
                  className="bg-white text-stone-950 p-6 sm:p-8 space-y-3 font-sans selection:bg-none"
                  dir="rtl"
                >
                  {/* 1. Official Header (Pure Typography without logo, matching official format) */}
                  <div className="w-full pb-2 border-b border-stone-300 space-y-1">
                    <div className="flex items-start justify-between">
                      {/* Right side: Arabic Ministry Title */}
                      <div className="text-right space-y-0.5 text-xs font-black text-stone-900 leading-tight">
                        <p className="text-sm font-black">المملكة المغربية</p>
                        <p className="text-xs font-bold text-stone-800">وزارة التربية الوطنية</p>
                        <p className="text-xs font-bold text-stone-800">والتعليم الأولي والرياضة</p>
                      </div>

                      {/* Left side: Tifinagh */}
                      <div className="text-left space-y-0.5 text-[11px] font-bold text-stone-700 leading-tight" dir="ltr">
                        <p className="font-bold text-stone-900 tracking-wider">ⵜⴰⴳⵍⴷⵉⵜ ⵏ ⵍⵎⵖⵔⵉⴱ</p>
                        <p className="text-[10px] text-stone-800">ⵜⴰⵎⴰⵡⴰⵙⵜ ⵏ ⵓⵙⴳⵎⵉ ⴰⵏⴰⵎⵓⵔ</p>
                        <p className="text-[10px] text-stone-800">ⴷ ⵓⵙⵙⵍⵎⴷ ⴰⵎⵣⵡⴰⵔⵓ ⴷ ⵜⵓⵏⵏⵓⵏⵜ</p>
                      </div>
                    </div>

                    {/* Sub-Header: Academy & Direction */}
                    <div className="text-center text-xs font-bold text-stone-800 space-y-0.5 pt-1">
                      <p>
                        الأكاديمية الجهوية للتربية والتكوين لجهة {metaInfo.academy || '...................................'}
                      </p>
                      <p>
                        المديرية الإقليمية {metaInfo.direction || '...................................'}
                      </p>
                    </div>
                  </div>

                  {/* 2. Main Title */}
                  <div className="text-center py-1">
                    <h1
                      style={{ color: selectedColorPreset.title }}
                      className="text-lg sm:text-xl font-black tracking-wide pb-1 inline-block border-b-2"
                    >
                      شبكة تفريغ نتائج روائز الموضعة
                    </h1>
                  </div>

                  {/* 3. Top Info Dual-Boxes (Right Box & Left Box) */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Right Info Box */}
                    <table
                      style={{ borderColor: selectedColorPreset.border }}
                      className="w-full border-2 border-collapse text-xs"
                    >
                      <tbody>
                        <tr style={{ borderColor: selectedColorPreset.border }} className="border-b">
                          <td
                            style={{
                              borderColor: selectedColorPreset.border,
                              backgroundColor: selectedColorPreset.headerBg,
                              color: selectedColorPreset.title,
                            }}
                            className="border-l-2 p-1.5 font-black text-center w-36"
                          >
                            المؤسسة
                          </td>
                          <td className="p-1.5 font-bold text-stone-900 text-center">
                            {metaInfo.school || '................................'}
                          </td>
                        </tr>
                        <tr style={{ borderColor: selectedColorPreset.border }} className="border-b">
                          <td
                            style={{
                              borderColor: selectedColorPreset.border,
                              backgroundColor: selectedColorPreset.headerBg,
                              color: selectedColorPreset.title,
                            }}
                            className="border-l-2 p-1.5 font-black text-center"
                          >
                            المستوى
                          </td>
                          <td className="p-1.5 font-bold text-stone-900 text-center">
                            {metaInfo.level || 'السادس'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              borderColor: selectedColorPreset.border,
                              backgroundColor: selectedColorPreset.headerBg,
                              color: selectedColorPreset.title,
                            }}
                            className="border-l-2 p-1.5 font-black text-center"
                          >
                            مجموعة الاختبار(الفوج)
                          </td>
                          <td className="p-1.5 font-bold text-stone-900 text-center">
                            {metaInfo.classGroup || '................................'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Left Info Box */}
                    <table
                      style={{ borderColor: selectedColorPreset.border }}
                      className="w-full border-2 border-collapse text-xs"
                    >
                      <tbody>
                        <tr style={{ borderColor: selectedColorPreset.border }} className="border-b">
                          <td
                            style={{
                              borderColor: selectedColorPreset.border,
                              backgroundColor: selectedColorPreset.headerBg,
                              color: selectedColorPreset.title,
                            }}
                            className="border-l-2 p-1.5 font-black text-center w-36"
                          >
                            الموسم الدراسي
                          </td>
                          <td className="p-1.5 font-bold text-stone-900 text-center">
                            {metaInfo.academicYear || '2026 / 2027'}
                          </td>
                        </tr>
                        <tr style={{ borderColor: selectedColorPreset.border }} className="border-b">
                          <td
                            style={{
                              borderColor: selectedColorPreset.border,
                              backgroundColor: selectedColorPreset.headerBg,
                              color: selectedColorPreset.title,
                            }}
                            className="border-l-2 p-1.5 font-black text-center"
                          >
                            نوع الاختبار
                          </td>
                          <td className="p-1.5 font-bold text-stone-900 text-center">
                            {metaInfo.testType || 'رائز الموضعة'}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              borderColor: selectedColorPreset.border,
                              backgroundColor: selectedColorPreset.headerBg,
                              color: selectedColorPreset.title,
                            }}
                            className="border-l-2 p-1.5 font-black text-center"
                          >
                            اسم الأستاذ(ة)
                          </td>
                          <td className="p-1.5 font-bold text-stone-900 text-center">
                            {metaInfo.teacherName || '................................'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Main Positioning Results Grid (8 Columns matching uploaded image) */}
                  <table
                    style={{ borderColor: selectedColorPreset.border }}
                    className="w-full border-2 border-collapse text-center text-stone-950"
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: selectedColorPreset.headerBg,
                          borderColor: selectedColorPreset.border,
                          color: selectedColorPreset.title,
                        }}
                        className="border-b-2 font-black text-[11px] leading-tight"
                      >
                        {/* 1. الرقم */}
                        <th
                          style={{ borderColor: selectedColorPreset.border }}
                          className="border-l-2 p-1.5 w-9 text-center"
                        >
                          الرقم
                        </th>

                        {/* 2. اسم التلميذ(ة) */}
                        <th
                          style={{ borderColor: selectedColorPreset.border }}
                          className="border-l-2 p-1.5 w-44 text-center"
                        >
                          اسم التلميذ(ة)
                        </th>

                        {/* 3. اللغة العربية (مستوى موضعة) */}
                        <th
                          style={{ borderColor: selectedColorPreset.border }}
                          className="border-l-2 p-1 text-center"
                        >
                          <div className="font-black">اللغة العربية</div>
                          <div className="text-[9px] font-normal opacity-90">(مستوى موضعة)</div>
                        </th>

                        {/* 4. فهم (مستوى أداء A أو C) */}
                        <th
                          style={{ borderColor: selectedColorPreset.border }}
                          className="border-l-2 p-1 text-center"
                        >
                          <div className="font-black">فهم</div>
                          <div className="text-[9px] font-normal opacity-90">(مستوى أداء A أو C)</div>
                        </th>

                        {/* 5. اللغة الفرنسية (مستوى موضعة) */}
                        <th
                          style={{ borderColor: selectedColorPreset.border }}
                          className="border-l-2 p-1 text-center"
                        >
                          <div className="font-black">اللغة الفرنسية</div>
                          <div className="text-[9px] font-normal opacity-90">(مستوى موضعة)</div>
                        </th>

                        {/* 6. Compréhension (مستوى أداء A أو C) */}
                        <th
                          style={{ borderColor: selectedColorPreset.border }}
                          className="border-l-2 p-1 text-center"
                        >
                          <div className="font-black font-sans">Compréhension</div>
                          <div className="text-[9px] font-normal opacity-90">(مستوى أداء A أو C)</div>
                        </th>

                        {/* 7. الرياضيات (مستوى موضعة) */}
                        <th
                          style={{ borderColor: selectedColorPreset.border }}
                          className="border-l-2 p-1 text-center"
                        >
                          <div className="font-black">الرياضيات</div>
                          <div className="text-[9px] font-normal opacity-90">(مستوى موضعة)</div>
                        </th>

                        {/* 8. مسألة (مستوى أداء A أو C) */}
                        <th className="p-1 text-center">
                          <div className="font-black">مسألة</div>
                          <div className="text-[9px] font-normal opacity-90">(مستوى أداء A أو C)</div>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {Array.from({ length: studentCount }).map((_, idx) => {
                        const studentName = studentNames[idx] || '';
                        const isEven = idx % 2 === 0;

                        return (
                          <tr
                            key={idx}
                            style={{
                              borderColor: selectedColorPreset.border,
                              height: studentCount > 35 ? '21px' : '23px',
                            }}
                            className={`border-b text-[11px] ${
                              isEven ? 'bg-white' : 'bg-stone-50/70'
                            }`}
                          >
                            {/* 1. N° */}
                            <td
                              style={{ borderColor: selectedColorPreset.border }}
                              className="border-l p-0.5 font-bold text-stone-700 text-center"
                            >
                              {idx + 1}
                            </td>

                            {/* 2. Nom de l'élève */}
                            <td
                              style={{ borderColor: selectedColorPreset.border }}
                              className="border-l p-0.5 font-medium text-right pr-2 text-stone-900"
                            >
                              {studentName || ''}
                            </td>

                            {/* 3. Arabe Positionnement */}
                            <td
                              style={{ borderColor: selectedColorPreset.border }}
                              className="border-l p-0.5"
                            ></td>

                            {/* 4. Arabe Compréhension */}
                            <td
                              style={{ borderColor: selectedColorPreset.border }}
                              className="border-l p-0.5"
                            ></td>

                            {/* 5. Français Positionnement */}
                            <td
                              style={{ borderColor: selectedColorPreset.border }}
                              className="border-l p-0.5"
                            ></td>

                            {/* 6. Français Compréhension */}
                            <td
                              style={{ borderColor: selectedColorPreset.border }}
                              className="border-l p-0.5"
                            ></td>

                            {/* 7. Maths Positionnement */}
                            <td
                              style={{ borderColor: selectedColorPreset.border }}
                              className="border-l p-0.5"
                            ></td>

                            {/* 8. Maths Problème */}
                            <td className="p-0.5"></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* 5. Footer Signatures (الأساتذة الممررون للروائز) */}
                  <div className="pt-2 text-xs font-bold text-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-6 w-full">
                      <span className="font-black shrink-0">الأساتذة الممررون للروائز:</span>
                      <span className="text-stone-400 flex-1 border-b border-dotted border-stone-400 text-center text-[10px]">
                        ....................................................................................................
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER: ACTION BUTTONS (MOBILE FRIENDLY)                             */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-4 md:p-5 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400">
            {exportProgress ? (
              <div className="flex items-center gap-2 text-amber-600 font-black animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{exportProgress}</span>
              </div>
            ) : exportSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600 font-black">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم تجهيز وتنزيل شبكة تفريغ نتائج الموضعة بنجاح!</span>
              </div>
            ) : (
              <span>جاهزة للطباعة والتوقيع • A4 Portrait</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              إغلاق
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleSharePdf}
              disabled={isExporting || isSharing}
              className="px-3 sm:px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-stone-200 dark:border-stone-700 cursor-pointer disabled:opacity-50 min-h-[42px]"
              title="مشاركة الملف"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <Share2 className="w-4 h-4 text-amber-600" />
              )}
              <span className="hidden md:inline">مشاركة</span>
            </button>

            {/* Direct Native Print Button */}
            <button
              type="button"
              onClick={handleNativePrint}
              disabled={isExporting}
              className="px-3 sm:px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[42px]"
              title="طباعة فورية"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Primary Action: Direct PDF Download */}
            <button
              type="button"
              id="btn-confirm-download-tarl-grid"
              onClick={handleDownloadPdf}
              disabled={isExporting || isSharing}
              style={{ backgroundColor: selectedColorPreset.primary }}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 hover:opacity-90 active:scale-98 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 min-h-[42px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري الإنشاء...</span>
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
