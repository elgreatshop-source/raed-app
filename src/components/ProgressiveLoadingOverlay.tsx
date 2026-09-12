import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, FileUp, BrainCircuit, FileCheck, Save, Clock } from 'lucide-react';

export type LoadingStage = 'uploading' | 'analyzing' | 'preparing' | 'saving' | 'completed';

export interface ProgressiveLoadingOverlayProps {
  isOpen: boolean;
  currentStage: LoadingStage;
  stageMessage?: string;
  totalFilesCount?: number;
}

export const ProgressiveLoadingOverlay: React.FC<ProgressiveLoadingOverlayProps> = ({
  isOpen,
  currentStage,
  stageMessage,
  totalFilesCount,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setSecondsElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const stages: Array<{
    id: LoadingStage;
    label: string;
    description: string;
    icon: any;
  }> = [
    {
      id: 'uploading',
      label: 'جاري رفع الملفات...',
      description: totalFilesCount ? `معالجة واستخراج النصوص من ${totalFilesCount} ملف/وثيقة` : 'قراءة الملفات والمستندات المرفقة',
      icon: FileUp,
    },
    {
      id: 'analyzing',
      label: 'جاري تحليل الوثائق...',
      description: 'استخراج الأهداف البيداغوجية، مسارات طارل، ومراحل التدريس الصريح بـ Gemini',
      icon: BrainCircuit,
    },
    {
      id: 'preparing',
      label: 'جاري إعداد الوثيقة...',
      description: 'تنسيق الخطاطات الذهنية وهيكلة المذكرة اليومية وفق النماذج الرسمية',
      icon: FileCheck,
    },
    {
      id: 'saving',
      label: 'جاري حفظ الوثيقة...',
      description: 'مزامنة الوثائق في حسابك السحابي وأرشيف السنة الدراسية',
      icon: Save,
    },
  ];

  const getStageIndex = (stage: LoadingStage): number => {
    switch (stage) {
      case 'uploading':
        return 0;
      case 'analyzing':
        return 1;
      case 'preparing':
        return 2;
      case 'saving':
        return 3;
      case 'completed':
        return 4;
      default:
        return 1;
    }
  };

  const currentIdx = getStageIndex(currentStage);

  return (
    <div
      id="progressive-loading-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200 dark:border-stone-800 transition-all text-center p-6 sm:p-8 space-y-6">
        {/* Header Sparkle & Title */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight">
            المعالجة والتوليد البيداغوجي الذكي
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
            تتم معالجة الدروس والوثائق بدقة وفق المعايير الوزارية لمدارس الريادة
          </p>
        </div>

        {/* Step-by-Step Progress List */}
        <div className="space-y-2.5 text-right">
          {stages.map((stage, idx) => {
            const isFinished = currentIdx > idx;
            const isActive = currentIdx === idx;
            const isPending = currentIdx < idx;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700/80 shadow-xs'
                    : isFinished
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-90'
                    : 'bg-stone-50/50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-800 opacity-40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-xs'
                        : isFinished
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                    }`}
                  >
                    {isFinished ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <span
                      className={`text-xs font-black block ${
                        isActive
                          ? 'text-amber-900 dark:text-amber-200'
                          : isFinished
                          ? 'text-emerald-900 dark:text-emerald-300'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                      {stage.description}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-black shrink-0">
                    جاري التنفيذ
                  </span>
                )}
                {isFinished && (
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-black shrink-0">
                    اكتمل ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info & timer */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>الوقت المنقضي: {secondsElapsed} ثانية</span>
          </div>
          <span>يرجى عدم إغلاق الصفحة أثناء المعالجة</span>
        </div>
      </div>
    </div>
  );
};
