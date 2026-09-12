import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SavedDocumentPackage,
  DocumentCategoryType,
} from '../../types';
import {
  Search,
  Calendar,
  Layers,
  Trash2,
  ExternalLink,
  Printer,
  Download,
  Upload,
  BookOpen,
  Calculator,
  Globe,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  PlusCircle,
  FileText,
  Copy,
  Sparkles,
  Edit3,
  Filter,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Tag,
  GraduationCap,
  FolderOpen,
  WifiOff,
  MoreVertical,
  LayoutGrid,
  List,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SavedArchiveViewProps {
  savedPackages: SavedDocumentPackage[];
  currentUserId?: string;
  currentUserName?: string;
  isSyncing?: boolean;
  onOpenDoc: (doc: SavedDocumentPackage) => void;
  onEditDoc?: (doc: SavedDocumentPackage) => void;
  onDeleteDoc: (id: string) => void;
  onDuplicateDoc?: (doc: SavedDocumentPackage) => void;
  onRegenerateOrEnhance?: (doc: SavedDocumentPackage, directive?: string) => void;
  onExportPdf?: (doc: SavedDocumentPackage) => void;
  onImportBackup: (packages: SavedDocumentPackage[]) => void;
  onStartNewDay: () => void;
  onRefreshCloud?: () => void;
}

export function SavedArchiveView({
  savedPackages,
  currentUserId,
  currentUserName,
  isSyncing = false,
  onOpenDoc,
  onEditDoc,
  onDeleteDoc,
  onDuplicateDoc,
  onRegenerateOrEnhance,
  onExportPdf,
  onImportBackup,
  onStartNewDay,
  onRefreshCloud,
}: SavedArchiveViewProps) {
  // View Layout Mode: 'grid' (cards) or 'table' (list)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | DocumentCategoryType>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Mobile Filter Drawer / Collapse State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileMoreActionsOpen, setIsMobileMoreActionsOpen] = useState(false);

  // Active Dropdown Menu per card (ID of package with open menu)
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Confirmation & Modal States
  const [deleteModalPkg, setDeleteModalPkg] = useState<SavedDocumentPackage | null>(null);
  const [enhanceModalPkg, setEnhanceModalPkg] = useState<SavedDocumentPackage | null>(null);
  const [customEnhancePrompt, setCustomEnhancePrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Online / Offline monitor
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close active dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuDocId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category Tabs Configuration
  const categoryTabs: Array<{
    id: 'all' | DocumentCategoryType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }> = useMemo(() => {
    const getCount = (type: 'all' | DocumentCategoryType) => {
      if (type === 'all') return savedPackages.length;
      return savedPackages.filter((p) => (p.docType || 'daily_journal') === type).length;
    };

    return [
      { id: 'all', label: 'جميع الوثائق', icon: FolderOpen, count: getCount('all') },
      { id: 'daily_journal', label: 'المذكرات اليومية', icon: FileSpreadsheet, count: getCount('daily_journal') },
      { id: 'mind_map', label: 'الخطاطات الذهنية', icon: BookOpen, count: getCount('mind_map') },
      { id: 'lesson_plan', label: 'الجذاذات التربوية', icon: FileText, count: getCount('lesson_plan') },
      { id: 'evaluation', label: 'التقويمات والشبكات', icon: CheckCircle, count: getCount('evaluation') },
      { id: 'remediation', label: 'أنشطة الدعم (TaRL)', icon: Sparkles, count: getCount('remediation') },
      { id: 'other', label: 'وثائق أخرى', icon: Layers, count: getCount('other') },
    ];
  }, [savedPackages]);

  // Extract unique subjects and levels for filter dropdowns
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    savedPackages.forEach((pkg) => {
      if (pkg.subject) set.add(pkg.subject);
    });
    return Array.from(set);
  }, [savedPackages]);

  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    savedPackages.forEach((pkg) => {
      if (pkg.level) set.add(pkg.level);
    });
    return Array.from(set);
  }, [savedPackages]);

  // Filtered & Sorted Packages
  const filteredPackages = useMemo(() => {
    let result = savedPackages.filter((pkg) => {
      // 1. Filter by category type
      const pkgType = pkg.docType || 'daily_journal';
      if (selectedType !== 'all' && pkgType !== selectedType) {
        return false;
      }

      // 2. Filter by subject
      if (selectedSubject !== 'all' && pkg.subject !== selectedSubject) {
        return false;
      }

      // 3. Filter by level
      if (selectedLevel !== 'all' && pkg.level !== selectedLevel) {
        return false;
      }

      // 4. Search query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = pkg.title?.toLowerCase().includes(q);
        const matchesSubject = pkg.subject?.toLowerCase().includes(q);
        const matchesLevel = pkg.level?.toLowerCase().includes(q);
        const matchesDate = pkg.date?.toLowerCase().includes(q);
        const matchesUnit = pkg.unitOrLesson?.toLowerCase().includes(q);
        const matchesArabic = pkg.arabicMap?.lessonTitle?.toLowerCase().includes(q);
        const matchesMath = pkg.mathMap?.lessonTitle?.toLowerCase().includes(q);
        const matchesFrench = pkg.frenchMap?.lessonTitle?.toLowerCase().includes(q);
        const matchesNotes = pkg.notes?.toLowerCase().includes(q);

        if (
          !matchesTitle &&
          !matchesSubject &&
          !matchesLevel &&
          !matchesDate &&
          !matchesUnit &&
          !matchesArabic &&
          !matchesMath &&
          !matchesFrench &&
          !matchesNotes
        ) {
          return false;
        }
      }

      return true;
    });

    // Sort result
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.updatedAt || a.createdAt || a.date || '';
        const timeB = b.updatedAt || b.createdAt || b.date || '';
        return timeB.localeCompare(timeA);
      }
      if (sortBy === 'oldest') {
        const timeA = a.createdAt || a.date || '';
        const timeB = b.createdAt || b.date || '';
        return timeA.localeCompare(timeB);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '', 'ar');
      }
      return 0;
    });

    return result;
  }, [savedPackages, selectedType, selectedSubject, selectedLevel, searchQuery, sortBy]);

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = JSON.stringify(savedPackages, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل_الوثائق_رائد_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsMobileMoreActionsOpen(false);
  };

  // Feedback and error state
  const [actionFeedback, setActionFeedback] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const showActionFeedback = (text: string, type: 'error' | 'success' = 'success') => {
    setActionFeedback({ text, type });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
          showActionFeedback(`تم استيراد ${parsed.length} وثيقة بنجاح!`, 'success');
          setIsMobileMoreActionsOpen(false);
        } else {
          showActionFeedback('الملف المحدد لا يحتوي على صيغة مصفوفة وثائق رائد صالحة.', 'error');
        }
      } catch (err) {
        showActionFeedback('تعذر قراءة ملف النسخة الاحتياطية. يرجى التأكد من اختيار ملف JSON سليم وغير تالف.', 'error');
      }
    };
    reader.onerror = () => {
      showActionFeedback('تعذر قراءة الملف من الجهاز. يرجى المحاولة مجدداً.', 'error');
    };
    reader.readAsText(file);
  };

  // Helper for Category Label and Colors
  const getCategoryBadge = (type?: DocumentCategoryType) => {
    switch (type) {
      case 'daily_journal':
        return {
          label: 'مذكرة يومية',
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: FileSpreadsheet,
        };
      case 'mind_map':
        return {
          label: 'خطاطة ذهنية',
          bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: BookOpen,
        };
      case 'lesson_plan':
        return {
          label: 'جذاذة تربوية',
          bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: FileText,
        };
      case 'evaluation':
        return {
          label: 'شبكة تقويم',
          bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: CheckCircle,
        };
      case 'remediation':
        return {
          label: 'أنشطة دعم',
          bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: Sparkles,
        };
      default:
        return {
          label: 'وثيقة تربوية',
          bg: 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700',
          icon: Layers,
        };
    }
  };

  // Trigger Enhance
  const handleConfirmEnhance = async () => {
    if (!enhanceModalPkg) return;
    setIsEnhancing(true);
    try {
      if (onRegenerateOrEnhance) {
        await onRegenerateOrEnhance(enhanceModalPkg, customEnhancePrompt);
      }
      setEnhanceModalPkg(null);
      setCustomEnhancePrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSubject !== 'all' ||
    selectedLevel !== 'all' ||
    sortBy !== 'newest';

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Action / Error Feedback Notification */}
      {actionFeedback && (
        <div
          className={`rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold shadow-md transition-all ${
            actionFeedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Offline Alert Banner if Internet Disconnected */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-2 border-amber-500 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              أنت تعمل حالياً دون اتصال بالإنترنت. يمكنك استعراض وتحميل الوثائق المخزنة محلياً، وستتم المزامنة تلقائياً فور عودة الاتصال.
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MAIN HUB HEADER - RESPONSIVE FOR MOBILE & DESKTOP                     */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Header Title & Account Info */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-2xs shrink-0">
                <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>سجل الوثائق والمذكرات</span>
                  {isSyncing && (
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span className="hidden sm:inline">جاري المزامنة السحابية...</span>
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>مربوط بالسحابة:</span>
                  </span>
                  <span className="font-mono text-[11px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                    {currentUserId ? `UID: ${currentUserId.slice(0, 8)}...` : 'مستخدم محلي'}
                  </span>
                  {currentUserName && (
                    <span className="font-medium text-stone-600 dark:text-stone-300">
                      ({currentUserName})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Responsive mobile flow vs desktop bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100 dark:border-stone-800">
            {/* Primary Action Button (New Document) */}
            <button
              type="button"
              onClick={onStartNewDay}
              id="btn-archive-new-document"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white px-5 py-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-xs transition-all cursor-pointer min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>إنشاء وثيقة جديدة</span>
            </button>

            {/* Desktop Quick Secondary Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {onRefreshCloud && (
                <button
                  type="button"
                  onClick={onRefreshCloud}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-200 dark:border-stone-700 min-h-[40px]"
                  title="تحديث ومزامنة السجل من السحابة"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>تحديث السجل</span>
                </button>
              )}

              <label className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-200 dark:border-stone-700 min-h-[40px]">
                <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>استيراد نسخة</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleExportBackup}
                disabled={savedPackages.length === 0}
                className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-200 dark:border-stone-700 disabled:opacity-50 min-h-[40px]"
                title="تصدير نسخة احتياطية بصيغة JSON"
              >
                <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>تصدير JSON</span>
              </button>
            </div>

            {/* Mobile Secondary Actions Collapsible Trigger */}
            <div className="sm:hidden relative">
              <button
                type="button"
                onClick={() => setIsMobileMoreActionsOpen((prev) => !prev)}
                className="w-full flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 py-2.5 px-4 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 min-h-[44px] cursor-pointer"
              >
                <span>أدوات النسخ الاحتياطي والمزامنة</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMoreActionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMobileMoreActionsOpen && (
                <div className="mt-2 p-3 bg-stone-50 dark:bg-stone-800/90 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2 animate-in fade-in">
                  {onRefreshCloud && (
                    <button
                      type="button"
                      onClick={() => {
                        onRefreshCloud();
                        setIsMobileMoreActionsOpen(false);
                      }}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-2.5 text-right px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 min-h-[44px]"
                    >
                      <RefreshCw className={`w-4 h-4 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>تحديث المزامنة السحابية</span>
                    </button>
                  )}

                  <label className="w-full flex items-center gap-2.5 text-right px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 min-h-[44px] cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>استيراد نسخة احتياطية (JSON)</span>
                    <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    disabled={savedPackages.length === 0}
                    className="w-full flex items-center gap-2.5 text-right px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 min-h-[44px] disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-amber-600" />
                    <span>تصدير السجل كملف JSON</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CATEGORY TABS & VIEW SWITCHER                                         */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        {/* Mobile Category Grid (Fully visible, responsive 2/3 columns without horizontal hidden overflow) */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:hidden gap-2">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs ring-2 ring-amber-500/20'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop & Tablet Category Bar with View Switcher */}
        <div className="hidden sm:flex sm:items-center sm:justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedType(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer min-h-[40px] ${
                    isActive
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher for Desktop / Tablet */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-200 dark:border-stone-700 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="عرض البطاقات الشبكية"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="عرض الجدول التفاعلي التفصيلي"
            >
              <List className="w-3.5 h-3.5" />
              <span>جدول تفصيلي</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & FILTERS TOOLBAR                                               */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
        {/* Mobile Search Row with Filter Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالعنوان، المادة، المستوى، الدرس، أو التاريخ..."
              className="w-full pl-8 pr-9 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl sm:rounded-2xl text-xs font-medium text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right transition-all min-h-[44px]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen((prev) => !prev)}
            className={`sm:hidden flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[44px] ${
              hasActiveFilters
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
          >
            <Filter className="w-4 h-4 text-amber-600" />
            <span className="hidden xs:inline">فلاتر</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            )}
            {isMobileFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dropdowns for Desktop (always visible) and Mobile (collapsible) */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 ${isMobileFilterOpen ? 'block' : 'hidden sm:grid'}`}>
          {/* 1. Subject Filter */}
          <div>
            <label className="block sm:hidden text-[11px] font-bold text-stone-500 mb-1">تصفية حسب المادة:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl sm:rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer min-h-[42px]"
            >
              <option value="all">كل المواد ({availableSubjects.length || 'عام'})</option>
              <option value="اللغة العربية">اللغة العربية</option>
              <option value="الرياضيات">الرياضيات</option>
              <option value="Français">Français</option>
              <option value="النشاط العلمي">النشاط العلمي</option>
              <option value="متعدد التخصصات">متعدد التخصصات</option>
              {availableSubjects
                .filter(
                  (s) =>
                    !['اللغة العربية', 'الرياضيات', 'Français', 'النشاط العلمي', 'متعدد التخصصات'].includes(s)
                )
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>

          {/* 2. Level Filter */}
          <div>
            <label className="block sm:hidden text-[11px] font-bold text-stone-500 mb-1">تصفية حسب المستوى:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl sm:rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer min-h-[42px]"
            >
              <option value="all">كل المستويات الدراسية</option>
              <option value="الأول">المستوى الأول</option>
              <option value="الثاني">المستوى الثاني</option>
              <option value="الثالث">المستوى الثالث</option>
              <option value="الرابع">المستوى الرابع</option>
              <option value="الخامس">المستوى الخامس</option>
              <option value="السادس">المستوى السادس</option>
              {availableLevels
                .filter((l) => !['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'].includes(l))
                .map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
            </select>
          </div>

          {/* 3. Sort Order */}
          <div>
            <label className="block sm:hidden text-[11px] font-bold text-stone-500 mb-1">الترتيب:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl sm:rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer min-h-[42px]"
            >
              <option value="newest">الترتيب: الأحدث تاريخاً وتعديلاً</option>
              <option value="oldest">الترتيب: الأقدم تاريخاً</option>
              <option value="title">الترتيب: أبجدياً حسب العنوان</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
            <span>
              عرض <strong>{filteredPackages.length}</strong> من أصل <strong>{savedPackages.length}</strong> وثيقة
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedSubject('all');
                setSelectedLevel('all');
                setSortBy('newest');
              }}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء جميع الفلاتر</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA (EMPTY STATES / GRID / TABLE)                        */}
      {/* ========================================================================= */}
      {savedPackages.length === 0 ? (
        /* Global Empty State - No documents saved yet */
        <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border-2 border-dashed border-stone-300 dark:border-stone-700 transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
            لم تحفظ أي وثائق بعد
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto leading-relaxed">
            مرحباً بك أستاذي الفاضل! ابدأ بتحضير يوم دراسي جديد وتوليد المذكرة والخطاطات الذهنية والجذاذات وحفظها في حسابك السحابي الآمن.
          </p>
          <button
            type="button"
            onClick={onStartNewDay}
            className="mt-6 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>إنشاء وثيقة جديدة الآن</span>
          </button>
        </div>
      ) : filteredPackages.length === 0 ? (
        /* Filtered Empty State - Search returned nothing */
        <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-stone-200 dark:border-stone-800 transition-colors">
          <FileText className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200">
            لا توجد وثائق مطابقة لمعايير البحث أو التصفية
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            جرب تغيير كلمات البحث أو إعادة ضبط خيارات المادة والمستوى.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedSubject('all');
              setSelectedLevel('all');
              setSortBy('newest');
            }}
            className="mt-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer border border-stone-200 dark:border-stone-700 min-h-[40px]"
          >
            <span>إعادة ضبط الفلاتر</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ======================================================================= */
        /* 4A. DESKTOP RICH TABLE / LIST VIEW                                      */
        /* ======================================================================= */
        <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 text-[11px] font-black text-stone-600 dark:text-stone-400">
                  <th className="py-3.5 px-4">نوع الوثيقة</th>
                  <th className="py-3.5 px-4">عنوان الوثيقة والدرس</th>
                  <th className="py-3.5 px-4">المستوى والمادة</th>
                  <th className="py-3.5 px-4">المكونات</th>
                  <th className="py-3.5 px-4">التاريخ والتعديل</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-xs">
                {filteredPackages.map((pkg) => {
                  const badge = getCategoryBadge(pkg.docType);
                  const BadgeIcon = badge.icon;
                  const createdDateStr = pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('ar-MA') : pkg.date;

                  return (
                    <tr
                      key={pkg.id}
                      className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors group"
                    >
                      {/* 1. Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-black border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* 2. Title & Lesson */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {pkg.title || 'وثيقة تربوية'}
                        </div>
                        {pkg.unitOrLesson && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium truncate max-w-xs mt-0.5">
                            الدرس: {pkg.unitOrLesson}
                          </div>
                        )}
                      </td>

                      {/* 3. Level & Subject */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {pkg.level && (
                            <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
                              {pkg.level}
                            </span>
                          )}
                          {pkg.subject && (
                            <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-200/50 dark:border-amber-800/50">
                              {pkg.subject}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Sub-components */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {pkg.dailyJournal && (
                            <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-1.5 py-0.5 rounded font-medium">
                              مذكرة ({pkg.dailyJournal.preBreakSessions?.length || 0} + {pkg.dailyJournal.postBreakSessions?.length || 0})
                            </span>
                          )}
                          {pkg.arabicMap?.lessonTitle && (
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                              خ.ذ عربي
                            </span>
                          )}
                          {pkg.mathMap?.lessonTitle && (
                            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                              خ.ذ رياضيات
                            </span>
                          )}
                          {pkg.frenchMap?.lessonTitle && (
                            <span className="text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium">
                              خ.ذ فرنسية
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-stone-500 dark:text-stone-400 text-[11px]">
                        <div className="flex items-center gap-1 font-bold text-stone-700 dark:text-stone-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>{pkg.date || pkg.dayName || '-'}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          حفظ: {createdDateStr}
                        </div>
                      </td>

                      {/* 6. Action Toolbar in Row */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Open */}
                          <button
                            type="button"
                            onClick={() => onOpenDoc(pkg)}
                            className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all cursor-pointer shadow-2xs"
                            title="فتح ومعاينة الوثيقة"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => (onEditDoc ? onEditDoc(pkg) : onOpenDoc(pkg))}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-all cursor-pointer"
                            title="تعديل الخانات"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Export PDF */}
                          <button
                            type="button"
                            onClick={() => (onExportPdf ? onExportPdf(pkg) : onOpenDoc(pkg))}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-all cursor-pointer"
                            title="تصدير PDF"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          </button>

                          {/* Duplicate */}
                          {onDuplicateDoc && (
                            <button
                              type="button"
                              onClick={() => onDuplicateDoc(pkg)}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-all cursor-pointer"
                              title="إنشاء نسخة مكررة"
                            >
                              <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </button>
                          )}

                          {/* Gemini Enhance */}
                          {onRegenerateOrEnhance && (
                            <button
                              type="button"
                              onClick={() => {
                                setEnhanceModalPkg(pkg);
                                setCustomEnhancePrompt('');
                              }}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg transition-all cursor-pointer"
                              title="تحسين بـ Gemini"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalPkg(pkg)}
                            className="p-1.5 bg-stone-100 hover:bg-red-50 dark:bg-stone-800 dark:hover:bg-red-950/40 text-stone-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all cursor-pointer"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================================================================= */
        /* 4B. RESPONSIVE CARDS GRID VIEW                                          */
        /* ======================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredPackages.map((pkg) => {
            const badge = getCategoryBadge(pkg.docType);
            const BadgeIcon = badge.icon;
            const createdDateStr = pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('ar-MA') : pkg.date;
            const isMenuOpen = activeMenuDocId === pkg.id;

            return (
              <div
                key={pkg.id}
                className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Header: Badge, Date, and Options Menu */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-black border ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 dark:text-stone-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{pkg.date || pkg.dayName || 'اليوم'}</span>
                      </div>

                      {/* Dropdown Options Button "⋮" */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuDocId(isMenuOpen ? null : pkg.id);
                          }}
                          className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="خيارات إضافية"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Floating Options Menu */}
                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute left-0 top-full mt-1.5 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in text-right"
                          >
                            {/* Export PDF */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuDocId(null);
                                if (onExportPdf) onExportPdf(pkg);
                                else onOpenDoc(pkg);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4 text-amber-600" />
                              <span>تصدير PDF للطباعة</span>
                            </button>

                            {/* Duplicate */}
                            {onDuplicateDoc && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuDocId(null);
                                  onDuplicateDoc(pkg);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
                              >
                                <Copy className="w-4 h-4 text-blue-600" />
                                <span>إنشاء نسخة مكررة</span>
                              </button>
                            )}

                            {/* Gemini Enhance */}
                            {onRegenerateOrEnhance && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuDocId(null);
                                  setEnhanceModalPkg(pkg);
                                  setCustomEnhancePrompt('');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span>تحسين بـ Gemini</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuDocId(null);
                                setDeleteModalPkg(pkg);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>حذف الوثيقة</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100 line-clamp-1 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {pkg.title || 'وثيقة تربوية'}
                  </h3>

                  {/* Metadata Tags: Level, Subject, Unit/Lesson */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                    {pkg.level && (
                      <span className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-lg border border-stone-200 dark:border-stone-700 font-bold">
                        <GraduationCap className="w-3 h-3 text-amber-600" />
                        <span>المستوى: {pkg.level}</span>
                      </span>
                    )}

                    {pkg.subject && (
                      <span className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-lg border border-stone-200 dark:border-stone-700 font-bold">
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>{pkg.subject}</span>
                      </span>
                    )}

                    {pkg.unitOrLesson && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/60 font-bold max-w-[200px] truncate">
                        <span>الدرس: {pkg.unitOrLesson}</span>
                      </span>
                    )}
                  </div>

                  {/* Sub-components Summary Box */}
                  <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-stone-100 dark:border-stone-800 mb-3.5">
                    {pkg.dailyJournal && (
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate font-medium">
                          المذكرة اليومية ({pkg.dailyJournal.preBreakSessions?.length || 0} + {pkg.dailyJournal.postBreakSessions?.length || 0} حصص)
                        </span>
                      </div>
                    )}
                    {pkg.arabicMap?.lessonTitle && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate font-medium">خ.ذ العربية: {pkg.arabicMap.lessonTitle}</span>
                      </div>
                    )}
                    {pkg.mathMap?.lessonTitle && (
                      <div className="flex items-center gap-2">
                        <Calculator className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate font-medium">خ.ذ الرياضيات: {pkg.mathMap.lessonTitle}</span>
                      </div>
                    )}
                    {pkg.frenchMap?.lessonTitle && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate font-medium">خ.ذ الفرنسية: {pkg.frenchMap.lessonTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp & User Owner */}
                  <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 mb-3 px-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>حفظ: {createdDateStr}</span>
                    </div>
                    {pkg.userId && (
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px]">
                        ✓ سحابي
                      </span>
                    )}
                  </div>
                </div>

                {/* Document Bottom Actions Bar */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Open / View Document */}
                    <button
                      type="button"
                      onClick={() => onOpenDoc(pkg)}
                      className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 active:scale-98 text-white text-xs font-black py-2.5 px-3 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>فتح ومعاينة</span>
                    </button>

                    {/* 2. Direct Export PDF */}
                    <button
                      type="button"
                      onClick={() => (onExportPdf ? onExportPdf(pkg) : onOpenDoc(pkg))}
                      className="w-full bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs font-black py-2.5 px-3 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                      title="تصدير الوثيقة مباشرة كملف PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تصدير PDF</span>
                    </button>
                  </div>

                  {/* Quick-Access Icon Ribbon (Accessible on both Mobile & Desktop) */}
                  <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-stone-100 dark:border-stone-800/80">
                    <div className="flex items-center gap-1">
                      {/* Direct Edit */}
                      <button
                        type="button"
                        onClick={() => (onEditDoc ? onEditDoc(pkg) : onOpenDoc(pkg))}
                        className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="تعديل خانات الوثيقة"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Print Studio Shortcut */}
                      <button
                        type="button"
                        onClick={() => (onExportPdf ? onExportPdf(pkg) : onOpenDoc(pkg))}
                        className="p-2 text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="طباعة فورية A4"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Duplicate Document */}
                      {onDuplicateDoc && (
                        <button
                          type="button"
                          onClick={() => onDuplicateDoc(pkg)}
                          className="p-2 text-stone-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="إنشاء نسخة مكررة للتعديل"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}

                      {/* Gemini Enhance */}
                      {onRegenerateOrEnhance && (
                        <button
                          type="button"
                          onClick={() => {
                            setEnhanceModalPkg(pkg);
                            setCustomEnhancePrompt('');
                          }}
                          className="p-2 text-stone-600 dark:text-stone-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="إعادة توليد أو تحسين الوثيقة بـ Gemini"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteModalPkg(pkg)}
                      className="p-2 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="حذف الوثيقة نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {deleteModalPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 border-2 border-red-500 shadow-2xl space-y-4 text-right">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                  تأكيد حذف الوثيقة نهائياً
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف الوثيقة:{' '}
                  <strong className="text-stone-900 dark:text-stone-100">{deleteModalPkg.title}</strong>؟
                  سيتم حذفها نهائياً من حسابك وقاعدة البيانات السحابية.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setDeleteModalPkg(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold cursor-pointer transition-all min-h-[44px]"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDoc(deleteModalPkg.id);
                  setDeleteModalPkg(null);
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-all min-h-[44px]"
              >
                نعم، احذف الوثيقة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GEMINI ENHANCE / REGENERATE MODAL                                      */}
      {/* ========================================================================= */}
      {enhanceModalPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 border-2 border-purple-500 shadow-2xl space-y-4 text-right">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                  إعادة توليد أو تحسين الوثيقة بـ Gemini
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  الوثيقة المستهدفة:{' '}
                  <strong className="text-stone-900 dark:text-stone-100">{enhanceModalPkg.title}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                توجيهات إضافية للذكاء الاصطناعي (اختياري):
              </label>
              <textarea
                value={customEnhancePrompt}
                onChange={(e) => setCustomEnhancePrompt(e.target.value)}
                placeholder="مثال: ركز على أنشطة الممارسة المستقلة، أو أضف تمارين تفاعلية إضافية، أو حسن صياغة الأهداف التعلمية وفق مقاربة التدريس الصريح..."
                rows={3}
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setEnhanceModalPkg(null)}
                disabled={isEnhancing}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold cursor-pointer transition-all min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmEnhance}
                disabled={isEnhancing}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50 min-h-[44px]"
              >
                {isEnhancing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التحسين...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>بدء التحسين والتوليد</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
