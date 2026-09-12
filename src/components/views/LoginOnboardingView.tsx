import React, { useState, useEffect } from 'react';
import { TeacherProfile, UserAuthSession } from '../../types';
import { sanitizeObject, validateTeacherProfile } from '../../utils/security';
import {
  MOROCCAN_REGIONS_WITH_DIRECTORATES,
  MOROCCAN_REGIONS_LIST,
  getDirectoratesForRegion,
} from '../../data/moroccoRegionsDirectorates';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  auth,
} from '../../services/firebase';
import {
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
} from '../../services/firestoreService';
import { logTechnicalError, getUserFriendlyErrorMessage } from '../../utils/logger';
import {
  School,
  User,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Download,
  Smartphone,
  Laptop,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Building,
  Mail,
  Lock,
  Check,
  Compass,
  Calendar,
  Layers,
  HelpCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { PRIMARY_GRADE_LEVELS, formatAssignedLevelsLabel } from '../TeacherProfileModal';

interface LoginOnboardingViewProps {
  profile: TeacherProfile;
  onSaveProfile: (profile: TeacherProfile) => void;
  onComplete: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTermsOfService?: () => void;
}

export function LoginOnboardingView({
  profile,
  onSaveProfile,
  onComplete,
  onOpenPrivacyPolicy,
  onOpenTermsOfService,
}: LoginOnboardingViewProps) {
  // Step 1: 'login_download' | Step 2: 'teacher_profile'
  const [currentStep, setCurrentStep] = useState<'login_download' | 'teacher_profile'>('login_download');
  
  // Auth state
  const [authEmail, setAuthEmail] = useState<string>(() => {
    const savedAuth = localStorage.getItem('pioneer_auth_session');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        return parsed.email || 'elhassane10safi@gmail.com';
      } catch (e) {
        return 'elhassane10safi@gmail.com';
      }
    }
    return 'elhassane10safi@gmail.com';
  });
  const [authPassword, setAuthPassword] = useState<string>('');
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [authName, setAuthName] = useState<string>('ذ. الحسن الصافي');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Profile Form state
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
      userEmail: profile.userEmail || authEmail,
    };
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available directorates based on selected academy
  const availableDirectorates = getDirectoratesForRegion(formData.academy);

  const handleToggleLevel = (levelName: string) => {
    setFormData((prev) => {
      const current = prev.assignedLevels || (prev.level ? [prev.level] : ['المستوى الرابع ابتدائي']);
      let updated: string[];
      if (current.includes(levelName)) {
        if (current.length === 1) {
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

  // Listen for beforeinstallprompt event for PWA download
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // When academy changes, ensure direction updates to a valid directorate of that academy
  const handleAcademyChange = (newAcademy: string) => {
    const newDirectorates = getDirectoratesForRegion(newAcademy);
    setFormData((prev) => ({
      ...prev,
      academy: newAcademy,
      direction: newDirectorates[0] || '',
    }));
  };

  const handleDownloadApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsDownloaded(true);
      }
      setDeferredPrompt(null);
    } else {
      setIsDownloaded(true);
      const notify = document.createElement('div');
      notify.innerText = '✓ تم تجهيز التطبيق للتثبيت السريع والاستخدام بدون إنترنت (PWA Offline Ready)';
      notify.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-4 py-2 rounded-xl shadow-lg z-50';
      document.body.appendChild(notify);
      setTimeout(() => notify.remove(), 3500);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const user = await loginWithGoogle();
      const userEmail = user.email || authEmail || 'teacher@gmail.com';
      const userName = user.displayName || authName || 'الأستاذ(ة)';

      const authSession: UserAuthSession = {
        isLoggedIn: true,
        email: userEmail,
        name: userName,
        photoUrl: user.photoURL || undefined,
        provider: 'google',
        loginDate: new Date().toISOString(),
      };
      localStorage.setItem('pioneer_auth_session', JSON.stringify(authSession));

      // Check if this teacher already has a saved profile in Firestore
      const existingProfile = await getUserProfileFromFirestore(user.uid);
      if (existingProfile && existingProfile.school) {
        onSaveProfile(existingProfile);
        onComplete();
        return;
      }

      // If new profile needed, prepopulate name and email and move to step 2
      setFormData((prev) => ({
        ...prev,
        userEmail: userEmail,
        teacherName: userName || prev.teacherName,
      }));

      setIsLoggingIn(false);
      setCurrentStep('teacher_profile');
    } catch (err: any) {
      logTechnicalError('auth', err, { method: 'google_signin' });
      setIsLoggingIn(false);
      setLoginError(getUserFriendlyErrorMessage(err, 'auth', 'حدث خطأ أثناء تسجيل الدخول بواسطة Google. يرجى المحاولة مرة أخرى.'));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setLoginError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      let user;
      if (isRegisterMode) {
        user = await registerWithEmail(authEmail, authPassword, authName);
      } else {
        user = await loginWithEmail(authEmail, authPassword);
      }

      const userEmail = user.email || authEmail;
      const userName = user.displayName || authName || 'الأستاذ(ة)';

      const authSession: UserAuthSession = {
        isLoggedIn: true,
        email: userEmail,
        name: userName,
        provider: 'google',
        loginDate: new Date().toISOString(),
      };
      localStorage.setItem('pioneer_auth_session', JSON.stringify(authSession));

      const existingProfile = await getUserProfileFromFirestore(user.uid);
      if (existingProfile && existingProfile.school) {
        onSaveProfile(existingProfile);
        onComplete();
        return;
      }

      setFormData((prev) => ({
        ...prev,
        userEmail: userEmail,
        teacherName: userName || prev.teacherName,
      }));

      setIsLoggingIn(false);
      setCurrentStep('teacher_profile');
    } catch (err: any) {
      logTechnicalError('auth', err, { method: isRegisterMode ? 'email_register' : 'email_login', email: authEmail });
      setIsLoggingIn(false);
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setLoginError('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.');
      } else if (err?.code === 'auth/weak-password') {
        setLoginError('كلمة المرور ضعيفة. يجب أن تتكون من 6 أحرف على الأقل.');
      } else {
        setLoginError(getUserFriendlyErrorMessage(err, 'auth', 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.'));
      }
    }
  };

  const handleGuestLogin = () => {
    const authSession: UserAuthSession = {
      isLoggedIn: true,
      email: 'professeur.pionnier@gmail.com',
      name: 'أستاذ(ة) مستخدم',
      provider: 'guest',
      loginDate: new Date().toISOString(),
    };
    localStorage.setItem('pioneer_auth_session', JSON.stringify(authSession));
    setCurrentStep('teacher_profile');
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeObject(formData);
    const validation = validateTeacherProfile(sanitized);

    if (!validation.isValid) {
      setErrorMessage(validation.errors[0]);
      return;
    }

    setErrorMessage(null);

    // Save to Firestore if current user is logged in
    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      try {
        await saveUserProfileToFirestore(currentUser.uid, sanitized);
      } catch (err) {
        console.warn('Could not sync profile to Firestore immediately:', err);
      }
    }

    onSaveProfile(sanitized);
    onComplete();
  };

  const handleQuickDemo = async () => {
    const demoProfile: TeacherProfile = {
      userEmail: authEmail || 'elhassane10safi@gmail.com',
      academy: 'جهة مراكش - آسفي',
      direction: 'المديرية الإقليمية باليوسفية',
      school: 'مجموعة مدارس الريادة النموذجية',
      teacherName: 'الأستاذ(ة) الحسن الصافي',
      level: 'المستوى الرابع ابتدائي',
      classGroup: 'الفوج 1',
      specialty: 'bilingual',
      teachingMode: 'bilingual',
      areaType: 'rural',
      scheduleType: 'continuous',
      continuousMorningDays: ['الإثنين', 'الأربعاء', 'الجمعة'],
      schoolStartDate: '2026-09-08',
      academicYear: '2026 - 2027',
    };

    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      try {
        await saveUserProfileToFirestore(currentUser.uid, demoProfile);
      } catch (err) {
        console.warn('Demo profile save warning:', err);
      }
    }

    const authSession: UserAuthSession = {
      isLoggedIn: true,
      email: demoProfile.userEmail || 'elhassane10safi@gmail.com',
      name: demoProfile.teacherName,
      provider: currentUser ? 'google' : 'guest',
      loginDate: new Date().toISOString(),
    };
    localStorage.setItem('pioneer_auth_session', JSON.stringify(authSession));

    onSaveProfile(demoProfile);
    onComplete();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6" dir="rtl">
      <div className="max-w-2xl w-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-all">
        {/* Top Moroccan Header Banner */}
        <div className="bg-gradient-to-l from-amber-600 via-amber-700 to-amber-800 p-6 sm:p-7 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-black text-2xl border border-white/30 shadow-inner">
                ر
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black">رائد | مساعد الأستاذ الرقمي</h1>
                  <span className="text-[10px] bg-white/25 border border-white/40 px-2.5 py-0.5 rounded-full font-bold">
                    تطبيق تربوي مستقل
                  </span>
                </div>
                <p className="text-xs text-amber-100 font-medium mt-0.5">
                  مساعدك الرقمي لإعداد وتوليد المذكرات، الخطاطات، جداول الحصص وشبكات التقويم باحترافية وسهولة
                </p>
              </div>
            </div>

            {/* Stepper Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold border border-white/20">
              <span className={currentStep === 'login_download' ? 'text-amber-200' : 'text-stone-300'}>
                1. تسجيل الدخول
              </span>
              <span className="opacity-50">←</span>
              <span className={currentStep === 'teacher_profile' ? 'text-amber-200' : 'text-stone-300'}>
                2. بطاقة الأستاذ
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: LOGIN & DOWNLOAD APPLICATION */}
        {currentStep === 'login_download' && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            {/* Title & Introduction */}
            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">
                مرحباً بكم في منصة رائد للتعليم الابتدائي
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                سجل الدخول بحسابك في Google للحفاظ على بياناتك ومزامنتها سحابياً بأمان واستقلالية
              </p>
            </div>

            {/* App Download / PWA Box */}
            <div className="bg-amber-50/70 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                      تنزيل وتثبيت التطبيق على الحاسوب والهاتف
                    </h3>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded-full">
                      PWA Offline
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                    يعمل التطبيق بكفاءة عالية وبدون إنترنت في قاعات الدرس والوسط القروي
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-download-app-pwa"
                onClick={handleDownloadApp}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-100 text-white dark:text-stone-900 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
              >
                {isDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>تم تثبيت التطبيق</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>تنزيل التطبيق الآن</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message if any */}
            {loginError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Google Sign In Section */}
            <div className="space-y-4 pt-1">
              <label className="block text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>تسجيل الدخول الموصى به عبر حساب Google:</span>
              </label>

              {/* Primary Google Sign-In Button */}
              <button
                type="button"
                id="btn-login-with-google"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 active:scale-[0.99] text-stone-800 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 rounded-2xl font-black text-sm shadow-xs hover:border-amber-500 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span>
                  {isLoggingIn ? 'جاري فتح نافذة المصادقة...' : 'تسجيل الدخول المباشر بواسطة Google'}
                </span>
                <ArrowLeft className="w-4 h-4 mr-auto text-stone-400" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تخزين مشفر ومحمي بقواعد أمان Firebase Firestore</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  {showEmailForm ? 'إخفاء الدخول بالبريد وكلمة المرور' : 'أو الدخول بالبريد وكلمة المرور'}
                </button>
              </div>

              {/* Collapsible Email/Password Form */}
              {showEmailForm && (
                <form onSubmit={handleEmailAuth} className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {isRegisterMode ? 'إنشاء حساب جديد بالبريد الإلكتروني' : 'تسجيل الدخول بالبريد وكلمة المرور'}
                  </div>

                  {isRegisterMode && (
                    <div>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="الاسم الكامل للأستاذ(ة)"
                        className="w-full px-3.5 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-bold"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-semibold"
                      dir="ltr"
                    />
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="كلمة المرور (6 أحرف فأكثر)"
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-semibold"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(!isRegisterMode)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                    >
                      {isRegisterMode ? 'لديك حساب بالفعل؟ سجل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-black hover:bg-stone-800 cursor-pointer"
                    >
                      {isLoggingIn ? 'جاري التحقق...' : isRegisterMode ? 'إنشاء حساب ومتابعة' : 'دخول'}
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Guest Alternative */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-bold transition-colors cursor-pointer"
                >
                  الدخول كأستاذ ضيف
                </button>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="text-amber-700 dark:text-amber-400 hover:underline font-black flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تخطي والبدء ببيانات تجريبية مكتملة</span>
                </button>
              </div>

              {/* Privacy & Terms Note */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-850 flex items-center justify-center gap-3 text-[11px] text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>بياناتك معزولة ومحمية</span>
                </span>
                <span>•</span>
                {onOpenPrivacyPolicy && (
                  <button
                    type="button"
                    onClick={onOpenPrivacyPolicy}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 underline font-medium cursor-pointer"
                  >
                    سياسة الخصوصية
                  </button>
                )}
                {onOpenTermsOfService && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={onOpenTermsOfService}
                      className="hover:text-amber-600 dark:hover:text-amber-400 underline font-medium cursor-pointer"
                    >
                      شروط الاستخدام
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INSTRUCTOR PROFILE & REGIONAL ACADEMY / DIRECTORATE SELECTION */}
        {currentStep === 'teacher_profile' && (
          <form onSubmit={handleSubmitProfile} className="p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
            {/* Header of Step 2 */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  <span>بطاقة الأستاذ(ة) والمعطيات الإدارية والتربوية</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  تُحدد هذه البيانات ترويسة الوثائق، وتوزيع الحصص، والمقررات حسب جهتك ومديريتك
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('login_download')}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
              >
                <span>تغيير الحساب</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl font-bold flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Teacher Name & Gmail Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-stone-800 dark:text-stone-200 mb-1.5">
                  اسم الأستاذ(ة) الكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    id="input-teacher-name"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    placeholder="مثال: ذ. الحسن الصافي"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-750 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-right"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-800 dark:text-stone-200 mb-1.5">
                  البريد الإلكتروني المرتبط (Google)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={formData.userEmail || authEmail}
                    className="w-full px-3.5 py-2.5 bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 text-left outline-none cursor-not-allowed pl-9"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* DYNAMICALLY LINKED: ACADEMY (12 REGIONS) & PROVINCIAL DIRECTORATE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-850">
              {/* 1. Regional Academy Dropdown */}
              <div>
                <label className="block text-xs font-black text-stone-900 dark:text-stone-100 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>الأكاديمية الجهوية (الجهة) <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={formData.academy}
                  onChange={(e) => handleAcademyChange(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:border-amber-500 outline-none cursor-pointer font-bold"
                >
                  {MOROCCAN_REGIONS_WITH_DIRECTORATES.map((region) => (
                    <option key={region.id} value={region.regionName}>
                      {region.regionName} ({region.capital})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Provincial Directorate Dropdown */}
              <div>
                <label className="block text-xs font-black text-stone-900 dark:text-stone-100 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-600" />
                  <span>المديرية الإقليمية <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:border-amber-500 outline-none cursor-pointer font-bold"
                >
                  {availableDirectorates.map((dir) => (
                    <option key={dir} value={dir}>
                      {dir}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* School & Teaching Level */}
            <div>
              <label className="block text-xs font-black text-stone-800 dark:text-stone-200 mb-1.5">
                المؤسسة التعليمية <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="input-school-name"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="مثال: مدرسة الريادة النموذجية"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-750 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-right"
                />
                <School className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Assigned Level(s) - Single or Multiple Selection */}
            <div className="bg-stone-50 dark:bg-stone-850/70 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>المستوى الدراسي المسند والمستويات المسندة:</span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">
                    (مستوى واحد أو عدة مستويات)
                  </span>
                </label>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50">
                  {(formData.assignedLevels || []).length > 1
                    ? `✓ تم تحديد ${(formData.assignedLevels || []).length} مستويات`
                    : `✓ مستوى واحد مسند`}
                </span>
              </div>

              {/* Interactive Level Cards (1 to 6) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRIMARY_GRADE_LEVELS.map((lvl) => {
                  const isSelected = (formData.assignedLevels || [formData.level]).includes(lvl.name);
                  return (
                    <button
                      key={lvl.grade}
                      type="button"
                      onClick={() => handleToggleLevel(lvl.name)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/25 dark:bg-amber-600 dark:border-amber-500'
                          : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:border-amber-400'
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

              {/* Quick Presets */}
              <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 ml-1">
                  نماذج جاهزة:
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyPresetLevels(['المستوى الأول ابتدائي', 'المستوى الثاني ابتدائي'])}
                  className="px-2 py-0.5 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  مشترك (1+2)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetLevels(['المستوى الثالث ابتدائي', 'المستوى الرابع ابتدائي'])}
                  className="px-2 py-0.5 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  مشترك (3+4)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetLevels(['المستوى الخامس ابتدائي', 'المستوى السادس ابتدائي'])}
                  className="px-2 py-0.5 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  مشترك (5+6)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetLevels(['المستوى الرابع ابتدائي', 'المستوى الخامس ابتدائي', 'المستوى السادس ابتدائي'])}
                  className="px-2 py-0.5 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  تخصص عليا (4+5+6)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetLevels(PRIMARY_GRADE_LEVELS.map((g) => g.name))}
                  className="px-2 py-0.5 text-[11px] font-bold bg-stone-200/70 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  جميع المستويات (1-6)
                </button>
              </div>

              {/* Level summary input */}
              <div className="pt-1">
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
            </div>

            {/* Teaching Mode & Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-stone-800 dark:text-stone-200 mb-1.5">
                  صيغة العمل ونمط التدريس
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
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="bilingual">أستاذ مزدوج / شامل (جميع المواد لنفس الفوج)</option>
                  <option value="binome_french_math">أستاذ فرنسية ورياضيات بالتفويج (فوج 1 وفوج 2)</option>
                  <option value="binome_arabic">أستاذ لغة عربية بالتفويج (فوج 1 وفوج 2)</option>
                  <option value="specialist_arabic">تخصص مادة وحيدة: لغة عربية</option>
                  <option value="specialist_french">تخصص مادة وحيدة: لغة فرنسية</option>
                  <option value="specialist_math">تخصص مادة وحيدة: رياضيات</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-800 dark:text-stone-200 mb-1.5">
                  الفوج / القسم
                </label>
                <input
                  type="text"
                  value={formData.classGroup}
                  onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
                  placeholder="مثال: الفوج 1"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Submit & Start Using App */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
              <button
                type="submit"
                id="btn-complete-onboarding-profile"
                className="w-full sm:w-auto px-7 py-3 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>حفظ ومتابعة إلى المنصة الرئيسية</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
