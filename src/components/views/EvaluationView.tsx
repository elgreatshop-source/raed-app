import React, { useState, useRef } from 'react';
import {
  TeacherProfile,
  PedagogicalPhase,
  PrintTheme,
} from '../../types';
import { OfficialHeader } from '../OfficialHeader';
import { TarlGridCustomizerModal } from '../TarlGridCustomizerModal';
import { TarlReportCustomizerModal } from '../TarlReportCustomizerModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  ClipboardCheck,
  FileSpreadsheet,
  Download,
  Loader2,
  Sparkles,
  BarChart3,
  FileCheck,
  TableProperties,
  GraduationCap,
  Layers,
  CheckCircle2,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface EvaluationViewProps {
  profile: TeacherProfile;
  phase: PedagogicalPhase;
  theme?: PrintTheme;
  showToast?: (msg: string) => void;
}

type EvaluationDocType =
  | 'tarl_grid' // 1. شبكة تفريغ نتائج فترة تارل
  | 'tarl_report' // 2. تقرير فترة تارل
  | 'continuous_assessment_grid' // 3. شبكة تفريغ نتائج المراقبة المستمرة
  | 'first_semester_report'; // 4. تقرير الأسدس الأول

export function EvaluationView({
  profile,
  theme,
  showToast,
}: EvaluationViewProps) {
  const [activeGeneratingId, setActiveGeneratingId] = useState<EvaluationDocType | null>(null);
  const [isTarlCustomizerOpen, setIsTarlCustomizerOpen] = useState<boolean>(false);
  const [isTarlReportCustomizerOpen, setIsTarlReportCustomizerOpen] = useState<boolean>(false);

  // Hidden printable element refs
  const printTarlGridRef = useRef<HTMLDivElement>(null);
  const printTarlReportRef = useRef<HTMLDivElement>(null);
  const printAssessmentGridRef = useRef<HTMLDivElement>(null);
  const printSemesterReportRef = useRef<HTMLDivElement>(null);

  // Helper for generating PDF from ref
  const generatePdfFromElement = async (
    elementRef: React.RefObject<HTMLDivElement | null>,
    fileName: string,
    orientation: 'portrait' | 'landscape' = 'portrait',
    typeId: EvaluationDocType
  ) => {
    if (!elementRef.current) return;
    setActiveGeneratingId(typeId);
    try {
      const element = elementRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = orientation === 'landscape' ? 297 : 210;
      const pdfHeight = orientation === 'landscape' ? 210 : 297;
      const margin = 8;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin,
        contentWidth,
        Math.min(contentHeight, pdfHeight - margin * 2)
      );

      pdf.save(`${fileName}_${profile.level || 'المستوى'}_${profile.classGroup || 'الفوج'}.pdf`);
      showToast?.(`تم تصدير وتحميل ${fileName} بنجاح!`);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إعداد وتصدير الوثيقة.');
    } finally {
      setActiveGeneratingId(null);
    }
  };

  // The 4 requested evaluation cards
  const evaluationCards = [
    {
      id: 'tarl_grid' as const,
      number: '1',
      title: 'بطاقة 1: شبكة تفريغ نتائج فترة تارل',
      subtitle: 'شبكة تفريغ نتائج روائز الموضعة والروائز المرحلية والنهائية لأنشطة الدعم وفق مقاربة TaRL (المستويات القرائية والحسابية).',
      badge: 'توليد ذكي A4 عمودي',
      format: 'A4 Portrait',
      icon: TableProperties,
      color: 'teal',
      actionLabel: 'توليد وتخصيص الشبكة (AI)',
      onGenerate: () => setIsTarlCustomizerOpen(true),
    },
    {
      id: 'tarl_report' as const,
      number: '2',
      title: 'بطاقة 2: تقرير فترة تارل',
      subtitle: 'تقرير تركيبي مفصل لنتائج وحصيلة فترة الدعم المكثف (TaRL) من 3 صفحات رسمية ملائم لصيغة العمل والتخصص مع إحصائيات ومبيانات.',
      badge: 'تقرير بيداغوجي 3 صفحات A4',
      format: 'A4 Portrait (3 ص)',
      icon: FileCheck,
      color: 'amber',
      actionLabel: 'توليد وتخصيص تقرير تارل (3 صفحات)',
      onGenerate: () => setIsTarlReportCustomizerOpen(true),
    },
    {
      id: 'continuous_assessment_grid' as const,
      number: '3',
      title: 'بطاقة 3: شبكة تفريغ نتائج المراقبة المستمرة',
      subtitle: 'جدول تفريغ معياري شامل لمسك درجات ونقط فروض المراقبة المستمرة لمختلف المواد والمكونات الدراسية.',
      badge: 'شبكة تفريغ A4 أفقي',
      format: 'A4 Landscape',
      icon: FileSpreadsheet,
      color: 'blue',
      isUnderDevelopment: true,
      developmentNotice: 'قيد التطوير - ستتوفر في التحديث القادم',
      actionLabel: 'قيد التطوير (قريباً)',
      onGenerate: () => {
        showToast?.('خدمة شبكة تفريغ المراقبة المستمرة قيد التطوير حالياً، وستتوفر بالكامل في التحديث القادم للتطبيق.');
      },
    },
    {
      id: 'first_semester_report' as const,
      number: '4',
      title: 'بطاقة 4: تقرير الأسدس الأول',
      subtitle: 'تقرير الحصيلة التركيبية الشاملة لنتائج التعلمات والتحصيل الدراسي ونسب النجاح والقرارات التربوية للأسدس الأول.',
      badge: 'تقرير تركيبي A4 عمودي',
      format: 'A4 Portrait',
      icon: GraduationCap,
      color: 'emerald',
      isUnderDevelopment: true,
      developmentNotice: 'قيد التطوير - ستتوفر في التحديث القادم',
      actionLabel: 'قيد التطوير (قريباً)',
      onGenerate: () => {
        showToast?.('خدمة تقرير الأسدس الأول قيد التطوير حالياً، وستتوفر بالكامل في التحديث القادم للتطبيق.');
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER (بطاقة العنوان التي تشرح محطة التقويم والدعم)        */}
      {/* ========================================================================= */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 border border-stone-800 shadow-md relative overflow-hidden">
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-full border border-amber-500/30">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>محطة التقويم والدعم</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              محطة التقويم والدعم التربوي والمراقبة المستمرة
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
              تُعنى محطة التقويم والدعم بتشخيص المكتسبات ورصد التعثرات عبر مقاربة طارل (TaRL)، وتتبع وتفريغ نتائج المراقبة المستمرة، وصياغة التقارير التركيبية الدورية وحصيلة الأسدوس بجودة طباعة رسمية جاهزة للتوقيع والتصدير.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2.5 bg-stone-800/90 px-4 py-3.5 rounded-2xl border border-stone-700 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-bold block">المستوى والفوج:</span>
              <span className="text-xs sm:text-sm font-black text-amber-400 block">
                {profile.level || 'المستوى الابتدائي'} • {profile.classGroup || 'الفوج 1'}
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
              الموسم {profile.academicYear || '2026/2027'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 4 SPECIFIED CARDS GRID                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {evaluationCards.map((card) => {
          const Icon = card.icon;
          const isGenerating = activeGeneratingId === card.id;

          return (
            <div
              key={card.id}
              id={`evaluation-card-${card.id}`}
              className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 hover:border-amber-500/70 dark:hover:border-amber-500/70 rounded-3xl p-5 sm:p-6 transition-all flex flex-col justify-between gap-5 shadow-2xs hover:shadow-md text-right group"
            >
              <div className="space-y-4">
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${
                    card.isUnderDevelopment
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                  } flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {card.isUnderDevelopment ? (
                      <span className="px-2.5 py-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-black rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>قيد التطوير (قريباً)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] font-black rounded-full">
                        {card.badge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-bold rounded-lg">
                      {card.format}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {card.title}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                    {card.subtitle}
                  </p>

                  {/* Prominent Under-Development Notice */}
                  {card.isUnderDevelopment && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs font-bold shadow-2xs mt-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>قيد التطوير - ستتوفر في التحديث القادم</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                  {card.isUnderDevelopment ? 'ستتوفر في التحديث القادم' : 'جاهز للتوليد والتصدير الفوري'}
                </span>

                <button
                  type="button"
                  id={`btn-generate-${card.id}`}
                  onClick={card.onGenerate}
                  disabled={isGenerating}
                  className={`${
                    card.isUnderDevelopment
                      ? 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  } active:scale-98 disabled:opacity-50 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-2xs cursor-pointer shrink-0`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الإعداد...</span>
                    </>
                  ) : card.isUnderDevelopment ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{card.actionLabel}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>{card.actionLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. FOOTER NOTE                                                           */}
      {/* ========================================================================= */}
      <div className="bg-stone-100 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200 dark:border-stone-700 flex items-start gap-3 text-xs text-stone-600 dark:text-stone-300">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-stone-900 dark:text-stone-100 block">
            توليد احترافي فوري بدقة الطباعة الرسمية
          </span>
          <p className="leading-relaxed font-normal">
            تعتمد الوثائق والتقارير الأربعة أعلاه على المعايير البيداغوجية المعتمدة لمدارس الريادة ومقاربة طارل (TaRL) وموجهات المراقبة المستمرة بالمغرب.
          </p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* OFF-SCREEN PRINTABLE SHEETS (RENDERED TO HIGH-RES PDF ONLY)          */}
      {/* ==================================================================== */}
      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
        {/* ================================================================ */}
        {/* 1. Printable TaRL Grid (Landscape A4)                            */}
        {/* ================================================================ */}
        <div
          ref={printTarlGridRef}
          className="w-[1120px] bg-white text-stone-900 p-8 space-y-4 font-sans"
          dir="rtl"
        >
          <OfficialHeader profile={profile} theme={theme} />

          <div className="text-center py-2.5 bg-stone-100 border border-stone-300 rounded-xl font-black text-base text-stone-950">
            شبكة تفريغ نتائج روائز فترة طارل (TaRL) - {profile.level || 'المستوى الابتدائي'} (الفوج {profile.classGroup || '1'})
          </div>

          <table className="w-full border-collapse border border-stone-400 text-xs">
            <thead>
              <tr className="bg-stone-200 text-stone-950 font-black">
                <th rowSpan={2} className="border border-stone-400 p-2 w-10 text-center">الرقم</th>
                <th rowSpan={2} className="border border-stone-400 p-2 text-right">اسم ونسب المتعلم(ة)</th>
                <th colSpan={3} className="border border-stone-400 p-1.5 text-center bg-amber-100/70">اللغة العربية (المستوى القرائي)</th>
                <th colSpan={3} className="border border-stone-400 p-1.5 text-center bg-teal-100/70">الرياضيات (المستوى الحسابي)</th>
                <th colSpan={2} className="border border-stone-400 p-1.5 text-center bg-blue-100/70">اللغة الفرنسية</th>
                <th rowSpan={2} className="border border-stone-400 p-2 w-36 text-center">ملاحظات التتبع</th>
              </tr>
              <tr className="bg-stone-100 text-stone-800 font-bold text-[11px]">
                <th className="border border-stone-400 p-1 text-center">الرائز الأولي</th>
                <th className="border border-stone-400 p-1 text-center">المرحلي</th>
                <th className="border border-stone-400 p-1 text-center">النهائي</th>
                <th className="border border-stone-400 p-1 text-center">الرائز الأولي</th>
                <th className="border border-stone-400 p-1 text-center">المرحلي</th>
                <th className="border border-stone-400 p-1 text-center">النهائي</th>
                <th className="border border-stone-400 p-1 text-center">الأولي</th>
                <th className="border border-stone-400 p-1 text-center">النهائي</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 26 }).map((_, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                  <td className="border border-stone-300 p-1.5 text-center font-bold text-stone-600">
                    {idx + 1}
                  </td>
                  <td className="border border-stone-300 p-1.5 font-medium text-stone-400 min-w-[160px]">
                    ................................................
                  </td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-3 flex items-center justify-between text-xs font-bold text-stone-800">
            <div>
              <span>المؤسسة: {profile.school || 'المؤسسة التعليمية'} • التاريخ: {new Date().toLocaleDateString('ar-MA')}</span>
            </div>
            <div className="text-center pl-8">
              <span>توقيع الأستاذ(ة):</span>
              <div className="h-7 mt-1 font-serif text-stone-700 italic">
                {profile.teacherName || 'الأستاذ(ة)'}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. Printable TaRL Report (Portrait A4)                           */}
        {/* ================================================================ */}
        <div
          ref={printTarlReportRef}
          className="w-[800px] bg-white text-stone-900 p-8 space-y-4 font-sans"
          dir="rtl"
        >
          <OfficialHeader profile={profile} theme={theme} />

          <div className="border-2 border-stone-800 rounded-xl p-3 bg-stone-50 text-center space-y-1">
            <h2 className="text-base font-black text-stone-950">
              تقرير حصيلة فترة الدعم المكثف وفق مقاربة طارل (TaRL)
            </h2>
            <div className="text-xs font-bold text-stone-600 flex items-center justify-center gap-4">
              <span>المستوى: {profile.level}</span>
              <span>•</span>
              <span>الفوج: {profile.classGroup}</span>
              <span>•</span>
              <span>الموسم الدراسي: {profile.academicYear || '2026/2027'}</span>
            </div>
          </div>

          {/* 1. Introduction & Context */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>1. السياق العام وأهداف فترة الدعم المكثف:</span>
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed pr-2 font-medium">
              تندرج فترة الدعم المكثف الممتدة على مدى 4 أسابيع في إطار مقاربة التدريس وفق المستوى المناسب (TaRL)، بهدف معالجة التعثرات المتراكمة في القراءة والحساب، وتأهيل المتعلمين للتحكم في المهارات الأساس ومسايرة التعلمات الصفية.
            </p>
          </div>

          {/* 2. Statistical Progression Table */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-teal-900 bg-teal-50 p-1.5 rounded-lg border border-teal-200 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-teal-700" />
              <span>2. نتائج التموضع والتطور بين الرائز الأولي والرائز النهائي:</span>
            </h3>
            <table className="w-full border-collapse border border-stone-300 text-xs text-center">
              <thead>
                <tr className="bg-stone-100 font-bold text-stone-900">
                  <th className="border border-stone-300 p-1.5">المجال</th>
                  <th className="border border-stone-300 p-1.5">المستوى المستهدف</th>
                  <th className="border border-stone-300 p-1.5 bg-red-50 text-red-800">الرائز الأولي (غير متحكم)</th>
                  <th className="border border-stone-300 p-1.5 bg-amber-50 text-amber-800">في طور التمكن</th>
                  <th className="border border-stone-300 p-1.5 bg-emerald-50 text-emerald-800">الرائز النهائي (متحكم)</th>
                </tr>
              </thead>
              <tbody className="font-bold text-stone-900">
                <tr>
                  <td className="border border-stone-300 p-2 bg-stone-50">اللغة العربية</td>
                  <td className="border border-stone-300 p-2">الطلاقة والفهم القرائي (مستوى فقرة/قصة)</td>
                  <td className="border border-stone-300 p-2 text-red-700">42%</td>
                  <td className="border border-stone-300 p-2 text-amber-700">28%</td>
                  <td className="border border-stone-300 p-2 text-emerald-700">84%</td>
                </tr>
                <tr>
                  <td className="border border-stone-300 p-2 bg-stone-50">الرياضيات</td>
                  <td className="border border-stone-300 p-2">الحساب الأساس والعمليات الأربع</td>
                  <td className="border border-stone-300 p-2 text-red-700">48%</td>
                  <td className="border border-stone-300 p-2 text-amber-700">22%</td>
                  <td className="border border-stone-300 p-2 text-emerald-700">86%</td>
                </tr>
                <tr>
                  <td className="border border-stone-300 p-2 bg-stone-50">الفرنسية</td>
                  <td className="border border-stone-300 p-2">Lecture & Combinatoire (Mot / Paragraphe)</td>
                  <td className="border border-stone-300 p-2 text-red-700">50%</td>
                  <td className="border border-stone-300 p-2 text-amber-700">25%</td>
                  <td className="border border-stone-300 p-2 text-emerald-700">80%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Qualitative Outcomes */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-emerald-900 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>3. الحصيلة النوعية وأهم المكتسبات المحققة:</span>
            </h3>
            <ul className="list-disc list-inside text-xs space-y-1 text-stone-800 pr-2 font-medium">
              <li>تحسن ملحوظ في سرعة القراءة والتعرف التلقائي على الكلمات والحروف المتشابهة.</li>
              <li>اكتساب آليات الحساب الذهني السريع والتحكم في الوضع العمودي للعمليات الحسابية.</li>
              <li>ارتفاع الثقة بالنفس لدى المتعلمين المتعثرين وانخراطهم الفعال في أنشطة المجموعات المرنة.</li>
            </ul>
          </div>

          {/* 4. Recommendations for Next Period */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-blue-900 bg-blue-50 p-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              <span>4. التوصيات واستمرارية الدعم المندمج:</span>
            </h3>
            <ul className="list-disc list-inside text-xs space-y-1 text-stone-800 pr-2 font-medium">
              <li>مواصلة اعتماد مبادئ التدريس الصريح والدعم المندمج في الحصص الأسبوعية القارة.</li>
              <li>برمجة أنشطة قصيرة ومكثفة (5 إلى 10 دقائق) يومياً لترسيخ الطلاقة والحساب الذهني.</li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-stone-300 flex items-center justify-between text-xs font-black text-stone-900">
            <div>
              <span>ملاحظة الإدارة التربوية: ............................................</span>
            </div>
            <div className="text-center pl-4">
              <span>توقيع الأستاذ(ة):</span>
              <div className="text-stone-700 font-serif italic text-sm mt-1">{profile.teacherName || 'الأستاذ(ة)'}</div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 3. Printable Continuous Assessment Grid (Landscape A4)           */}
        {/* ================================================================ */}
        <div
          ref={printAssessmentGridRef}
          className="w-[1120px] bg-white text-stone-900 p-8 space-y-4 font-sans"
          dir="rtl"
        >
          <OfficialHeader profile={profile} theme={theme} />

          <div className="text-center py-2.5 bg-stone-100 border border-stone-300 rounded-xl font-black text-base text-stone-950">
            شبكة تفريغ نتائج فروض المراقبة المستمرة - {profile.level || 'المستوى الابتدائي'} (الفوج {profile.classGroup || '1'})
          </div>

          <table className="w-full border-collapse border border-stone-400 text-xs">
            <thead>
              <tr className="bg-stone-200 text-stone-950 font-black">
                <th className="border border-stone-400 p-2 w-10 text-center">الرقم</th>
                <th className="border border-stone-400 p-2 text-right">اسم ونسب المتعلم(ة)</th>
                <th className="border border-stone-400 p-2 text-center w-24">اللغة العربية (فرض 1)</th>
                <th className="border border-stone-400 p-2 text-center w-24">اللغة العربية (فرض 2)</th>
                <th className="border border-stone-400 p-2 text-center w-24">الرياضيات (فرض 1)</th>
                <th className="border border-stone-400 p-2 text-center w-24">الرياضيات (فرض 2)</th>
                <th className="border border-stone-400 p-2 text-center w-24">اللغة الفرنسية (CC1)</th>
                <th className="border border-stone-400 p-2 text-center w-24">اللغة الفرنسية (CC2)</th>
                <th className="border border-stone-400 p-2 text-center w-24">النشاط العلمي</th>
                <th className="border border-stone-400 p-2 text-center w-24">التربية الإسلامية</th>
                <th className="border border-stone-400 p-2 text-center w-20 bg-stone-300">المعدل العام</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 26 }).map((_, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                  <td className="border border-stone-300 p-1.5 text-center font-bold text-stone-600">
                    {idx + 1}
                  </td>
                  <td className="border border-stone-300 p-1.5 font-medium text-stone-400 min-w-[160px]">
                    ................................................
                  </td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300">...</td>
                  <td className="border border-stone-300 p-1.5 text-center text-stone-300 bg-stone-100 font-bold">...</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-3 flex items-center justify-between text-xs font-bold text-stone-800">
            <div>
              <span>المؤسسة: {profile.school || 'المؤسسة التعليمية'} • التاريخ: {new Date().toLocaleDateString('ar-MA')}</span>
            </div>
            <div className="text-center pl-8">
              <span>توقيع الأستاذ(ة):</span>
              <div className="h-7 mt-1 font-serif text-stone-700 italic">
                {profile.teacherName || 'الأستاذ(ة)'}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 4. Printable First Semester Report (Portrait A4)                 */}
        {/* ================================================================ */}
        <div
          ref={printSemesterReportRef}
          className="w-[800px] bg-white text-stone-900 p-8 space-y-4 font-sans"
          dir="rtl"
        >
          <OfficialHeader profile={profile} theme={theme} />

          <div className="border-2 border-stone-800 rounded-xl p-3 bg-stone-50 text-center space-y-1">
            <h2 className="text-base font-black text-stone-950">
              تقرير الحصيلة التركيبية لنتائج الأسدوس الأول
            </h2>
            <div className="text-xs font-bold text-stone-600 flex items-center justify-center gap-4">
              <span>المستوى: {profile.level}</span>
              <span>•</span>
              <span>الفوج: {profile.classGroup}</span>
              <span>•</span>
              <span>الموسم الدراسي: {profile.academicYear || '2026/2027'}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Curriculum progress */}
            <div className="border border-stone-300 rounded-xl p-3 bg-stone-50 space-y-1">
              <span className="font-black text-stone-900 block">1. حصيلة تنفيذ المقرر والمنهاج الدراسي:</span>
              <p className="text-stone-700 leading-relaxed font-medium">
                تم تنفيذ الوحدات والدروس المبرمجة بالأسدوس الأول بنسبة إنجاز بلغت 100% وفق التوجيهات التربوية الرسمية وتوزيع الحصص المعتمد.
              </p>
            </div>

            {/* Results Table */}
            <div className="space-y-1">
              <span className="font-black text-stone-900 block">2. المعطيات الإحصائية ونسب التحصيل حسب المواد:</span>
              <table className="w-full border-collapse border border-stone-300 text-center">
                <thead>
                  <tr className="bg-stone-200 font-black text-stone-950">
                    <th className="border border-stone-300 p-2">المادة الدراسية</th>
                    <th className="border border-stone-300 p-2">المعدل العام</th>
                    <th className="border border-stone-300 p-2">أعلى نقطة</th>
                    <th className="border border-stone-300 p-2">أدنى نقطة</th>
                    <th className="border border-stone-300 p-2">نسبة النجاح (≥ 5/10)</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-stone-800">
                  <tr>
                    <td className="border border-stone-300 p-2 font-bold bg-stone-50">اللغة العربية</td>
                    <td className="border border-stone-300 p-2 font-black text-stone-900">7.85 / 10</td>
                    <td className="border border-stone-300 p-2 text-emerald-700">9.50</td>
                    <td className="border border-stone-300 p-2 text-red-700">5.20</td>
                    <td className="border border-stone-300 p-2 font-black text-emerald-700">92%</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2 font-bold bg-stone-50">الرياضيات</td>
                    <td className="border border-stone-300 p-2 font-black text-stone-900">7.40 / 10</td>
                    <td className="border border-stone-300 p-2 text-emerald-700">10.0</td>
                    <td className="border border-stone-300 p-2 text-red-700">4.80</td>
                    <td className="border border-stone-300 p-2 font-black text-emerald-700">88%</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2 font-bold bg-stone-50">اللغة الفرنسية</td>
                    <td className="border border-stone-300 p-2 font-black text-stone-900">7.20 / 10</td>
                    <td className="border border-stone-300 p-2 text-emerald-700">9.00</td>
                    <td className="border border-stone-300 p-2 text-red-700">4.50</td>
                    <td className="border border-stone-300 p-2 font-black text-emerald-700">85%</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2 font-bold bg-stone-50">النشاط العلمي</td>
                    <td className="border border-stone-300 p-2 font-black text-stone-900">8.10 / 10</td>
                    <td className="border border-stone-300 p-2 text-emerald-700">9.75</td>
                    <td className="border border-stone-300 p-2 text-red-700">5.50</td>
                    <td className="border border-stone-300 p-2 font-black text-emerald-700">96%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* General Conclusion & Decisions */}
            <div className="border border-stone-300 rounded-xl p-3 space-y-1">
              <span className="font-black text-stone-900 block">3. القرارات وخطة الدخل للأسدوس الثاني:</span>
              <p className="text-stone-700 leading-relaxed font-medium">
                تثمين النتائج الطيبة المحققة، والتنويه بالمواظبة والسلوك الإيجابي للمتعلمين، مع وضع خطة دعم مركّزة للمتعثرين في مادتي الرياضيات واللغة الفرنسية خلال الأسابيع الأولى من الأسدوس الثاني.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-300 flex items-center justify-between text-xs font-black text-stone-900">
            <div>
              <span>توقيع وملاحظة رئيس(ة) المؤسسة: .........................</span>
            </div>
            <div className="text-center pl-4">
              <span>توقيع الأستاذ(ة):</span>
              <div className="text-stone-700 font-serif italic text-sm mt-1">{profile.teacherName || 'الأستاذ(ة)'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TARL POSITIONING GRID AI CUSTOMIZER MODAL                            */}
      {/* ==================================================================== */}
      <TarlGridCustomizerModal
        isOpen={isTarlCustomizerOpen}
        onClose={() => setIsTarlCustomizerOpen(false)}
        profile={profile}
        showToast={showToast}
      />

      {/* ==================================================================== */}
      {/* TARL 3-PAGE REPORT AI CUSTOMIZER MODAL                               */}
      {/* ==================================================================== */}
      <TarlReportCustomizerModal
        isOpen={isTarlReportCustomizerOpen}
        onClose={() => setIsTarlReportCustomizerOpen(false)}
        profile={profile}
        showToast={showToast}
      />
    </div>
  );
}
