import React from 'react';
import { Shield, X, Lock, Database, Sparkles, Camera, Trash2, Mail, CheckCircle2, FileText, Globe } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="privacy-policy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-700 to-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-base sm:text-lg font-black text-white">
                سياسة الخصوصية وحماية المعطيات
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium">
                تطبيق رائد • التزام صارم بالأمان والشفافية
              </p>
            </div>
          </div>
          <button
            id="close-privacy-policy-btn"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed">
          {/* Quick Summary Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200">
              <strong className="block font-black mb-1">خلاصة الخصوصية:</strong>
              بياناتك التربوية ووثائقك ملك خالص لك وحدك. لا نقوم ببيع أو مشاركة بياناتك، وتتم معالجة المستندات عبر اتصالات مشفرة مع إمكانية حذف حسابك وكافة بياناتك نهائياً في أي لحظة.
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>1. المعطيات التي يجمعها التطبيق</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              يجمع تطبيق «رائد» المعطيات الضرورية فقط لأداء وظائفه التربوية:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2">
              <li><strong>معلومات الحساب:</strong> البريد الإلكتروني، الاسم الظاهر، ومعرف المستخدم (UID) الصادر عن مزود المصادقة (Google Firebase).</li>
              <li><strong>المعلومات الإدارية والتربوية:</strong> المؤسسة التعليمية، المديرية الإقليمية، الأكاديمية الجهوية، المستوى الدراسي، والفوج المسند.</li>
              <li><strong>الوثائق والمحتوى:</strong> المذكرات اليومية، الخطاطات الذهنية، جداول الحصص، والملاحظات التربوية التي تنشئها أو تحفظها.</li>
              <li><strong>الملفات المرفوعة للتحليل:</strong> الصور ومستندات الدروس (PDF, Word, Excel, PPT) التي تختار رفعها لمعالجتها وتوليد الوثيقة المقابلة لها.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>2. الغرض من جمع المعطيات واستخدامها</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              تُستخدم المعطيات المجمعة حصرياً للأغراض التالية:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2">
              <li>توليد المذكرات والخطاطات وجداول الحصص وفق المنهاج المغربي ومقاربة مدارس الريادة.</li>
              <li>مزامنة وثائقك بين أجهزتك المختلفة للوصول إليها في أي وقت.</li>
              <li>تصدير الوثائق بصيغة PDF قابلة للطباعة الرسمية.</li>
              <li>لا يتم استخدام بياناتك لأي أغراض إعلانية أو تجارية أو تسويقية على الإطلاق.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>3. معالجة الذكاء الاصطناعي (Gemini API) والخصوصية</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              عند طلبك توليد مذكرة أو تحليل صورة وثيقة، يتم إرسال المحتوى المعني عبر خادم خلفي آمن ومشفر إلى خدمة Gemini AI التابعة لـ Google لمعالجة النص واستخراج العناصر التربوية.
            </p>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs">
              ⚠️ <strong>إشعار الشفافية:</strong> تتم معالجة محتوى الوثائق والصور المرسلة فقط للرد على طلب التوليد اللحظي، ولا يتم استخدام بيانات الأساتذة الخاصة لتدريب النماذج العامة.
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>4. أين يتم تخزين البيانات وعزل الحسابات (Zero-Trust)</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              تُخزن بياناتك على منصة <strong>Google Firebase Firestore</strong> السحابية الآمنة. تطبق المنظومة قواعد أمان مشددة (Security Rules) تضمن:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2">
              <li>عزل كامل لكل حساب تحت مسار مخصص: <code>/users/{'{userId}'}</code>.</li>
              <li>التحقق الصارم من هوية المستخدم قبل السماح بقراءة أو تعديل أو حذف أي وثيقة.</li>
              <li>استحالة وصول أي مستخدم آخر إلى وثائقك أو بياناتك الإدارية أو ملفاتك.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>5. الصلاحيات المطلوبة على الجهاز</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              يلتزم التطبيق بمبدأ الحد الأدنى من الصلاحيات (Least Privilege):
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2">
              <li><strong>الكاميرا:</strong> تُطلب فقط وحصرياً عند اختيارك تصوير وثيقة أو جذاذة ورقية مباشرة من داخل التطبيق، وتتوقف فور التقاط الصورة.</li>
              <li>لا يطلب التطبيق ولا يصل إلى: الموقع الجغرافي، الميكروفون، جهات الاتصال، أو الرسائل.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>6. مدة الاحتفاظ بالبيانات وحق الحذف الكامل</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              يحتفظ التطبيق ببياناتك طالما كان حسابك نشطاً لتسهيل عملك اليومي. يحق لك في أي وقت:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2">
              <li>حذف أي وثيقة أو مذكرة منفردة من قسم الأرشيف.</li>
              <li><strong>حذف الحساب بالكامل:</strong> من خلال قسم «حسابي» ➔ «حذف الحساب والبيانات»، والذي يقوم بحذف حسابك وسجل المصادقة وكافة الوثائق والجداول المرتبطة به نهائياً من السحابة والذاكرة المحلية دون إمكانية استرجاعها.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>7. التواصل والدعم الفني</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              لأي استفسارات بخصوص سياسة الخصوصية أو معالجة المعطيات، يمكنك التواصل مباشرة عبر البريد الإلكتروني:
            </p>
            <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl font-mono text-xs text-stone-800 dark:text-stone-200">
              elhassane10safi@gmail.com
            </div>
            <p className="text-[11px] text-stone-400 pt-1">
              آخر تحديث لهذه السياسة: غشت 2026 (متوافقة مع معايير Google Play وحماية البيانات العامة).
            </p>
          </section>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
          <button
            id="accept-privacy-policy-btn"
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            فهمت وموافق
          </button>
        </div>
      </div>
    </div>
  );
};
