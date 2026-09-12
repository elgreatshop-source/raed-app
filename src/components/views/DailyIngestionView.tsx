import React, { useState, useRef, useMemo } from 'react';
import { TeacherProfile, PedagogicalPhase, AgendaDayEvent, WeeklyTimetable } from '../../types';
import { sanitizeString } from '../../utils/security';
import { calculatePedagogicalMetrics, initialMoroccanAcademicEvents } from '../../data/timetableTemplates';
import { isNativeApp, takeNativePhoto } from '../../services/nativeBridge';
import {
  processUploadedFile,
  UploadedAttachment,
  formatFileSize,
  getFileTypeCategory,
  getFileCategoryInfo,
} from '../../utils/fileParser';
import {
  Sparkles,
  Camera,
  Upload,
  FileText,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
  Calculator,
  Globe,
  CheckCircle2,
  Loader2,
  Info,
  Compass,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  File as FileIcon,
  Eye,
  EyeOff,
  AlertTriangle,
  Plus,
  Clock,
  Check,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  X,
} from 'lucide-react';

interface DailyIngestionViewProps {
  phase: PedagogicalPhase;
  onPhaseChange: (phase: PedagogicalPhase) => void;
  date: string;
  onDateChange: (date: string) => void;
  dayName: string;
  onDayNameChange: (day: string) => void;
  teacherProfile: TeacherProfile;
  timetable?: WeeklyTimetable;
  onGenerate: (payload: {
    phase: PedagogicalPhase;
    date: string;
    dayName: string;
    arabicLessonInput: string;
    mathLessonInput: string;
    frenchLessonInput: string;
    customInstructions: string;
    imagesBase64: Array<{ data: string; mimeType: string }>;
    documentsText?: Array<{ name: string; type: string; text: string }>;
  }) => Promise<void>;
  isGenerating: boolean;
}

export function DailyIngestionView({
  phase,
  onPhaseChange,
  date,
  onDateChange,
  dayName,
  onDayNameChange,
  teacherProfile,
  timetable,
  onGenerate,
  isGenerating,
}: DailyIngestionViewProps) {
  const [arabicLessonInput, setArabicLessonInput] = useState('');
  const [mathLessonInput, setMathLessonInput] = useState('');
  const [frenchLessonInput, setFrenchLessonInput] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'text'>('upload');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [expandedDocTextId, setExpandedDocTextId] = useState<string | null>(null);

  // Camera preview inspection modal state
  const [photoPreviewModal, setPhotoPreviewModal] = useState<{
    dataUrl: string;
    name: string;
    size: number;
    format: string;
    rawFile?: File;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const daysOfWeek = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Calculate live pedagogical metrics for the selected date
  const pedagogicalMetrics = useMemo(() => {
    try {
      const savedEvents = localStorage.getItem('pioneer_agenda_events');
      const events: AgendaDayEvent[] = savedEvents ? JSON.parse(savedEvents) : initialMoroccanAcademicEvents;
      return calculatePedagogicalMetrics(date, events);
    } catch (e) {
      return calculatePedagogicalMetrics(date, initialMoroccanAcademicEvents);
    }
  }, [date]);

  // Timetable scheduled slots for the selected day
  const todayTimetableSlots = useMemo(() => {
    if (!timetable?.slots || !Array.isArray(timetable.slots)) return [];
    return timetable.slots.filter((s) => s.day === dayName);
  }, [timetable, dayName]);

  const handleDateChange = (newDate: string) => {
    onDateChange(newDate);
    try {
      const d = new Date(newDate);
      const dayIndex = d.getDay();
      const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      if (arabicDays[dayIndex]) {
        onDayNameChange(arabicDays[dayIndex]);
      }
    } catch (e) {
      // ignore
    }
  };

  /**
   * Handles camera trigger: uses Capacitor Native Camera on Android, or hidden input on Web.
   * Prompts permission only when requested on tap.
   */
  const handleTriggerCamera = async () => {
    setValidationError(null);
    if (isNativeApp()) {
      try {
        setIsProcessingFiles(true);
        const photoResult = await takeNativePhoto();
        if (photoResult) {
          setPhotoPreviewModal(photoResult);
        }
      } catch (err: any) {
        setValidationError(err.message || 'تعذر تشغيل كاميرا الهاتف. يرجى مراجعة أذونات الكاميرا.');
      } finally {
        setIsProcessingFiles(false);
      }
    } else {
      cameraInputRef.current?.click();
    }
  };

  /**
   * Web camera capture handler
   */
  const handleWebCameraCapture = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreviewModal({
          dataUrl: reader.result,
          name: file.name || `صورة_كاميرا_${new Date().toISOString().split('T')[0]}.jpg`,
          size: file.size,
          format: file.type.split('/')[1] || 'jpeg',
          rawFile: file,
        });
      }
    };
    reader.readAsDataURL(file);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  /**
   * Approves the captured photo from inspection modal and adds it to attachments
   */
  const handleApproveCapturedPhoto = async () => {
    if (!photoPreviewModal) return;
    setIsProcessingFiles(true);
    try {
      let attachment: UploadedAttachment;
      if (photoPreviewModal.rawFile) {
        attachment = await processUploadedFile(photoPreviewModal.rawFile);
      } else {
        const base64Clean = photoPreviewModal.dataUrl.split(',')[1] || photoPreviewModal.dataUrl;
        attachment = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: photoPreviewModal.name,
          size: photoPreviewModal.size,
          type: 'image',
          mimeType: `image/${photoPreviewModal.format || 'jpeg'}`,
          dataUrl: photoPreviewModal.dataUrl,
          status: 'ready',
        };
      }
      setAttachments((prev) => [...prev, attachment]);
      setPhotoPreviewModal(null);
    } catch (err) {
      console.error('Error approving photo:', err);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  /**
   * Retakes photo by reopening camera
   */
  const handleRetakePhoto = () => {
    setPhotoPreviewModal(null);
    setTimeout(() => {
      handleTriggerCamera();
    }, 200);
  };

  /**
   * Handles multi-file upload with cumulative addition and per-file error isolation.
   */
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setValidationError(null);
    setIsProcessingFiles(true);

    try {
      const validFiles = Array.from(files);
      const newAttachments: UploadedAttachment[] = [];

      for (const file of validFiles) {
        // Limit file size to 30 MB
        if (file.size > 30 * 1024 * 1024) {
          newAttachments.push({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            size: file.size,
            type: getFileTypeCategory(file),
            status: 'error',
            errorMessage: 'يتجاوز حجم هذا الملف الحد الأقصى (30 ميغابايت). يمكنك حذفه أو استبداله.',
          });
          continue;
        }

        const attachment = await processUploadedFile(file);
        newAttachments.push(attachment);
      }

      // Add files cumulatively without deleting previously uploaded files
      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (err) {
      console.error('Error processing files:', err);
      setValidationError('حدث خطأ أثناء قراءة الملفات المرفقة.');
    } finally {
      setIsProcessingFiles(false);
      // Reset input element so user can re-upload or upload more files
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  // Moroccan Pilot Curriculum Quick Presets
  const applyPreset = () => {
    if (phase === 'intensive_remediation') {
      setArabicLessonInput('طارل (TaRL) - اللبنة 3: قراءة نص قصير بطلاقة وتركيب الجمل الفعلية وتفكيك الكلمات الصعبة');
      setMathLessonInput('طارل (TaRL) - اللبنة 4: العمليات الحسابية: تقنية الجمع بالاحتفاظ وحل مسائل بالأربع خطوات');
      setFrenchLessonInput('TaRL - Palier 3: Lecture de syllabes et mots avec phonèmes complexes (ou, on, oi) et écriture de phrases');
      setCustomInstructions('التركيز على النمذجة واستراتيجية الألواح والتقويم التكويني السريع');
    } else {
      setArabicLessonInput('النص الوظيفي: ما أحلى العطلة! - دراسة المعجم، أسئلة الفهم الصريح، واستخراج عناصر الجملة الفعلية');
      setMathLessonInput('الدرس 3: الأعداد من 0 إلى 999 999 (قراءة، كتابة، تفكيك، ومقارنة) وحل مسألة الجمع والطرح');
      setFrenchLessonInput('Unité 1: Thème de la rentrée scolaire - Compréhension de l\'écrit et enrichissement du vocabulaire');
      setCustomInstructions('اعتماد التدرج الصريح: أنا أعمل (Modelage)، نحن نعمل (Pratique guidée)، أنت تعمل (Pratique autonome)');
    }
  };

  const handleGenerateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const readyAttachments = attachments.filter((att) => att.status === 'ready');

    // Validation: Require at least one ready attachment or text lesson input
    if (
      !arabicLessonInput &&
      !mathLessonInput &&
      !frenchLessonInput &&
      readyAttachments.length === 0
    ) {
      setValidationError('يرجى اختيار وثائق أو دروس رقمية صالحة للتحليل، أو إدخال عناوين الدروس نصياً.');
      return;
    }

    // Filter images/PDFs and extracted text from ready documents
    const imagesBase64 = readyAttachments
      .filter((att) => (att.type === 'image' || att.type === 'pdf') && att.dataUrl)
      .map((att) => ({
        data: att.dataUrl!,
        mimeType: att.mimeType || (att.type === 'pdf' ? 'application/pdf' : 'image/jpeg'),
      }));

    const documentsText = readyAttachments
      .filter((att) => att.extractedText && att.extractedText.trim().length > 0)
      .map((att) => ({
        name: att.name,
        type: att.type,
        text: att.extractedText!,
      }));

    await onGenerate({
      phase,
      date,
      dayName,
      arabicLessonInput: sanitizeString(arabicLessonInput),
      mathLessonInput: sanitizeString(mathLessonInput),
      frenchLessonInput: sanitizeString(frenchLessonInput),
      customInstructions: sanitizeString(customInstructions),
      imagesBase64,
      documentsText,
    });
  };

  // Count ready vs error attachments
  const readyCount = attachments.filter((a) => a.status === 'ready').length;
  const errorCount = attachments.filter((a) => a.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title & Info Header - Pioneer Amber / Orange Identity */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 border border-amber-400 shadow-md text-center transition-all relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs text-white text-[11px] font-black rounded-full border border-white/30 shadow-2xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>بوابة التوليد اليومي الذكي</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
            تحضير اليوم الدراسي
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 font-medium max-w-2xl mx-auto leading-relaxed">
            حدد تاريخ اليوم الدراسي، ثم ارفع ملفات الدروس الرقمية والوثائق البيداغوجية بشتى الصيغ (PDF, Word, PPT, Excel, صور, نصوص) أو أدخلها نصياً لتوليد المذكرة والخطاطات بدقة.
          </p>

          {/* Quick Presets Bar */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-100">تعبئة تجريبية سريعة:</span>
            <button
              type="button"
              onClick={() => {
                applyPreset();
                setActiveInputMode('text');
              }}
              className="text-xs bg-white text-amber-950 hover:bg-amber-50 font-black px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>نموذج جاهز ({teacherProfile.level})</span>
            </button>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs rounded-2xl font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Ingestion Form */}
      <form onSubmit={handleGenerateClick} className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-6 transition-colors">
        {/* Step 1: Date & Day Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-stone-100 dark:border-stone-800">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              المرحلة البيداغوجية <span className="text-red-500">*</span>
            </label>
            <select
              value={phase}
              onChange={(e) => onPhaseChange(e.target.value as PedagogicalPhase)}
              className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="intensive_remediation">فترة الدعم المكثف لتعلمات الأساس (TaRL)</option>
              <option value="explicit_instruction">مرحلة التدريس الصريح المعتاد (إرساء الموارد)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              تاريخ اليوم الدراسي <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
              />
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              اليوم <span className="text-red-500">*</span>
            </label>
            <select
              value={dayName}
              onChange={(e) => onDayNameChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Pedagogical Tracking & Timetable Integration Info */}
        <div className="space-y-2">
          {/* Special Milestone / Entry / Reception Reminder Banner */}
          {pedagogicalMetrics.eventForDate && (
            <div
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs ${
                pedagogicalMetrics.eventForDate.type === 'entry_signature'
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200'
                  : pedagogicalMetrics.eventForDate.type === 'student_reception'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : pedagogicalMetrics.eventForDate.type === 'holiday'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-950 dark:text-red-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-stone-900/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {pedagogicalMetrics.eventForDate.type === 'entry_signature' ? (
                    <span className="text-base">📝</span>
                  ) : pedagogicalMetrics.eventForDate.type === 'student_reception' ? (
                    <span className="text-base">🤝</span>
                  ) : (
                    <Compass className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs sm:text-sm">
                      تذكير وملاحظة: {pedagogicalMetrics.eventForDate.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/70 dark:bg-stone-900/70 border border-current/20">
                      {pedagogicalMetrics.eventForDate.type === 'entry_signature'
                        ? 'محطة توقيع المحاضر'
                        : pedagogicalMetrics.eventForDate.type === 'student_reception'
                        ? 'محطة استقبال التلاميذ'
                        : 'محطة مبرمجة'}
                    </span>
                  </div>
                  {pedagogicalMetrics.eventForDate.notes && (
                    <p className="text-[11px] font-medium mt-1 opacity-90 leading-relaxed">
                      {pedagogicalMetrics.eventForDate.notes}
                    </p>
                  )}
                  {pedagogicalMetrics.isPreTeachingWorkDay && (
                    <p className="text-[10px] font-bold text-teal-800 dark:text-teal-300 mt-1">
                      💡 تنبيه تنظيمي: هذا اليوم هو يوم عمل إداري واستقبال، والانطلاق الفعلي لحصص التدريس مع التلاميذ سيكون يوم الثلاثاء 08 شتنبر 2026.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                  الموقع البيداغوجي وفق اليومية المعتمدة:
                </span>
                <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-medium">
                  {pedagogicalMetrics.eventForDate && pedagogicalMetrics.eventForDate.type === 'holiday'
                    ? `⚠️ ${pedagogicalMetrics.eventForDate.title || 'يوم عطلة / توقف'}`
                    : pedagogicalMetrics.isPreTeachingWorkDay
                    ? `مرحلة الدخول المدرسي والاستقبال (قبل الانطلاق الفعلي للدراسة)`
                    : `الأسبوع التربوي: ${pedagogicalMetrics.pedagogicalWeek} • اليوم التربوي: ${pedagogicalMetrics.pedagogicalDay}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] font-bold text-amber-800 dark:text-amber-300">
                {pedagogicalMetrics.phase === 'intensive_remediation' ? 'دعم طارل (TaRL)' : 'التدريس الصريح'}
              </span>
              <span className="px-2.5 py-1 bg-amber-600 text-white rounded-xl text-[11px] font-black shadow-2xs">
                {pedagogicalMetrics.phaseTitle}
              </span>
            </div>
          </div>

          {/* Timetable Slots for Today (if any) */}
          {todayTimetableSlots.length > 0 && (
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-stone-700 dark:text-stone-300 text-xs">
                  المكونات المبرمجة في استعمال الزمن ليوم ({dayName}):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {todayTimetableSlots.map((slot, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-[11px] font-bold shadow-2xs"
                  >
                    <span className="text-amber-600 font-black">{slot.startTime} - {slot.endTime}</span>
                    <span>•</span>
                    <span>{slot.subject}</span>
                    {slot.group && <span className="text-stone-400 text-[10px]">({slot.group})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Mode Selection Tabs */}
        <div>
          <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2.5">
            طريقة إدخال معطيات الدروس والوثائق:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700">
            {/* Mode 1: Digital Lessons & Documents Upload */}
            <button
              type="button"
              onClick={() => setActiveInputMode('upload')}
              className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                activeInputMode === 'upload'
                  ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs border border-amber-200/60 dark:border-stone-600'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-black">رفع ملفات الدروس الرقمية والوثائق</span>
                <span className="block text-[10px] font-normal text-stone-500 dark:text-stone-400">
                  PDF، Word، PowerPoint، Excel، صور (JPG/PNG)، ونصوص
                </span>
              </div>
            </button>

            {/* Mode 2: Manual Text Writing */}
            <button
              type="button"
              onClick={() => setActiveInputMode('text')}
              className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                activeInputMode === 'text'
                  ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs border border-amber-200/60 dark:border-stone-600'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-black">كتابة العناوين يدوياً</span>
                <span className="block text-[10px] font-normal text-stone-500 dark:text-stone-400">
                  إدخال عناوين الحصص والأنشطة كتابياً
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Hidden inputs for camera and comprehensive file upload */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/jpeg,image/png,image/jpg,image/webp"
          capture="environment"
          onChange={(e) => handleWebCameraCapture(e.target.files)}
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/jpg,image/webp,.pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/plain,text/csv"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        {/* ==================================================================== */}
        {/* VIEW 1: ADVANCED DIGITAL LESSONS & MULTI-DOCUMENTS DROPZONE          */}
        {/* ==================================================================== */}
        {activeInputMode === 'upload' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Drag & Drop Main Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
                isDraggingOver
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 scale-[0.99]'
                  : 'border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 bg-stone-50/50 dark:bg-stone-800/30'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-2xs">
                  {isProcessingFiles ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <p className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100">
                    اسحب وأفلت وثائق ودروس اليوم هنا أو اضغط للاختيار من جهازك
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
                    يمكنك اختيار عدة ملفات معاً في نفس الوقت، وإضافة ملفات أخرى لاحقاً دون حذف ما رفعته سابقاً
                  </p>
                </div>

                {/* Formats Badges Indicator */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-[11px] font-bold">
                    <FileIcon className="w-3 h-3 text-red-600" />
                    <span>PDF</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold">
                    <FileText className="w-3 h-3 text-indigo-600" />
                    <span>Word (DOC/DOCX)</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 rounded-lg text-[11px] font-bold">
                    <Presentation className="w-3 h-3 text-orange-600" />
                    <span>PowerPoint (PPT/PPTX)</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-bold">
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    <span>Excel (XLS/XLSX/CSV)</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold">
                    <ImageIcon className="w-3 h-3 text-blue-600" />
                    <span>صور (JPG/PNG/WEBP)</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold">
                    <FileText className="w-3 h-3 text-slate-600" />
                    <span>نصوص (TXT)</span>
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingFiles}
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>اختيار ملفات الدروس الرقمية والوثائق من الجهاز</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerCamera}
                    disabled={isProcessingFiles}
                    className="px-4 py-3 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 active:scale-95 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>التقاط صورة بكاميرا الهاتف</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Structured Documents List */}
            {attachments.length > 0 && (
              <div className="bg-stone-50 dark:bg-stone-800/60 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-4">
                {/* Header with Counter and Add More Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>قائمة الوثائق والدروس المرفقة ({attachments.length}):</span>
                    </span>
                    {errorCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md">
                        {errorCount} به خطأ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* «+ إضافة وثيقة أخرى» Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingFiles}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ إضافة وثيقة أخرى</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttachments([])}
                      className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-bold cursor-pointer px-2 py-1"
                    >
                      مسح الكل
                    </button>
                  </div>
                </div>

                {/* Document Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((att) => {
                    const isExpanded = expandedDocTextId === att.id;
                    const catInfo = getFileCategoryInfo(att.type);

                    return (
                      <div
                        key={att.id}
                        className={`bg-white dark:bg-stone-800 rounded-2xl border p-3.5 shadow-2xs relative flex flex-col justify-between overflow-hidden transition-all ${
                          att.status === 'error'
                            ? 'border-red-300 dark:border-red-800/80 bg-red-50/20'
                            : 'border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        {/* Header: Type icon, name & delete */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {/* Type Icon */}
                            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                              {att.type === 'pdf' && <FileIcon className="w-4 h-4 text-red-600" />}
                              {att.type === 'word' && <FileText className="w-4 h-4 text-indigo-600" />}
                              {att.type === 'powerpoint' && <Presentation className="w-4 h-4 text-orange-600" />}
                              {att.type === 'excel' && <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                              {att.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-600" />}
                              {att.type === 'text' && <FileText className="w-4 h-4 text-slate-600" />}
                              {att.type === 'other' && <HelpCircle className="w-4 h-4 text-zinc-500" />}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-black text-stone-900 dark:text-stone-100 truncate" title={att.name}>
                                {att.name}
                              </p>

                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] mt-1 text-stone-500 dark:text-stone-400">
                                <span className={`font-black px-1.5 py-0.5 rounded-md border text-[9px] ${catInfo.bg} ${catInfo.color}`}>
                                  {catInfo.label}
                                </span>
                                <span>•</span>
                                <span>{formatFileSize(att.size)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Status Badge & Messages */}
                        <div className="my-1">
                          {att.status === 'ready' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>جاهز للتحليل بواسطة Gemini</span>
                            </span>
                          )}

                          {att.status === 'processing' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/60">
                              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                              <span>جاري قراءة واستخراج المحتوى...</span>
                            </span>
                          )}

                          {att.status === 'error' && (
                            <div className="p-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-[10px] font-bold text-red-700 dark:text-red-300 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                              <span>{att.errorMessage || 'تعذر قراءة هذا الملف، يمكنك حذفه أو استبداله.'}</span>
                            </div>
                          )}
                        </div>

                        {/* Image Thumbnail Preview */}
                        {att.type === 'image' && att.dataUrl && (
                          <div className="w-full h-24 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 mt-2">
                            <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Extracted Text Snippet & View Toggle for Word, PowerPoint, Excel, Text */}
                        {att.extractedText && att.status === 'ready' && (
                          <div className="mt-2 space-y-1.5">
                            <div className="bg-stone-50 dark:bg-stone-900/70 p-2 rounded-xl border border-stone-200/80 dark:border-stone-700/70 text-[10px] text-stone-600 dark:text-stone-300">
                              <p className="line-clamp-2 leading-relaxed">
                                {att.extractedText}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setExpandedDocTextId(isExpanded ? null : att.id)}
                              className="text-[10px] text-amber-700 dark:text-amber-400 font-black hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>إخفاء النص المستخرج</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>معاينة النص المستخرج</span>
                                </>
                              )}
                            </button>

                            {isExpanded && (
                              <div className="max-h-40 overflow-y-auto p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-amber-200 dark:border-amber-800 text-[10px] text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                                {att.extractedText}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 2: DEDICATED CONTAINER FOR MANUAL TEXT WRITING                  */}
        {/* ==================================================================== */}
        {activeInputMode === 'text' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Arabic Subject Section */}
            <div className="bg-stone-50 dark:bg-stone-800/40 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>مكون اللغة العربية (نص القراءة، التراكيب، الكتابة، أو لبنة طارل)</span>
              </div>
              <textarea
                rows={2}
                value={arabicLessonInput}
                onChange={(e) => setArabicLessonInput(e.target.value)}
                placeholder="مثال: النص القرائي 'شجرة الليمون' - اكتشاف معاني الكلمات واستخراج عناصر الجملة الفعلية مع تمارين في الكراسة..."
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            {/* Math Subject Section */}
            <div className="bg-stone-50 dark:bg-stone-800/40 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>مكون الرياضيات (العد، الحساب الذهني، المفهوم الرياضي، والمسائل)</span>
              </div>
              <textarea
                rows={2}
                value={mathLessonInput}
                onChange={(e) => setMathLessonInput(e.target.value)}
                placeholder="مثال: الدرس 4: الأعداد من 0 إلى 999 999 (مقارنة وترتيب)، الحساب الذهني لجدول الضرب 6 و 7، وحل مسألة الجمع بالأربع خطوات..."
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            {/* French Subject Section */}
            <div className="bg-stone-50 dark:bg-stone-800/40 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300">
                <Globe className="w-4 h-4 text-amber-600" />
                <span>مكون اللغة الفرنسية (Français: Lecture, Vocabulaire, Écriture ou TaRL)</span>
              </div>
              <textarea
                rows={2}
                value={frenchLessonInput}
                onChange={(e) => setFrenchLessonInput(e.target.value)}
                placeholder="Exemple: Unité 1 - Semaine 2: Texte 'La rentrée', étude de phonèmes (ou, on, oi), et pratique guidée sur cahier..."
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed text-left"
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* Custom Teacher Pedagogical Instructions */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            توجيهات وملاحظات بيداغوجية خاصة (اختياري):
          </label>
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="مثال: التركيز على استراتيجية الألواح الفردية، أو تخصيص 10 دقائق للتقويم التكويني السريع..."
            className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* AI Privacy & Transparency Notice */}
        <div className="p-3 bg-stone-50 dark:bg-stone-850/80 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>معالجة ذكية آمنة ومحمية:</strong> تُعالج ملفاتك ونصوصك لغرض إعداد المذكرة بطلبك فقط، مع حظر استخدام بياناتك في تدريب النماذج العامة.
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold shrink-0 hidden sm:inline-block">
            خادم مشفّر 256-bit
          </span>
        </div>

        {/* Action Button: Generate Daily Pack */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
          <button
            type="submit"
            disabled={isGenerating || isProcessingFiles}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 active:scale-[0.99] text-white font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer text-sm sm:text-base border border-amber-400 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>جاري تحليل الوثائق وبناء الخطاطات والمذكرة اليومية بالذكاء البيداغوجي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>توليد الخطاطات والمذكرة اليومية والانتقال للمعاينة</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* NATIVE / WEB CAMERA INSPECTION & APPROVAL MODAL                           */}
      {/* ========================================================================= */}
      {photoPreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black">معاينة الصورة الملتقطة بالكاميرا</h3>
                  <p className="text-[11px] text-stone-400">تأكد من وضوح نص الوثيقة ومقروئيتها قبل اعتمادها</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPhotoPreviewModal(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview Container */}
            <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-stone-950/40">
              <div className="w-full max-h-[55vh] rounded-2xl overflow-hidden border-2 border-stone-200 dark:border-stone-700 shadow-inner bg-black flex items-center justify-center">
                <img
                  src={photoPreviewModal.dataUrl}
                  alt="Captured Document"
                  className="max-h-[55vh] w-auto max-w-full object-contain rounded-xl"
                />
              </div>

              {/* Metadata strip */}
              <div className="w-full mt-3 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300">
                <span className="truncate max-w-[200px] font-bold">{photoPreviewModal.name}</span>
                <span>الحجم التقريبي: {formatFileSize(photoPreviewModal.size)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleApproveCapturedPhoto}
                disabled={isProcessingFiles}
                className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>اعتماد الصورة وإضافتها للتحليل</span>
              </button>

              <button
                type="button"
                onClick={handleRetakePhoto}
                disabled={isProcessingFiles}
                className="w-full sm:w-auto py-3 px-4 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>إعادة التصوير</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoPreviewModal(null)}
                className="w-full sm:w-auto py-3 px-3 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
