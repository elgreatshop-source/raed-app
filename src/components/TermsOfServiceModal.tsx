import React from 'react';
import { BookOpen, X, CheckCircle2, AlertTriangle, Scale, UserCheck, ShieldAlert } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="terms-of-service-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-of-service-title"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-l from-amber-600 to-amber-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 id="terms-of-service-title" className="text-base sm:text-lg font-black text-white">
                شروط الاستخدام والإرشادات التربوية
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-100/90 font-medium">
                تطبيق رائد • ضوابط الاستخدام المسؤول للمنظومة
              </p>
            </div>
          </div>
          <button
            id="close-terms-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed">
          {/* Important Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <strong className="block font-black mb-1">إشعار تربوي هام:</strong>
              تطبيق «رائد» أداة مساعدة لربح الوقت وتيسير التدبير الديداكتيكي. المذكرات والخطاطات المولدة بالذكاء الاصطناعي هي مقترحات استرشادية تظل خاضعة للمراجعة والمصادقة التربوية من طرف الأستاذ الممارس.
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>1. طبيعة التطبيق والغاية منه</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              «رائد» هو تطبيق تعليمي وتربوي موجه لأساتذة التعليم الابتدائي بالمملكة المغربية، يهدف إلى تيسير إعداد المذكرات اليومية، الخطاطات الذهنية، جداول الحصص، وتتبع محطات التقويم والدعم وفق مستجدات المنهاج الدراسي ومقاربة مدارس الريادة (TaRL والتعليم الصريح).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>2. مسؤولية المستخدم عن المحتوى المرفوع</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2">
              <li>يتحمل الأستاذ كامل المسؤولية عن الوثائق والصور والمستندات التي يرفعها إلى التطبيق بغرض التحليل.</li>
              <li>يجب عدم رفع أي مواد تنتهك حقوق الملكية الفكرية أو تتضمن بيانات شخصية حساسة للتلاميذ أو أي محتوى مخالف للقوانين والآداب العامة.</li>
              <li>يتحمل الأستاذ مسؤولية التأكد من مطابقة الجذاذات للمقررات الرسمية المعتمدة في مؤسسته.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>3. إخلاء المسؤولية عن مخرجات الذكاء الاصطناعي</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              يعتمد التطبيق على تقنيات الذكاء الاصطناعي التوليدي لمساعدة الأستاذ في صياغة الأهداف والأنشطة والخطوات الديداكتيكية. وبالرغم من الحرص على دقة النماذج:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2">
              <li>لا يضمن التطبيق خلو النتائج المولدة تلقائياً من الأخطاء اللغوية أو المعرفية أو المنهجية.</li>
              <li>تظل الكلمة الفصل والمسؤولية البيداغوجية الكاملة على عاتق الأستاذ في مراجعة وتنقيح واعتماد أي وثيقة قبل طباعتها أو تقديمها للإدارة أو المفتش التربوي.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>4. الاستخدام المقبول وحماية الخدمة</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              يلتزم المستخدم بالاستخدام الشخصي والمهني المشروع للتطبيق، مع منع أي محاولة للهندسة العكسية أو التحايل على حدود الاستخدام أو إرهاق الخوادم بطلبات آلية مفرطة.
            </p>
          </section>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
          <button
            id="accept-terms-btn"
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            الموافقة والمتابعة
          </button>
        </div>
      </div>
    </div>
  );
};
