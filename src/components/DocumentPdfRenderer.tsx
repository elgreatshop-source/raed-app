import React from 'react';
import {
  TeacherProfile,
  PrintTheme,
  DailyJournalData,
  MindMapArabic,
  MindMapMath,
  MindMapFrench,
  SavedDocumentPackage,
} from '../types';
import { OfficialHeader } from './OfficialHeader';
import { getFontFamilyCss } from '../data/themePresets';
import {
  BookOpen,
  Calculator,
  Globe,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Clock,
  User,
  GraduationCap,
  Tag,
  PenTool,
} from 'lucide-react';

export interface DocumentPdfRendererProps {
  profile: TeacherProfile;
  theme: PrintTheme;
  docType: 'all' | 'journal' | 'arabic' | 'math' | 'french' | 'lesson_plan' | 'evaluation';
  dailyJournal?: DailyJournalData;
  arabicMap?: MindMapArabic;
  mathMap?: MindMapMath;
  frenchMap?: MindMapFrench;
  documentPackage?: SavedDocumentPackage;
  showPageNumbers?: boolean;
}

export const DocumentPdfRenderer: React.FC<DocumentPdfRendererProps> = ({
  profile,
  theme,
  docType,
  dailyJournal,
  arabicMap,
  mathMap,
  frenchMap,
  documentPackage,
  showPageNumbers = true,
}) => {
  const primaryColor = theme?.primaryColor || '#d97706';
  const accentColor = theme?.accentColor || '#fef3c7';
  const borderColor = theme?.borderColor || '#b45309';
  const fontCss = getFontFamilyCss(theme?.fontFamily, false);

  // Active sub-documents
  const currentJournal = dailyJournal || documentPackage?.dailyJournal;
  const currentArabic = arabicMap || documentPackage?.arabicMap;
  const currentMath = mathMap || documentPackage?.mathMap;
  const currentFrench = frenchMap || documentPackage?.frenchMap;

  const hasArabic = Boolean(currentArabic?.lessonTitle?.trim());
  const hasMath = Boolean(currentMath?.lessonTitle?.trim());
  const hasFrench = Boolean(currentFrench?.lessonTitle?.trim());

  return (
    <div
      id="pdf-render-document-root"
      className="bg-white text-stone-900 mx-auto w-full"
      style={{
        fontFamily: fontCss,
        maxWidth: '210mm',
        minWidth: '210mm',
        boxSizing: 'border-box',
      }}
      dir="rtl"
    >
      {/* 1. DAILY JOURNAL DOCUMENT PAGE */}
      {(docType === 'journal' || docType === 'all') && currentJournal && (
        <div className="p-6 bg-white min-h-[297mm] flex flex-col justify-between border-b border-stone-200 print:border-none print:min-h-0 page-break-after">
          <div>
            {/* Official Moroccan Header */}
            {theme?.headerVisible !== false && (
              <OfficialHeader profile={profile} theme={theme} />
            )}

            {/* Document Main Title Ribbon */}
            <div
              className="w-full text-white text-center py-2 px-4 rounded-xl font-black text-sm sm:text-base mb-3 flex items-center justify-between shadow-xs print:text-black print:border-2 print:border-stone-800"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 opacity-90" />
                <span>المذكرة اليومية لتخطيط وتدبير التعلمات</span>
              </div>
              <div className="text-xs bg-black/20 print:bg-transparent px-2.5 py-0.5 rounded-lg font-bold">
                {currentJournal.dayName} ({currentJournal.date || 'اليوم'})
              </div>
            </div>

            {/* Meta Information Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-600">المستوى:</span>
                <span className="font-black text-stone-900">{profile.level || 'الأول ابتدائي'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-600">المرحلة:</span>
                <span className="font-black text-stone-900">{currentJournal.phase || 'الدعم المكثف (TaRL)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-600">المسار:</span>
                <span className="font-black text-stone-900">{currentJournal.pathway || 'المسار 1'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-600">اللبنة:</span>
                <span className="font-black text-stone-900">{currentJournal.milestone || 'اللبنة 1'}</span>
              </div>
            </div>

            {/* Daily Journal Sessions Table */}
            <div className="border border-stone-800 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-right border-collapse text-[10.5px]">
                <thead>
                  <tr
                    className="text-white text-[11px] font-black print:text-black print:bg-stone-200"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <th className="p-2 border-b border-l border-stone-800 w-24 text-center">التوقيت</th>
                    <th className="p-2 border-b border-l border-stone-800 w-14 text-center">القسم</th>
                    <th className="p-2 border-b border-l border-stone-800 w-24">المادة والحصة</th>
                    <th className="p-2 border-b border-l border-stone-800">التدبير الديداكتيكي والأنشطة</th>
                    <th className="p-2 border-b border-stone-800 w-24 text-center">خ.ذ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300">
                  {/* Pre-break sessions */}
                  {currentJournal.preBreakSessions?.map((session, idx) => (
                    <tr key={session.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'}>
                      <td className="p-2 border-l border-stone-300 font-bold text-center whitespace-nowrap">
                        {session.timing}
                      </td>
                      <td className="p-2 border-l border-stone-300 font-black text-center text-amber-900">
                        {session.className}
                      </td>
                      <td className="p-2 border-l border-stone-300 font-bold">
                        <div>{session.subject}</div>
                        <div className="text-[9.5px] text-stone-500 font-normal">{session.sessionOrder}</div>
                      </td>
                      <td className="p-2 border-l border-stone-300 space-y-1">
                        {session.opening && (
                          <div>
                            <span className="font-bold text-amber-900">افتتاح: </span>
                            <span>{session.opening}</span>
                          </div>
                        )}
                        {session.mainContent1Title && (
                          <div>
                            <span className="font-bold text-stone-800">• {session.mainContent1Title}: </span>
                            <span className="text-stone-700">{session.mainContent1Desc}</span>
                          </div>
                        )}
                        {session.mainContent2Title && (
                          <div>
                            <span className="font-bold text-stone-800">• {session.mainContent2Title}: </span>
                            <span className="text-stone-700">{session.mainContent2Desc}</span>
                          </div>
                        )}
                        {session.closing && (
                          <div>
                            <span className="font-bold text-stone-600">اختتام: </span>
                            <span className="text-stone-600">{session.closing}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-center font-bold font-mono text-[10px] text-stone-600">
                        {session.mindMapRef || `خ ذ ${idx + 1}`}
                      </td>
                    </tr>
                  ))}

                  {/* Break Separator Row */}
                  <tr className="bg-amber-100/70 dark:bg-amber-950/40 text-amber-950 font-black border-y border-amber-300">
                    <td colSpan={5} className="p-1.5 text-center text-xs">
                      ☕ {currentJournal.breakTitle || 'فـتـرة الاسـتـراحـة'} (15 دقيقة)
                    </td>
                  </tr>

                  {/* Post-break sessions */}
                  {currentJournal.postBreakSessions?.map((session, idx) => (
                    <tr key={session.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'}>
                      <td className="p-2 border-l border-stone-300 font-bold text-center whitespace-nowrap">
                        {session.timing}
                      </td>
                      <td className="p-2 border-l border-stone-300 font-black text-center text-amber-900">
                        {session.className}
                      </td>
                      <td className="p-2 border-l border-stone-300 font-bold">
                        <div>{session.subject}</div>
                        <div className="text-[9.5px] text-stone-500 font-normal">{session.sessionOrder}</div>
                      </td>
                      <td className="p-2 border-l border-stone-300 space-y-1">
                        {session.opening && (
                          <div>
                            <span className="font-bold text-amber-900">افتتاح: </span>
                            <span>{session.opening}</span>
                          </div>
                        )}
                        {session.mainContent1Title && (
                          <div>
                            <span className="font-bold text-stone-800">• {session.mainContent1Title}: </span>
                            <span className="text-stone-700">{session.mainContent1Desc}</span>
                          </div>
                        )}
                        {session.mainContent2Title && (
                          <div>
                            <span className="font-bold text-stone-800">• {session.mainContent2Title}: </span>
                            <span className="text-stone-700">{session.mainContent2Desc}</span>
                          </div>
                        )}
                        {session.mainContent3Title && (
                          <div>
                            <span className="font-bold text-stone-800">• {session.mainContent3Title}: </span>
                            <span className="text-stone-700">{session.mainContent3Desc}</span>
                          </div>
                        )}
                        {session.closing && (
                          <div>
                            <span className="font-bold text-stone-600">اختتام: </span>
                            <span className="text-stone-600">{session.closing}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-center font-bold font-mono text-[10px] text-stone-600">
                        {session.mindMapRef || `خ ذ ${currentJournal.preBreakSessions.length + idx + 1}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pedagogical Observations and Support Box */}
            <div className="border border-stone-400 rounded-xl p-3 mb-4 bg-stone-50/50 text-xs">
              <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>ملاحظات وتتبع التعثرات ومعالجة الصعوبات (الدعم الفوري):</span>
              </div>
              <p className="text-stone-700 text-[11px] leading-relaxed">
                {currentJournal.notes ||
                  'تتبع المتعلمين المتعثرين أثناء الممارسة المستقلة، تقديم التغذية الراجعة الفورية، والتأكيد على تثبيت المكتسبات الأساسية على الألواح وكراسات الأنشطة.'}
              </p>
            </div>
          </div>

          {/* Official Signatures and Footer */}
          <div className="pt-2 border-t-2 border-stone-800 mt-auto">
            <div className="grid grid-cols-2 text-center text-xs font-bold py-2">
              <div>
                <p className="text-stone-600 mb-6">توقيع الأستاذ(ة):</p>
                <p className="font-black text-stone-900">{profile.teacherName || 'الأستاذ(ة)'}</p>
              </div>
              <div>
                <p className="text-stone-600 mb-6">تأشيرة وملاحظات الإدارة التربوية:</p>
                <p className="text-stone-400">..................................................</p>
              </div>
            </div>

            {showPageNumbers && (
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-200">
                <span>تطبيق رائد - المساعد البيداغوجي لأساتذة الريادة</span>
                <span>المذكرة اليومية • صفحة 1</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ARABIC MIND MAP DOCUMENT PAGE */}
      {(docType === 'arabic' || (docType === 'all' && hasArabic)) && currentArabic && (
        <div className="p-6 bg-white min-h-[297mm] flex flex-col justify-between border-b border-stone-200 print:border-none print:min-h-0 page-break-after">
          <div>
            {theme?.headerVisible !== false && (
              <OfficialHeader profile={profile} theme={theme} />
            )}

            {/* Main Title Banner */}
            <div
              className="w-full text-white text-center py-2 px-4 rounded-xl font-black text-sm sm:text-base mb-3 flex items-center justify-between shadow-xs print:text-black print:border-2 print:border-stone-800"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 opacity-90" />
                <span>الخطاطة الذهنية: اللغة العربية - {currentArabic.lessonTitle || 'درس القراءة والكتابة'}</span>
              </div>
              <div className="text-xs bg-black/20 print:bg-transparent px-2.5 py-0.5 rounded-lg font-bold">
                {currentArabic.session || 'الحصة 1'}
              </div>
            </div>

            {/* Meta Table */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-300 text-center font-bold">
              <div>
                <div className="text-stone-500 text-[10px]">المستوى</div>
                <div className="text-stone-900">{currentArabic.level || profile.level}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">المادة</div>
                <div className="text-amber-800 font-black">اللغة العربية</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">المرحلة</div>
                <div className="text-stone-900">{currentArabic.phase || 'الدعم المكثف'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">المسار</div>
                <div className="text-stone-900">{currentArabic.pathway || 'المسار 1'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">اللبنة</div>
                <div className="text-stone-900">{currentArabic.milestone || 'اللبنة 1'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">الحصة</div>
                <div className="text-stone-900">{currentArabic.session || 'حصة 1'}</div>
              </div>
            </div>

            {/* Educational Objectives */}
            <div className="border border-stone-800 rounded-xl p-3 mb-3 bg-stone-50/50">
              <div className="font-black text-xs sm:text-sm text-stone-900 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الأهداف التعلمية المسطرة للحصة:</span>
              </div>
              <ul className="space-y-1 text-xs text-stone-800 pr-2">
                {currentArabic.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-1.5 font-medium">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phased Instructional Flow (Explicit Teaching) */}
            <div className="space-y-3 mb-4">
              {/* 1. Opening */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div
                  className="p-1.5 px-3 text-white font-bold text-xs flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>1. افتتاح الحصة والنشاط الاعتيادي</span>
                  <span>{currentArabic.opening?.durationMinutes || 5} دقيقة</span>
                </div>
                <div className="p-2.5 text-xs space-y-1 bg-white">
                  <div>
                    <span className="font-bold text-amber-900">إعلان الهدف: </span>
                    <span>{currentArabic.opening?.declareObjective || 'التصريح بأهداف الحصة للمتعلمين'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">النشاط الاعتيادي: </span>
                    <span>{currentArabic.opening?.routineActivity || 'قراءة لوحة الحروف والكلمات البصرية'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Reading Activity (Explicit Teaching Pillars) */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div className="p-1.5 px-3 bg-stone-800 text-white font-bold text-xs flex items-center justify-between">
                  <span>2. أنشطة القراءة والطلاقة والفهم (التدريس الصريح)</span>
                  <span>{currentArabic.readingActivity?.durationMinutes || 25} دقيقة</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-stone-300 text-xs bg-white">
                  <div className="p-2.5 space-y-1">
                    <div className="font-black text-amber-800">النمذجة (أنا أعمل / Modelage):</div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {currentArabic.readingActivity?.modeling || 'نمذجة قراءة المقاطع والكلمات بطلاقة وتوضيح نطق الأصوات'}
                    </p>
                  </div>
                  <div className="p-2.5 space-y-1 bg-stone-50/40">
                    <div className="font-black text-emerald-800">الممارسة الموجهة (نحن نعمل):</div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {currentArabic.readingActivity?.guidedPractice || 'قراءة جماعية وثنائية بمواكبة الأستاذ وتصحيح التعثرات فورا'}
                    </p>
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="font-black text-blue-800">الممارسة المستقلة (أنت تعمل):</div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {currentArabic.readingActivity?.independentPractice || 'قراءة فردية من الكراسة والإنجاز على الألواح'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Writing Activity */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div className="p-1.5 px-3 bg-stone-800 text-white font-bold text-xs flex items-center justify-between">
                  <span>3. أنشطة الكتابة والخط والإنتاج الكتابي</span>
                  <span>{currentArabic.writingActivity?.durationMinutes || 20} دقيقة</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-stone-300 text-xs bg-white">
                  <div className="p-2.5 space-y-1">
                    <div className="font-black text-amber-800">النمذجة:</div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {currentArabic.writingActivity?.modeling || 'نمذجة رسم الحرف على السبورة مع احترام مقاييس الخط'}
                    </p>
                  </div>
                  <div className="p-2.5 space-y-1 bg-stone-50/40">
                    <div className="font-black text-emerald-800">الممارسة الموجهة:</div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {currentArabic.writingActivity?.guidedPractice || 'الكتابة في الهواء وعلى الألواح بإشراف الأستاذ'}
                    </p>
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="font-black text-blue-800">الممارسة المستقلة:</div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {currentArabic.writingActivity?.independentPractice || 'نقل وكتابة المقاطع والكلمات على دفتر الأنشطة'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Closing */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div
                  className="p-1.5 px-3 text-white font-bold text-xs flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>4. اختتام الحصة، اللعبة البيداغوجية والتبصر</span>
                  <span>{currentArabic.closing?.durationMinutes || 10} دقيقة</span>
                </div>
                <div className="p-2.5 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white">
                  <div>
                    <span className="font-bold text-amber-900">اللعبة: </span>
                    <span className="text-stone-700">{currentArabic.closing?.game || 'لعبة صيد الكلمات والبطاقات'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">تبصر الحصة: </span>
                    <span className="text-stone-700">{currentArabic.closing?.reflection || 'تقييم مدى تحقيق الهدف المسطر'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">الواجب: </span>
                    <span className="text-stone-700">{currentArabic.closing?.homework || 'قراءة الفقرة في المنزل'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="pt-2 border-t-2 border-stone-800 mt-auto">
            <div className="grid grid-cols-2 text-center text-xs font-bold py-2">
              <div>
                <p className="text-stone-600 mb-6">توقيع الأستاذ(ة):</p>
                <p className="font-black text-stone-900">{profile.teacherName || 'الأستاذ(ة)'}</p>
              </div>
              <div>
                <p className="text-stone-600 mb-6">تأشيرة وملاحظات المفتش التربوي / الإدارة:</p>
                <p className="text-stone-400">..................................................</p>
              </div>
            </div>

            {showPageNumbers && (
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-200">
                <span>تطبيق رائد - المساعد البيداغوجي لأساتذة الريادة</span>
                <span>خطاطة اللغة العربية • صفحة {docType === 'all' ? '2' : '1'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MATH MIND MAP DOCUMENT PAGE */}
      {(docType === 'math' || (docType === 'all' && hasMath)) && currentMath && (
        <div className="p-6 bg-white min-h-[297mm] flex flex-col justify-between border-b border-stone-200 print:border-none print:min-h-0 page-break-after">
          <div>
            {theme?.headerVisible !== false && (
              <OfficialHeader profile={profile} theme={theme} />
            )}

            {/* Main Title Banner */}
            <div
              className="w-full text-white text-center py-2 px-4 rounded-xl font-black text-sm sm:text-base mb-3 flex items-center justify-between shadow-xs print:text-black print:border-2 print:border-stone-800"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 opacity-90" />
                <span>الخطاطة الذهنية: الرياضيات - {currentMath.lessonTitle || 'درس الأعداد والحساب'}</span>
              </div>
              <div className="text-xs bg-black/20 print:bg-transparent px-2.5 py-0.5 rounded-lg font-bold">
                {currentMath.session || 'الحصة 1'}
              </div>
            </div>

            {/* Meta Table */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-300 text-center font-bold">
              <div>
                <div className="text-stone-500 text-[10px]">المستوى</div>
                <div className="text-stone-900">{currentMath.level || profile.level}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">المادة</div>
                <div className="text-blue-800 font-black">الرياضيات</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">المرحلة</div>
                <div className="text-stone-900">{currentMath.phase || 'الدعم المكثف'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">المسار</div>
                <div className="text-stone-900">{currentMath.pathway || 'المسار 1'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">اللبنة</div>
                <div className="text-stone-900">{currentMath.milestone || 'اللبنة 1'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">الحصة</div>
                <div className="text-stone-900">{currentMath.session || 'حصة 1'}</div>
              </div>
            </div>

            {/* Objectives */}
            <div className="border border-stone-800 rounded-xl p-3 mb-3 bg-stone-50/50">
              <div className="font-black text-xs sm:text-sm text-stone-900 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>الأهداف التعلمية المسطرة للحصة:</span>
              </div>
              <ul className="space-y-1 text-xs text-stone-800 pr-2">
                {currentMath.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-1.5 font-medium">
                    <span className="text-blue-700 font-bold">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Math Stages Breakdown */}
            <div className="space-y-3 mb-4">
              {/* 1. Opening & Mental Math */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div
                  className="p-1.5 px-3 text-white font-bold text-xs flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>1. افتتاح الحصة ونشاط الحساب الذهني الاعتيادي</span>
                  <span>{currentMath.opening?.durationMinutes || 5} دقيقة</span>
                </div>
                <div className="p-2.5 text-xs space-y-1 bg-white">
                  <div>
                    <span className="font-bold text-amber-900">إعلان الهدف: </span>
                    <span>{currentMath.opening?.declareObjective || 'التصريح بأهداف درس الرياضيات'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">الحساب الذهني: </span>
                    <span>{currentMath.opening?.routineActivity || 'الحساب السريع على الألواح وبطاقات الأعداد'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Counting Activity */}
              {currentMath.countingActivity && (
                <div className="border border-stone-800 rounded-xl overflow-hidden">
                  <div className="p-1.5 px-3 bg-stone-800 text-white font-bold text-xs flex items-center justify-between">
                    <span>2. {currentMath.countingActivity.title || 'نشاط العد وبناء المفهوم'}</span>
                    <span>{currentMath.countingActivity.durationMinutes || 15} دقيقة</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-stone-300 text-xs bg-white">
                    <div className="p-2.5 space-y-1">
                      <div className="font-black text-amber-800">النمذجة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.countingActivity.modeling}</p>
                    </div>
                    <div className="p-2.5 space-y-1 bg-stone-50/40">
                      <div className="font-black text-emerald-800">الممارسة الموجهة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.countingActivity.guidedPractice}</p>
                    </div>
                    <div className="p-2.5 space-y-1">
                      <div className="font-black text-blue-800">الممارسة المستقلة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.countingActivity.independentPractice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Calculation Activity */}
              {currentMath.calculationActivity && (
                <div className="border border-stone-800 rounded-xl overflow-hidden">
                  <div className="p-1.5 px-3 bg-stone-800 text-white font-bold text-xs flex items-center justify-between">
                    <span>3. {currentMath.calculationActivity.title || 'نشاط الحساب والعمليات'}</span>
                    <span>{currentMath.calculationActivity.durationMinutes || 20} دقيقة</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-stone-300 text-xs bg-white">
                    <div className="p-2.5 space-y-1">
                      <div className="font-black text-amber-800">النمذجة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.calculationActivity.modeling}</p>
                    </div>
                    <div className="p-2.5 space-y-1 bg-stone-50/40">
                      <div className="font-black text-emerald-800">الممارسة الموجهة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.calculationActivity.guidedPractice}</p>
                    </div>
                    <div className="p-2.5 space-y-1">
                      <div className="font-black text-blue-800">الممارسة المستقلة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.calculationActivity.independentPractice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Problem Solving */}
              {currentMath.problemSolvingActivity && (
                <div className="border border-stone-800 rounded-xl overflow-hidden">
                  <div className="p-1.5 px-3 bg-stone-800 text-white font-bold text-xs flex items-center justify-between">
                    <span>4. {currentMath.problemSolvingActivity.title || 'نشاط حل المسائل والوضعيات'}</span>
                    <span>{currentMath.problemSolvingActivity.durationMinutes || 15} دقيقة</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-stone-300 text-xs bg-white">
                    <div className="p-2.5 space-y-1">
                      <div className="font-black text-amber-800">النمذجة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.problemSolvingActivity.modeling}</p>
                    </div>
                    <div className="p-2.5 space-y-1 bg-stone-50/40">
                      <div className="font-black text-emerald-800">الممارسة الموجهة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.problemSolvingActivity.guidedPractice}</p>
                    </div>
                    <div className="p-2.5 space-y-1">
                      <div className="font-black text-blue-800">الممارسة المستقلة:</div>
                      <p className="text-stone-700 text-[11px]">{currentMath.problemSolvingActivity.independentPractice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Closing */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div
                  className="p-1.5 px-3 text-white font-bold text-xs flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>5. اختتام الحصة واللعبة الرياضية والتبصر</span>
                  <span>{currentMath.closing?.durationMinutes || 5} دقيقة</span>
                </div>
                <div className="p-2.5 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white">
                  <div>
                    <span className="font-bold text-amber-900">اللعبة: </span>
                    <span className="text-stone-700">{currentMath.closing?.game || 'لعبة المتاهة الحسابية'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">التبصر: </span>
                    <span className="text-stone-700">{currentMath.closing?.reflection || 'تقويم المكتسبات وتثبيت المفهوم'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">الواجب: </span>
                    <span className="text-stone-700">{currentMath.closing?.homework || 'إنجاز تمرين التحدي'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="pt-2 border-t-2 border-stone-800 mt-auto">
            <div className="grid grid-cols-2 text-center text-xs font-bold py-2">
              <div>
                <p className="text-stone-600 mb-6">توقيع الأستاذ(ة):</p>
                <p className="font-black text-stone-900">{profile.teacherName || 'الأستاذ(ة)'}</p>
              </div>
              <div>
                <p className="text-stone-600 mb-6">تأشيرة وملاحظات المفتش التربوي / الإدارة:</p>
                <p className="text-stone-400">..................................................</p>
              </div>
            </div>

            {showPageNumbers && (
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-200">
                <span>تطبيق رائد - المساعد البيداغوجي لأساتذة الريادة</span>
                <span>خطاطة الرياضيات • صفحة {docType === 'all' ? '3' : '1'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. FRENCH MIND MAP (CARTE DE FRANÇAIS) PAGE */}
      {(docType === 'french' || (docType === 'all' && hasFrench)) && currentFrench && (
        <div
          className="p-6 bg-white min-h-[297mm] flex flex-col justify-between border-b border-stone-200 print:border-none print:min-h-0 page-break-after"
          dir="ltr"
        >
          <div>
            {theme?.headerVisible !== false && (
              <div dir="rtl">
                <OfficialHeader profile={profile} theme={theme} />
              </div>
            )}

            {/* Main Title Banner */}
            <div
              className="w-full text-white text-center py-2 px-4 rounded-xl font-black text-sm sm:text-base mb-3 flex items-center justify-between shadow-xs print:text-black print:border-2 print:border-stone-800"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 opacity-90" />
                <span>Carte Mentale : Français - {currentFrench.lessonTitle || 'Lecture & Écriture'}</span>
              </div>
              <div className="text-xs bg-black/20 print:bg-transparent px-2.5 py-0.5 rounded-lg font-bold">
                {currentFrench.session || 'Séance 1'}
              </div>
            </div>

            {/* Meta Table */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-300 text-center font-bold">
              <div>
                <div className="text-stone-500 text-[10px]">Niveau</div>
                <div className="text-stone-900">{currentFrench.level || profile.level}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">Discipline</div>
                <div className="text-purple-800 font-black">Français</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">Phase</div>
                <div className="text-stone-900">{currentFrench.phase || 'Remédiation TaRL'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">Parcours</div>
                <div className="text-stone-900">{currentFrench.pathway || 'Parcours 1'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">Palier</div>
                <div className="text-stone-900">{currentFrench.milestone || 'Palier 1'}</div>
              </div>
              <div>
                <div className="text-stone-500 text-[10px]">Séance</div>
                <div className="text-stone-900">{currentFrench.session || 'Séance 1'}</div>
              </div>
            </div>

            {/* Objectives */}
            <div className="border border-stone-800 rounded-xl p-3 mb-3 bg-stone-50/50">
              <div className="font-black text-xs sm:text-sm text-stone-900 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Objectifs d'apprentissage :</span>
              </div>
              <ul className="space-y-1 text-xs text-stone-800 pl-2">
                {currentFrench.objectives?.map((obj, i) => (
                  <li key={i} className="flex items-start gap-1.5 font-medium">
                    <span className="text-purple-700 font-bold">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stages */}
            <div className="space-y-3 mb-4">
              {/* 1. Ouverture */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div
                  className="p-1.5 px-3 text-white font-bold text-xs flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>1. Ouverture de la séance & Routine</span>
                  <span>{currentFrench.opening?.durationMinutes || 5} min</span>
                </div>
                <div className="p-2.5 text-xs space-y-1 bg-white">
                  <div>
                    <span className="font-bold text-amber-900">Déclaration de l'objectif : </span>
                    <span>{currentFrench.opening?.declareObjective || 'Annonce claire des apprentissages ciblés'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">Activité de routine : </span>
                    <span>{currentFrench.opening?.routineActivity || 'Lecture rapide des mots outils et syllabes'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Lecture */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div className="p-1.5 px-3 bg-stone-800 text-white font-bold text-xs flex items-center justify-between">
                  <span>2. Activités de Lecture & Décodage (Enseignement explicite)</span>
                  <span>{currentFrench.readingActivity?.durationMinutes || 25} min</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-300 text-xs bg-white">
                  <div className="p-2.5 space-y-1">
                    <div className="font-black text-amber-800">Modelage (Je fais) :</div>
                    <p className="text-stone-700 text-[11px] leading-relaxed">
                      {currentFrench.readingActivity?.modeling || 'Lecture modèle à haute voix avec articulation et gestes'}
                    </p>
                  </div>
                  <div className="p-2.5 space-y-1 bg-stone-50/40">
                    <div className="font-black text-emerald-800">Pratique guidée (Nous faisons) :</div>
                    <p className="text-stone-700 text-[11px] leading-relaxed">
                      {currentFrench.readingActivity?.guidedPractice || 'Lecture collective et par paire avec feedback immédiat'}
                    </p>
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="font-black text-blue-800">Pratique autonome (Tu fais) :</div>
                    <p className="text-stone-700 text-[11px] leading-relaxed">
                      {currentFrench.readingActivity?.independentPractice || 'Lecture individuelle sur livret et ardoise'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Écriture */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div className="p-1.5 px-3 bg-stone-800 text-white font-bold text-xs flex items-center justify-between">
                  <span>3. Activités d'Écriture & Production de mots</span>
                  <span>{currentFrench.writingActivity?.durationMinutes || 20} min</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-300 text-xs bg-white">
                  <div className="p-2.5 space-y-1">
                    <div className="font-black text-amber-800">Modelage :</div>
                    <p className="text-stone-700 text-[11px]">
                      {currentFrench.writingActivity?.modeling || "Tracé du graphème au tableau en respectant l'interligne"}
                    </p>
                  </div>
                  <div className="p-2.5 space-y-1 bg-stone-50/40">
                    <div className="font-black text-emerald-800">Pratique guidée :</div>
                    <p className="text-stone-700 text-[11px]">
                      {currentFrench.writingActivity?.guidedPractice || 'Écriture sur ardoise et correction par les pairs'}
                    </p>
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="font-black text-blue-800">Pratique autonome :</div>
                    <p className="text-stone-700 text-[11px]">
                      {currentFrench.writingActivity?.independentPractice || 'Copie sur le cahier de classe avec soin'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Clôture */}
              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <div
                  className="p-1.5 px-3 text-white font-bold text-xs flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>4. Clôture, Jeu pédagogique & Bilan</span>
                  <span>{currentFrench.closing?.durationMinutes || 10} min</span>
                </div>
                <div className="p-2.5 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white">
                  <div>
                    <span className="font-bold text-amber-900">Jeu : </span>
                    <span className="text-stone-700">{currentFrench.closing?.game || 'Jeu du mot mystère'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">Bilan : </span>
                    <span className="text-stone-700">{currentFrench.closing?.reflection || 'Auto-évaluation des élèves'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">Devoir : </span>
                    <span className="text-stone-700">{currentFrench.closing?.homework || 'Lecture des syllabes à la maison'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visa & Footer */}
          <div className="pt-2 border-t-2 border-stone-800 mt-auto">
            <div className="grid grid-cols-2 text-center text-xs font-bold py-2">
              <div>
                <p className="text-stone-600 mb-6">Signature de l'enseignant(e) :</p>
                <p className="font-black text-stone-900">{profile.teacherName || 'Enseignant(e)'}</p>
              </div>
              <div>
                <p className="text-stone-600 mb-6">Visa de l'administration / Inspection :</p>
                <p className="text-stone-400">..................................................</p>
              </div>
            </div>

            {showPageNumbers && (
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-200">
                <span>Application Rayed - Guide Pédagogique Digital</span>
                <span>Carte de Français • Page {docType === 'all' ? (hasMath && hasArabic ? '4' : '3') : '1'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
