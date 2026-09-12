export type AppScreen = 'home' | 'agenda' | 'ingest' | 'preview' | 'pdf' | 'archive' | 'evaluation' | 'onboarding';

export type SubjectType = 'arabic' | 'math' | 'french';

export type PedagogicalPhase = 'intensive_remediation' | 'explicit_instruction';

export type TeachingMode = 
  | 'bilingual' // أستاذ شامل مزدوج (جميع المواد: عربية + فرنسية + رياضيات لنفس الفوج)
  | 'binome_french_math' // تفويج ثنائي: فرنسية + رياضيات (فوج 1 و فوج 2)
  | 'binome_arabic' // تفويج ثنائي: لغة عربية فقط (فوج 1 و فوج 2)
  | 'specialist_arabic' // تخصص أحادي: لغة عربية (أقسام متعددة)
  | 'specialist_french' // تخصص أحادي: لغة فرنسية (أقسام متعددة)
  | 'specialist_math'; // تخصص أحادي: رياضيات (أقسام متعددة)

export type ScheduleType = 
  | 'continuous' // توقيت مستمر (مناصفة بين الصباح والمساء - الوسط القروي)
  | 'continuous_morning' // للتوافق القديم
  | 'continuous_afternoon' // للتوافق القديم
  | 'intermittent'; // توقيت متقطع (صباحي + مسائي - الوسط الحضري)

export type AreaType = 'rural' | 'urban'; // وسط قروي / شبه حضري أو وسط حضري

export interface UserAuthSession {
  isLoggedIn: boolean;
  email: string;
  name: string;
  photoUrl?: string;
  provider: 'google' | 'guest';
  loginDate?: string;
}

export interface TeacherProfile {
  userEmail?: string; // بريد الأستاذ (Gmail)
  userAvatar?: string; // الصورة الرمزية
  academy: string; // الأكاديمية الجهوية للتربية والتكوين
  direction: string; // المديرية الإقليمية
  school: string; // المؤسسة التعليمية
  schoolStartDate?: string; // تاريخ أول يوم عمل فعلي مع التلاميذ (مثلاً: 2026-09-08)
  continuousMorningDays?: string[]; // الأيام الصباحية في التوقيت المستمر (مثلاً: الإثنين، الأربعاء، الجمعة)
  teacherName: string; // اسم الأستاذ(ة)
  level: string; // المستوى الدراسي الأساسي (مثال: المستوى الرابع ابتدائي)
  assignedLevels?: string[]; // المستويات المسندة (للأستاذ المتخصص أو الأقسام المشتركة)
  classGroup: string; // رقم القسم / الفوج (مثال: 1 / 2)
  assignedGroups?: string[]; // الأفواج المسندة (مثال: ['فوج 1', 'فوج 2'])
  specialty: 'arabic' | 'french' | 'bilingual'; // التخصص البيداغوجي الأساسي
  teachingMode: TeachingMode; // صيغة العمل / نمط التكليف
  scheduleType: ScheduleType; // نظام استعمال الزمن (مستمر مناصفة / متقطع)
  areaType: AreaType; // المجال الجغرافي (قروي مستمر / حضري متقطع)
  academicYear: string; // الموسم الدراسي (مثال: 2026 - 2027)
}

export interface TimetableSlot {
  id: string;
  day: string; // 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت'
  dayIndex: number; // 0: الإثنين إلى 5: السبت
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "09:30"
  subject: string; // e.g. "اللغة العربية" / "الرياضيات" / "Français"
  subjectType: SubjectType | 'other';
  level: string; // e.g. "المستوى الرابع"
  group: string; // e.g. "فوج 1"
  notes?: string;
}

export interface WeeklyTimetable {
  slots: TimetableSlot[];
  phaseMode?: 'tarl_remediation' | 'explicit_instruction';
  scheduleType: ScheduleType;
  lastUpdated: string;
  customTitle?: string;
  themeStyle?: 
    | 'classic_black' 
    | 'emerald_ministry' 
    | 'amber_pioneer' 
    | 'navy_royal' 
    | 'maroon_academic' 
    | 'slate_modern'
    | 'indigo_official'
    | 'olive_heritage'
    | 'purple_majestic'
    | 'teal_cyan'
    | 'sepia_classic';
  fontFamily?: 'scheherazade' | 'naskh' | 'amiri' | 'cairo' | 'alexandria' | 'tajawal' | 'almarai' | 'ruqaa' | 'kufi' | 'sans';
  fontScale?: 'compact' | 'normal' | 'medium' | 'large';
  customAccentColor?: string;
  customHeaderColor?: string;
  timingConfig?: {
    morning1Start?: string;
    morning1End?: string;
    morning2Start?: string;
    morning2End?: string;
    afternoon1Start?: string;
    afternoon1End?: string;
    afternoon2Start?: string;
    afternoon2End?: string;
  };
}

export type AgendaEventType = 
  | 'teaching_day' // يوم عمل دراسي مع التلاميذ
  | 'entry_signature' // توقيع محاضر الدخول
  | 'student_reception' // استقبال التلميذات والتلاميذ
  | 'school_activity' // نشاط مدرسي / عمل إداري تربوي
  | 'training' // تكوين مستمر حضوري (يحفظ الترقيم البيداغوجي ويرحله)
  | 'sick_leave' // رخصة مرضية / غياب مبرر (يرحل الترقيم)
  | 'holiday' // عطلة مدرسية أو وطنية (يرحل الترقيم)
  | 'evaluation'; // أسبوع التقويم والدعم

export interface AgendaDayEvent {
  date: string; // 'YYYY-MM-DD'
  type: AgendaEventType;
  title: string;
  pedagogicalWeek?: number; // رقم الأسبوع التربوي الفعلي
  pedagogicalDay?: number; // رقم اليوم التربوي الفعلي
  phase?: PedagogicalPhase;
  milestoneNote?: string; // e.g. 'طارل: اللبنة 3 - اليوم 9'
  notes?: string;
}

export interface MindMapArabic {
  id: string;
  lessonTitle: string;
  level: string;
  pathway: string; // المسار
  phase: string; // المرحلة (الدعم المكثف لتعلمات الأساس / إرساء الموارد)
  milestone: string; // اللبنة
  session: string; // الحصة
  objectives: string[];
  opening: {
    durationMinutes: number;
    declareObjective: string;
    routineActivity: string;
  };
  readingActivity: {
    durationMinutes: number;
    modeling: string; // نمذجة
    guidedPractice: string; // ممارسة موجهة
    independentPractice: string; // ممارسة مستقلة
  };
  writingActivity: {
    durationMinutes: number;
    modeling: string;
    guidedPractice: string;
    independentPractice: string;
  };
  closing: {
    durationMinutes: number;
    game: string; // لعبة
    reflection: string; // تبصر الحصة
    homework: string; // واجب منزلي
  };
}

export interface MindMapMath {
  id: string;
  lessonTitle: string;
  level: string;
  pathway: string;
  phase: string;
  milestone: string;
  session: string;
  objectives: string[];
  opening: {
    durationMinutes: number;
    declareObjective: string;
    routineActivity: string;
  };
  countingActivity: {
    durationMinutes: number;
    title: string; // نشاط العد
    modeling: string;
    guidedPractice: string;
    independentPractice: string;
  };
  calculationActivity: {
    durationMinutes: number;
    title: string; // نشاط الحساب
    modeling: string;
    guidedPractice: string;
    independentPractice: string;
  };
  problemSolvingActivity: {
    durationMinutes: number;
    title: string; // نشاط حل المسائل
    modeling: string;
    guidedPractice: string;
    independentPractice: string;
  };
  closing: {
    durationMinutes: number;
    game: string;
    reflection: string;
    homework: string;
  };
}

export interface MindMapFrench {
  id: string;
  lessonTitle: string;
  level: string;
  pathway: string; // Parcours
  phase: string; // Palier / Remédiation
  milestone: string; // Palier
  session: string; // Séance
  objectives: string[];
  opening: {
    durationMinutes: number;
    declareObjective: string;
    routineActivity: string;
  };
  readingActivity: {
    durationMinutes: number;
    modeling: string; // Modelage (Je fais)
    guidedPractice: string; // Pratique guidée (Nous faisons)
    independentPractice: string; // Pratique autonome (Tu fais)
  };
  writingActivity: {
    durationMinutes: number;
    modeling: string;
    guidedPractice: string;
    independentPractice: string;
  };
  closing: {
    durationMinutes: number;
    game: string;
    reflection: string;
    homework: string;
  };
}

export interface DailyJournalEntrySession {
  id: string;
  timing: string; // e.g. 08:30 - 09:30
  className: string; // e.g. 3/1
  subject: string; // e.g. اللغة العربية / الرياضيات / Français
  opening: string; // افتتاح الحصة
  mainContent1Title: string; // e.g. نشاط العد / نشاط القراءة
  mainContent1Desc: string;
  mainContent2Title: string; // e.g. نشاط الحساب / نشاط الكتابة
  mainContent2Desc: string;
  mainContent3Title?: string; // e.g. نشاط حل المسائل
  mainContent3Desc?: string;
  closing: string; // اختتام الحصة
  sessionOrder: string; // ترتيب الحصص
  mindMapRef: string; // رقم خ ذ
}

export interface DailyJournalData {
  id: string;
  date: string; // e.g. 2026-09-22
  dayName: string; // e.g. الثلاثاء
  phase: string; // e.g. فترة الدعم المكثف للتعلمات الأساس
  pathway: string;
  milestone: string;
  preBreakSessions: DailyJournalEntrySession[];
  breakTitle: string; // فترة الاستراحة
  postBreakSessions: DailyJournalEntrySession[];
  notes: string;
}

export type DocumentCategoryType =
  | 'daily_journal' // المذكرات اليومية
  | 'mind_map' // الخطاطات الذهنية
  | 'lesson_plan' // الجذاذات
  | 'evaluation' // التقويمات
  | 'remediation' // أنشطة الدعم
  | 'other'; // الوثائق الأخرى

export interface SavedDocumentPackage {
  id: string;
  userId?: string;
  title: string;
  docType?: DocumentCategoryType;
  level?: string; // المستوى
  subject?: string; // المادة
  unitOrLesson?: string; // الوحدة أو الدرس
  createdAt: string;
  updatedAt?: string;
  date: string;
  dayName?: string;
  phase: PedagogicalPhase;
  arabicMap?: MindMapArabic;
  mathMap?: MindMapMath;
  frenchMap?: MindMapFrench;
  dailyJournal?: DailyJournalData;
  teacherProfile?: TeacherProfile;
  theme?: PrintTheme;
  notes?: string;
  tags?: string[];
}

export interface PrintTheme {
  primaryColor: string;
  accentColor: string;
  borderColor: string;
  styleName: string;
  fontFamily?: string;
  latinFontFamily?: string;
  headerVisible: boolean;
  fontScale: 'compact' | 'normal' | 'large' | 'xlarge';
}

export type EvaluationTabMode = 'grids' | 'reports';

export interface EvaluationCriterion {
  id: string;
  name: string;
  type: 'tarl_level' | 'score_10' | 'mastery_level';
  maxScore?: number;
}

export interface EvaluationStudent {
  id: string;
  code?: string;
  name: string;
  gender: 'M' | 'F';
  scores: Record<string, string | number>;
  notes?: string;
}

export interface EvaluationGridData {
  id: string;
  title: string;
  subject: string;
  level: string;
  classGroup: string;
  phase: PedagogicalPhase;
  gridType: 'tarl_diagnostic' | 'tarl_milestone' | 'continuous_assessment' | 'formative';
  criteria: EvaluationCriterion[];
  students: EvaluationStudent[];
  createdAt: string;
  notes?: string;
}

export interface EvaluationReportData {
  id: string;
  title: string;
  reportType: 'tarl_summary' | 'diagnostic_report' | 'continuous_assessment_summary' | 'remediation_plan';
  level: string;
  classGroup: string;
  phase: PedagogicalPhase;
  academicYear: string;
  date: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  masteryCount: number; // عدد المتحكمين
  inProgressCount: number; // في طور التحكم
  nonMasteryCount: number; // غير المتحكمين
  strengths: string[];
  difficulties: string[];
  remediationPlan: string[];
  recommendations: string;
  teacherNotes: string;
  createdAt: string;
}



