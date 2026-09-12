import React from 'react';
import { DailyJournalData, TeacherProfile, PrintTheme, DailyJournalEntrySession, WeeklyTimetable } from '../types';
import { getFontFamilyCss } from '../data/themePresets';
import { Calendar, Plus, Trash2, Coffee, Sparkles, RefreshCw } from 'lucide-react';

interface DailyJournalCardProps {
  data: DailyJournalData;
  profile: TeacherProfile;
  theme: PrintTheme;
  timetable?: WeeklyTimetable;
  onUpdate: (updated: DailyJournalData) => void;
}

export const DailyJournalCard: React.FC<DailyJournalCardProps> = ({
  data,
  profile,
  theme,
  timetable,
  onUpdate,
}) => {
  const primaryBg = theme.primaryColor || '#e07a38';
  const borderCol = theme.borderColor || '#d96c24';
  const fontCss = getFontFamilyCss(theme.fontFamily, false);

  const updatePreSession = (index: number, updated: DailyJournalEntrySession) => {
    const next = [...data.preBreakSessions];
    next[index] = updated;
    onUpdate({ ...data, preBreakSessions: next });
  };

  const updatePostSession = (index: number, updated: DailyJournalEntrySession) => {
    const next = [...data.postBreakSessions];
    next[index] = updated;
    onUpdate({ ...data, postBreakSessions: next });
  };

  const addPreSession = () => {
    const currentCount = data.preBreakSessions.length + 1;
    const newSession: DailyJournalEntrySession = {
      id: `session-pre-${Date.now()}`,
      timing: '08:30 - 09:30',
      className: `${profile.classGroup || '1'}`,
      subject: 'اللغة العربية',
      opening: 'افتتاح الحصة + نشاط اعتيادي',
      mainContent1Title: 'نشاط القراءة',
      mainContent1Desc: 'قراءة النص وإنجاز أنشطة الفهم والطلاقة',
      mainContent2Title: 'نشاط الكتابة',
      mainContent2Desc: 'تركيب الجمل والتمارين التطبيقية على الألواح',
      closing: 'اختتام الحصة + تبصر وواجب منزلي',
      sessionOrder: `ح ${currentCount}`,
      mindMapRef: `خ ذ ${currentCount}`,
    };
    onUpdate({ ...data, preBreakSessions: [...data.preBreakSessions, newSession] });
  };

  const addPostSession = () => {
    const totalCount = data.preBreakSessions.length + data.postBreakSessions.length + 1;
    const newSession: DailyJournalEntrySession = {
      id: `session-post-${Date.now()}`,
      timing: '11:45 - 12:45',
      className: `${profile.classGroup || '2'}`,
      subject: 'الرياضيات',
      opening: 'نشاط الحساب الذهني الاعتيادي',
      mainContent1Title: 'بناء المفهوم',
      mainContent1Desc: 'تقديم الوضعية التعلمية ونمذجة الحل',
      mainContent2Title: 'التدريب والممارسة',
      mainContent2Desc: 'إنجاز تمارين الكراسة في مجموعات ثنائية',
      mainContent3Title: 'حل المسائل',
      mainContent3Desc: 'تطبيق فردي وتقويم تكويني لدعم التعثرات',
      closing: 'اختتام الحصة وتدوين خلاصة التعلم',
      sessionOrder: `ح ${totalCount}`,
      mindMapRef: `خ ذ ${totalCount}`,
    };
    onUpdate({ ...data, postBreakSessions: [...data.postBreakSessions, newSession] });
  };

  const deletePreSession = (index: number) => {
    const next = data.preBreakSessions.filter((_, idx) => idx !== index);
    onUpdate({ ...data, preBreakSessions: next });
  };

  const deletePostSession = (index: number) => {
    const next = data.postBreakSessions.filter((_, idx) => idx !== index);
    onUpdate({ ...data, postBreakSessions: next });
  };

  const autoRenumber = () => {
    let counter = 1;
    const nextPre = data.preBreakSessions.map((s) => {
      const order = `ح ${counter}`;
      const ref = `خ ذ ${counter}`;
      counter++;
      return { ...s, sessionOrder: order, mindMapRef: ref };
    });

    const nextPost = data.postBreakSessions.map((s) => {
      const order = `ح ${counter}`;
      const ref = `خ ذ ${counter}`;
      counter++;
      return { ...s, sessionOrder: order, mindMapRef: ref };
    });

    onUpdate({
      ...data,
      preBreakSessions: nextPre,
      postBreakSessions: nextPost,
    });
  };

  const syncWithTimetable = () => {
    if (!timetable || !timetable.slots) return;
    const daySlots = timetable.slots.filter(
      (s) => s.day && (s.day.includes(data.dayName) || data.dayName.includes(s.day))
    );
    if (daySlots.length === 0) return;

    let counter = 1;
    const preList: DailyJournalEntrySession[] = [];
    const postList: DailyJournalEntrySession[] = [];

    daySlots.forEach((s) => {
      const isPost = s.startTime >= '11:00' || s.startTime >= '15:00';
      const item: DailyJournalEntrySession = {
        id: `sync-${Date.now()}-${counter}`,
        timing: `${s.startTime} - ${s.endTime}`,
        className: s.group || profile.classGroup || '1',
        subject: s.subject || 'اللغة العربية',
        opening: s.subject?.includes('رياضيات') ? 'الحساب الذهني + نشاط اعتيادي' : 'افتتاح الحصة + نشاط اعتيادي',
        mainContent1Title: s.subject?.includes('رياضيات') ? 'بناء المفهوم والنمذجة' : 'نشاط القراءة والطلاقة',
        mainContent1Desc: 'إنجاز الأنشطة المبرمجة بالدرس الرقمي',
        mainContent2Title: s.subject?.includes('رياضيات') ? 'الممارسة الموجهة والتمارين' : 'نشاط الفهم والتطبيق',
        mainContent2Desc: 'التطبيق على الألواح وكراسة المتعلم',
        ...(s.subject?.includes('رياضيات')
          ? {
              mainContent3Title: 'حل المسائل الرياضية',
              mainContent3Desc: 'تطبيق فردي وتقويم تكويني',
            }
          : {}),
        closing: 'اختتام الحصة + تبصر وواجب منزلي',
        sessionOrder: `ح ${counter}`,
        mindMapRef: `خ ذ ${counter}`,
      };

      if (isPost) {
        postList.push(item);
      } else {
        preList.push(item);
      }
      counter++;
    });

    onUpdate({
      ...data,
      preBreakSessions: preList.length > 0 ? preList : data.preBreakSessions,
      postBreakSessions: postList.length > 0 ? postList : data.postBreakSessions,
    });
  };

  const renderSessionRow = (
    session: DailyJournalEntrySession,
    index: number,
    isPre: boolean
  ) => {
    return (
      <tr
        key={session.id || index}
        className="border-b border-stone-800 hover:bg-amber-50/20 transition-colors group"
      >
        {/* التوقيت */}
        <td className="p-1 sm:p-2 border-l border-stone-800 text-center font-bold text-[11px] sm:text-xs align-top whitespace-nowrap bg-stone-50/50">
          <input
            type="text"
            value={session.timing}
            onChange={(e) =>
              isPre
                ? updatePreSession(index, { ...session, timing: e.target.value })
                : updatePostSession(index, { ...session, timing: e.target.value })
            }
            className="w-full text-center bg-transparent outline-none font-bold text-stone-900"
            placeholder="08:30 - 09:30"
          />
        </td>

        {/* القسم / الفوج */}
        <td className="p-1 sm:p-2 border-l border-stone-800 text-center font-bold text-[11px] sm:text-xs align-top whitespace-nowrap bg-stone-50/50">
          <input
            type="text"
            value={session.className}
            onChange={(e) =>
              isPre
                ? updatePreSession(index, { ...session, className: e.target.value })
                : updatePostSession(index, { ...session, className: e.target.value })
            }
            className="w-full text-center bg-transparent outline-none font-black text-stone-900"
            placeholder="1"
          />
        </td>

        {/* المادة */}
        <td className="p-1 sm:p-2 border-l border-stone-800 text-center font-black text-[11px] sm:text-xs align-top whitespace-nowrap">
          <input
            type="text"
            value={session.subject}
            onChange={(e) =>
              isPre
                ? updatePreSession(index, { ...session, subject: e.target.value })
                : updatePostSession(index, { ...session, subject: e.target.value })
            }
            className="w-full text-center bg-amber-50/80 border border-amber-300 rounded px-1 py-0.5 outline-none font-black text-amber-950"
            placeholder="المادة"
          />
        </td>

        {/* المضامين والأنشطة (المحطة التعليمية) */}
        <td className="p-1.5 sm:p-2 border-l border-stone-800 text-right align-top text-xs leading-normal">
          {/* افتتاح الحصة */}
          <div className="flex items-center gap-1.5 mb-1.5 bg-stone-100/70 px-1.5 py-0.5 rounded border border-stone-200">
            <span className="text-emerald-700 font-black text-[11px]">✓</span>
            <span className="font-bold text-amber-800 whitespace-nowrap text-[11px]">افتتاح:</span>
            <input
              type="text"
              value={session.opening}
              onChange={(e) =>
                isPre
                  ? updatePreSession(index, { ...session, opening: e.target.value })
                  : updatePostSession(index, { ...session, opening: e.target.value })
              }
              className="w-full bg-transparent outline-none text-[11px] sm:text-xs text-stone-800 font-medium"
              placeholder="افتتاح الحصة + نشاط اعتيادي..."
            />
          </div>

          {/* أنشطة رئيسية */}
          <div className="space-y-1 my-1">
            <div className="font-bold text-red-700 text-[10.5px] sm:text-[11px] flex items-center gap-1">
              <span>✓</span>
              <span>الأنشطة الرئيسية:</span>
            </div>

            {/* نشاط 1 */}
            <div className="pr-1 flex items-baseline gap-1 text-[11px] sm:text-xs">
              <input
                type="text"
                value={session.mainContent1Title}
                onChange={(e) =>
                  isPre
                    ? updatePreSession(index, { ...session, mainContent1Title: e.target.value })
                    : updatePostSession(index, { ...session, mainContent1Title: e.target.value })
                }
                className="w-24 sm:w-28 font-black bg-stone-100 outline-none text-stone-900 border border-stone-300 text-[11px] sm:text-xs px-1 py-0.2 rounded"
                placeholder="عنوان النشاط 1"
              />
              <span className="font-bold text-stone-600">:</span>
              <input
                type="text"
                value={session.mainContent1Desc}
                onChange={(e) =>
                  isPre
                    ? updatePreSession(index, { ...session, mainContent1Desc: e.target.value })
                    : updatePostSession(index, { ...session, mainContent1Desc: e.target.value })
                }
                className="flex-1 bg-white border border-stone-200 focus:border-amber-500 rounded outline-none text-[11px] sm:text-xs text-stone-800 px-1.5 py-0.2"
                placeholder="المضمون والإنجاز..."
              />
            </div>

            {/* نشاط 2 */}
            <div className="pr-1 flex items-baseline gap-1 text-[11px] sm:text-xs">
              <input
                type="text"
                value={session.mainContent2Title}
                onChange={(e) =>
                  isPre
                    ? updatePreSession(index, { ...session, mainContent2Title: e.target.value })
                    : updatePostSession(index, { ...session, mainContent2Title: e.target.value })
                }
                className="w-24 sm:w-28 font-black bg-stone-100 outline-none text-stone-900 border border-stone-300 text-[11px] sm:text-xs px-1 py-0.2 rounded"
                placeholder="عنوان النشاط 2"
              />
              <span className="font-bold text-stone-600">:</span>
              <input
                type="text"
                value={session.mainContent2Desc}
                onChange={(e) =>
                  isPre
                    ? updatePreSession(index, { ...session, mainContent2Desc: e.target.value })
                    : updatePostSession(index, { ...session, mainContent2Desc: e.target.value })
                }
                className="flex-1 bg-white border border-stone-200 focus:border-amber-500 rounded outline-none text-[11px] sm:text-xs text-stone-800 px-1.5 py-0.2"
                placeholder="المضمون والإنجاز..."
              />
            </div>

            {/* نشاط 3 (اختياري مثل حل المسائل للرياضيات) */}
            {(session.mainContent3Title !== undefined || session.subject.includes('الرياضيات')) && (
              <div className="pr-1 flex items-baseline gap-1 text-[11px] sm:text-xs">
                <input
                  type="text"
                  value={session.mainContent3Title || 'نشاط حل المسائل'}
                  onChange={(e) =>
                    isPre
                      ? updatePreSession(index, { ...session, mainContent3Title: e.target.value })
                      : updatePostSession(index, { ...session, mainContent3Title: e.target.value })
                  }
                  className="w-24 sm:w-28 font-black bg-stone-100 outline-none text-stone-900 border border-stone-300 text-[11px] sm:text-xs px-1 py-0.2 rounded"
                  placeholder="عنوان النشاط 3"
                />
                <span className="font-bold text-stone-600">:</span>
                <input
                  type="text"
                  value={session.mainContent3Desc || ''}
                  onChange={(e) =>
                    isPre
                      ? updatePreSession(index, { ...session, mainContent3Desc: e.target.value })
                      : updatePostSession(index, { ...session, mainContent3Desc: e.target.value })
                  }
                  className="flex-1 bg-white border border-stone-200 focus:border-amber-500 rounded outline-none text-[11px] sm:text-xs text-stone-800 px-1.5 py-0.2"
                  placeholder="مضمون المسألة أو التطبيق..."
                />
              </div>
            )}
          </div>

          {/* اختتام الحصة */}
          <div className="flex items-center gap-1.5 mt-1.5 bg-stone-100/70 px-1.5 py-0.5 rounded border border-stone-200">
            <span className="text-emerald-700 font-black text-[11px]">✓</span>
            <span className="font-bold text-amber-800 whitespace-nowrap text-[11px]">اختتام:</span>
            <input
              type="text"
              value={session.closing}
              onChange={(e) =>
                isPre
                  ? updatePreSession(index, { ...session, closing: e.target.value })
                  : updatePostSession(index, { ...session, closing: e.target.value })
              }
              className="w-full bg-transparent outline-none text-[11px] sm:text-xs text-stone-800 font-medium"
              placeholder="لعبة ختامية، تبصر، وواجب منزلي..."
            />
          </div>
        </td>

        {/* ترتيب الحصص */}
        <td className="p-1 sm:p-2 border-l border-stone-800 text-center font-bold text-[11px] sm:text-xs align-top whitespace-nowrap bg-stone-50/50">
          <input
            type="text"
            value={session.sessionOrder}
            onChange={(e) =>
              isPre
                ? updatePreSession(index, { ...session, sessionOrder: e.target.value })
                : updatePostSession(index, { ...session, sessionOrder: e.target.value })
            }
            className="w-12 sm:w-14 text-center bg-white border border-stone-300 rounded p-1 outline-none font-black text-stone-800 text-[11px] sm:text-xs"
            placeholder="ح 1"
          />
        </td>

        {/* رقم خ ذ (الخطاطة الذهنية) */}
        <td className="p-1 sm:p-2 text-center font-bold text-[11px] sm:text-xs align-top whitespace-nowrap bg-stone-50/50">
          <div className="flex items-center justify-center gap-1">
            <input
              type="text"
              value={session.mindMapRef}
              onChange={(e) =>
                isPre
                  ? updatePreSession(index, { ...session, mindMapRef: e.target.value })
                  : updatePostSession(index, { ...session, mindMapRef: e.target.value })
              }
              className="w-14 sm:w-16 text-center bg-amber-50 border border-amber-300 rounded p-1 outline-none font-black text-amber-900 text-[11px] sm:text-xs"
              placeholder="خ ذ 1"
            />
            <button
              onClick={() => (isPre ? deletePreSession(index) : deletePostSession(index))}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 print:hidden transition-opacity cursor-pointer"
              title="حذف الحصة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div
      id="daily-journal-printable"
      className="w-full max-w-4xl mx-auto bg-white border border-stone-300 rounded-2xl shadow-sm p-3 sm:p-6 print:p-2 print:border-none print:shadow-none text-stone-900 leading-relaxed transition-all"
      style={{ fontFamily: fontCss }}
      dir="rtl"
    >
      {/* Date Banner */}
      <div
        className="w-full text-white text-center py-2 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base mb-3 flex flex-wrap items-center justify-between gap-2 shadow-xs print:text-black print:border print:border-stone-800"
        style={{ backgroundColor: primaryBg }}
      >
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 opacity-90 hidden sm:inline" />
          <span className="font-black text-xs sm:text-sm">المذكرة اليومية (Cahier Journal) - التاريخ:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={data.dayName}
            onChange={(e) => onUpdate({ ...data, dayName: e.target.value })}
            className="bg-white/20 px-2.5 py-0.5 rounded-lg text-white text-xs sm:text-sm font-black text-center outline-none border border-white/40"
            placeholder="اليوم"
          />
          <input
            type="date"
            value={data.date}
            onChange={(e) => onUpdate({ ...data, date: e.target.value })}
            className="bg-white text-stone-900 px-2 py-0.5 rounded-lg text-xs sm:text-sm font-black outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Phase & Milestone Subheader (TaRL Official Metadata Grid) */}
      <div className="w-full border border-stone-800 rounded-xl mb-3 text-xs overflow-hidden shadow-2xs">
        <div
          className="text-center font-black py-1 px-2 border-b border-stone-800 text-stone-900 bg-amber-50/80"
        >
          <input
            type="text"
            value={data.phase}
            onChange={(e) => onUpdate({ ...data, phase: e.target.value })}
            className="w-full bg-transparent text-center font-black text-stone-900 outline-none text-xs sm:text-sm"
            placeholder="المرحلة (فترة الدعم المكثف لتعلمات الأساس - مقاربة طارل TaRL)..."
          />
        </div>
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-stone-800 bg-white text-[11px] sm:text-xs">
          <div className="p-1.5 sm:p-2 flex items-center justify-center gap-1.5">
            <span className="font-black text-stone-800 whitespace-nowrap">المسار:</span>
            <input
              type="text"
              value={data.pathway}
              onChange={(e) => onUpdate({ ...data, pathway: e.target.value })}
              className="w-full bg-transparent text-right outline-none text-stone-900 font-bold"
              placeholder="المسار..."
            />
          </div>
          <div className="p-1.5 sm:p-2 flex items-center justify-center gap-1.5">
            <span className="font-black text-stone-800 whitespace-nowrap">اللبنة:</span>
            <input
              type="text"
              value={data.milestone}
              onChange={(e) => onUpdate({ ...data, milestone: e.target.value })}
              className="w-full bg-transparent text-right outline-none text-stone-900 font-bold"
              placeholder="اللبنة..."
            />
          </div>
        </div>
      </div>

      {/* Main Journal Timetable - Pristine Structured Grid */}
      <div className="w-full border border-stone-800 rounded-xl overflow-x-auto mb-3 shadow-2xs bg-white">
        <table className="w-full min-w-[680px] border-collapse text-right">
          <thead>
            <tr className="border-b border-stone-800 text-stone-900 bg-stone-100 text-xs font-black">
              <th className="p-1.5 sm:p-2 border-l border-stone-800 text-center w-[12%]">التوقيت</th>
              <th className="p-1.5 sm:p-2 border-l border-stone-800 text-center w-[7%]">القسم</th>
              <th className="p-1.5 sm:p-2 border-l border-stone-800 text-center w-[14%]">المادة</th>
              <th className="p-1.5 sm:p-2 border-l border-stone-800 text-center w-[49%]">المضامين والأنشطة (المحطة التعليمية)</th>
              <th className="p-1.5 sm:p-2 border-l border-stone-800 text-center w-[9%]">ترتيب الحصص</th>
              <th className="p-1.5 sm:p-2 text-center w-[9%]">رقم خ ذ</th>
            </tr>
          </thead>
          <tbody>
            {/* Pre-break sessions */}
            {data.preBreakSessions.map((s, idx) => renderSessionRow(s, idx, true))}

            {/* Break Banner */}
            <tr className="border-b border-stone-800" style={{ backgroundColor: primaryBg }}>
              <td colSpan={6} className="py-1.5 text-center font-black text-white text-xs sm:text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Coffee className="w-4 h-4 opacity-90 hidden sm:inline" />
                  <input
                    type="text"
                    value={data.breakTitle}
                    onChange={(e) => onUpdate({ ...data, breakTitle: e.target.value })}
                    className="bg-transparent text-center text-white font-black outline-none w-64"
                    placeholder="فترة الاستراحة والتنفس"
                  />
                </div>
              </td>
            </tr>

            {/* Post-break sessions */}
            {data.postBreakSessions.map((s, idx) => renderSessionRow(s, idx, false))}
          </tbody>
        </table>
      </div>

      {/* Row Controls & Sync Buttons Bar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 print:hidden text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={addPreSession}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold transition-all cursor-pointer shadow-2xs text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة حصة قبل الاستراحة</span>
          </button>
          <button
            type="button"
            onClick={addPostSession}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold transition-all cursor-pointer shadow-2xs text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة حصة بعد الاستراحة</span>
          </button>
          <button
            type="button"
            onClick={autoRenumber}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg font-bold transition-all cursor-pointer shadow-2xs text-[11px]"
            title="إعادة الترقيم التسلسلي للحصص والخطاطات الذهنية (ح 1، خ ذ 1...)"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>ترقيم تسلسلي (ح / خ ذ)</span>
          </button>
        </div>

        {timetable && (
          <button
            type="button"
            onClick={syncWithTimetable}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold transition-all cursor-pointer shadow-2xs text-[11px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>مزامنة التوقيت والمواد من استعمال الزمن</span>
          </button>
        )}
      </div>

      {/* Notes Box */}
      <div className="w-full border border-stone-800 rounded-xl p-2.5 sm:p-3 bg-stone-50/40">
        <div className="font-black text-xs sm:text-sm text-stone-900 mb-1 flex items-center gap-1">
          <span className="text-amber-800">ملاحظات تربوية وتقويمية:</span>
        </div>
        <textarea
          rows={3}
          value={data.notes}
          onChange={(e) => onUpdate({ ...data, notes: e.target.value })}
          className="w-full text-xs sm:text-sm p-2 border border-stone-200 rounded-lg focus:border-amber-500 outline-none bg-white text-stone-800 resize-none leading-relaxed"
          placeholder="تدوين ملاحظات سير الأنشطة، وتيرة إنجاز المتعلمين، والتقويم التكويني اليومي..."
        />
      </div>
    </div>
  );
};
