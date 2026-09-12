import React, { useState, useEffect } from 'react';
import { TeacherProfile, UserAuthSession, PrintTheme } from '../types';
import {
  MOROCCAN_REGIONS_WITH_DIRECTORATES,
  getDirectoratesForRegion,
} from '../data/moroccoRegionsDirectorates';
import {
  MAIN_COLOR_PRESETS,
  ARABIC_FONT_PRESETS,
  FONT_SCALE_PRESETS,
} from '../data/themePresets';
import {
  UserCheck,
  School,
  MapPin,
  GraduationCap,
  Calendar,
  CalendarDays,
  X,
  Save,
  ShieldCheck,
  Building,
  LogOut,
  Mail,
  User,
  CheckCircle2,
  Cloud,
  Shield,
  BookOpen,
  Trash2,
  ChevronLeft,
  Lock,
  Palette,
  Type,
  Sliders,
  Sparkles,
  Info,
  Layers,
  Clock,
  Globe,
  Smartphone,
  Check,
  Users,
} from 'lucide-react';

export const PRIMARY_GRADE_LEVELS = [
  { grade: 1, name: 'المستوى الأول ابتدائي', code: '1AEP', short: 'المستوى 1', ordinal: 'الأول' },
  { grade: 2, name: 'المستوى الثاني ابتدائي', code: '2AEP', short: 'المستوى 2', ordinal: 'الثاني' },
  { grade: 3, name: 'المستوى الثالث ابتدائي', code: '3AEP', short: 'المستوى 3', ordinal: 'الثالث' },
  { grade: 4, name: 'المستوى الرابع ابتدائي', code: '4AEP', short: 'المستوى 4', ordinal: 'الرابع' },
  { grade: 5, name: 'المستوى الخامس ابتدائي', code: '5AEP', short: 'المستوى 5', ordinal: 'الخامس' },
  { grade: 6, name: 'المستوى السادس ابتدائي', code: '6AEP', short: 'المستوى 6', ordinal: 'السادس' },
];

export function formatAssignedLevelsLabel(selectedLevels: string[]): string {
  if (!selectedLevels || selectedLevels.length === 0) {
    return 'المستوى الرابع ابتدائي';
  }
  if (selectedLevels.length === 1) {
    return selectedLevels[0];
  }
  
  const matchingGrades = PRIMARY_GRADE_LEVELS
    .filter((g) => selectedLevels.includes(g.name))
    .map((g) => g.grade);
    
  if (matchingGrades.length === 0) {
    return selectedLevels.join(' + ');
  }
  
  if (matchingGrades.length === 2) {
    return `المستويان ${matchingGrades[0]} و ${matchingGrades[1]} ابتدائي`;
  }
  
  if (matchingGrades.length === 6) {
    return 'جميع المستويات (1 إلى 6 ابتدائي)';
  }
  
  return `المستويات ${matchingGrades.join(' و ')} ابتدائي`;
}

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onSave: (updated: TeacherProfile) => void;
  userAuthSession?: UserAuthSession | null;
  userId?: string | null;
  onLogout?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTermsOfService?: () => void;
  onOpenDeleteAccount?: () => void;
  currentTheme?: PrintTheme;
  onApplyTheme?: (newTheme: PrintTheme) => void;
  initialTab?: 'profile' | 'theme' | 'security';
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  userAuthSession,
  userId,
  onLogout,
  onOpenPrivacyPolicy,
  onOpenTermsOfService,
  onOpenDeleteAccount,
  currentTheme,
  onApplyTheme,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'security'>(initialTab);

  // Form State for Profile
  const [formData, setFormData] = useState<TeacherProfile>(() => {
    const initialAcademy = profile.academy || 'جهة مراكش - آسفي';
    const availableDirectorates = getDirectoratesForRegion(initialAcademy);
    const initialDirection = availableDirectorates.includes(profile.direction)
      ? profile.direction
      : availableDirectorates[0] || 'المديرية الإقليمية باليوسفية';

    const initialAssignedLevels =
      profile.assignedLevels && profile.assignedLevels.length > 0
        ? profile.assignedLevels
        : [profile.level || 'المستوى الرابع ابتدائي'];

    return {
      ...profile,
      academy: initialAcademy,
      direction: initialDirection,
      assignedLevels: initialAssignedLevels,
      scheduleType: profile.scheduleType || 'continuous',
      continuousMorningDays: profile.continuousMorningDays || ['الإثنين', 'الأربعاء', 'الجمعة'],
      schoolStartDate: profile.schoolStartDate || '2026-09-08',
      academicYear: profile.academicYear || '2026 - 2027',
      userEmail: profile.userEmail || userAuthSession?.email || '',
    };
  });

  // Local Theme State if theme customization tab is used
  const [selectedColorId, setSelectedColorId] = useState<string>(
    currentTheme?.styleName || 'pioneer-orange'
  );
  const [selectedArabicFont, setSelectedArabicFont] = useState<string>(
    currentTheme?.fontFamily || 'cairo'
  );
  const [selectedScale, setSelectedScale] = useState<'compact' | 'normal' | 'large' | 'xlarge'>(
    currentTheme?.fontScale || 'normal'
  );

  // Re-sync when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      const initialAcademy = profile.academy || 'جهة مراكش - آسفي';
      const availableDirectorates = getDirectoratesForRegion(initialAcademy);
      const initialDirection = availableDirectorates.includes(profile.direction)
        ? profile.direction
        : availableDirectorates[0] || 'المديرية الإقليمية باليوسفية';

      const initialAssignedLevels =
        profile.assignedLevels && profile.assignedLevels.length > 0
          ? profile.assignedLevels
          : [profile.level || 'المستوى الرابع ابتدائي'];

      setFormData({
        ...profile,
        academy: initialAcademy,
        direction: initialDirection,
        assignedLevels: initialAssignedLevels,
        scheduleType: profile.scheduleType || 'continuous',
        continuousMorningDays: profile.continuousMorningDays || ['الإثنين', 'الأربعاء', 'الجمعة'],
        schoolStartDate: profile.schoolStartDate || '2026-09-08',
        academicYear: profile.academicYear || '2026 - 2027',
        userEmail: profile.userEmail || userAuthSession?.email || '',
      });

      if (currentTheme) {
        setSelectedColorId(currentTheme.styleName || 'pioneer-orange');
        setSelectedArabicFont(currentTheme.fontFamily || 'cairo');
        setSelectedScale(currentTheme.fontScale || 'normal');
      }
      setActiveTab(initialTab);
    }
  }, [isOpen, profile, currentTheme, initialTab, userAuthSession]);

  if (!isOpen) return null;

  const availableDirectorates = getDirectoratesForRegion(formData.academy);

  const handleAcademyChange = (newAcademy: string) => {
    const dirs = getDirectoratesForRegion(newAcademy);
    setFormData((prev) => ({
      ...prev,
      academy: newAcademy,
      direction: dirs[0] || '',
    }));
  };

  const handleToggleLevel = (levelName: string) => {
    setFormData((prev) => {
      const current = prev.assignedLevels || (prev.level ? [prev.level] : ['المستوى الرابع ابتدائي']);
      let updated: string[];
      if (current.includes(levelName)) {
        if (current.length === 1) {
          // If only 1 selected, keep it or allow toggling to another
          updated = current;
        } else {
          updated = current.filter((l) => l !== levelName);
        }
      } else {
        const newSet = new Set([...current, levelName]);
        updated = PRIMARY_GRADE_LEVELS
          .filter((g) => newSet.has(g.name))
          .map((g) => g.name);
      }
      return {
        ...prev,
        assignedLevels: updated,
        level: formatAssignedLevelsLabel(updated),
      };
    });
  };

  const handleApplyPresetLevels = (presetLevels: string[]) => {
    setFormData((prev) => ({
      ...prev,
      assignedLevels: presetLevels,
      level: formatAssignedLevelsLabel(presetLevels),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save Profile
    onSave(formData);

    // 2. If theme was modified, save theme too
    if (onApplyTheme && currentTheme) {
      const colorPreset = MAIN_COLOR_PRESETS.find((c) => c.id === selectedColorId) || MAIN_COLOR_PRESETS[0];
      const updatedTheme: PrintTheme = {
        ...currentTheme,
        styleName: colorPreset.id,
        primaryColor: colorPreset.primary,
        accentColor: colorPreset.accent,
        borderColor: colorPreset.border,
        fontFamily: selectedArabicFont,
        fontScale: selectedScale,
      };
      localStorage.setItem('pioneer_print_theme', JSON.stringify(updatedTheme));
      onApplyTheme(updatedTheme);
    }

    onClose();
  };

  // Avatar Image or Letter
  const userPhoto = userAuthSession?.photoUrl || profile.userAvatar;
  const userInitial = userAuthSession?.name?.charAt(0) || profile.teacherName?.charAt(0) || 'أ';

  return (
    <div
      id="teacher-profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-profile-modal-title"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-l from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={formData.teacherName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to text initial if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-lg font-black text-white">{userInitial}</span>
              )}
            </div>
            <div>
              <h2 id="teacher-profile-modal-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>حساب الأستاذ والإعدادات</span>
                <span className="text-[10px] font-bold bg-white/20 text-amber-100 px-2 py-0.5 rounded-full font-mono">
                  Paramètres
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-100/90 font-medium">
                إدارة الحساب السحابي، المعطيات التربوية، والتخصيص
              </p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Bilingual, Accessible, Touch-friendly) */}
        <div className="bg-stone-100 dark:bg-stone-850 px-3 sm:px-5 pt-2 border-b border-stone-200 dark:border-stone-800 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          <button
            id="tab-btn-profile"
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border-t-2 ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 border-amber-500 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border-transparent hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>حسابي والبيانات التربوية</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">(Profil)</span>
          </button>

          <button
            id="tab-btn-theme"
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`px-3.5 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border-t-2 ${
              activeTab === 'theme'
                ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 border-amber-500 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border-transparent hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>المظهر والطباعة</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">(Thème)</span>
          </button>

          <button
            id="tab-btn-security"
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border-t-2 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 border-amber-500 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border-transparent hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>الأمان وعن التطبيق</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">(Sécurité)</span>
          </button>
        </div>

        {/* Form & Tab Content Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-4 sm:p-6 space-y-5">
            
            {/* ========================================================= */}
            {/* TAB 1: Mon Profil & Données Pédagogiques */}
            {/* ========================================================= */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Account Status Card */}
                <div className="bg-stone-900 dark:bg-stone-950 text-white rounded-2xl p-4 border border-stone-800 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black text-base overflow-hidden shrink-0">
                        {userPhoto ? (
                          <img
                            src={userPhoto}
                            alt={formData.teacherName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span>{userInitial}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-white">
                            {formData.teacherName || userAuthSession?.name || 'الأستاذ(ة)'}
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            {userAuthSession?.provider === 'google' ? 'حساب Google موثق ✓' : 'حساب محلي'}
                          </span>
                        </div>
                        <span className="text-xs text-stone-400 font-mono block mt-0.5">
                          {userAuthSession?.email || formData.userEmail || 'غير مسجل بالبريد'}
                        </span>
                      </div>
                    </div>

                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
                            onLogout();
                            onClose();
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">تسجيل الخروج</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Cloud className="w-3.5 h-3.5" />
                      <span>المزامنة السحابية الذاتية (Zero-Trust): مفعّلة</span>
                    </div>
                    {userId && (
                      <span className="font-mono text-stone-500 text-[10px]" title={userId}>
                        UID: {userId.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                </div>

                {/* Region & Directorate Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-900/40">
                  {/* الأكاديمية الجهوية */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>الأكاديمية الجهوية (الجهة):</span>
                      <span className="text-[10px] text-stone-400 font-normal mr-auto">Académie</span>
                    </label>
                    <select
                      value={formData.academy}
                      onChange={(e) => handleAcademyChange(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                    >
                      {MOROCCAN_REGIONS_WITH_DIRECTORATES.map((region) => (
                        <option key={region.id} value={region.regionName}>
                          {region.regionName} ({region.capital})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* المديرية الإقليمية */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>المديرية الإقليمية:</span>
                      <span className="text-[10px] text-stone-400 font-normal mr-auto">Direction</span>
                    </label>
                    <select
                      value={formData.direction}
                      onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                    >
                      {availableDirectorates.map((dir) => (
                        <option key={dir} value={dir}>
                          {dir}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Teacher Name & School Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>اسم الأستاذ(ة) الكامل:</span>
                      <span className="text-[10px] text-stone-400 font-normal mr-auto">Nom & Prénom</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.teacherName}
                      onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                      placeholder="مثال: ذ. محمد السعيدي"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>المؤسسة التعليمية / م/م:</span>
                      <span className="text-[10px] text-stone-400 font-normal mr-auto">Établissement</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      placeholder="مثال: مدرسة الإمام البخاري الابتدائية"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Assigned Level(s) - Single or Multiple Selection */}
                <div className="bg-stone-50 dark:bg-stone-850/70 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>المستوى الدراسي المسند والمستويات المسندة:</span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">
                        (مستوى منفرد، أقسام مشتركة، أو تخصص)
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50">
                        {(formData.assignedLevels || []).length > 1
                          ? `✓ تم تحديد ${(formData.assignedLevels || []).length} مستويات`
                          : `✓ مستوى واحد مسند`}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Level Cards (1 to 6) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRIMARY_GRADE_LEVELS.map((lvl) => {
                      const isSelected = (formData.assignedLevels || [formData.level]).includes(lvl.name);
                      return (
                        <button
                          key={lvl.grade}
                          type="button"
                          id={`level-btn-${lvl.grade}`}
                          onClick={() => handleToggleLevel(lvl.name)}
                          className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/25 dark:bg-amber-600 dark:border-amber-500'
                              : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-500'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-white text-amber-700 dark:bg-stone-900 dark:text-amber-400'
                                  : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              {lvl.grade}
                            </span>
                            <div className="text-right">
                              <div className="text-xs font-bold leading-tight">
                                {lvl.name}
                              </div>
                              <div className={`text-[10px] ${isSelected ? 'text-amber-100 dark:text-amber-200' : 'text-stone-400'}`}>
                                {lvl.code}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-white text-amber-600 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-stone-300 dark:border-stone-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Presets / Shortcuts */}
                  <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 ml-1">
                      نماذج جاهزة:
                    </span>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetLevels(['المستوى الأول ابتدائي', 'المستوى الثاني ابتدائي'])}
                      className="px-2.5 py-1 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                    >
                      مشترك (1+2)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetLevels(['المستوى الثالث ابتدائي', 'المستوى الرابع ابتدائي'])}
                      className="px-2.5 py-1 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                    >
                      مشترك (3+4)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetLevels(['المستوى الخامس ابتدائي', 'المستوى السادس ابتدائي'])}
                      className="px-2.5 py-1 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                    >
                      مشترك (5+6)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetLevels(['المستوى الرابع ابتدائي', 'المستوى الخامس ابتدائي', 'المستوى السادس ابتدائي'])}
                      className="px-2.5 py-1 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                    >
                      تخصص عليا (4+5+6)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetLevels(['المستوى الأول ابتدائي', 'المستوى الثاني ابتدائي', 'المستوى الثالث ابتدائي'])}
                      className="px-2.5 py-1 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                    >
                      تخصص دنيا (1+2+3)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetLevels(PRIMARY_GRADE_LEVELS.map((g) => g.name))}
                      className="px-2.5 py-1 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                    >
                      جميع المستويات (1-6)
                    </button>
                  </div>

                  {/* Level text formula in official header & group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                        <span>صيغة كتابة المستوى في ترويسة الوثائق:</span>
                        <span className="text-[10px] text-stone-400 font-normal">قابلة للتعديل</span>
                      </label>
                      <input
                        type="text"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        placeholder="مثال: المستوى الرابع ابتدائي أو المشترك 3+4"
                        className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>رقم الفوج أو القسم:</span>
                        <span className="text-[10px] text-stone-400 font-normal mr-auto">Groupe/Section</span>
                      </label>
                      <input
                        type="text"
                        value={formData.classGroup}
                        onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
                        placeholder="مثال: فوج 1 / القسم 4/2 / مشترك"
                        className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Teaching Mode & Specialty */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>صيغة العمل ونمط التكليف التربوي:</span>
                    <span className="text-[10px] text-stone-400 font-normal mr-auto">Matières & Spécialité</span>
                  </label>
                  <select
                    value={formData.teachingMode || 'bilingual'}
                    onChange={(e) => {
                      const mode = e.target.value as any;
                      let spec: 'arabic' | 'french' | 'bilingual' = 'bilingual';
                      if (mode === 'binome_arabic' || mode === 'specialist_arabic') spec = 'arabic';
                      else if (mode === 'binome_french_math' || mode === 'specialist_french' || mode === 'specialist_math') spec = 'french';
                      setFormData({ ...formData, teachingMode: mode, specialty: spec });
                    }}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="bilingual">أستاذ شامل مزدوج (جميع المواد: عربية + فرنسية + رياضيات لنفس الفوج)</option>
                    <option value="binome_french_math">أستاذ فرنسية ورياضيات بالتفويج (فوج 1 وفوج 2)</option>
                    <option value="binome_arabic">أستاذ لغة عربية بالتفويج (فوج 1 وفوج 2)</option>
                    <option value="specialist_arabic">تخصص مادة وحيدة: لغة عربية (أقسام متعددة)</option>
                    <option value="specialist_french">تخصص مادة وحيدة: لغة فرنسية (أقسام متعددة)</option>
                    <option value="specialist_math">تخصص مادة وحيدة: رياضيات (أقسام متعددة)</option>
                  </select>
                </div>

                {/* Academic Year, Timetable Type & First Day of Academic Work */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>الموسم الدراسي:</span>
                      <span className="text-[10px] text-stone-400 font-normal mr-auto">Année</span>
                    </label>
                    <input
                      type="text"
                      value={formData.academicYear || '2026 - 2027'}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="2026 - 2027"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>أول يوم عمل دراسي مع التلاميذ:</span>
                      <span className="text-[10px] text-stone-400 font-normal mr-auto">Date début</span>
                    </label>
                    <input
                      type="date"
                      value={formData.schoolStartDate || '2026-09-08'}
                      onChange={(e) => setFormData({ ...formData, schoolStartDate: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-right font-bold"
                    />
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">
                      التاريخ الرسمي: 08 شتنبر 2026 (قابل للتعديل حسب وضعية الأستاذ)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>نظام استعمال الزمن:</span>
                      <span className="text-[10px] text-stone-400 font-normal mr-auto">Régime</span>
                    </label>
                    <select
                      value={formData.scheduleType || 'continuous'}
                      onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as any })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                    >
                      <option value="continuous">توقيت مستمر مناصفة (وسط قروي/شبه حضري)</option>
                      <option value="intermittent">توقيت متقطع فترتين (وسط حضري)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: Thème & Personnalisation */}
            {/* ========================================================= */}
            {activeTab === 'theme' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    تخصيص الهوية البصرية الرسمية ينطبق تلقائياً على المذكرات اليومية، الخطاطات الذهنية، وجداول الحصص المطبوعة بصيغة PDF.
                  </span>
                </div>

                {/* Color Preset Palette */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>لوحة الألوان الرسمية:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {MAIN_COLOR_PRESETS.map((preset) => {
                      const isSelected = selectedColorId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedColorId(preset.id)}
                          className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                              : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-xl shadow-xs shrink-0 flex items-center justify-center text-white"
                              style={{ backgroundColor: preset.primary }}
                            >
                              {isSelected && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                                {preset.label}
                              </div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate max-w-[180px]">
                                {preset.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Arabic Font Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>الخط العربي المعتمد للطباعة:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ARABIC_FONT_PRESETS.slice(0, 6).map((font) => {
                      const isSelected = selectedArabicFont === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setSelectedArabicFont(font.id)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 font-black text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                              : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-750'
                          }`}
                        >
                          <div className="text-xs">{font.name}</div>
                          <div className="text-base mt-1 text-stone-600 dark:text-stone-400 font-normal">
                            المملكة المغربية
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Scale Preset */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>مقياس حجم الخط والكثافة:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_SCALE_PRESETS.slice(0, 3).map((scale) => {
                      const isSelected = selectedScale === scale.id;
                      return (
                        <button
                          key={scale.id}
                          type="button"
                          onClick={() => setSelectedScale(scale.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 font-black text-amber-900 dark:text-amber-200'
                              : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="text-xs">{scale.label}</div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {scale.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Header Preview Sample */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-2">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                    معاينة حية للترويسة الرسمية المطبوعة ببياناتك الحالية:
                  </span>
                  <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-between text-[11px]">
                    <div className="text-right">
                      <div className="font-bold text-stone-800 dark:text-stone-200">{formData.academy}</div>
                      <div className="text-stone-500 dark:text-stone-400 text-[10px]">{formData.direction}</div>
                      <div className="text-stone-700 dark:text-stone-300 font-medium text-[10px]">{formData.school}</div>
                    </div>
                    <div className="text-center font-black text-amber-600 dark:text-amber-400 text-xs">
                      المذكرة اليومية
                      <span className="block text-[9px] text-stone-400 font-normal">Journal de classe</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-stone-800 dark:text-stone-200">{formData.teacherName}</div>
                      <div className="text-stone-500 dark:text-stone-400 text-[10px]">{formData.level}</div>
                      <div className="text-stone-700 dark:text-stone-300 text-[10px]">{formData.classGroup}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: Sécurité, Confidentialité & À propos */}
            {/* ========================================================= */}
            {activeTab === 'security' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Security Overview */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>حماية البيانات والعزل التام (Zero-Trust Security)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    تُخزن جميع وثائقك ومذكراتك في قاعدة بيانات سحابية مشفرة ومعزولة حصرياً تحت معرف حسابك الفريد. لا يمكن لأي مستخدم آخر أو جهة خارجية الوصول إلى وثائقك.
                  </p>
                </div>

                {/* Legal & Policy Buttons */}
                <div className="space-y-2">
                  <span className="block text-xs font-black text-stone-700 dark:text-stone-300">
                    الوثائق القانونية وسياسات الاستخدام:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {onOpenPrivacyPolicy && (
                      <button
                        id="modal-open-privacy-btn"
                        type="button"
                        onClick={onOpenPrivacyPolicy}
                        className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-800 flex items-center justify-between text-stone-800 dark:text-stone-200 transition-all cursor-pointer text-xs font-bold"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <div>سياسة الخصوصية</div>
                            <div className="text-[10px] text-stone-400 font-normal">Politique de confidentialité</div>
                          </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-stone-400" />
                      </button>
                    )}

                    {onOpenTermsOfService && (
                      <button
                        id="modal-open-terms-btn"
                        type="button"
                        onClick={onOpenTermsOfService}
                        className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-800 flex items-center justify-between text-stone-800 dark:text-stone-200 transition-all cursor-pointer text-xs font-bold"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <div>شروط الاستخدام والإرشادات</div>
                            <div className="text-[10px] text-stone-400 font-normal">Conditions d'utilisation</div>
                          </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-stone-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* About Application Card */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-black text-stone-900 dark:text-stone-100">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>حول تطبيق «رائد | مساعد الأستاذ الرقمي» (À propos)</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                    منصة تربوية مخصصة لأساتذة التعليم الابتدائي بالمملكة المغربية، تم تطويرها لتيسير التخطيط الديداكتيكي وتوليد المذكرات اليومية والخطاطات الذهنية وجداول الحصص وفق مستجدات المنهاج ومقاربة مدارس الريادة (TaRL والتعليم الصريح).
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700 text-[10px] text-stone-500 dark:text-stone-400 flex-wrap gap-2">
                    <span>الإصدار: v2.4 (Morocco Pioneer Edition)</span>
                    <span className="font-mono">elhassane10safi@gmail.com</span>
                  </div>
                </div>

                {/* Danger Zone: Delete Account */}
                {onOpenDeleteAccount && (
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                    <button
                      id="modal-open-delete-account-btn"
                      type="button"
                      onClick={onOpenDeleteAccount}
                      className="w-full p-3 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-red-700 dark:text-red-300 transition-all cursor-pointer text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                        <div className="text-right">
                          <div>حذف الحساب والبيانات السحابية نهائياً</div>
                          <div className="text-[10px] text-red-500/80 font-normal">Supprimer le compte et toutes les données</div>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="save-profile-btn"
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتثبيت البيانات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
