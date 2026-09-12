import React, { useState, useRef } from 'react';
import { PedagogicalPhase, TeacherProfile } from '../types';
import {
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Calculator,
  Globe,
  CheckCircle,
  AlertCircle,
  Calendar,
  Layers,
  Zap,
  Sliders,
} from 'lucide-react';

interface LessonInputSectionProps {
  phase: PedagogicalPhase;
  onPhaseChange: (p: PedagogicalPhase) => void;
  date: string;
  onDateChange: (d: string) => void;
  dayName: string;
  onDayNameChange: (n: string) => void;
  teacherProfile: TeacherProfile;
  onGenerate: (payload: {
    phase: PedagogicalPhase;
    date: string;
    dayName: string;
    arabicLessonInput: string;
    mathLessonInput: string;
    frenchLessonInput: string;
    customInstructions: string;
    imagesBase64: Array<{ data: string; mimeType: string }>;
  }) => Promise<void>;
  isGenerating: boolean;
}

export const LessonInputSection: React.FC<LessonInputSectionProps> = ({
  phase,
  onPhaseChange,
  date,
  onDateChange,
  dayName,
  onDayNameChange,
  teacherProfile,
  onGenerate,
  isGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<'math' | 'arabic' | 'french'>('math');
  const [mathInput, setMathInput] = useState(
    'العد القفزي بمقدار 5 و 10 على الشريط العددي، تقنية الجمع بالاحتفاظ من 0 إلى 999، وحل مسألة جمعية بسيطة باستخدام استراتيجية الأسئلة الأربعة.'
  );
  const [arabicInput, setArabicInput] = useState(
    'قراءة نص قصير بطلاقة وفهم معانيه، التمييز بين عناصر الجملة الفعلية (فعل + فاعل + مفعول به)، وكتابة جملة فعلية سليمة المعنى.'
  );
  const [frenchInput, setFrenchInput] = useState(
    'Lecture de syllabes et mots avec sons complexes (ou, on, oi), identification de la phrase simple (Sujet + Verbe), et copie calligraphique sur cahier.'
  );
  const [customPrompt, setCustomPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; type: string; base64: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const daysArabic = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const handleDateChangeInternal = (newDate: string) => {
    onDateChange(newDate);
    try {
      const d = new Date(newDate);
      if (!isNaN(d.getTime())) {
        const dName = daysArabic[d.getDay()];
        onDayNameChange(dName);
      }
    } catch {
      // ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'image/jpeg',
            base64: result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStartGeneration = async () => {
    const imagesPayload = uploadedFiles.map((f) => ({
      data: f.base64,
      mimeType: f.type,
    }));

    await onGenerate({
      phase,
      date,
      dayName,
      arabicLessonInput: arabicInput,
      mathLessonInput: mathInput,
      frenchLessonInput: frenchInput,
      customInstructions: customPrompt,
      imagesBase64: imagesPayload,
    });
  };

  return (
    <div className="w-full bg-white border border-stone-200 rounded-2xl shadow-xs p-4 sm:p-6 mb-6" dir="rtl">
      {/* Step Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              الخطوة 1: معطيات الدروس
            </span>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              إدخال فهرسة ودروس اليوم للذكاء الاصطناعي
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            أدخل محاور الدرسين (أو ارفع صور الفهرسة / الدليل الرقمي) ليقوم الذكاء الاصطناعي بتوليد الخطاطات والمذكرة اليومية تلقائياً.
          </p>
        </div>

        {/* Phase Selector Toggle */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => onPhaseChange('intensive_remediation')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              phase === 'intensive_remediation'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. الدعم المكثف (TaRL)</span>
          </button>
          <button
            type="button"
            onClick={() => onPhaseChange('explicit_instruction')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              phase === 'explicit_instruction'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. التدريس الصريح المعتاد</span>
          </button>
        </div>
      </div>

      {/* Date and Day Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 bg-stone-50 p-3 rounded-xl border border-stone-200/70">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>تاريخ اليوم الدراسي:</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChangeInternal(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            <span>اليوم:</span>
          </label>
          <input
            type="text"
            value={dayName}
            onChange={(e) => onDayNameChange(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-bold text-amber-900"
            placeholder="مثال: الثلاثاء"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            <span>المستوى المسجل بالبروفايل:</span>
          </label>
          <div className="bg-stone-200/70 text-stone-800 text-xs sm:text-sm px-3 py-2 rounded-lg font-bold flex items-center justify-between">
            <span>{teacherProfile.level}</span>
            <span className="text-[11px] text-stone-500 font-normal">{teacherProfile.classGroup}</span>
          </div>
        </div>
      </div>

      {/* Tabs for Subject Inputs */}
      <div className="border-b border-stone-200 mb-4 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('math')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'math'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>درس الرياضيات</span>
        </button>

        <button
          onClick={() => setActiveTab('arabic')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'arabic'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>درس اللغة العربية</span>
        </button>

        <button
          onClick={() => setActiveTab('french')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'french'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Leçon de Français</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-4">
        {activeTab === 'math' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-semibold text-stone-800">مضمون درس الرياضيات اليوم (أنشطة العد، الحساب، وحل المسائل):</span>
              <span className="text-[11px] text-amber-700">مقسم لـ: العد + الحساب + المسائل</span>
            </div>
            <textarea
              rows={3}
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-900 resize-none leading-relaxed"
              placeholder="مثال: العد القفزي بـ 5 و 10، الجمع بالاحتفاظ من 0 إلى 999، ومسألة جمعية..."
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-stone-500 font-medium">اقتراحات سريعة:</span>
              <button
                type="button"
                onClick={() =>
                  setMathInput(
                    'العد التنازلي من 50 إلى 0، طرح عددين بدون احتفاظ على الألواح، مسألة طرحية بسيطة.'
                  )
                }
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition-colors"
              >
                + طرح بدون احتفاظ
              </button>
              <button
                type="button"
                onClick={() =>
                  setMathInput(
                    'العد القفزي بـ 2 و 3، مفهوم الضرب كجمع متكرر، وضعيات حسابية بالألواح والدفتر.'
                  )
                }
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition-colors"
              >
                + مفهوم الضرب
              </button>
              <button
                type="button"
                onClick={() =>
                  setMathInput(
                    'العد إلى 1000، جدول الضرب في 4 و 5، ومسألة تتطلب عملية ضرب وحساب المبلغ الإجمالي.'
                  )
                }
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition-colors"
              >
                + جداول الضرب والمسائل
              </button>
            </div>
          </div>
        )}

        {activeTab === 'arabic' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-semibold text-stone-800">مضمون درس اللغة العربية (نشاط القراءة ونشاط الكتابة):</span>
              <span className="text-[11px] text-amber-700">مقسم لـ: نمذجة + ممارسة موجهة + ممارسة مستقلة</span>
            </div>
            <textarea
              rows={3}
              value={arabicInput}
              onChange={(e) => setArabicInput(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-900 resize-none leading-relaxed"
              placeholder="مثال: قراءة نص قصير وفهمه، استخراج الفعل والفاعل، تركيب جمل وكتابتها على الدفتر..."
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-stone-500 font-medium">اقتراحات سريعة:</span>
              <button
                type="button"
                onClick={() =>
                  setArabicInput(
                    'قراءة فقرة عن المدرسة والتعاون، التعرف على الجملة الاسمية (مبتدأ وخبر)، كتابة جملتين مع ضبط الحركات.'
                  )
                }
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition-colors"
              >
                + الجملة الاسمية
              </button>
              <button
                type="button"
                onClick={() =>
                  setArabicInput(
                    'طلاقة قراءة نص حواري، تصريف الفعل الماضي مع الضمائر، الإملاء: التاء المربوطة والمبسوطة.'
                  )
                }
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition-colors"
              >
                + التاء المبسوطة والمربوطة
              </button>
            </div>
          </div>
        )}

        {activeTab === 'french' && (
          <div className="space-y-2" dir="ltr">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-semibold text-stone-800">Contenu de la leçon de Français (Lecture et Écriture) :</span>
              <span className="text-[11px] text-blue-700">Modelage + Pratique guidée + Pratique autonome</span>
            </div>
            <textarea
              rows={3}
              value={frenchInput}
              onChange={(e) => setFrenchInput(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-900 resize-none leading-relaxed"
              placeholder="Ex: Lecture de mots contenant [ou/on], structure Sujet + Verbe, copie de phrase..."
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-stone-500 font-medium">Suggestions :</span>
              <button
                type="button"
                onClick={() =>
                  setFrenchInput(
                    'Lecture fluide de syllabes complexes avec (br, cr, dr, tr), production d\'une phrase descriptive, écriture sur cahier.'
                  )
                }
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition-colors"
              >
                + Sons complexes (br/cr/tr)
              </button>
              <button
                type="button"
                onClick={() =>
                  setFrenchInput(
                    'Lecture d\'un court dialogue, les pronoms personnels (je, tu, il, elle), accord verbe-sujet et dictée de mots.'
                  )
                }
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded border border-stone-200 transition-colors"
              >
                + Pronoms & Dictée
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Upload / Image Scanning for Digital Lessons */}
      <div className="border border-dashed border-stone-300 bg-stone-50/70 rounded-xl p-3.5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-stone-800">
              رفع ملفات الدرس الرقمي أو صورة الفهرسة (PDF / PPT / صور / كاميرا):
            </span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 font-bold px-3 py-1 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>اختيار ملفات أو التقاط صورة</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,application/pdf"
            className="hidden"
          />
        </div>

        {uploadedFiles.length === 0 ? (
          <p className="text-[11px] text-stone-500">
            يمكنك رفع صورة لصفحة الفهرسة أو وثيقة الدرس الرقمي وسيقوم الذكاء الاصطناعي باستخراج الأهداف والمضامين تلقائياً.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {uploadedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-white border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-900 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeUploadedFile(i)}
                  className="text-red-500 hover:text-red-700 font-bold text-sm leading-none mr-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generation Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-stone-500 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>توليد تلقائي فوري متوافق 100% مع شبكات ودلائل مدارس الريادة الرسمية</span>
        </div>

        <button
          type="button"
          onClick={handleStartGeneration}
          disabled={isGenerating}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
            isGenerating
              ? 'bg-stone-400 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-700 active:scale-98 cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>جاري تحليل الدروس وتوليد الوثائق بالذكاء الاصطناعي...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>توليد الخطاطات الذهنية والمذكرة اليومية</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
