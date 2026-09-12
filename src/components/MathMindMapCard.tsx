import React from 'react';
import { MindMapMath, TeacherProfile, PrintTheme } from '../types';
import { getFontFamilyCss } from '../data/themePresets';
import { Check, Clock, Calculator, Hash, Brain, HelpCircle } from 'lucide-react';

interface MathMindMapCardProps {
  data: MindMapMath;
  profile: TeacherProfile;
  theme: PrintTheme;
  onUpdate: (updated: MindMapMath) => void;
}

export const MathMindMapCard: React.FC<MathMindMapCardProps> = ({
  data,
  profile,
  theme,
  onUpdate,
}) => {
  const primaryBg = theme.primaryColor || '#e07a38';
  const borderCol = theme.borderColor || '#d96c24';
  const fontCss = getFontFamilyCss(theme.fontFamily, false);

  return (
    <div
      id="math-mind-map-printable"
      className="w-full max-w-4xl mx-auto bg-white border border-stone-300 rounded-xl shadow-sm p-4 sm:p-6 print:p-2 print:border-none print:shadow-none text-stone-900 leading-relaxed transition-all"
      style={{ fontFamily: fontCss }}
      dir="rtl"
    >
      {/* Main Banner Title */}
      <div
        className="w-full text-white text-center py-2 px-4 rounded-md font-bold text-base sm:text-lg mb-3 flex items-center justify-center gap-2 shadow-sm print:text-black print:border print:border-stone-800"
        style={{ backgroundColor: primaryBg }}
      >
        <Calculator className="w-5 h-5 opacity-90 hidden sm:inline" />
        <span>الخطاطة الذهنية لدرس:</span>
        <input
          type="text"
          value={data.lessonTitle}
          onChange={(e) => onUpdate({ ...data, lessonTitle: e.target.value })}
          className="bg-transparent border-b border-white/60 focus:border-white outline-none px-2 py-0.5 text-center font-bold text-white placeholder-white/70 min-w-[220px] max-w-full text-sm sm:text-base print:text-black print:border-black"
          placeholder="عنوان الدرس..."
        />
      </div>

      {/* Lesson Meta Table */}
      <div className="w-full border border-stone-800 rounded mb-4 text-xs sm:text-sm overflow-hidden grid grid-cols-2 divide-x divide-x-reverse divide-stone-800">
        <div className="divide-y divide-stone-800">
          <div className="p-1.5 flex items-center justify-between gap-1 bg-stone-50">
            <span className="font-bold text-stone-800 whitespace-nowrap">المستوى:</span>
            <input
              type="text"
              value={data.level}
              onChange={(e) => onUpdate({ ...data, level: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
          <div className="p-1.5 flex items-center justify-between gap-1">
            <span className="font-bold text-stone-800 whitespace-nowrap">المرحلة:</span>
            <input
              type="text"
              value={data.phase}
              onChange={(e) => onUpdate({ ...data, phase: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
          <div className="p-1.5 flex items-center justify-between gap-1 bg-stone-50">
            <span className="font-bold text-stone-800 whitespace-nowrap">المادة:</span>
            <span className="w-full text-left px-1 font-bold text-amber-900">الرياضيات</span>
          </div>
        </div>

        <div className="divide-y divide-stone-800">
          <div className="p-1.5 flex items-center justify-between gap-1 bg-stone-50">
            <span className="font-bold text-stone-800 whitespace-nowrap">المسار:</span>
            <input
              type="text"
              value={data.pathway}
              onChange={(e) => onUpdate({ ...data, pathway: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
          <div className="p-1.5 flex items-center justify-between gap-1">
            <span className="font-bold text-stone-800 whitespace-nowrap">اللبنة:</span>
            <input
              type="text"
              value={data.milestone}
              onChange={(e) => onUpdate({ ...data, milestone: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
          <div className="p-1.5 flex items-center justify-between gap-1 bg-stone-50">
            <span className="font-bold text-stone-800 whitespace-nowrap">الحصة:</span>
            <input
              type="text"
              value={data.session}
              onChange={(e) => onUpdate({ ...data, session: e.target.value })}
              className="w-full bg-transparent text-left px-1 outline-none text-stone-900 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Objectives Section */}
      <div className="w-full border border-stone-800 rounded p-2.5 mb-4 bg-stone-50/50">
        <div className="font-bold text-sm sm:text-base text-stone-900 mb-1.5 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>الأهداف التعليمية:</span>
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm text-stone-800 pr-2">
          {data.objectives.map((obj, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <input
                type="text"
                value={obj}
                onChange={(e) => {
                  const newObjs = [...data.objectives];
                  newObjs[idx] = e.target.value;
                  onUpdate({ ...data, objectives: newObjs });
                }}
                className="w-full bg-transparent border-b border-dashed border-stone-300 focus:border-stone-600 outline-none pb-0.5 text-stone-800"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Top Split: 1- Opening & 3- Closing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* 1- Opening */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-3 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: primaryBg }}
          >
            <span>افتتاح الحصة:</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.opening.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    opening: { ...data.opening, durationMinutes: parseInt(e.target.value) || 10 },
                  })
                }
                className="w-8 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>د</span>
            </div>
          </div>
          <div className="p-2.5 space-y-2 text-xs sm:text-sm bg-white">
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> التصريح بالهدف:
              </div>
              <textarea
                rows={2}
                value={data.opening.declareObjective}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    opening: { ...data.opening, declareObjective: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> نشاط اعتيادي (حساب ذهني):
              </div>
              <textarea
                rows={2}
                value={data.opening.routineActivity}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    opening: { ...data.opening, routineActivity: e.target.value },
                  })
                }
                className="w-full text-xs p-1.5 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
          </div>
        </div>

        {/* 3- Closing */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-3 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: primaryBg }}
          >
            <span>اختتام الحصة:</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.closing.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    closing: { ...data.closing, durationMinutes: parseInt(e.target.value) || 10 },
                  })
                }
                className="w-8 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>د</span>
            </div>
          </div>
          <div className="p-2.5 space-y-1.5 text-xs sm:text-sm bg-white">
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> لعبة:
              </div>
              <input
                type="text"
                value={data.closing.game}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    closing: { ...data.closing, game: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 text-stone-800"
              />
            </div>
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> تبصر الحصة:
              </div>
              <input
                type="text"
                value={data.closing.reflection}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    closing: { ...data.closing, reflection: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 text-stone-800"
              />
            </div>
            <div>
              <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700">✓</span> واجب منزلي:
              </div>
              <input
                type="text"
                value={data.closing.homework}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    closing: { ...data.closing, homework: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 text-stone-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Activities Section Title */}
      <div
        className="w-full text-white text-center py-1.5 px-3 rounded font-bold text-sm sm:text-base mb-3 shadow-xs"
        style={{ backgroundColor: primaryBg }}
      >
        <span>أنشطة رئيسية</span>
      </div>

      {/* 3 Main Activities Columns: Counting, Calculation, Problem Solving */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* 1. نشاط العد */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-2.5 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: borderCol }}
          >
            <span>نشاط العد:</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.countingActivity.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    countingActivity: {
                      ...data.countingActivity,
                      durationMinutes: parseInt(e.target.value) || 15,
                    },
                  })
                }
                className="w-7 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>د</span>
            </div>
          </div>
          <div className="p-2 space-y-2.5 text-xs bg-white">
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> نمذجة:
              </div>
              <textarea
                rows={3}
                value={data.countingActivity.modeling}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    countingActivity: { ...data.countingActivity, modeling: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> ممارسة موجهة:
              </div>
              <div className="text-[10px] text-stone-500 mb-0.5 font-medium">العمل بالثنائيات / مجموعات ثم الألواح / الدفتر</div>
              <textarea
                rows={3}
                value={data.countingActivity.guidedPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    countingActivity: { ...data.countingActivity, guidedPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> ممارسة مستقلة:
              </div>
              <div className="text-[10px] text-stone-500 mb-0.5 font-medium">إنجاز فردي على الكتاب المدرسي ثم تصحيح جماعي/تبادلي</div>
              <textarea
                rows={3}
                value={data.countingActivity.independentPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    countingActivity: { ...data.countingActivity, independentPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
          </div>
        </div>

        {/* 2. نشاط الحساب */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-2.5 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: borderCol }}
          >
            <span>نشاط الحساب:</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.calculationActivity.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    calculationActivity: {
                      ...data.calculationActivity,
                      durationMinutes: parseInt(e.target.value) || 15,
                    },
                  })
                }
                className="w-7 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>د</span>
            </div>
          </div>
          <div className="p-2 space-y-2.5 text-xs bg-white">
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> نمذجة:
              </div>
              <textarea
                rows={3}
                value={data.calculationActivity.modeling}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    calculationActivity: { ...data.calculationActivity, modeling: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> ممارسة موجهة:
              </div>
              <div className="text-[10px] text-stone-500 mb-0.5 font-medium">العمل بالثنائيات / مجموعات ثم الألواح / الدفتر</div>
              <textarea
                rows={3}
                value={data.calculationActivity.guidedPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    calculationActivity: { ...data.calculationActivity, guidedPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> ممارسة مستقلة:
              </div>
              <div className="text-[10px] text-stone-500 mb-0.5 font-medium">إنجاز فردي على الكتاب المدرسي ثم تصحيح جماعي/تبادلي</div>
              <textarea
                rows={3}
                value={data.calculationActivity.independentPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    calculationActivity: { ...data.calculationActivity, independentPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
          </div>
        </div>

        {/* 3. نشاط حل المسائل */}
        <div className="border border-stone-800 rounded overflow-hidden">
          <div
            className="p-1.5 px-2.5 text-white font-bold text-xs sm:text-sm flex items-center justify-between"
            style={{ backgroundColor: borderCol }}
          >
            <span>نشاط حل المسائل:</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/20 px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <input
                type="number"
                value={data.problemSolvingActivity.durationMinutes}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    problemSolvingActivity: {
                      ...data.problemSolvingActivity,
                      durationMinutes: parseInt(e.target.value) || 15,
                    },
                  })
                }
                className="w-7 bg-transparent text-center text-white outline-none font-bold"
              />
              <span>د</span>
            </div>
          </div>
          <div className="p-2 space-y-2.5 text-xs bg-white">
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> نمذجة:
              </div>
              <textarea
                rows={3}
                value={data.problemSolvingActivity.modeling}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    problemSolvingActivity: { ...data.problemSolvingActivity, modeling: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> ممارسة موجهة:
              </div>
              <div className="text-[10px] text-stone-500 mb-0.5 font-medium">العمل بالثنائيات / مجموعات ثم الألواح / الدفتر</div>
              <textarea
                rows={3}
                value={data.problemSolvingActivity.guidedPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    problemSolvingActivity: { ...data.problemSolvingActivity, guidedPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
            <div>
              <div className="font-bold text-stone-900 mb-0.5 flex items-center gap-1">
                <span className="text-emerald-700 font-bold">✓</span> ممارسة مستقلة:
              </div>
              <div className="text-[10px] text-stone-500 mb-0.5 font-medium">إنجاز فردي على الكتاب المدرسي ثم تصحيح جماعي/تبادلي</div>
              <textarea
                rows={3}
                value={data.problemSolvingActivity.independentPractice}
                onChange={(e) =>
                  onUpdate({
                    ...data,
                    problemSolvingActivity: { ...data.problemSolvingActivity, independentPractice: e.target.value },
                  })
                }
                className="w-full text-xs p-1 border border-stone-200 rounded focus:border-amber-500 outline-none bg-stone-50/50 resize-none text-stone-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
