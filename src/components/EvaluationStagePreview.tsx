import React from 'react';
import { PedagogicalPhase, TeacherProfile } from '../types';
import { ClipboardCheck, FileText, CheckCircle2, TrendingUp, Award, BarChart3 } from 'lucide-react';

interface EvaluationStagePreviewProps {
  phase: PedagogicalPhase;
  profile: TeacherProfile;
}

export const EvaluationStagePreview: React.FC<EvaluationStagePreviewProps> = ({ phase, profile }) => {
  return (
    <div className="w-full bg-white border border-stone-200 rounded-2xl shadow-xs p-4 sm:p-6 mb-6 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              {phase === 'intensive_remediation'
                ? 'شبكات تقويم طارل وتقرير مرحلة الدعم المكثف'
                : 'شبكات المراقبة المستمرة وتقارير الدورة (التدريس الصريح)'}
            </h2>
            <p className="text-xs text-stone-500">
              {phase === 'intensive_remediation'
                ? 'تتبع تموضع المتعلمين في اللبنات (المبتدئ، الحرف، الكلمة، الفقرة، العمليات الحسابية) واستخراج التقرير البيداغوجي.'
                : 'مسك نقط الفروض، الملاحظات المستمرة، وتقارير المجالس التعليمية الخاصة بمدارس الريادة.'}
            </p>
          </div>
        </div>

        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto">
          {phase === 'intensive_remediation' ? 'المرحلة 1: TaRL' : 'المرحلة 2: التدريس الصريح'}
        </span>
      </div>

      {phase === 'intensive_remediation' ? (
        <div className="space-y-4">
          {/* TaRL Milestones Progression Bar */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-stone-800 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>لبنات التموضع في اللغة العربية والرياضيات (شبكة التقييم الأولي والدوري):</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                <div className="font-bold text-stone-700 mb-1">اللبنة 1</div>
                <div className="text-[11px] text-stone-500">الحروف / الأرقام (0-9)</div>
              </div>
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                <div className="font-bold text-stone-700 mb-1">اللبنة 2</div>
                <div className="text-[11px] text-stone-500">الكلمات / الجمع البسيط</div>
              </div>
              <div className="p-2.5 bg-white border border-amber-400 bg-amber-50/40 rounded-lg shadow-2xs">
                <div className="font-bold text-amber-800 mb-1">اللبنة 3</div>
                <div className="text-[11px] text-amber-700">الفقرة / الطرح والجمع</div>
              </div>
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                <div className="font-bold text-stone-700 mb-1">اللبنة 4</div>
                <div className="text-[11px] text-stone-500">الأقصوصة / الضرب</div>
              </div>
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                <div className="font-bold text-stone-700 mb-1">اللبنة 5</div>
                <div className="text-[11px] text-stone-500">الفهم المتقدم / القسمة والمسائل</div>
              </div>
            </div>
          </div>

          {/* Quick Summary Report Card */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>تقرير نهاية فترة الدعم المكثف لتعلمات الأساس</span>
              </h4>
              <p className="text-xs text-stone-500">
                يتضمن نسب التحسن، الحصيلة العامة للفوج {profile.classGroup} بمدرسة {profile.school}، والتوصيات البيداغوجية الموجهة للمفتش والإدارة.
              </p>
            </div>
            <button
              onClick={() => alert('سيتم استخراج نموذج تقرير المرحلة متضمناً معطيات الفوج المكتسبة في الخطاطات!')}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-colors cursor-pointer"
            >
              معاينة نموذج التقرير
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-stone-800 mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>محطات المراقبة المستمرة في التدريس الصريح:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-stone-200 rounded-lg">
                <div className="font-bold text-stone-900 mb-1">المراقبة المستمرة 1 (الوحدة 1 و 2)</div>
                <p className="text-[11px] text-stone-500">شبكة تفريغ نتائج المراقبة المستمرة الأولى مع مقترحات الدعم المندمج.</p>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-lg">
                <div className="font-bold text-stone-900 mb-1">المراقبة المستمرة 2 (الوحدة 3 و 4)</div>
                <p className="text-[11px] text-stone-500">تقويم نهاية الأسدس الأول واستخراج مخرجات المعالجة المركزة.</p>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-lg">
                <div className="font-bold text-stone-900 mb-1">تقرير الدورة الأولى</div>
                <p className="text-[11px] text-stone-500">التقرير التركيبي للأسدس الأول الخاص بمشروع المؤسسة المندمج.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
