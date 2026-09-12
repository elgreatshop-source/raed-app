import React from 'react';
import { TeacherProfile, PrintTheme } from '../types';

interface OfficialHeaderProps {
  profile: TeacherProfile;
  compact?: boolean;
  theme?: PrintTheme;
}

export const OfficialHeader: React.FC<OfficialHeaderProps> = ({ profile, compact = false, theme }) => {
  const borderColor = theme?.borderColor || '#d97706';

  return (
    <div id="official-header-section" className="w-full pb-2 mb-3 border-b-2 border-stone-800 font-sans text-stone-900" dir="rtl">
      {/* Unified Professional 3-Column Table Grid */}
      <table className="w-full border-collapse border-none m-0 p-0">
        <tbody>
          <tr className="border-none">
            {/* Right Column: School, Direction, Region, Academic Year */}
            <td className="w-1/3 p-0.5 sm:p-1 align-top text-right border-none">
              <div className="text-[9px] sm:text-xs leading-snug sm:leading-relaxed font-bold space-y-0.5 sm:space-y-1 text-stone-900">
                <p className="flex flex-wrap items-baseline gap-1 justify-start">
                  <span className="text-stone-500 sm:text-stone-600 font-semibold text-[8px] sm:text-xs">المؤسسة:</span>
                  <span className="font-black text-stone-950">{profile.school || 'المؤسسة التعليمية'}</span>
                </p>
                <p className="flex flex-wrap items-baseline gap-1 justify-start">
                  <span className="text-stone-500 sm:text-stone-600 font-semibold text-[8px] sm:text-xs">المديرية:</span>
                  <span className="font-black text-stone-950">{profile.direction || 'المديرية الإقليمية'}</span>
                </p>
                <p className="flex flex-wrap items-baseline gap-1 justify-start">
                  <span className="text-stone-500 sm:text-stone-600 font-semibold text-[8px] sm:text-xs">الجهة:</span>
                  <span className="font-black text-stone-950">{profile.academy || 'جهة مراكش - آسفي'}</span>
                </p>
                <p className="flex flex-wrap items-baseline gap-1 justify-start pt-0.5">
                  <span className="text-stone-500 sm:text-stone-600 font-semibold text-[8px] sm:text-xs">الموسم الدراسي:</span>
                  <span className="border border-stone-300 sm:border-stone-400 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded font-black text-[8px] sm:text-[11px] text-stone-950 bg-stone-50 inline-block">
                    {profile.academicYear || '2026/2027'}
                  </span>
                </p>
              </div>
            </td>

            {/* Center Column: Professional Document Identity */}
            <td className="w-1/3 p-0.5 sm:p-1 align-top text-center border-none">
              <div className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 py-0.5 sm:py-1">
                <p className="text-[11px] sm:text-base font-black tracking-wide text-stone-950 leading-tight">
                  بطاقة التوثيق البيداغوجي
                </p>
                <p className="text-[9px] sm:text-xs font-bold text-stone-700 leading-tight">
                  تخطيط وتدبير التعلمات
                </p>
                <div className="text-[7.5px] sm:text-[9px] text-amber-900 font-black tracking-wider bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-0.5">
                  فضاء الأستاذ • التدريس الفعال
                </div>
              </div>
            </td>

            {/* Left Column: Teacher Details */}
            <td className="w-1/3 p-0.5 sm:p-1 align-top text-right border-none">
              <div className="text-[9px] sm:text-xs leading-snug sm:leading-relaxed font-bold space-y-0.5 sm:space-y-1 text-stone-900">
                <p className="flex flex-wrap items-baseline gap-1 justify-start">
                  <span className="text-stone-500 sm:text-stone-600 font-semibold text-[8px] sm:text-xs">الأستاذ(ة):</span>
                  <span className="font-black text-stone-950">{profile.teacherName || '................'}</span>
                </p>
                <p className="flex flex-wrap items-baseline gap-1 justify-start">
                  <span className="text-stone-500 sm:text-stone-600 font-semibold text-[8px] sm:text-xs">المستوى:</span>
                  <span className="font-black text-stone-950">{profile.level || 'الأول'}</span>
                </p>
                <p className="flex flex-wrap items-baseline gap-1 justify-start">
                  <span className="text-stone-500 sm:text-stone-600 font-semibold text-[8px] sm:text-xs">الفوج:</span>
                  <span className="font-black text-stone-950">{profile.classGroup || 'الفوج 1'}</span>
                </p>
                <p className="flex flex-wrap items-baseline gap-1 justify-start">
                  <span className="text-stone-500 sm:text-stone-600 font-semibold text-[8px] sm:text-xs">المادة / الصيغة:</span>
                  <span className="font-black text-stone-950">
                    {profile.teachingMode === 'bilingual'
                      ? 'مزدوج'
                      : profile.teachingMode === 'binome_french_math'
                      ? 'فرنسية + رياضيات'
                      : profile.teachingMode === 'binome_arabic'
                      ? 'لغة عربية'
                      : 'عام'}
                  </span>
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
