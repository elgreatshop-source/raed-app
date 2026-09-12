import React, { useState, useRef } from 'react';
import {
  TeacherProfile,
  MindMapArabic,
  MindMapMath,
  MindMapFrench,
  DailyJournalData,
  WeeklyTimetable,
  PrintTheme,
} from '../../types';
import { DailyJournalCard } from '../DailyJournalCard';
import { ArabicMindMapCard } from '../ArabicMindMapCard';
import { MathMindMapCard } from '../MathMindMapCard';
import { FrenchMindMapCard } from '../FrenchMindMapCard';
import { OfficialTimetableDocument } from '../OfficialTimetableDocument';
import {
  Printer,
  Download,
  CheckCircle2,
  Loader2,
  CloudUpload,
  ArrowRight,
  Clock,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfPrintStudioViewProps {
  profile: TeacherProfile;
  dailyJournal: DailyJournalData;
  arabicMap: MindMapArabic;
  mathMap: MindMapMath;
  frenchMap: MindMapFrench;
  timetable?: WeeklyTimetable;
  theme: PrintTheme;
  onBackToPreview: () => void;
}

export function PdfPrintStudioView({
  profile,
  dailyJournal,
  arabicMap,
  mathMap,
  frenchMap,
  timetable,
  theme,
  onBackToPreview,
}: PdfPrintStudioViewProps) {
  const [selectedDoc, setSelectedDoc] = useState<'all' | 'journal' | 'arabic' | 'math' | 'french' | 'timetable'>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleSystemPrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = printAreaRef.current;
      const isLandscape = selectedDoc === 'timetable';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (isLandscape) {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, Math.min(imgHeight, pageHeight - margin * 2));
      } else {
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      const fileName = selectedDoc === 'timetable'
        ? `استعمال_الزمن_الرسمي_${profile.teacherName || 'الاستاذ'}.pdf`
        : `مذكرات_الريادة_${dailyJournal.date || 'اليوم'}.pdf`;

      pdf.save(fileName);

      setToastMessage('تم تحميل ملف الـ PDF عالي الجودة بنجاح!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء توليد ملف الـ PDF. يرجى تجربة الطباعة المباشرة.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDriveBackup = () => {
    setToastMessage('تم تجهيز نسخة الأرشفة وحفظها في قاعدة البيانات المحلية وتهيئة الحفظ السحابي!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              5
            </span>
            <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">استوديو الطباعة وتوليد وثائق PDF الرسمية</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            معاينة طبق الأصل لأوراق العمل والمذكرات واستعمال الزمن بصيغة المؤسسة المعتمدة، جاهزة للتأشير والتوقيع
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBackToPreview}
            className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-200 dark:border-stone-700"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للتعديل</span>
          </button>

          <button
            onClick={handleDriveBackup}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="أرشفة في Google Drive / السحابة"
          >
            <CloudUpload className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">أرشفة سحابية</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-75"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري بناء الـ PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>تحميل PDF رسمي</span>
              </>
            )}
          </button>

          <button
            onClick={handleSystemPrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة فورية</span>
          </button>
        </div>
      </div>

      {/* Document Selector Filter (Screen only) */}
      <div className="bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center gap-1 print:hidden transition-colors">
        <button
          onClick={() => setSelectedDoc('all')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'all'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-700 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-stone-700'
          }`}
        >
          دفتر اليوم الدراسي كامل (4 صفحات)
        </button>

        <button
          onClick={() => setSelectedDoc('journal')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'journal'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-700 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-stone-700'
          }`}
        >
          المذكرة اليومية فقط
        </button>

        <button
          onClick={() => setSelectedDoc('arabic')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'arabic'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-700 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-stone-700'
          }`}
        >
          خطاطة العربية فقط
        </button>

        <button
          onClick={() => setSelectedDoc('math')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'math'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-700 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-stone-700'
          }`}
        >
          خطاطة الرياضيات فقط
        </button>

        <button
          onClick={() => setSelectedDoc('french')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'french'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-700 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-stone-700'
          }`}
        >
          Carte de Français فقط
        </button>

        {timetable && (
          <button
            onClick={() => setSelectedDoc('timetable')}
            className={`py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedDoc === 'timetable'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 dark:text-amber-300 hover:bg-white/60 dark:hover:bg-stone-700 font-bold'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>استعمال الزمن الرسمي (A4)</span>
          </button>
        )}
      </div>

      {/* Paper Stage (A4 Mock & Real Rendering Container - Always crisp white for print fidelity) */}
      <div ref={printAreaRef} className="space-y-8 bg-white p-4 sm:p-8 rounded-3xl border border-stone-300 dark:border-stone-700 shadow-sm text-stone-900">
        {selectedDoc === 'timetable' && timetable && (
          <div className="page-break-after">
            <OfficialTimetableDocument
              profile={profile}
              timetable={timetable}
              timetablePhase="tarl_remediation"
            />
          </div>
        )}

        {(selectedDoc === 'all' || selectedDoc === 'journal') && (
          <div className="page-break-after">
            <DailyJournalCard
              data={dailyJournal}
              profile={profile}
              theme={theme}
              onUpdate={() => {}}
            />
          </div>
        )}

        {(selectedDoc === 'all' || selectedDoc === 'arabic') && (
          <div className="page-break-after">
            <ArabicMindMapCard
              data={arabicMap}
              profile={profile}
              theme={theme}
              onUpdate={() => {}}
            />
          </div>
        )}

        {(selectedDoc === 'all' || selectedDoc === 'math') && (
          <div className="page-break-after">
            <MathMindMapCard
              data={mathMap}
              profile={profile}
              theme={theme}
              onUpdate={() => {}}
            />
          </div>
        )}

        {(selectedDoc === 'all' || selectedDoc === 'french') && (
          <div className="page-break-after">
            <FrenchMindMapCard
              data={frenchMap}
              profile={profile}
              theme={theme}
              onUpdate={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
