import React, { useState, useRef, useEffect } from 'react';
import { TeacherProfile } from '../types';
import { downloadPdfBlob, sharePdfBlob } from '../utils/pdfExportService';
import { logTechnicalError, getUserFriendlyErrorMessage } from '../utils/logger';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  Download,
  Share2,
  X,
  FileCheck,
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
  Edit3,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Upload,
  Camera,
  Layers,
  Languages,
  BookOpen,
  BarChart3,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Info,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface TarlReportCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onUpdateProfile?: (updated: TeacherProfile) => void;
  showToast?: (msg: string) => void;
}

export type ReportSubjectScope = 'all_3' | 'arabic_only' | 'french_only' | 'math_only' | 'arabic_math';
export type ReportLanguage = 'ar' | 'fr' | 'bilingual';

const COLOR_PRESETS = [
  {
    id: 'amber_pioneer',
    name: 'العنبري (مدارس الريادة)',
    primary: '#d97706',
    headerBg: '#fef3c7',
    border: '#d97706',
    title: '#b45309',
    badge: 'bg-amber-600',
    accent: '#f59e0b',
  },
  {
    id: 'ministry_blue',
    name: 'الأزرق الوزاري الرسمي',
    primary: '#0284c7',
    headerBg: '#e0f2fe',
    border: '#0284c7',
    title: '#0369a1',
    badge: 'bg-sky-600',
    accent: '#0284c7',
  },
  {
    id: 'royal_navy',
    name: 'الكحلي الملكي الأكاديمي',
    primary: '#1e3a8a',
    headerBg: '#eff6ff',
    border: '#1e3a8a',
    title: '#1e3a8a',
    badge: 'bg-blue-900',
    accent: '#1e40af',
  },
  {
    id: 'emerald_green',
    name: 'الزمردي البيداغوجي',
    primary: '#047857',
    headerBg: '#ecfdf5',
    border: '#047857',
    title: '#065f46',
    badge: 'bg-emerald-700',
    accent: '#059669',
  },
  {
    id: 'burgundy',
    name: 'البورغندي الأصيل',
    primary: '#9f1239',
    headerBg: '#fff1f2',
    border: '#9f1239',
    title: '#881337',
    badge: 'bg-rose-800',
    accent: '#be123c',
  },
  {
    id: 'classic_black',
    name: 'الأسود الكلاسيكي الفاخر',
    primary: '#18181b',
    headerBg: '#f4f4f5',
    border: '#27272a',
    title: '#09090b',
    badge: 'bg-stone-900',
    accent: '#3f3f46',
  },
  {
    id: 'marrakech_terracotta',
    name: 'التراكوتا المراكشي',
    primary: '#c2410c',
    headerBg: '#ffedd5',
    border: '#c2410c',
    title: '#9a3412',
    badge: 'bg-orange-700',
    accent: '#ea580c',
  },
  {
    id: 'atlas_olive',
    name: 'الزيتوني الأطلسي',
    primary: '#4d7c0f',
    headerBg: '#f7fee7',
    border: '#4d7c0f',
    title: '#3f6212',
    badge: 'bg-lime-800',
    accent: '#65a30d',
  },
  {
    id: 'fez_indigo',
    name: 'النيلي الفاسي',
    primary: '#4338ca',
    headerBg: '#eef2ff',
    border: '#4338ca',
    title: '#3730a3',
    badge: 'bg-indigo-700',
    accent: '#4f46e5',
  },
  {
    id: 'calm_teal',
    name: 'الفيروزي الهادئ',
    primary: '#0f766e',
    headerBg: '#f0fdfa',
    border: '#0f766e',
    title: '#115e59',
    badge: 'bg-teal-700',
    accent: '#14b8a6',
  },
  {
    id: 'imperial_purple',
    name: 'الأرجواني الإمبراطوري',
    primary: '#7e22ce',
    headerBg: '#faf5ff',
    border: '#7e22ce',
    title: '#6b21a8',
    badge: 'bg-purple-700',
    accent: '#9333ea',
  },
  {
    id: 'sahara_gold',
    name: 'الذهبي الصحراوي',
    primary: '#b45309',
    headerBg: '#fffbeb',
    border: '#b45309',
    title: '#92400e',
    badge: 'bg-amber-700',
    accent: '#d97706',
  },
];

const FONT_PRESETS = [
  { id: 'Cairo', name: 'خط القاهرة (Cairo)', family: 'Cairo, sans-serif' },
  { id: 'Tajawal', name: 'خط تجوال (Tajawal)', family: 'Tajawal, sans-serif' },
  { id: 'Alexandria', name: 'خط الإسكندرية (Alexandria)', family: 'Alexandria, sans-serif' },
  { id: 'Almarai', name: 'خط المراعي (Almarai)', family: 'Almarai, sans-serif' },
  { id: 'Amiri', name: 'الخط الأميري (Amiri)', family: 'Amiri, serif' },
  { id: 'Noto Kufi Arabic', name: 'الكوفي الحديث (Noto Kufi)', family: '"Noto Kufi Arabic", sans-serif' },
  { id: 'Readex Pro', name: 'خط ريديكس (Readex Pro)', family: '"Readex Pro", sans-serif' },
  { id: 'IBM Plex Sans Arabic', name: 'خط آي بي إم (IBM Plex)', family: '"IBM Plex Sans Arabic", sans-serif' },
  { id: 'Changa', name: 'خط تشانغا (Changa)', family: 'Changa, sans-serif' },
  { id: 'El Messiri', name: 'خط المسيري (El Messiri)', family: '"El Messiri", sans-serif' },
  { id: 'Scheherazade New', name: 'خط شهرزاد (Scheherazade)', family: '"Scheherazade New", serif' },
  { id: 'Aref Ruqaa', name: 'خط رقعة (Aref Ruqaa)', family: '"Aref Ruqaa", serif' },
];

export const TarlReportCustomizerModal: React.FC<TarlReportCustomizerModalProps> = ({
  isOpen,
  onClose,
  profile,
  showToast,
}) => {
  if (!isOpen) return null;

  // Determine initial scope from teacher's teaching mode / specialty
  const getInitialScope = (): ReportSubjectScope => {
    const mode = profile.teachingMode || 'bilingual';
    const spec = profile.specialty || 'bilingual';

    if (mode === 'specialist_arabic' || (spec === 'arabic' && mode !== 'bilingual' && mode !== 'binome_arabic')) {
      return 'arabic_only';
    }
    if (mode === 'specialist_french' || (spec === 'french' && mode !== 'bilingual')) {
      return 'french_only';
    }
    if (mode === 'specialist_math') {
      return 'math_only';
    }
    if (mode === 'binome_arabic' || mode === 'binome_french_math') {
      // In TaRL period, double mode is Arabic + Math
      return 'arabic_math';
    }
    return 'all_3'; // default comprehensive bilingual
  };

  const getTeachingModeLabel = (): string => {
    switch (profile.teachingMode) {
      case 'bilingual':
        return 'أستاذ شامل مزدوج (جميع المواد الثلاث)';
      case 'binome_french_math':
      case 'binome_arabic':
        return 'أستاذ ثنائي (مزدوج عربية ورياضيات في طارل)';
      case 'specialist_arabic':
        return 'أستاذ متخصص (لغة عربية)';
      case 'specialist_french':
        return 'أستاذ متخصص (لغة فرنسية)';
      case 'specialist_math':
        return 'أستاذ متخصص (رياضيات)';
      default:
        return 'أستاذ شامل مزدوج';
    }
  };

  // State: Subject Scope & Language
  const [subjectScope, setSubjectScope] = useState<ReportSubjectScope>(getInitialScope);
  const [reportLanguage, setReportLanguage] = useState<ReportLanguage>('ar');
  const [showConfigNotice, setShowConfigNotice] = useState<boolean>(true);

  // Mobile / View Navigation
  const [mobileTab, setMobileTab] = useState<'controls' | 'preview'>('controls');
  const [activePageTab, setActivePageTab] = useState<'all' | '1' | '2' | '3'>('all');
  const [previewScale, setPreviewScale] = useState<number>(0.8);

  // Style customization
  const [selectedColorPreset, setSelectedColorPreset] = useState(COLOR_PRESETS[0]); // Amber default for pioneer
  const [selectedFont, setSelectedFont] = useState(FONT_PRESETS[0]);

  // Context & Metadata
  const [metaInfo, setMetaInfo] = useState({
    school: profile.school || '',
    level: profile.level || 'المستوى السادس ابتدائي',
    classGroup: profile.classGroup || 'الفوج 1',
    academicYear: profile.academicYear || '2026 / 2027',
    teacherName: profile.teacherName || '',
    academy: profile.academy || 'مراكش - آسفي',
    direction: profile.direction || 'آسفي',
    testDateRange: 'من 09 إلى 25 شتنبر 2026',
    testLocation: 'الحجرات الدراسية وفضاءات المؤسسة',
    remediationDuration: '4 أسابيع (24 يوماً من الدعم المكثف)',
  });

  // Statistics Data - Initialized to 0 so the teacher uploads or inputs their real grid
  const [stats, setStats] = useState({
    enrolled: 0,
    present: 0,
    absent: 0,
    // Arabic levels count
    arabic: {
      letter: 0,
      word: 0,
      paragraph: 0,
      story: 0,
      comprehension: 0,
    },
    // French levels count
    french: {
      letter: 0,
      word: 0,
      paragraph: 0,
      story: 0,
      comprehension: 0,
    },
    // Math levels count
    math: {
      beginner: 0,
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0,
      problem: 0,
    },
  });

  // Pedagogical Texts (Fully editable)
  const [pedagogicalContent, setPedagogicalContent] = useState({
    introduction:
      'تنفيذاً للتوجيهات الوزارية المنظمة للموسم الدراسي وبرنامج "مدارس الريادة"، تم تنظيم وتمرير روائز الموضعة الخاصة بمقاربة طارل (TaRL) بهدف التشخيص الدقيق للمستويات الفعلية للمتعلمات والمتعلمين في التعلمات الأساس (القراءة والحساب)، وتفييئهم وفق مستويات الأداء للانخراط في مرحلة الدعم المكثف والصريح.',
    analysis:
      'أظهرت نتائج روائز الموضعة تفاوتاً في تحكم المتعلمين في مهارات الأساس؛ حيث شكلت فئة المتعثرين في القراءة الحرفية والعمليات البسيطة نسبة استدعت تركيز أنشطة طارل التفاعلية والألعاب البيداغوجية الموجهة، بينما لوحظ تجاوب ملحوظ وتطور تصاعدي سريع لدى غالبية التلاميذ خلال حصص التمرير والمعالجة.',
    achievements: [
      'تحديد المستوى الحقيقي لكل متعلم بدون ضغط وتصنيفهم في مجموعات متجانسة بيداغوجياً.',
      'تجاوز نسبة هامة من المتعثرين لصعوبات التهجي والتعرف على الحروف والأصوات المركبة.',
      'التمكن من التقنيات الاعتيادية للجمع والطرح والانتقال نحو الضرب والحساب الذهني السريع.',
      'خلق دينامية وحافزية إيجابية نحو التعلم بفضل الأنشطة الحركية والألعاب الهادفة.',
    ],
    difficulties: [
      'تعثرات قرائية بنيوية لدى قلة من التلاميذ مرتبطة ببطء التعلم أو تشتت الانتباه.',
      'صعوبة الانتقال من الحساب البسيط إلى فهم واستيعاب نص المسألة الرياضية لدى بعض المتعلمين.',
      'تأثير بعض حالات الغياب المتقطع على وتيرة الاستفادة المستمرة من اللبنات البيداغوجية.',
    ],
    recommendations: [
      'الاستمرار في استثمار طقوس وروتينات التدريس الصريح وأنشطة طارل خلال مرحلة إرساء الموارد.',
      'تخصيص دعم فردي ومندمج للتلاميذ الذين لم يستوفوا بعد التحكم في اللبنات المتقدمة.',
      'التنسيق المستمر مع أولياء الأمور وتتبع الدفاتر المخصصة للدعم المنزلي المنتظم.',
      'إجراء تقويمات تشخيصية تكوينية دورية لقياس أثر المعالجة وتثبيت المكتسبات.',
    ],
  });

  // Image Upload / OCR State
  const [isExtractingGrid, setIsExtractingGrid] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // PDF Export States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Page Refs
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);
  const fullDocumentContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-adjust scale on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPreviewScale(0.42);
      } else if (window.innerWidth < 1024) {
        setPreviewScale(0.62);
      } else {
        setPreviewScale(0.8);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Image Upload & OCR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صالحة لشبكة الموضعة (JPG أو PNG).');
      return;
    }

    setIsExtractingGrid(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          const res = await fetch('/api/ai/extract-tarl-grid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type,
            }),
          });

          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            // Update stats
            setStats((prev) => ({
              ...prev,
              enrolled: data.totalEnrolled || prev.enrolled,
              present: data.totalPresent || prev.present,
              absent: data.totalAbsent || (data.totalEnrolled && data.totalPresent ? data.totalEnrolled - data.totalPresent : prev.absent),
              arabic: data.arabicStats ? { ...prev.arabic, ...data.arabicStats } : prev.arabic,
              french: data.frenchStats ? { ...prev.french, ...data.frenchStats } : prev.french,
              math: data.mathStats ? { ...prev.math, ...data.mathStats } : prev.math,
            }));

            // Update meta if detected
            setMetaInfo((prev) => ({
              ...prev,
              school: data.detectedSchool || prev.school,
              level: data.detectedLevel || prev.level,
              classGroup: data.detectedClassGroup || prev.classGroup,
              teacherName: data.detectedTeacherName || prev.teacherName,
            }));

            showToast?.('تم استخراج وقراءة معطيات شبكة الموضعة وتحديث الجداول بنجاح!');
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
          } else {
            throw new Error(json.error || 'تعذر قراءة الصورة');
          }
        } catch (err: any) {
          logTechnicalError('gemini', err, { action: 'extract_tarl_grid' });
          setUploadError('تعذر استخراج البيانات من الصورة تلقائياً. يمكنك تعديل الإحصائيات والأرقام يدوياً بسهولة.');
        } finally {
          setIsExtractingGrid(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsExtractingGrid(false);
      setUploadError('حدث خطأ أثناء تحميل الصورة.');
    }
  };

  // Helper calculation for percentages
  const calcPercent = (val: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  // High Quality Multi-Page PDF Generator for all 3 pages
  const handleDownloadMultiPagePdf = async () => {
    if (!page1Ref.current || !page2Ref.current || !page3Ref.current) return;

    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      setExportProgress('جاري معالجة صفحات التقرير الثلاث بدقة A4...');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pages = [page1Ref.current, page2Ref.current, page3Ref.current];

      for (let i = 0; i < pages.length; i++) {
        setExportProgress(`جاري تجهيز الصفحة ${i + 1} من 3...`);
        const pageElem = pages[i];

        const canvas = await html2canvas(pageElem, {
          scale: 2.2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 900,
          onclone: (clonedDoc) => {
            const clonedPage = clonedDoc.getElementById(`tarl-report-page-${i + 1}`);
            if (clonedPage) {
              clonedPage.style.transform = 'none';
            }
            const inputs = clonedDoc.querySelectorAll('input, textarea');
            inputs.forEach((inp: any) => {
              inp.style.border = 'none';
              inp.style.outline = 'none';
              inp.style.background = 'transparent';
            });
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      const fileName = `تقرير_فترة_تارل_${metaInfo.level.replace(/\s+/g, '_')}_${metaInfo.classGroup.replace(/\s+/g, '_')}`;
      const blob = pdf.output('blob');
      downloadPdfBlob(blob, fileName);

      setExportSuccess(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
      setTimeout(() => setExportSuccess(false), 4000);
      showToast?.('تم تحميل تقرير فترة طارل (3 صفحات كاملة) بنجاح!');
    } catch (err: any) {
      logTechnicalError('pdf', err, { action: 'download_tarl_report' });
      setExportError(getUserFriendlyErrorMessage(err, 'pdf', 'حدث خطأ أثناء تصدير التقرير. يرجى المحاولة ثانية.'));
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Share PDF
  const handleSharePdf = async () => {
    if (!page1Ref.current || !page2Ref.current || !page3Ref.current) return;
    setIsExporting(true);
    setExportError(null);

    try {
      setExportProgress('جاري تحضير ملف التقرير للمشاركة...');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pages = [page1Ref.current, page2Ref.current, page3Ref.current];

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2.0,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 900,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      const fileName = `تقرير_فترة_تارل_${metaInfo.level.replace(/\s+/g, '_')}`;
      const blob = pdf.output('blob');
      const shared = await sharePdfBlob(blob, fileName, 'تقرير فترة طارل (TaRL) - 3 صفحات');
      if (!shared) downloadPdfBlob(blob, fileName);
    } catch (err) {
      setExportError('تعذر مشاركة التقرير مباشرة.');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Helper to add list item
  const handleAddItem = (field: 'achievements' | 'difficulties' | 'recommendations') => {
    const newItem = prompt('أدخل نص العنصر الجديد:');
    if (newItem && newItem.trim()) {
      setPedagogicalContent((prev) => ({
        ...prev,
        [field]: [...prev[field], newItem.trim()],
      }));
    }
  };

  const handleRemoveItem = (field: 'achievements' | 'difficulties' | 'recommendations', index: number) => {
    setPedagogicalContent((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Helper labels
  const getSubjectTitle = () => {
    switch (subjectScope) {
      case 'all_3':
        return 'جميع المواد الأساسية الثلاث (اللغة العربية - اللغة الفرنسية - الرياضيات)';
      case 'arabic_only':
        return 'مادة اللغة العربية';
      case 'french_only':
        return 'مادة اللغة الفرنسية (Français)';
      case 'math_only':
        return 'مادة الرياضيات';
      case 'arabic_math':
        return 'مادتا اللغة العربية والرياضيات';
    }
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
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight truncate">
                  توليد وتخصيص تقرير فترة طارل (TaRL)
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                  3 صفحات A4 رسمية
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-300 hidden sm:block truncate">
                تقرير بيداغوجي تركيبي ملائم لصيغة العمل: غلاف رسمي + سياق وإحصائيات ومبيانات + تحليل ومكتسبات وتوصيات.
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
            <span>1. التخصيص والإحصائيات</span>
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
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>2. معاينة الصفحات (3 صفحات)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ADVISORY BANNER: EXPLAINING TEACHING MODE MATCHING                        */}
        {/* ========================================================================= */}
        {showConfigNotice && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 p-3 sm:p-3.5 flex items-start justify-between gap-3 text-xs shrink-0">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950 dark:text-amber-200 leading-relaxed">
                  <span className="font-black">مرحباً أستاذ(ة) {metaInfo.teacherName || ''}:</span> بناءً على صيغة عملك ونمط تكليفك المسجل (
                  <span className="font-black text-amber-800 dark:text-amber-300 underline">{getTeachingModeLabel()}</span>
                  )، تم ضبط التقرير ليكون متطابقاً مع المواد المسندة إليك ({getSubjectTitle()}). يمكنك تعديل المواد أو لغة التقرير في أي وقت.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigNotice(false)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-lg"
              title="إخفاء الإشعار"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL BODY (DUAL PANE: CONTROLS & LIVE 3-PAGE A4 DOCUMENT)                */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-stone-100 dark:bg-stone-950">
          {/* ======================================================================= */}
          {/* SIDEBAR CONTROLS (4 COLS ON DESKTOP)                                    */}
          {/* ======================================================================= */}
          <div
            className={`lg:col-span-4 p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 ${
              mobileTab === 'controls' ? 'flex-1 block' : 'hidden lg:block'
            }`}
          >
            {/* 1. Subject Scope & Language Selector */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <label className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>1. نطاق المواد المسندة بالتقرير:</span>
              </label>

              <div className="space-y-1.5">
                {[
                  { id: 'all_3', label: 'تقرير شامل (جميع المواد الثلاث: عربية + فرنسية + رياضيات)' },
                  { id: 'arabic_only', label: 'تقرير خاص بمادة اللغة العربية فقط' },
                  { id: 'french_only', label: 'تقرير خاص بمادة اللغة الفرنسية فقط' },
                  { id: 'math_only', label: 'تقرير خاص بمادة الرياضيات فقط' },
                  { id: 'arabic_math', label: 'تقرير مزدوج (لغة عربية + رياضيات)' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      subjectScope === opt.id
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-1 ring-amber-500'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subjectScope"
                      checked={subjectScope === opt.id}
                      onChange={() => setSubjectScope(opt.id as ReportSubjectScope)}
                      className="accent-amber-600"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Language Selector */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                <label className="text-[11px] font-black text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-1.5">
                  <Languages className="w-3.5 h-3.5 text-amber-600" />
                  <span>لغة التقرير المصاغ:</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'ar', label: 'العربية' },
                    { id: 'fr', label: 'Français' },
                    { id: 'bilingual', label: 'ثنائي اللغة' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setReportLanguage(l.id as ReportLanguage)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                        reportLanguage === l.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Grid Image Upload (AI Extraction of Stats) */}
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>2. استخراج المعطيات من صورة شبكة الموضعة:</span>
                </span>
                <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md font-black">
                  ذكاء اصطناعي AI
                </span>
              </div>

              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                التقط صورة لشبكة تفريغ رائز الموضعة الورقية وسيتم استخراج وتفريغ أعداد التلاميذ وتحديث المبيانات الإحصائية بالتقرير تلقائياً:
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                disabled={isExtractingGrid}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                {isExtractingGrid ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تحليل صورة الشبكة واستخراج الأرقام...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>رفع / تصوير شبكة تفريغ الموضعة</span>
                  </>
                )}
              </button>

              {uploadError && (
                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">{uploadError}</p>
              )}
            </div>

            {/* 3. Manual Numbers & Stats Quick Counters */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <label className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>3. الأرقام والإحصائيات التقديرية (قابلة للتعديل اليدوي):</span>
              </label>

              {/* Attendance Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 font-bold block">المسجلون:</span>
                  <input
                    type="number"
                    value={stats.enrolled}
                    onChange={(e) => setStats({ ...stats, enrolled: parseInt(e.target.value) || 0 })}
                    className="w-full text-center font-black text-sm text-stone-900 dark:text-stone-100 bg-transparent border-0"
                  />
                </div>
                <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-emerald-600 font-bold block">الحاضرون:</span>
                  <input
                    type="number"
                    value={stats.present}
                    onChange={(e) => setStats({ ...stats, present: parseInt(e.target.value) || 0 })}
                    className="w-full text-center font-black text-sm text-emerald-600 bg-transparent border-0"
                  />
                </div>
                <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-red-500 font-bold block">المتغيبون:</span>
                  <input
                    type="number"
                    value={stats.absent}
                    onChange={(e) => setStats({ ...stats, absent: parseInt(e.target.value) || 0 })}
                    className="w-full text-center font-black text-sm text-red-600 bg-transparent border-0"
                  />
                </div>
              </div>

              {/* Arabic Levels breakdown */}
              {(subjectScope === 'all_3' || subjectScope === 'arabic_only' || subjectScope === 'arabic_math') && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                    توزيع مستويات اللغة العربية:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">حرف:</span>
                      <input
                        type="number"
                        value={stats.arabic.letter}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            arabic: { ...stats.arabic, letter: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">كلمة:</span>
                      <input
                        type="number"
                        value={stats.arabic.word}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            arabic: { ...stats.arabic, word: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">فقرة:</span>
                      <input
                        type="number"
                        value={stats.arabic.paragraph}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            arabic: { ...stats.arabic, paragraph: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">قصة:</span>
                      <input
                        type="number"
                        value={stats.arabic.story}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            arabic: { ...stats.arabic, story: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* French Levels breakdown */}
              {(subjectScope === 'all_3' || subjectScope === 'french_only') && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                    توزيع مستويات اللغة الفرنسية (Français):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">Lettre:</span>
                      <input
                        type="number"
                        value={stats.french.letter}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            french: { ...stats.french, letter: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">Mot:</span>
                      <input
                        type="number"
                        value={stats.french.word}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            french: { ...stats.french, word: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">Paragraphe:</span>
                      <input
                        type="number"
                        value={stats.french.paragraph}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            french: { ...stats.french, paragraph: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">Histoire:</span>
                      <input
                        type="number"
                        value={stats.french.story}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            french: { ...stats.french, story: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Math Levels breakdown */}
              {(subjectScope === 'all_3' || subjectScope === 'math_only' || subjectScope === 'arabic_math') && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                    توزيع مستويات الرياضيات:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">مبتدئ:</span>
                      <input
                        type="number"
                        value={stats.math.beginner}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            math: { ...stats.math, beginner: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">جمع/طرح:</span>
                      <input
                        type="number"
                        value={stats.math.addition + stats.math.subtraction}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 0;
                          setStats({
                            ...stats,
                            math: { ...stats.math, addition: Math.ceil(v / 2), subtraction: Math.floor(v / 2) },
                          });
                        }}
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">ضرب/قسمة:</span>
                      <input
                        type="number"
                        value={stats.math.multiplication + stats.math.division}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 0;
                          setStats({
                            ...stats,
                            math: { ...stats.math, multiplication: Math.ceil(v / 2), division: Math.floor(v / 2) },
                          });
                        }}
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                    <div className="bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 block">مسألة:</span>
                      <input
                        type="number"
                        value={stats.math.problem}
                        onChange={(e) =>
                          setStats({
                            ...stats,
                            math: { ...stats.math, problem: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full text-center font-black text-xs bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Quick Edit of Header & Meta */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <label className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>4. معطيات الترويسة والتأطير الإداري:</span>
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">المؤسسة:</span>
                  <input
                    type="text"
                    value={metaInfo.school}
                    onChange={(e) => setMetaInfo({ ...metaInfo, school: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">الأستاذ(ة):</span>
                  <input
                    type="text"
                    value={metaInfo.teacherName}
                    onChange={(e) => setMetaInfo({ ...metaInfo, teacherName: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">المستوى:</span>
                  <input
                    type="text"
                    value={metaInfo.level}
                    onChange={(e) => setMetaInfo({ ...metaInfo, level: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">الفوج / القسم:</span>
                  <input
                    type="text"
                    value={metaInfo.classGroup}
                    onChange={(e) => setMetaInfo({ ...metaInfo, classGroup: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">فترة التمرير:</span>
                  <input
                    type="text"
                    value={metaInfo.testDateRange}
                    onChange={(e) => setMetaInfo({ ...metaInfo, testDateRange: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block mb-0.5">فضاء الإجراء:</span>
                  <input
                    type="text"
                    value={metaInfo.testLocation}
                    onChange={(e) => setMetaInfo({ ...metaInfo, testLocation: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 5. Theme & Fonts */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-4">
              <label className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>5. مكتبة الألوان والخطوط الرسمية:</span>
              </label>

              {/* Color Presets (12 Colors) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                  اختر نمط الألوان المعتمد ({COLOR_PRESETS.length} ألوان رسمية):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-900">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColorPreset(c)}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        selectedColorPreset.id === c.id
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-1 ring-amber-500'
                          : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white" style={{ backgroundColor: c.primary }} />
                      <span className="truncate text-[11px]">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Presets (12 Arabic Fonts) */}
              <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-stone-700">
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
                  اختر الخط العربي للتقرير ({FONT_PRESETS.length} خطوط عربية):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-900">
                  {FONT_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFont(f)}
                      style={{ fontFamily: f.family }}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                        selectedFont.id === f.id
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-1 ring-amber-500'
                          : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="truncate text-[11px]">{f.name}</span>
                      {selectedFont.id === f.id && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile switch to preview button */}
            <div className="lg:hidden pt-2">
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>معاينة الصفحات الثلاث A4</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* MAIN PREVIEW CANVAS: 3-PAGES A4 LIVE VIEW                               */}
          {/* ======================================================================= */}
          <div
            className={`lg:col-span-8 p-2 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden ${
              mobileTab === 'preview' ? 'flex-1 block' : 'hidden lg:flex'
            }`}
          >
            {/* Toolbar: Page Switcher & Zoom Controls */}
            <div className="flex items-center justify-between pb-2 text-xs font-bold text-stone-600 dark:text-stone-400 gap-2 flex-wrap">
              {/* Page Navigator Tabs */}
              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActivePageTab('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activePageTab === 'all'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  جميع الصفحات (3)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePageTab('1')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activePageTab === '1'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  ص 1: الغلاف
                </button>
                <button
                  type="button"
                  onClick={() => setActivePageTab('2')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activePageTab === '2'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  ص 2: الإحصائيات
                </button>
                <button
                  type="button"
                  onClick={() => setActivePageTab('3')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activePageTab === '3'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  ص 3: التحليل والتوصيات
                </button>
              </div>

              {/* Quick page prev / next when looking at single page on mobile */}
              {activePageTab !== 'all' && (
                <div className="flex items-center gap-1 bg-white dark:bg-stone-900 px-2 py-1 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (activePageTab === '2') setActivePageTab('1');
                      if (activePageTab === '3') setActivePageTab('2');
                    }}
                    disabled={activePageTab === '1'}
                    className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 rounded-lg cursor-pointer"
                    title="الصفحة السابقة"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-black px-1">صفحة {activePageTab} / 3</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activePageTab === '1') setActivePageTab('2');
                      if (activePageTab === '2') setActivePageTab('3');
                    }}
                    disabled={activePageTab === '3'}
                    className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 rounded-lg cursor-pointer"
                    title="الصفحة التالية"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Zoom Buttons */}
              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 px-2 py-1 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.max(0.28, Number((s - 0.06).toFixed(2))))}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] px-1 font-black">{Math.round(previewScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.min(1.3, Number((s + 0.06).toFixed(2))))}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const width = window.innerWidth;
                    if (width < 450) {
                      setPreviewScale(Number(((width - 32) / 810).toFixed(2)));
                    } else if (width < 640) {
                      setPreviewScale(0.46);
                    } else if (width < 1024) {
                      setPreviewScale(0.64);
                    } else {
                      setPreviewScale(0.8);
                    }
                  }}
                  className="px-2 py-0.5 text-[10px] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-md cursor-pointer font-bold"
                >
                  ملاءمة
                </button>
              </div>
            </div>

            {/* Scrollable Viewport with 3 A4 Document Pages */}
            <div
              ref={fullDocumentContainerRef}
              className="flex-1 overflow-auto bg-stone-200/80 dark:bg-stone-900/70 p-1 sm:p-4 md:p-6 rounded-2xl border border-stone-300 dark:border-stone-800 flex flex-col items-center gap-6 shadow-inner touch-pan-x touch-pan-y"
            >
              {/* =================================================================== */}
              {/* PAGE 1: COVER PAGE (الصفحة الافتتاحية / الغلاف الرسمي)                */}
              {/* =================================================================== */}
              {(activePageTab === 'all' || activePageTab === '1') && (
                <div
                  className="flex justify-center items-start w-full overflow-hidden shrink-0 transition-all"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    height: `${1130 * previewScale + 8}px`,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top center',
                      width: '800px',
                      height: '1130px',
                      fontFamily: selectedFont.family,
                    }}
                    ref={page1Ref}
                    id="tarl-report-page-1"
                    className="bg-white text-stone-950 p-8 sm:p-10 flex flex-col justify-between shadow-2xl rounded-sm shrink-0 relative overflow-hidden"
                    dir="rtl"
                  >
                    {/* Top: Official Typography Header (Strictly NO graphics logo) */}
                    <div className="w-full pb-2 border-b-2 border-stone-300 space-y-1">
                      <div className="flex items-start justify-between">
                        {/* Right: Arabic Ministry */}
                        <div className="text-right space-y-0.5 text-xs font-black text-stone-900 leading-tight">
                          <p className="text-sm font-black">المملكة المغربية</p>
                          <p className="text-xs font-bold text-stone-800">وزارة التربية الوطنية</p>
                          <p className="text-xs font-bold text-stone-800">والتعليم الأولي والرياضة</p>
                        </div>

                        {/* Left: Tifinagh */}
                        <div className="text-left space-y-0.5 text-[11px] font-bold text-stone-700 leading-tight" dir="ltr">
                          <p className="font-bold text-stone-900 tracking-wider">ⵜⴰⴳⵍⴷⵉⵜ ⵏ ⵍⵎⵖⵔⵉⴱ</p>
                          <p className="text-[10px] text-stone-800">ⵜⴰⵎⴰⵡⴰⵙⵜ ⵏ ⵓⵙⴳⵎⵉ ⴰⵏⴰⵎⵓⵔ</p>
                          <p className="text-[10px] text-stone-800">ⴷ ⵓⵙⵙⵍⵎⴷ ⴰⵎⵣⵡⴰⵔⵓ ⴷ ⵜⵓⵏⵏⵓⵏⵜ</p>
                        </div>
                      </div>

                      {/* Academy & Direction Sub-header */}
                      <div className="text-center text-xs font-bold text-stone-800 space-y-0.5 pt-1">
                        <p>الأكاديمية الجهوية للتربية والتكوين لجهة {metaInfo.academy || '.........................'}</p>
                        <p>المديرية الإقليمية بـ {metaInfo.direction || '.........................'}</p>
                        <p className="font-black text-amber-700 pt-0.5">مشروع مدارس الريادة (Écoles Pionnières)</p>
                      </div>
                    </div>

                    {/* Center: Main Cover Title & Ornate Framing */}
                    <div className="my-auto text-center space-y-8 py-6">
                      <div className="inline-block px-6 py-2 rounded-full border-2 border-amber-600 bg-amber-50 text-amber-900 font-black text-sm tracking-wide shadow-2xs">
                        مقاربة التدريس وفق المستوى المناسب (TaRL)
                      </div>

                      <div className="space-y-4 max-w-xl mx-auto border-4 border-double border-stone-800 p-8 rounded-3xl bg-stone-50/50 shadow-inner">
                        <h1
                          style={{ color: selectedColorPreset.title }}
                          className="text-2xl sm:text-3xl font-black tracking-tight leading-tight"
                        >
                          تقرير فترة الدعم المكثف لتعلمات الأساس
                        </h1>
                        <h2 className="text-lg font-bold text-stone-700">
                          حصيلة نتائج روائز الموضعة ومسار المعالجة البيداغوجية
                        </h2>
                        <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full my-2" />
                        <p className="text-sm font-black text-stone-800 pt-2">
                          {getSubjectTitle()}
                        </p>
                      </div>

                      {/* Scope & Group Details */}
                      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-xs font-bold bg-white p-4 rounded-2xl border border-stone-300 shadow-2xs">
                        <div className="text-right space-y-1">
                          <p className="text-stone-500">المستوى الدراسي:</p>
                          <p className="font-black text-stone-900 text-sm">{metaInfo.level}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-stone-500">مجموعة الاختبار (الفوج):</p>
                          <p className="font-black text-stone-900 text-sm">{metaInfo.classGroup}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Teacher, School & Academic Year Metadata */}
                    <div className="border-t-2 border-stone-300 pt-4 flex items-center justify-between text-xs font-bold text-stone-800">
                      <div className="space-y-1">
                        <p>
                          <span className="text-stone-500">إعداد الأستاذ(ة):</span>{' '}
                          <span className="font-black text-stone-900">{metaInfo.teacherName || '..............................'}</span>
                        </p>
                        <p>
                          <span className="text-stone-500">المؤسسة التعليمية:</span>{' '}
                          <span className="font-black text-stone-900">{metaInfo.school || '..............................'}</span>
                        </p>
                      </div>

                      <div className="text-left space-y-1">
                        <p>
                          <span className="text-stone-500">الموسم الدراسي:</span>{' '}
                          <span className="font-black text-stone-900">{metaInfo.academicYear}</span>
                        </p>
                        <p className="text-[10px] text-stone-400 font-mono">وثيقة بيداغوجية رسمية (صفحة 1 من 3)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* PAGE 2: CONTEXT, TEST DETAILS, STATISTICS & CHARTS                  */}
              {/* =================================================================== */}
              {(activePageTab === 'all' || activePageTab === '2') && (
                <div
                  className="flex justify-center items-start w-full overflow-hidden shrink-0 transition-all"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    height: `${1130 * previewScale + 8}px`,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top center',
                      width: '800px',
                      height: '1130px',
                      fontFamily: selectedFont.family,
                    }}
                    ref={page2Ref}
                    id="tarl-report-page-2"
                    className="bg-white text-stone-950 p-8 sm:p-9 flex flex-col justify-between shadow-2xl rounded-sm shrink-0 space-y-4"
                    dir="rtl"
                  >
                    {/* Mini Official Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-300 text-xs">
                      <span className="font-bold text-stone-700">
                        تقرير فترة طارل • {metaInfo.school} • {metaInfo.level} ({metaInfo.classGroup})
                      </span>
                      <span className="font-black text-stone-500 text-[11px]">الصفحة 2 / 3</span>
                    </div>

                    {/* Section 1: Pedagogical Context & Administration Details */}
                    <div className="space-y-2">
                      <h3
                        style={{ color: selectedColorPreset.title }}
                        className="text-xs sm:text-sm font-black border-r-4 pr-2 border-amber-600"
                      >
                        أولاً: السياق البيداغوجي وتمرير روائز الموضعة
                      </h3>

                      <p className="text-[11px] leading-relaxed text-stone-800 text-justify bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        {pedagogicalContent.introduction}
                      </p>

                      {/* Test Administration Info Table */}
                      <table
                        style={{ borderColor: selectedColorPreset.border }}
                        className="w-full border-2 border-collapse text-xs text-center mt-1"
                      >
                        <tbody>
                          <tr style={{ borderColor: selectedColorPreset.border }} className="border-b">
                            <td
                              style={{ backgroundColor: selectedColorPreset.headerBg, color: selectedColorPreset.title }}
                              className="p-1 font-black w-28 border-l"
                            >
                              فترة الإجراء
                            </td>
                            <td className="p-1 font-bold text-stone-900 border-l">{metaInfo.testDateRange}</td>
                            <td
                              style={{ backgroundColor: selectedColorPreset.headerBg, color: selectedColorPreset.title }}
                              className="p-1 font-black w-28 border-l"
                            >
                              فضاء التمرير
                            </td>
                            <td className="p-1 font-bold text-stone-900">{metaInfo.testLocation}</td>
                          </tr>
                          <tr style={{ borderColor: selectedColorPreset.border }} className="border-b">
                            <td
                              style={{ backgroundColor: selectedColorPreset.headerBg, color: selectedColorPreset.title }}
                              className="p-1 font-black border-l"
                            >
                              المسجلون
                            </td>
                            <td className="p-1 font-black text-stone-900 border-l">{stats.enrolled} تلميذ(ة)</td>
                            <td
                              style={{ backgroundColor: selectedColorPreset.headerBg, color: selectedColorPreset.title }}
                              className="p-1 font-black border-l"
                            >
                              الحاضرون / المتغيبون
                            </td>
                            <td className="p-1 font-bold text-stone-900">
                              <span className="text-emerald-700 font-black">{stats.present} حاضر</span> /{' '}
                              <span className="text-red-600 font-bold">{stats.absent} غائب</span> (
                              {calcPercent(stats.present, stats.enrolled)}%)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Section 2: Statistical Results Breakdown (Subject by Subject) */}
                    <div className="space-y-2">
                      <h3
                        style={{ color: selectedColorPreset.title }}
                        className="text-xs sm:text-sm font-black border-r-4 pr-2 border-amber-600"
                      >
                        ثانياً: النتائج الإحصائية ونسب التموضع الأولي
                      </h3>

                      {/* Arabic Table */}
                      {(subjectScope === 'all_3' || subjectScope === 'arabic_only' || subjectScope === 'arabic_math') && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-black text-stone-800">1. نتائج مادة اللغة العربية:</div>
                          <table
                            style={{ borderColor: selectedColorPreset.border }}
                            className="w-full border border-collapse text-[10px] text-center"
                          >
                            <thead>
                              <tr
                                style={{ backgroundColor: selectedColorPreset.headerBg, color: selectedColorPreset.title }}
                                className="font-black border-b"
                              >
                                <th className="p-1 border-l">المستوى القرائي</th>
                                <th className="p-1 border-l">مستوى الحرف</th>
                                <th className="p-1 border-l">مستوى الكلمة</th>
                                <th className="p-1 border-l">مستوى الفقرة</th>
                                <th className="p-1 border-l">مستوى القصة</th>
                                <th className="p-1">مستوى الفهم</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b font-bold">
                                <td className="p-1 border-l bg-stone-50 font-black">العدد</td>
                                <td className="p-1 border-l">{stats.arabic.letter}</td>
                                <td className="p-1 border-l">{stats.arabic.word}</td>
                                <td className="p-1 border-l">{stats.arabic.paragraph}</td>
                                <td className="p-1 border-l text-emerald-700 font-black">{stats.arabic.story}</td>
                                <td className="p-1 text-emerald-700 font-black">{stats.arabic.comprehension}</td>
                              </tr>
                              <tr className="font-bold bg-stone-50/70">
                                <td className="p-1 border-l font-black">النسبة المئوية</td>
                                <td className="p-1 border-l">{calcPercent(stats.arabic.letter, stats.present)}%</td>
                                <td className="p-1 border-l">{calcPercent(stats.arabic.word, stats.present)}%</td>
                                <td className="p-1 border-l">{calcPercent(stats.arabic.paragraph, stats.present)}%</td>
                                <td className="p-1 border-l font-black text-emerald-700">
                                  {calcPercent(stats.arabic.story, stats.present)}%
                                </td>
                                <td className="p-1 font-black text-emerald-700">
                                  {calcPercent(stats.arabic.comprehension, stats.present)}%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* French Table */}
                      {(subjectScope === 'all_3' || subjectScope === 'french_only') && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[11px] font-black text-stone-800">2. Résultats de Français:</div>
                          <table
                            style={{ borderColor: selectedColorPreset.border }}
                            className="w-full border border-collapse text-[10px] text-center"
                          >
                            <thead>
                              <tr
                                style={{ backgroundColor: selectedColorPreset.headerBg, color: selectedColorPreset.title }}
                                className="font-black border-b"
                              >
                                <th className="p-1 border-l">Palier</th>
                                <th className="p-1 border-l">Lettre</th>
                                <th className="p-1 border-l">Mot</th>
                                <th className="p-1 border-l">Paragraphe</th>
                                <th className="p-1 border-l">Histoire</th>
                                <th className="p-1">Compréhension</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b font-bold">
                                <td className="p-1 border-l bg-stone-50 font-black">Effectif</td>
                                <td className="p-1 border-l">{stats.french.letter}</td>
                                <td className="p-1 border-l">{stats.french.word}</td>
                                <td className="p-1 border-l">{stats.french.paragraph}</td>
                                <td className="p-1 border-l text-emerald-700 font-black">{stats.french.story}</td>
                                <td className="p-1 text-emerald-700 font-black">{stats.french.comprehension}</td>
                              </tr>
                              <tr className="font-bold bg-stone-50/70">
                                <td className="p-1 border-l font-black">Pourcentage</td>
                                <td className="p-1 border-l">{calcPercent(stats.french.letter, stats.present)}%</td>
                                <td className="p-1 border-l">{calcPercent(stats.french.word, stats.present)}%</td>
                                <td className="p-1 border-l">{calcPercent(stats.french.paragraph, stats.present)}%</td>
                                <td className="p-1 border-l font-black text-emerald-700">
                                  {calcPercent(stats.french.story, stats.present)}%
                                </td>
                                <td className="p-1 font-black text-emerald-700">
                                  {calcPercent(stats.french.comprehension, stats.present)}%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Math Table */}
                      {(subjectScope === 'all_3' || subjectScope === 'math_only' || subjectScope === 'arabic_math') && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[11px] font-black text-stone-800">
                            {subjectScope === 'arabic_math' ? '2.' : '3.'} نتائج مادة الرياضيات:
                          </div>
                          <table
                            style={{ borderColor: selectedColorPreset.border }}
                            className="w-full border border-collapse text-[10px] text-center"
                          >
                            <thead>
                              <tr
                                style={{ backgroundColor: selectedColorPreset.headerBg, color: selectedColorPreset.title }}
                                className="font-black border-b"
                              >
                                <th className="p-1 border-l">المستوى الحسابي</th>
                                <th className="p-1 border-l">مبتدئ (عد)</th>
                                <th className="p-1 border-l">الجمع / الطرح</th>
                                <th className="p-1 border-l">الضرب / القسمة</th>
                                <th className="p-1">حل المسائل</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b font-bold">
                                <td className="p-1 border-l bg-stone-50 font-black">العدد</td>
                                <td className="p-1 border-l">{stats.math.beginner}</td>
                                <td className="p-1 border-l">{stats.math.addition + stats.math.subtraction}</td>
                                <td className="p-1 border-l">{stats.math.multiplication + stats.math.division}</td>
                                <td className="p-1 text-emerald-700 font-black">{stats.math.problem}</td>
                              </tr>
                              <tr className="font-bold bg-stone-50/70">
                                <td className="p-1 border-l font-black">النسبة المئوية</td>
                                <td className="p-1 border-l">{calcPercent(stats.math.beginner, stats.present)}%</td>
                                <td className="p-1 border-l">
                                  {calcPercent(stats.math.addition + stats.math.subtraction, stats.present)}%
                                </td>
                                <td className="p-1 border-l">
                                  {calcPercent(stats.math.multiplication + stats.math.division, stats.present)}%
                                </td>
                                <td className="p-1 font-black text-emerald-700">
                                  {calcPercent(stats.math.problem, stats.present)}%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Visual Progress Bars & Statistical Charts */}
                    <div className="space-y-2 pt-1">
                      <h3
                        style={{ color: selectedColorPreset.title }}
                        className="text-xs sm:text-sm font-black border-r-4 pr-2 border-amber-600"
                      >
                        ثالثاً: المبيانات الإحصائية البصرية لتوزيع التلاميذ
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                        {/* Arabic Progress Chart */}
                        {(subjectScope === 'all_3' || subjectScope === 'arabic_only' || subjectScope === 'arabic_math') && (
                          <div className="space-y-1.5 text-[10px]">
                            <div className="font-black text-stone-800 flex justify-between">
                              <span>مبيان القراءة (العربية):</span>
                              <span className="text-amber-700 font-bold">{stats.present} تلميذ مصنف</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-12 text-stone-600">قصة/فهم:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{ width: `${calcPercent(stats.arabic.story + stats.arabic.comprehension, stats.present)}%` }}
                                    className="bg-emerald-600 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(stats.arabic.story + stats.arabic.comprehension, stats.present)}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-12 text-stone-600">فقرة:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{ width: `${calcPercent(stats.arabic.paragraph, stats.present)}%` }}
                                    className="bg-sky-600 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(stats.arabic.paragraph, stats.present)}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-12 text-stone-600">كلمة/حرف:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{
                                      width: `${calcPercent(stats.arabic.word + stats.arabic.letter, stats.present)}%`,
                                    }}
                                    className="bg-amber-500 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(stats.arabic.word + stats.arabic.letter, stats.present)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* French Progress Chart (when french_only) */}
                        {subjectScope === 'french_only' && (
                          <div className="space-y-1.5 text-[10px]">
                            <div className="font-black text-stone-800 flex justify-between">
                              <span>Graphique Français:</span>
                              <span className="text-amber-700 font-bold">{stats.present} élèves</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-16 text-stone-600">Histoire/Comp:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{ width: `${calcPercent(stats.french.story + stats.french.comprehension, stats.present)}%` }}
                                    className="bg-emerald-600 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(stats.french.story + stats.french.comprehension, stats.present)}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-16 text-stone-600">Paragraphe:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{ width: `${calcPercent(stats.french.paragraph, stats.present)}%` }}
                                    className="bg-sky-600 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(stats.french.paragraph, stats.present)}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-16 text-stone-600">Mot/Lettre:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{
                                      width: `${calcPercent(stats.french.word + stats.french.letter, stats.present)}%`,
                                    }}
                                    className="bg-amber-500 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(stats.french.word + stats.french.letter, stats.present)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Math Progress Chart */}
                        {(subjectScope === 'all_3' || subjectScope === 'math_only' || subjectScope === 'arabic_math') && (
                          <div className="space-y-1.5 text-[10px]">
                            <div className="font-black text-stone-800 flex justify-between">
                              <span>مبيان الحساب (الرياضيات):</span>
                              <span className="text-amber-700 font-bold">{stats.present} تلميذ مصنف</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-14 text-stone-600">مسألة:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{ width: `${calcPercent(stats.math.problem, stats.present)}%` }}
                                    className="bg-emerald-600 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(stats.math.problem, stats.present)}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-14 text-stone-600">ضرب/قسمة:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{
                                      width: `${calcPercent(
                                        stats.math.multiplication + stats.math.division,
                                        stats.present
                                      )}%`,
                                    }}
                                    className="bg-blue-600 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(stats.math.multiplication + stats.math.division, stats.present)}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-14 text-stone-600">مبتدئ/جمع:</span>
                                <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden flex">
                                  <div
                                    style={{
                                      width: `${calcPercent(
                                        stats.math.beginner + stats.math.addition + stats.math.subtraction,
                                        stats.present
                                      )}%`,
                                    }}
                                    className="bg-amber-500 h-full text-[8px] text-white flex items-center justify-center font-bold"
                                  >
                                    {calcPercent(
                                      stats.math.beginner + stats.math.addition + stats.math.subtraction,
                                      stats.present
                                    )}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Page 2 Footer */}
                    <div className="border-t border-stone-300 pt-2 flex items-center justify-between text-[10px] text-stone-500 font-bold">
                      <span>تقرير فترة طارل • المعطيات الإحصائية</span>
                      <span>الموسم الدراسي {metaInfo.academicYear}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* PAGE 3: PEDAGOGICAL ANALYSIS, ACHIEVEMENTS, DIFFICULTIES & PLAN     */}
              {/* =================================================================== */}
              {(activePageTab === 'all' || activePageTab === '3') && (
                <div
                  className="flex justify-center items-start w-full overflow-hidden shrink-0 transition-all"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    height: `${1130 * previewScale + 8}px`,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top center',
                      width: '800px',
                      height: '1130px',
                      fontFamily: selectedFont.family,
                    }}
                    ref={page3Ref}
                    id="tarl-report-page-3"
                    className="bg-white text-stone-950 p-8 sm:p-9 flex flex-col justify-between shadow-2xl rounded-sm shrink-0 space-y-3"
                    dir="rtl"
                  >
                    {/* Mini Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-300 text-xs">
                      <span className="font-bold text-stone-700">
                        تقرير فترة طارل • {metaInfo.school} • التحليل التربوي والتوصيات
                      </span>
                      <span className="font-black text-stone-500 text-[11px]">الصفحة 3 / 3</span>
                    </div>

                    {/* Section 4: Pedagogical Analysis of Results */}
                    <div className="space-y-1.5">
                      <h3
                        style={{ color: selectedColorPreset.title }}
                        className="text-xs sm:text-sm font-black border-r-4 pr-2 border-amber-600"
                      >
                        رابعاً: التحليل والتشخيص التربوي للنتائج
                      </h3>
                      <p className="text-[11px] leading-relaxed text-stone-800 text-justify bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        {pedagogicalContent.analysis}
                      </p>
                    </div>

                    {/* Section 5: Acquired Skills & Achievements */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3
                          style={{ color: selectedColorPreset.title }}
                          className="text-xs sm:text-sm font-black border-r-4 pr-2 border-amber-600"
                        >
                          خامساً: المكتسبات والإنجازات المحققة خلال فترة الدعم
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddItem('achievements')}
                          className="text-[10px] text-amber-700 font-black hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> إضافة مكتسب
                        </button>
                      </div>

                      <ul className="space-y-1 text-[11px] text-stone-800 pr-2">
                        {pedagogicalContent.achievements.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 group">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="flex-1 leading-snug">{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem('achievements', idx)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 p-0.5 hover:bg-red-50 rounded"
                              title="حذف"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 6: Difficulties and Challenges Observed */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3
                          style={{ color: selectedColorPreset.title }}
                          className="text-xs sm:text-sm font-black border-r-4 pr-2 border-amber-600"
                        >
                          سادساً: الصعوبات والتعثرات المرصودة
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddItem('difficulties')}
                          className="text-[10px] text-amber-700 font-black hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> إضافة صعوبة
                        </button>
                      </div>

                      <ul className="space-y-1 text-[11px] text-stone-800 pr-2">
                        {pedagogicalContent.difficulties.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 group">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="flex-1 leading-snug">{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem('difficulties', idx)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 p-0.5 hover:bg-red-50 rounded"
                              title="حذف"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 7: Remediation Plan & Recommendations */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3
                          style={{ color: selectedColorPreset.title }}
                          className="text-xs sm:text-sm font-black border-r-4 pr-2 border-amber-600"
                        >
                          سابعاً: التوصيات وخطة الدعم المندمج المستمر
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddItem('recommendations')}
                          className="text-[10px] text-amber-700 font-black hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> إضافة توصية
                        </button>
                      </div>

                      <ul className="space-y-1 text-[11px] text-stone-800 pr-2">
                        {pedagogicalContent.recommendations.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                            <span className="flex-1 leading-snug">{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem('recommendations', idx)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 p-0.5 hover:bg-red-50 rounded"
                              title="حذف"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Official Signatures Triple Box */}
                    <div className="pt-3 border-t-2 border-stone-300">
                      <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold">
                        <div className="p-2 border border-stone-300 rounded-xl bg-stone-50/50 space-y-6">
                          <p className="font-black text-stone-900">توقيع الأستاذ(ة) الممرر(ة)</p>
                          <p className="text-[10px] text-stone-400 font-normal">.................................</p>
                        </div>

                        <div className="p-2 border border-stone-300 rounded-xl bg-stone-50/50 space-y-6">
                          <p className="font-black text-stone-900">توقيع وخاتم السيد رئيس المؤسسة</p>
                          <p className="text-[10px] text-stone-400 font-normal">.................................</p>
                        </div>

                        <div className="p-2 border border-stone-300 rounded-xl bg-stone-50/50 space-y-6">
                          <p className="font-black text-stone-900">تأشيرة السيد المفتش التربوي</p>
                          <p className="text-[10px] text-stone-400 font-normal">.................................</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER: ACTION BUTTONS                                              */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-4 md:p-5 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 w-full sm:w-auto justify-between sm:justify-start">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">جاهز للتصدير كملف PDF موحد (3 صفحات كاملة)</span>
            </span>
            {isExporting && exportProgress && (
              <span className="text-amber-600 font-bold text-[11px] animate-pulse">
                {exportProgress}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Share Button */}
            <button
              type="button"
              disabled={isExporting}
              onClick={handleSharePdf}
              className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="مشاركة التقرير"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="طباعة مباشرة"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة فورية</span>
            </button>

            {/* Main Download 3-Page PDF Button */}
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadMultiPagePdf}
              className="flex-1 sm:flex-none py-2.5 px-5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تصدير التقرير...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم التصدير بنجاح!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تصدير وتحميل تقرير طارل (3 صفحات PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
