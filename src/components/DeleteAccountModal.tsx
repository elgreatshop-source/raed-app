import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, Loader2, CheckCircle2, Lock } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  userEmail?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  userEmail,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmationInput.trim() === 'حذف';

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await onConfirmDelete();
      // App will transition to onboarding screen upon successful deletion
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setErrorMessage(
        err?.message || 'تعذر إكمال حذف الحساب. إذا كنت مسجلاً بحساب Google، قد تحتاج لإعادة تسجيل الدخول أولاً كإجراء أمان.'
      );
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (isDeleting) return;
    setConfirmationInput('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      id="delete-account-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-red-200 dark:border-red-900/60 transition-colors">
        {/* Header */}
        <div className="bg-red-600 dark:bg-red-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="delete-account-title" className="text-base sm:text-lg font-black text-white">
                حذف الحساب والبيانات نهائياً
              </h2>
              <p className="text-[11px] sm:text-xs text-red-100 font-medium">
                إجراء دائم ولا يمكن التراجع عنه
              </p>
            </div>
          </div>
          <button
            id="close-delete-modal-btn"
            onClick={handleCancel}
            disabled={isDeleting}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="إلغاء"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Warning Banner */}
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>هل أنت متأكد من رغبتك في حذف حسابك وجميع بياناتك؟</span>
            </div>
            <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
              سيؤدي تنفيذ هذا الإجراء إلى حذف الحساب نهائياً من سحابة التطبيق وقاعدة البيانات. تشمل العناصر التي سيتم حذفها بشكل دائم:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-red-800 dark:text-red-300 pr-1">
              <li><strong>معلومات الحساب:</strong> بيانات الدخول ({userEmail || 'الحساب الحالي'}) وسجلات الجلسة.</li>
              <li><strong>المذكرات والخطاطات:</strong> كافة الوثائق المحفوظة في الأرشيف السحابي.</li>
              <li><strong>التخصيصات:</strong> جداول الحصص الأسبوعية واليومية التربوية والملاحظات.</li>
              <li><strong>الذاكرة المؤقتة:</strong> التفضيلات والبيانات المحفوظة محلياً على هذا الجهاز.</li>
            </ul>
          </div>

          {/* Verification input */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              للتأكيد، يرجى كتابة كلمة <span className="text-red-600 font-mono font-black">حذف</span> في المربع أدناه:
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="اكتب كلمة: حذف"
              disabled={isDeleting}
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-center font-bold"
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-xl text-xs flex items-start gap-2 border border-red-300 dark:border-red-800">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
            <button
              id="cancel-delete-account-btn"
              type="button"
              onClick={handleCancel}
              disabled={isDeleting}
              className="px-4 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              تراجع وإلغاء
            </button>
            <button
              id="confirm-delete-account-btn"
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || isDeleting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الحذف نهائياً...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>تأكيد الحذف النهائي</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
