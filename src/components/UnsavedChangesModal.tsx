import React from 'react';
import { AlertCircle, Save, LogOut, X } from 'lucide-react';

export interface UnsavedChangesModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onSaveAndLeave: () => Promise<void> | void;
  onDiscardAndLeave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  title = 'تعديلات غير محفوظة',
  message = 'لديك تعديلات غير محفوظة. هل تريد حفظها قبل المغادرة؟',
  onSaveAndLeave,
  onDiscardAndLeave,
  onCancel,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="unsaved-changes-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 dark:border-stone-800 transition-all">
        {/* Header */}
        <div className="bg-amber-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-black tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
            {message}
          </p>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            💡 بالضغط على «حفظ»، ستتم مزامنة كافة إضافاتك وتعديلاتك تلقائياً في السحابة والأرشيف قبل الانتقال.
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* 1. Save & Leave */}
            <button
              type="button"
              id="btn-unsaved-save-leave"
              onClick={onSaveAndLeave}
              disabled={isSaving}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>

            {/* 2. Discard & Leave */}
            <button
              type="button"
              id="btn-unsaved-discard-leave"
              onClick={onDiscardAndLeave}
              disabled={isSaving}
              className="w-full py-2 px-4 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>الخروج دون حفظ</span>
            </button>

            {/* 3. Cancel */}
            <button
              type="button"
              id="btn-unsaved-cancel"
              onClick={onCancel}
              disabled={isSaving}
              className="w-full py-2 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>إلغاء</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
