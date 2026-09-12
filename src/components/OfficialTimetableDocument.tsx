import React, { useRef, useState, useEffect } from 'react';
import { TeacherProfile, WeeklyTimetable, TimetableSlot } from '../types';
import { DAYS_OF_WEEK } from '../data/timetableTemplates';
import { 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  X, 
  Save, 
  Clock, 
  Pencil, 
  Sparkles, 
  AlertCircle,
  AlertTriangle,
  Palette,
  Camera,
  Upload,
  FolderArchive,
  CheckCircle2,
  RotateCcw,
  Type,
  FileImage,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Maximize2,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ImageScanErrorBanner } from './ImageScanErrorBanner';
import { logTechnicalError, getUserFriendlyErrorMessage } from '../utils/logger';

interface OfficialTimetableDocumentProps {
  profile: TeacherProfile;
  timetable: WeeklyTimetable;
  timetablePhase?: 'tarl_remediation' | 'explicit_instruction';
  onUpdateTimetable?: (updated: WeeklyTimetable) => void;
  onPhaseChange?: (phase: 'tarl_remediation' | 'explicit_instruction') => void;
}

// Saved Timetable Snapshot interface
interface TimetableSnapshot {
  id: string;
  name: string;
  savedAt: string;
  level: string;
  slotsCount: number;
  timetableData: WeeklyTimetable;
}

const STORAGE_SNAPSHOTS_KEY = 'pioneer_saved_timetable_snapshots_v1';

export const OfficialTimetableDocument: React.FC<OfficialTimetableDocumentProps> = ({
  profile,
  timetable,
  timetablePhase = 'explicit_instruction',
  onUpdateTimetable,
  onPhaseChange,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // High-level Screen State: 'selector' (Initial Gate screen) vs 'editor' (Direct table editing)
  const [viewMode, setViewMode] = useState<'selector' | 'editor'>(() => {
    // If the teacher already has timetable slots or configured their timetable, stay in 'editor' so the fixed timetable is permanently loaded
    if (timetable && timetable.slots && timetable.slots.length > 0) {
      return 'editor';
    }
    return 'selector';
  });

  // Active pedagogical phase
  const [activePhase, setActivePhase] = useState<'tarl_remediation' | 'explicit_instruction'>(
    timetablePhase || 'explicit_instruction'
  );

  // Period Timing Configuration (Editable per teacher)
  const defaultTimings = {
    morning1Start: '08:00',
    morning1End: '10:15',
    morning2Start: '10:30',
    morning2End: '13:00',
    afternoon1Start: '13:00',
    afternoon1End: '15:15',
    afternoon2Start: '15:30',
    afternoon2End: '18:00',
  };

  const timings = {
    ...defaultTimings,
    ...(timetable.timingConfig || {}),
  };

  // State for Appearance & Theme Customization
  const [themeStyle, setThemeStyle] = useState<
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
    | 'sepia_classic'
  >(timetable.themeStyle || 'classic_black');

  const [fontFamily, setFontFamily] = useState<
    'scheherazade' | 'naskh' | 'amiri' | 'cairo' | 'alexandria' | 'tajawal' | 'almarai' | 'ruqaa' | 'kufi' | 'sans'
  >(timetable.fontFamily || 'scheherazade');

  const [fontScale, setFontScale] = useState<'compact' | 'normal' | 'medium' | 'large'>(
    timetable.fontScale || 'normal'
  );

  const [customTitle, setCustomTitle] = useState<string>(
    timetable.customTitle ||
      (activePhase === 'tarl_remediation'
        ? 'استعمال الزمن - فترة الدعم المكثف (طـارل)'
        : 'استعمال الزمن - فترة التعليم الصريح')
  );

  // Custom Colors
  const [customBorderColor, setCustomBorderColor] = useState<string>(timetable.customAccentColor || '#1c1917');
  const [useCustomColors, setUseCustomColors] = useState<boolean>(false);

  // Modals
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
  const [isAiScanModalOpen, setIsAiScanModalOpen] = useState(false);
  const [isSnapshotsModalOpen, setIsSnapshotsModalOpen] = useState(false);

  // State for Snapshots library
  const [savedSnapshots, setSavedSnapshots] = useState<TimetableSnapshot[]>([]);
  const [snapshotName, setSnapshotName] = useState<string>('');
  const [snapshotSuccessMsg, setSnapshotSuccessMsg] = useState<string>('');

  // State for AI Image Scanning
  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);
  const [scannedMimeType, setScannedMimeType] = useState<string>('image/jpeg');
  const [isScanningAi, setIsScanningAi] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    detectedTeacherName?: string;
    detectedLevel?: string;
    detectedSchool?: string;
    detectedAcademicYear?: string;
    timingConfig?: any;
    slots: Array<{
      day: string;
      startTime: string;
      endTime: string;
      subject: string;
      group?: string;
      notes?: string;
    }>;
  } | null>(null);

  // State for Cell Slot Add/Edit Modal
  const [activeCellModal, setActiveCellModal] = useState<{
    day: string;
    periodType: 'morning_1' | 'morning_2' | 'afternoon_1' | 'afternoon_2';
    existingSlot?: TimetableSlot;
  } | null>(null);

  const [cellSubject, setCellSubject] = useState<string>('اللغة العربية');
  const [cellStartTime, setCellStartTime] = useState<string>('08:00');
  const [cellDuration, setCellDuration] = useState<number>(60);
  const [cellEndTime, setCellEndTime] = useState<string>('09:00');
  const [cellGroup, setCellGroup] = useState<string>(profile.classGroup || 'الفوج 1');
  const [cellNotes, setCellNotes] = useState<string>('');

  // Load saved snapshots on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SNAPSHOTS_KEY);
      if (stored) {
        setSavedSnapshots(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load timetable snapshots', e);
    }
  }, []);

  // Update title when activePhase changes (if not customized)
  useEffect(() => {
    if (!timetable.customTitle) {
      setCustomTitle(
        activePhase === 'tarl_remediation'
          ? 'استعمال الزمن - فترة الدعم المكثف (طـارل)'
          : 'استعمال الزمن - فترة التعليم الصريح'
      );
    }
  }, [activePhase, timetable.customTitle]);

  const handleSelectPhase = (phase: 'tarl_remediation' | 'explicit_instruction') => {
    setActivePhase(phase);
    if (onPhaseChange) onPhaseChange(phase);
    if (!timetable.customTitle) {
      setCustomTitle(
        phase === 'tarl_remediation'
          ? 'استعمال الزمن - فترة الدعم المكثف (طـارل)'
          : 'استعمال الزمن - فترة التعليم الصريح'
      );
    }
  };

  // Helper to calculate end time from start time and duration
  const calculateEndTime = (start: string, duration: number) => {
    if (!start) return '09:00';
    const [h, m] = start.split(':').map(Number);
    const total = h * 60 + m + duration;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  };

  // Helper to calculate duration in minutes between two "HH:mm" strings
  const getMinutesDifference = (startStr: string, endStr: string): number => {
    if (!startStr || !endStr) return 0;
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const startTotal = (sh || 0) * 60 + (sm || 0);
    const endTotal = (eh || 0) * 60 + (em || 0);
    return Math.max(0, endTotal - startTotal);
  };

  // Duration Validation Helper for a specific period
  const getPeriodWindowMinutes = (periodType: 'morning_1' | 'morning_2' | 'afternoon_1' | 'afternoon_2'): number => {
    switch (periodType) {
      case 'morning_1':
        return getMinutesDifference(timings.morning1Start, timings.morning1End);
      case 'morning_2':
        return getMinutesDifference(timings.morning2Start, timings.morning2End);
      case 'afternoon_1':
        return getMinutesDifference(timings.afternoon1Start, timings.afternoon1End);
      case 'afternoon_2':
        return getMinutesDifference(timings.afternoon2Start, timings.afternoon2End);
      default:
        return 135;
    }
  };

  // Helper to find slots in specific period for a day
  const getSlotsForPeriod = (day: string, periodType: 'morning_1' | 'morning_2' | 'afternoon_1' | 'afternoon_2') => {
    const daySlots = timetable.slots.filter((s) => s.day === day);
    return daySlots.filter((s) => {
      const startH = parseInt(s.startTime?.split(':')[0] || '0', 10);
      if (periodType === 'morning_1') return startH >= 7 && startH < 10;
      if (periodType === 'morning_2') return startH >= 10 && startH < 13;
      if (periodType === 'afternoon_1') return startH >= 13 && startH < 15;
      if (periodType === 'afternoon_2') return startH >= 15 && startH < 19;
      return false;
    });
  };

  // Calculate duration stats for a day's period
  const getPeriodDurationAnalysis = (day: string, periodType: 'morning_1' | 'morning_2' | 'afternoon_1' | 'afternoon_2') => {
    const slots = getSlotsForPeriod(day, periodType);
    const windowMinutes = getPeriodWindowMinutes(periodType);
    if (slots.length === 0) {
      return { slotsCount: 0, totalSlotsMinutes: 0, windowMinutes, diff: 0, status: 'empty' };
    }

    const totalSlotsMinutes = slots.reduce((acc, slot) => {
      return acc + getMinutesDifference(slot.startTime, slot.endTime);
    }, 0);

    const diff = totalSlotsMinutes - windowMinutes;
    if (diff === 0) {
      return { slotsCount: slots.length, totalSlotsMinutes, windowMinutes, diff: 0, status: 'match' };
    } else if (diff > 0) {
      return { slotsCount: slots.length, totalSlotsMinutes, windowMinutes, diff, status: 'exceeded' };
    } else {
      return { slotsCount: slots.length, totalSlotsMinutes, windowMinutes, diff, status: 'under' };
    }
  };

  // Overall mismatch count across all active periods
  const totalMismatches = DAYS_OF_WEEK.reduce((total, day) => {
    const p1 = getPeriodDurationAnalysis(day, 'morning_1');
    const p2 = getPeriodDurationAnalysis(day, 'morning_2');
    const p3 = getPeriodDurationAnalysis(day, 'afternoon_1');
    const p4 = getPeriodDurationAnalysis(day, 'afternoon_2');
    let count = 0;
    if (p1.status === 'exceeded' || p1.status === 'under') count++;
    if (p2.status === 'exceeded' || p2.status === 'under') count++;
    if (p3.status === 'exceeded' || p3.status === 'under') count++;
    if (p4.status === 'exceeded' || p4.status === 'under') count++;
    return total + count;
  }, 0);

  // 11 Rich Curated Themes
  const themeClasses: Record<string, {
    name: string;
    border: string;
    headerBg: string;
    titleBg: string;
    slotBg: string;
    slotTimeColor: string;
    accentHex: string;
    previewBg: string;
  }> = {
    classic_black: {
      name: 'الأسود الكلاسيكي المعتمد',
      border: 'border-stone-900',
      headerBg: 'bg-stone-100 text-stone-950',
      titleBg: 'bg-stone-50 border-stone-900 text-stone-950',
      slotBg: 'bg-stone-100/90 border-stone-400 text-stone-900',
      slotTimeColor: 'text-stone-700',
      accentHex: '#1c1917',
      previewBg: 'bg-stone-900',
    },
    emerald_ministry: {
      name: 'الزمرد الوزاري',
      border: 'border-emerald-900',
      headerBg: 'bg-emerald-50 text-emerald-950',
      titleBg: 'bg-emerald-50/80 border-emerald-800 text-emerald-950',
      slotBg: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
      slotTimeColor: 'text-emerald-800',
      accentHex: '#065f46',
      previewBg: 'bg-emerald-700',
    },
    navy_royal: {
      name: 'الأزرق الملكي الأنيق',
      border: 'border-blue-900',
      headerBg: 'bg-blue-50 text-blue-950',
      titleBg: 'bg-blue-50/80 border-blue-900 text-blue-950',
      slotBg: 'bg-blue-50/80 border-blue-300 text-blue-950',
      slotTimeColor: 'text-blue-800',
      accentHex: '#1e3a8a',
      previewBg: 'bg-blue-800',
    },
    amber_pioneer: {
      name: 'عنبر الريادة الذهبي',
      border: 'border-amber-900',
      headerBg: 'bg-amber-50 text-amber-950',
      titleBg: 'bg-amber-50/80 border-amber-800 text-amber-950',
      slotBg: 'bg-amber-50/90 border-amber-300 text-amber-950',
      slotTimeColor: 'text-amber-800',
      accentHex: '#92400e',
      previewBg: 'bg-amber-600',
    },
    maroon_academic: {
      name: 'العنابي الأكاديمي',
      border: 'border-rose-950',
      headerBg: 'bg-rose-50 text-rose-950',
      titleBg: 'bg-rose-50/80 border-rose-900 text-rose-950',
      slotBg: 'bg-rose-50/80 border-rose-300 text-rose-950',
      slotTimeColor: 'text-rose-900',
      accentHex: '#831843',
      previewBg: 'bg-rose-800',
    },
    slate_modern: {
      name: 'الرمادي الصخري المعاصر',
      border: 'border-slate-800',
      headerBg: 'bg-slate-100 text-slate-900',
      titleBg: 'bg-slate-50 border-slate-700 text-slate-900',
      slotBg: 'bg-slate-100/90 border-slate-300 text-slate-900',
      slotTimeColor: 'text-slate-700',
      accentHex: '#334155',
      previewBg: 'bg-slate-700',
    },
    indigo_official: {
      name: 'النيلي الأكاديمي',
      border: 'border-indigo-900',
      headerBg: 'bg-indigo-50 text-indigo-950',
      titleBg: 'bg-indigo-50/80 border-indigo-900 text-indigo-950',
      slotBg: 'bg-indigo-50/80 border-indigo-300 text-indigo-950',
      slotTimeColor: 'text-indigo-900',
      accentHex: '#312e81',
      previewBg: 'bg-indigo-700',
    },
    olive_heritage: {
      name: 'الزيتوني التراثي',
      border: 'border-lime-950',
      headerBg: 'bg-lime-50 text-lime-950',
      titleBg: 'bg-lime-50/80 border-lime-900 text-lime-950',
      slotBg: 'bg-lime-50/90 border-lime-300 text-lime-950',
      slotTimeColor: 'text-lime-900',
      accentHex: '#365314',
      previewBg: 'bg-lime-800',
    },
    purple_majestic: {
      name: 'الأرجواني الوقور',
      border: 'border-purple-950',
      headerBg: 'bg-purple-50 text-purple-950',
      titleBg: 'bg-purple-50/80 border-purple-900 text-purple-950',
      slotBg: 'bg-purple-50/90 border-purple-300 text-purple-950',
      slotTimeColor: 'text-purple-900',
      accentHex: '#581c87',
      previewBg: 'bg-purple-800',
    },
    teal_cyan: {
      name: 'الفيروزي المنعش',
      border: 'border-teal-900',
      headerBg: 'bg-teal-50 text-teal-950',
      titleBg: 'bg-teal-50/80 border-teal-800 text-teal-950',
      slotBg: 'bg-teal-50/90 border-teal-300 text-teal-950',
      slotTimeColor: 'text-teal-900',
      accentHex: '#134e4a',
      previewBg: 'bg-teal-700',
    },
    sepia_classic: {
      name: 'السيبيا والورق العتيق',
      border: 'border-amber-950',
      headerBg: 'bg-amber-100/60 text-amber-950',
      titleBg: 'bg-amber-50 border-amber-900 text-amber-950',
      slotBg: 'bg-amber-100/50 border-amber-400 text-amber-950',
      slotTimeColor: 'text-amber-900',
      accentHex: '#78350f',
      previewBg: 'bg-[#854d0e]',
    },
  };

  const currentTheme = themeClasses[themeStyle] || themeClasses.classic_black;

  // 9 Word-like Arabic Typography Families
  const fontDefinitions: Record<string, { name: string; class: string; styleName: string; fontCss: string }> = {
    scheherazade: {
      name: 'خط النسخ المدرسي (المعتمد)',
      class: 'font-serif',
      styleName: 'Scheherazade New, serif',
      fontCss: "'Scheherazade New', 'Amiri', serif",
    },
    naskh: {
      name: 'خط النسخ التقليدي الواضح',
      class: 'font-serif',
      styleName: 'Scheherazade New, serif',
      fontCss: "'Scheherazade New', serif",
    },
    amiri: {
      name: 'الخط الأميري الطباعي الأصيل',
      class: 'font-serif',
      styleName: 'Amiri, serif',
      fontCss: "'Amiri', serif",
    },
    cairo: {
      name: 'خط القاهرة الهندسي المتقن',
      class: 'font-sans',
      styleName: 'Cairo, sans-serif',
      fontCss: "'Cairo', sans-serif",
    },
    alexandria: {
      name: 'خط الإسكندرية الإداري',
      class: 'font-sans',
      styleName: 'Alexandria, sans-serif',
      fontCss: "'Alexandria', sans-serif",
    },
    tajawal: {
      name: 'خط تجوال العصري',
      class: 'font-sans',
      styleName: 'Tajawal, sans-serif',
      fontCss: "'Tajawal', sans-serif",
    },
    almarai: {
      name: 'خط المراعي السلس والمريح',
      class: 'font-sans',
      styleName: 'Almarai, sans-serif',
      fontCss: "'Almarai', sans-serif",
    },
    ruqaa: {
      name: 'خط الرقعة التراثي الفني',
      class: 'font-serif',
      styleName: 'Aref Ruqaa, serif',
      fontCss: "'Aref Ruqaa', serif",
    },
    kufi: {
      name: 'الخط الكوفي الرسمي الرصين',
      class: 'font-sans font-bold',
      styleName: 'Noto Kufi Arabic, sans-serif',
      fontCss: "'Noto Kufi Arabic', sans-serif",
    },
    sans: {
      name: 'الخط القياسي العام',
      class: 'font-sans',
      styleName: 'system-ui, sans-serif',
      fontCss: 'system-ui, sans-serif',
    },
  };

  const currentFont = fontDefinitions[fontFamily] || fontDefinitions.scheherazade;

  const scaleClasses = {
    compact: 'scale-[0.92] origin-top',
    normal: 'scale-100',
    medium: 'scale-[1.02] origin-top',
    large: 'scale-[1.05] origin-top',
  };

  const handleOpenCell = (
    day: string,
    periodType: 'morning_1' | 'morning_2' | 'afternoon_1' | 'afternoon_2',
    defaultStart: string,
    existingSlot?: TimetableSlot
  ) => {
    setActiveCellModal({ day, periodType, existingSlot });
    if (existingSlot) {
      setCellSubject(existingSlot.subject);
      setCellStartTime(existingSlot.startTime);
      setCellEndTime(existingSlot.endTime);
      setCellGroup(existingSlot.group || profile.classGroup || 'الفوج 1');
      setCellNotes(existingSlot.notes || '');
      if (existingSlot.startTime && existingSlot.endTime) {
        const diff = getMinutesDifference(existingSlot.startTime, existingSlot.endTime);
        setCellDuration(diff > 0 ? diff : 60);
      }
    } else {
      setCellSubject('اللغة العربية');
      setCellStartTime(defaultStart);
      setCellDuration(60);
      setCellEndTime(calculateEndTime(defaultStart, 60));
      setCellGroup(profile.classGroup || 'الفوج 1');
      setCellNotes('');
    }
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCellModal || !onUpdateTimetable) return;

    let subjectType: any = 'arabic';
    if (cellSubject === 'الرياضيات') subjectType = 'math';
    else if (cellSubject === 'Français') subjectType = 'french';
    else if (cellSubject !== 'اللغة العربية') subjectType = 'other';

    const finalEndTime = cellEndTime || calculateEndTime(cellStartTime, cellDuration);

    let updatedSlots = [...timetable.slots];
    if (activeCellModal.existingSlot) {
      updatedSlots = updatedSlots.map((s) =>
        s.id === activeCellModal.existingSlot?.id
          ? {
              ...s,
              subject: cellSubject,
              subjectType,
              startTime: cellStartTime,
              endTime: finalEndTime,
              group: cellGroup,
              notes: cellNotes,
            }
          : s
      );
    } else {
      const newSlot: TimetableSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        day: activeCellModal.day,
        dayIndex: DAYS_OF_WEEK.indexOf(activeCellModal.day),
        startTime: cellStartTime,
        endTime: finalEndTime,
        subject: cellSubject,
        subjectType,
        level: profile.level,
        group: cellGroup,
        notes: cellNotes,
      };
      updatedSlots.push(newSlot);
    }

    onUpdateTimetable({
      ...timetable,
      slots: updatedSlots,
      lastUpdated: new Date().toISOString(),
    });
    setActiveCellModal(null);
  };

  const handleDeleteSlot = (id: string) => {
    if (!onUpdateTimetable) return;
    const updatedSlots = timetable.slots.filter((s) => s.id !== id);
    onUpdateTimetable({
      ...timetable,
      slots: updatedSlots,
      lastUpdated: new Date().toISOString(),
    });
    setActiveCellModal(null);
  };

  const handleSaveTimings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateTimetable) return;
    onUpdateTimetable({
      ...timetable,
      timingConfig: tempTimings,
      lastUpdated: new Date().toISOString(),
    });
    setIsTimingModalOpen(false);
  };

  const handleSaveStyle = () => {
    if (!onUpdateTimetable) return;
    onUpdateTimetable({
      ...timetable,
      customTitle,
      themeStyle,
      fontFamily,
      fontScale,
      customAccentColor: customBorderColor,
      lastUpdated: new Date().toISOString(),
    });
    setIsStyleModalOpen(false);
  };

  const handleClearAllSlots = () => {
    if (!onUpdateTimetable) return;
    if (window.confirm('هل أنت متأكد من رغبتك في إفراغ جميع الحصص من الجدول؟ يمكنك استرجاع أي نموذج سابق من الأرشيف لاحقاً.')) {
      onUpdateTimetable({
        ...timetable,
        slots: [],
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  // Snapshot Saving Logic
  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = snapshotName.trim() || `استعمال زمن ${profile.level || 'المستوى'} - ${new Date().toLocaleDateString('ar-MA')}`;
    const newSnapshot: TimetableSnapshot = {
      id: `snap-${Date.now()}`,
      name: finalName,
      savedAt: new Date().toISOString(),
      level: profile.level || 'المستوى الرابع',
      slotsCount: timetable.slots.length,
      timetableData: JSON.parse(JSON.stringify(timetable)),
    };

    const updated = [newSnapshot, ...savedSnapshots.slice(0, 19)];
    setSavedSnapshots(updated);
    try {
      localStorage.setItem(STORAGE_SNAPSHOTS_KEY, JSON.stringify(updated));
      setSnapshotName('');
      setSnapshotSuccessMsg('تم حفظ نموذج استعمال الزمن بنجاح في الأرشيف!');
      setTimeout(() => setSnapshotSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Error saving snapshot', err);
    }
  };

  const handleLoadSnapshot = (snap: TimetableSnapshot) => {
    if (!onUpdateTimetable) return;
    if (window.confirm(`هل ترغب في استرجاع النموذج "${snap.name}"؟ سيتم استبدال الحصص والمواقيت الحالية بالنموذج المحفوظ.`)) {
      onUpdateTimetable({
        ...snap.timetableData,
        lastUpdated: new Date().toISOString(),
      });
      if (snap.timetableData.themeStyle) setThemeStyle(snap.timetableData.themeStyle);
      if (snap.timetableData.fontFamily) setFontFamily(snap.timetableData.fontFamily);
      if (snap.timetableData.customTitle) setCustomTitle(snap.timetableData.customTitle);
      setIsSnapshotsModalOpen(false);
      setViewMode('editor');
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    const filtered = savedSnapshots.filter((s) => s.id !== id);
    setSavedSnapshots(filtered);
    try {
      localStorage.setItem(STORAGE_SNAPSHOTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Image Upload for AI Scanning
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannedMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setScannedImagePreview(event.target?.result as string);
      setScanError(null);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI Timetable Extraction from Image
  const handleRunAiExtraction = async () => {
    if (!scannedImagePreview) return;
    setIsScanningAi(true);
    setScanError(null);

    try {
      const response = await fetch('/api/ai/extract-timetable-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: scannedImagePreview,
          mimeType: scannedMimeType,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'فشل في استخراج البيانات من الصورة.');
      }

      if (!resData.data?.slots || resData.data.slots.length === 0) {
        throw new Error('الصورة غير واضحة بما يكفي للتحليل واستخراج الحصص.');
      }

      setScanResult(resData.data);
    } catch (err: any) {
      logTechnicalError('camera', err, { action: 'extract_timetable_image' });
      setScanError(getUserFriendlyErrorMessage(err, 'camera', 'الصورة غير واضحة بما يكفي للتحليل. يرجى إعادة التقاط الصورة باتباع الإرشادات.'));
    } finally {
      setIsScanningAi(false);
    }
  };

  // Apply AI Scanned Result to Document
  const handleApplyAiResult = (mode: 'replace' | 'merge') => {
    if (!scanResult || !onUpdateTimetable) return;

    const mappedSlots: TimetableSlot[] = scanResult.slots.map((item, idx) => {
      let subjectType: any = 'arabic';
      if (item.subject.includes('رياضيات') || item.subject.toLowerCase().includes('math')) subjectType = 'math';
      else if (item.subject.includes('فرنسية') || item.subject.toLowerCase().includes('fran')) subjectType = 'french';
      else if (!item.subject.includes('عربية')) subjectType = 'other';

      return {
        id: `slot-ai-${Date.now()}-${idx}`,
        day: item.day || 'الإثنين',
        dayIndex: DAYS_OF_WEEK.indexOf(item.day || 'الإثنين'),
        startTime: item.startTime || '08:00',
        endTime: item.endTime || '09:00',
        subject: item.subject || 'حصة دراسية',
        subjectType,
        level: scanResult.detectedLevel || profile.level,
        group: item.group || profile.classGroup || 'الفوج 1',
        notes: item.notes || '',
      };
    });

    const newSlots = mode === 'replace' ? mappedSlots : [...timetable.slots, ...mappedSlots];

    const updatedTiming = {
      ...timings,
      ...(scanResult.timingConfig || {}),
    };

    onUpdateTimetable({
      ...timetable,
      slots: newSlots,
      timingConfig: updatedTiming,
      lastUpdated: new Date().toISOString(),
    });

    setIsAiScanModalOpen(false);
    setScannedImagePreview(null);
    setScanResult(null);
    setViewMode('editor');
  };

  const [tempTimings, setTempTimings] = useState(timings);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, Math.min(imgHeight, pageHeight - margin * 2));
      pdf.save(`استعمال_الزمن_${profile.teacherName || 'الاستاذ'}_${profile.academicYear || '2026-2027'}.pdf`);
    } catch (e) {
      console.error('PDF export failed', e);
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs for Image Capture and Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* VIEW 1: INITIAL GATE & PEDAGOGICAL PHASE SELECTOR                         */}
      {/* (Only shows phase selection and 2 main choices as requested)              */}
      {/* ========================================================================= */}
      {viewMode === 'selector' && (
        <div className="print:hidden bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
          {/* Header Title */}
          <div className="text-center space-y-1.5 border-b border-stone-200 dark:border-stone-800 pb-5">
            <div className="inline-flex items-center justify-center p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-2xl text-amber-600 dark:text-amber-400 mb-1">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">
              إعداد وتخصيص استعمال الزمن
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
              اختر الصيغة البيداغوجية، ثم حدد طريقة إدخال الحصص والمواقيت (عبر التصوير بالذكاء الاصطناعي أو التعديل المباشر داخل التطبيق).
            </p>
          </div>

          {/* Section 1: Pedagogical Phase Selection (الصيغة البيداغوجية) */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-stone-700 dark:text-stone-300">
              1. اختر الصيغة البيداغوجية المعتمدة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Explicit Instruction */}
              <div
                onClick={() => handleSelectPhase('explicit_instruction')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                  activePhase === 'explicit_instruction'
                    ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${activePhase === 'explicit_instruction' ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="font-black text-sm">فترة التعليم الصريح</div>
                  <div className="text-[11px] leading-relaxed opacity-80">
                    بناء التعلمات المنهجية والإرساء طيلة أسابيع السنة الدراسية العادية.
                  </div>
                </div>
                {activePhase === 'explicit_instruction' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-600 absolute top-3.5 left-3.5 shrink-0" />
                )}
              </div>

              {/* Card 2: TaRL Remediation */}
              <div
                onClick={() => handleSelectPhase('tarl_remediation')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                  activePhase === 'tarl_remediation'
                    ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${activePhase === 'tarl_remediation' ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="font-black text-sm">فترة الدعم المكثف (طـارل TaRL)</div>
                  <div className="text-[11px] leading-relaxed opacity-80">
                    أنشطة الدعم الموجه ومعالجة التعثرات خلال شتنبر وفترات الدعم المؤسساتي.
                  </div>
                </div>
                {activePhase === 'tarl_remediation' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-600 absolute top-3.5 left-3.5 shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Two Main Action Choices (خانة الزران المطلوبان) */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-black text-stone-700 dark:text-stone-300">
              2. حدد طريقة العمل المطلوبة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Choice 1: Camera / Scan Timetable Image */}
              <div className="p-5 rounded-3xl border-2 border-stone-200 dark:border-stone-800 hover:border-amber-500 bg-gradient-to-b from-stone-50 to-stone-100/60 dark:from-stone-800/50 dark:to-stone-900/50 flex flex-col justify-between space-y-4 text-right transition-all group">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100">
                    تصوير أو استيراد صورة قديمة
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    التقط صورة لاستعمال الزمن الورقي القديم أو ارفعه كصورة ليقوم الذكاء الاصطناعي باستخراج المواد والمواقيت آلياً.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiScanModalOpen(true);
                      setScanError(null);
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>مسح ضوئي واستخراج الحصص</span>
                  </button>
                </div>
              </div>

              {/* Choice 2: Create & Edit Directly in App */}
              <div className="p-5 rounded-3xl border-2 border-amber-500 dark:border-amber-600 bg-gradient-to-b from-amber-50/40 to-amber-100/20 dark:from-amber-950/30 dark:to-stone-900 flex flex-col justify-between space-y-4 text-right transition-all shadow-xs">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-stone-100">
                    إنشاء وتعديل في التطبيق
                  </h3>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                    فتح الجدول التفاعلي الكامل لتعديل الحصص، تخصيص الألوان والخطوط، ومراقبة مدد الحصص مع التنبيه الذكي.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('editor')}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <span>الدخول إلى محرر الجدول والتعديل</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Archive / Snapshots Link */}
          {savedSnapshots.length > 0 && (
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">
                لديك {savedSnapshots.length} نماذج سابقة محفوظة في الأرشيف
              </span>
              <button
                type="button"
                onClick={() => setIsSnapshotsModalOpen(true)}
                className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>استعراض أرشيف النماذج</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FULL INTERACTIVE EDITOR & OFFICIAL DOCUMENT VIEW                  */}
      {/* (Shows when teacher chooses "تعديل في التطبيق" or applies AI Scan)        */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Main Top Control Action Bar (Screen Only) */}
          <div className="print:hidden bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Back to Phase / Mode Selector Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('selector')}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                  title="الرجوع لاختيار الصيغة البيداغوجية أو التصوير"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  <span>تغيير الصيغة أو المسح</span>
                </button>

                <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
                  {activePhase === 'tarl_remediation' ? '⚡ فترة الدعم طارل' : '📘 فترة التعليم الصريح'}
                </span>

                <span className="text-[11px] text-stone-500 font-medium">
                  (الحصص المسجلة: {timetable.slots.length})
                </span>

                {/* Prominent Smart Duration Validation Alert Badge */}
                {totalMismatches > 0 ? (
                  <span className="text-xs bg-red-100 dark:bg-red-950/90 text-red-900 dark:text-red-200 border-2 border-red-400 dark:border-red-800 px-3 py-1 rounded-xl font-black flex items-center gap-2 animate-pulse shadow-2xs">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>⚠️ تنبيه تذكيري: هناك {totalMismatches} فترات بها فارق في مجموع مدد الحصص!</span>
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-xl font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>مجموع مدد الحصص متطابق تماماً مع التوقيت المخصص</span>
                  </span>
                )}
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* AI Image Scan Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAiScanModalOpen(true);
                    setScanError(null);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="تصوير أو استيراد صورة استعمال الزمن القديم"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>تصوير / استيراد صورة</span>
                </button>

                {/* Word-Office Style / Theme & Fonts Studio */}
                <button
                  type="button"
                  onClick={() => setIsStyleModalOpen(true)}
                  className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all border border-stone-300 dark:border-stone-700"
                  title="تنسيق الخطوط والألوان على طريقة الوورد أوفيس"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>تنسيق الخطوط والألوان (Word)</span>
                </button>

                {/* Snapshots / Archive Button */}
                <button
                  type="button"
                  onClick={() => setIsSnapshotsModalOpen(true)}
                  className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  title="حفظ واسترجاع النماذج للأعوام القادمة"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>النماذج المحفوظة ({savedSnapshots.length})</span>
                </button>

                {/* Timing Edit Button */}
                <button
                  type="button"
                  onClick={() => {
                    setTempTimings(timings);
                    setIsTimingModalOpen(true);
                  }}
                  className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>تعديل التوقيت</span>
                </button>

                {/* Clear All Slots */}
                {timetable.slots.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSlots}
                    className="px-2.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-red-50 text-stone-600 hover:text-red-600 dark:text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                    title="إفراغ الجدول"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إفراغ</span>
                  </button>
                )}

                {/* PDF Export */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>تحميل PDF</span>
                </button>

                {/* Direct Print */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة فورية</span>
                </button>
              </div>
            </div>
          </div>

          {/* Official Timetable Sheet Container matching the official Moroccan Ministry layout */}
          <div className={`overflow-x-auto p-1 ${scaleClasses[fontScale]}`}>
            <div
              ref={printRef}
              id="official-moroccan-timetable"
              style={{ fontFamily: currentFont.fontCss }}
              className={`bg-white text-stone-950 p-6 sm:p-8 rounded-3xl border-2 ${currentTheme.border} shadow-md mx-auto max-w-4xl min-h-[920px] flex flex-col justify-between`}
              dir="rtl"
            >
              <div>
                {/* Top Administrative Header - Single Row 3-Cell Invisible Table */}
                <div className={`pb-3 border-b-2 ${currentTheme.border}`}>
                  <table className="w-full border-collapse border-none m-0 p-0">
                    <tbody>
                      <tr className="border-none">
                        {/* Right Column: Academy, Direction, School, Academic Year */}
                        <td className="w-1/3 p-1.5 align-middle text-right border-none">
                          <div className="text-[11px] sm:text-xs leading-relaxed font-bold space-y-1.5 text-stone-900">
                            <p className="flex items-center gap-1 justify-start">
                              <span className="text-stone-600 font-semibold">الأكاديمية الجهوية:</span>
                              <span className="font-black text-stone-950">{profile.academy || '................'}</span>
                            </p>
                            <p className="flex items-center gap-1 justify-start">
                              <span className="text-stone-600 font-semibold">المديرية الإقليمية:</span>
                              <span className="font-black text-stone-950">{profile.direction || '................'}</span>
                            </p>
                            <p className="flex items-center gap-1 justify-start">
                              <span className="text-stone-600 font-semibold">المؤسسة:</span>
                              <span className="font-black text-stone-950">{profile.school || '................'}</span>
                            </p>
                            <p className="flex items-center gap-1 justify-start">
                              <span className="text-stone-600 font-semibold">الموسم الدراسي:</span>
                              <span className={`border ${currentTheme.border} px-2 py-0.5 rounded-md font-black text-xs text-stone-950 bg-stone-50 inline-block`}>
                                {profile.academicYear || '2026/2027'}
                              </span>
                            </p>
                          </div>
                        </td>

                        {/* Center Column: Kingdom of Morocco & Ministry Title */}
                        <td className="w-1/3 p-1.5 align-middle text-center border-none">
                          <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                            <p className="text-sm sm:text-base font-black tracking-wide text-stone-950 leading-tight">
                              المملكة المغربية
                            </p>
                            <p className="text-xs sm:text-sm font-black text-stone-900 leading-snug">
                              وزارة التربية الوطنية والتعليم الأولي والرياضة
                            </p>
                          </div>
                        </td>

                        {/* Left Column: Teacher Details (Separated Level & Group) */}
                        <td className="w-1/3 p-1.5 align-middle text-right border-none">
                          <div className="text-[11px] sm:text-xs leading-relaxed font-bold space-y-1.5 text-stone-900">
                            <p className="flex items-center gap-1 justify-start">
                              <span className="text-stone-600 font-semibold">الأستاذ(ة):</span>
                              <span className="font-black text-stone-950">{profile.teacherName || '................'}</span>
                            </p>
                            <p className="flex items-center gap-1 justify-start">
                              <span className="text-stone-600 font-semibold">المستوى:</span>
                              <span className="font-black text-stone-950">{profile.level || 'الأول'}</span>
                            </p>
                            <p className="flex items-center gap-1 justify-start">
                              <span className="text-stone-600 font-semibold">الفوج:</span>
                              <span className="font-black text-stone-950">{profile.classGroup || 'الفوج 1'}</span>
                            </p>
                            <p className="flex items-center gap-1 justify-start">
                              <span className="text-stone-600 font-semibold">رقم التأجير:</span>
                              <span className="font-black text-stone-950">................</span>
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Centered Document Title Box */}
                <div className="my-4 flex justify-center">
                  <div className={`border-2 ${currentTheme.border} rounded-2xl px-8 py-2 ${currentTheme.titleBg} text-center shadow-2xs flex items-center gap-2 group`}>
                    <h1 className="text-base sm:text-lg font-black tracking-wide">
                      {customTitle}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsStyleModalOpen(true)}
                      className="print:hidden opacity-0 group-hover:opacity-100 p-1 hover:bg-stone-200/60 rounded-lg text-stone-500 hover:text-stone-900 transition-all cursor-pointer"
                      title="تعديل العنوان والمظهر"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Exact Moroccan Timetable Matrix Table */}
                <div className="w-full overflow-x-auto">
                  <table className={`w-full border-collapse border-2 ${currentTheme.border} text-center text-xs`}>
                    <thead>
                      {/* Header Row 1: تسلسل الاسبوع 1 - 6 */}
                      <tr className={`${currentTheme.headerBg} border-b ${currentTheme.border} font-black`}>
                        <th colSpan={2} className={`border-r-2 border-l-2 ${currentTheme.border} p-1.5 text-xs`}>
                          تسلسل الاسبوع
                        </th>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <th key={num} className={`border-r border-l ${currentTheme.border} p-1.5 w-[14%] text-xs font-black`}>
                            {num}
                          </th>
                        ))}
                      </tr>

                      {/* Header Row 2: الفترة | التوقيت | الأيام */}
                      <tr className={`${currentTheme.headerBg} border-b-2 ${currentTheme.border} font-black`}>
                        <th className={`border-r-2 ${currentTheme.border} p-1.5 w-12 text-xs`}>الفترة</th>
                        <th
                          onClick={() => {
                            setTempTimings(timings);
                            setIsTimingModalOpen(true);
                          }}
                          className={`border-r border-l-2 ${currentTheme.border} p-1.5 w-20 text-xs cursor-pointer hover:bg-amber-100/60 transition-colors`}
                          title="انقر لتعديل التوقيت"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>التوقيت</span>
                            <Pencil className="w-2.5 h-2.5 text-amber-700 print:hidden" />
                          </div>
                        </th>
                        {DAYS_OF_WEEK.map((day) => (
                          <th key={day} className={`border-r border-l ${currentTheme.border} p-1.5 text-xs font-black`}>
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* ========================================================================= */}
                      {/* SECTION 1: الفترة الصباحية                                                */}
                      {/* ========================================================================= */}
                      {/* Morning Sub-period 1 */}
                      <tr className="h-28 border-b border-stone-400">
                        {/* Vertical Period Header: الصباحية */}
                        <td
                          rowSpan={3}
                          className={`border-r-2 border-l-2 ${currentTheme.border} ${currentTheme.headerBg} font-black text-xs p-1 select-none`}
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          الصباحية
                        </td>

                        {/* Timing Column: Morning 1 (Editable) */}
                        <td
                          onClick={() => {
                            setTempTimings(timings);
                            setIsTimingModalOpen(true);
                          }}
                          className={`border-r border-l-2 ${currentTheme.border} p-1 font-bold text-[11px] bg-stone-50/70 relative cursor-pointer hover:bg-amber-100/60 transition-colors`}
                        >
                          <div className="absolute top-1.5 left-0 right-0 text-center font-black">
                            {timings.morning1Start}
                          </div>
                          <div className="absolute bottom-1.5 left-0 right-0 text-center font-black">
                            {timings.morning1End}
                          </div>
                        </td>

                        {/* 6 Day Cells for Morning 1 */}
                        {DAYS_OF_WEEK.map((day) => {
                          const slots = getSlotsForPeriod(day, 'morning_1');
                          const analysis = getPeriodDurationAnalysis(day, 'morning_1');
                          return (
                            <td
                              key={`m1-${day}`}
                              className={`border-r border-l ${currentTheme.border} p-1.5 align-middle relative hover:bg-amber-50/40 transition-colors group`}
                            >
                              {slots.length > 0 ? (
                                <div className="space-y-1.5">
                                  {slots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      onClick={() => handleOpenCell(day, 'morning_1', timings.morning1Start, slot)}
                                      className={`p-1 rounded-lg ${currentTheme.slotBg} hover:opacity-90 cursor-pointer text-right transition-all shadow-2xs`}
                                    >
                                      <div className="font-black text-xs leading-tight">
                                        {slot.subject}
                                      </div>
                                      <div className={`text-[10px] ${currentTheme.slotTimeColor} font-black`}>
                                        {slot.startTime} - {slot.endTime}
                                      </div>
                                      <div className="text-[9px] text-stone-600 font-bold">
                                        {slot.group || profile.classGroup || 'فوج 1'}
                                      </div>
                                    </div>
                                  ))}

                                  {/* PROMINENT Duration Mismatch Warning Badge (Screen Only) */}
                                  {analysis.status !== 'match' && (
                                    <div
                                      className={`print:hidden p-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 shadow-2xs border ${
                                        analysis.status === 'exceeded'
                                          ? 'bg-red-100 text-red-900 border-red-400 font-black animate-bounce'
                                          : 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                                      }`}
                                      title={`المجموع المدخل: ${analysis.totalSlotsMinutes}د / المخصص للفترة: ${analysis.windowMinutes}د`}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                                      <span>
                                        {analysis.status === 'exceeded'
                                          ? `⚠️ زيادة ${analysis.diff}د (${analysis.totalSlotsMinutes}د / متاح ${analysis.windowMinutes}د)`
                                          : `⚠️ نقص ${Math.abs(analysis.diff)}د (${analysis.totalSlotsMinutes}د / متاح ${analysis.windowMinutes}د)`}
                                      </span>
                                    </div>
                                  )}

                                  {/* Add another session button inside same cell */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCell(day, 'morning_1', timings.morning1Start)}
                                    className="print:hidden w-full py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/50 hover:bg-amber-200/80 rounded border border-dashed border-amber-400 cursor-pointer"
                                  >
                                    + حصة أخرى
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCell(day, 'morning_1', timings.morning1Start)}
                                  className="w-full h-full min-h-[70px] flex flex-col items-center justify-center text-stone-400 hover:text-amber-700 hover:bg-amber-100/40 rounded-xl transition-all cursor-pointer border border-dashed border-stone-200 hover:border-amber-400 p-2"
                                >
                                  <span className="text-base font-black leading-none mb-1">+</span>
                                  <span className="text-[10px] font-bold">إضافة حصة</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Morning Break Row (استراحة) */}
                      <tr className="bg-stone-200/90 text-stone-800 border-t border-b border-stone-900 font-black text-xs">
                        <td colSpan={7} className={`border-r border-l-2 ${currentTheme.border} py-1 tracking-widest text-center`}>
                          اسـتـراحـة
                        </td>
                      </tr>

                      {/* Morning Sub-period 2 */}
                      <tr className={`h-28 border-b-2 ${currentTheme.border}`}>
                        {/* Timing Column: Morning 2 (Editable) */}
                        <td
                          onClick={() => {
                            setTempTimings(timings);
                            setIsTimingModalOpen(true);
                          }}
                          className={`border-r border-l-2 ${currentTheme.border} p-1 font-bold text-[11px] bg-stone-50/70 relative cursor-pointer hover:bg-amber-100/60 transition-colors`}
                        >
                          <div className="absolute top-1.5 left-0 right-0 text-center font-black">
                            {timings.morning2Start}
                          </div>
                          <div className="absolute bottom-1.5 left-0 right-0 text-center font-black">
                            {timings.morning2End}
                          </div>
                        </td>

                        {/* 6 Day Cells for Morning 2 */}
                        {DAYS_OF_WEEK.map((day) => {
                          const slots = getSlotsForPeriod(day, 'morning_2');
                          const analysis = getPeriodDurationAnalysis(day, 'morning_2');
                          return (
                            <td
                              key={`m2-${day}`}
                              className={`border-r border-l ${currentTheme.border} p-1.5 align-middle relative hover:bg-amber-50/40 transition-colors group`}
                            >
                              {slots.length > 0 ? (
                                <div className="space-y-1.5">
                                  {slots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      onClick={() => handleOpenCell(day, 'morning_2', timings.morning2Start, slot)}
                                      className={`p-1 rounded-lg ${currentTheme.slotBg} hover:opacity-90 cursor-pointer text-right transition-all shadow-2xs`}
                                    >
                                      <div className="font-black text-xs leading-tight">
                                        {slot.subject}
                                      </div>
                                      <div className={`text-[10px] ${currentTheme.slotTimeColor} font-black`}>
                                        {slot.startTime} - {slot.endTime}
                                      </div>
                                      <div className="text-[9px] text-stone-600 font-bold">
                                        {slot.group || profile.classGroup || 'فوج 1'}
                                      </div>
                                    </div>
                                  ))}

                                  {/* PROMINENT Duration Mismatch Warning Badge */}
                                  {analysis.status !== 'match' && (
                                    <div
                                      className={`print:hidden p-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 shadow-2xs border ${
                                        analysis.status === 'exceeded'
                                          ? 'bg-red-100 text-red-900 border-red-400 font-black animate-bounce'
                                          : 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                                      }`}
                                      title={`المجموع المدخل: ${analysis.totalSlotsMinutes}د / المخصص للفترة: ${analysis.windowMinutes}د`}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                                      <span>
                                        {analysis.status === 'exceeded'
                                          ? `⚠️ زيادة ${analysis.diff}د (${analysis.totalSlotsMinutes}د / متاح ${analysis.windowMinutes}د)`
                                          : `⚠️ نقص ${Math.abs(analysis.diff)}د (${analysis.totalSlotsMinutes}د / متاح ${analysis.windowMinutes}د)`}
                                      </span>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleOpenCell(day, 'morning_2', timings.morning2Start)}
                                    className="print:hidden w-full py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/50 hover:bg-amber-200/80 rounded border border-dashed border-amber-400 cursor-pointer"
                                  >
                                    + حصة أخرى
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCell(day, 'morning_2', timings.morning2Start)}
                                  className="w-full h-full min-h-[70px] flex flex-col items-center justify-center text-stone-400 hover:text-amber-700 hover:bg-amber-100/40 rounded-xl transition-all cursor-pointer border border-dashed border-stone-200 hover:border-amber-400 p-2"
                                >
                                  <span className="text-base font-black leading-none mb-1">+</span>
                                  <span className="text-[10px] font-bold">إضافة حصة</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* ========================================================================= */}
                      {/* SEPARATOR: عازل رمادي بين الفترة الصباحية والمسائية                       */}
                      {/* ========================================================================= */}
                      <tr className={`bg-stone-300 dark:bg-stone-300 h-5 border-t-2 border-b-2 ${currentTheme.border}`}>
                        <td colSpan={8} className={`p-0 border-r-2 border-l-2 ${currentTheme.border} bg-stone-300`} />
                      </tr>

                      {/* ========================================================================= */}
                      {/* SECTION 2: الفترة المسائية                                                 */}
                      {/* ========================================================================= */}
                      {/* Afternoon Sub-period 1 */}
                      <tr className="h-28 border-b border-stone-400">
                        {/* Vertical Period Header: المسائية */}
                        <td
                          rowSpan={3}
                          className={`border-r-2 border-l-2 ${currentTheme.border} ${currentTheme.headerBg} font-black text-xs p-1 select-none`}
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          المسائية
                        </td>

                        {/* Timing Column: Afternoon 1 (Editable) */}
                        <td
                          onClick={() => {
                            setTempTimings(timings);
                            setIsTimingModalOpen(true);
                          }}
                          className={`border-r border-l-2 ${currentTheme.border} p-1 font-bold text-[11px] bg-stone-50/70 relative cursor-pointer hover:bg-amber-100/60 transition-colors`}
                        >
                          <div className="absolute top-1.5 left-0 right-0 text-center font-black">
                            {timings.afternoon1Start}
                          </div>
                          <div className="absolute bottom-1.5 left-0 right-0 text-center font-black">
                            {timings.afternoon1End}
                          </div>
                        </td>

                        {/* 6 Day Cells for Afternoon 1 */}
                        {DAYS_OF_WEEK.map((day) => {
                          const slots = getSlotsForPeriod(day, 'afternoon_1');
                          const analysis = getPeriodDurationAnalysis(day, 'afternoon_1');
                          return (
                            <td
                              key={`a1-${day}`}
                              className={`border-r border-l ${currentTheme.border} p-1.5 align-middle relative hover:bg-amber-50/40 transition-colors group`}
                            >
                              {slots.length > 0 ? (
                                <div className="space-y-1.5">
                                  {slots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      onClick={() => handleOpenCell(day, 'afternoon_1', timings.afternoon1Start, slot)}
                                      className={`p-1 rounded-lg ${currentTheme.slotBg} hover:opacity-90 cursor-pointer text-right transition-all shadow-2xs`}
                                    >
                                      <div className="font-black text-xs leading-tight">
                                        {slot.subject}
                                      </div>
                                      <div className={`text-[10px] ${currentTheme.slotTimeColor} font-black`}>
                                        {slot.startTime} - {slot.endTime}
                                      </div>
                                      <div className="text-[9px] text-stone-600 font-bold">
                                        {slot.group || profile.classGroup || 'فوج 1'}
                                      </div>
                                    </div>
                                  ))}

                                  {/* PROMINENT Duration Mismatch Warning Badge */}
                                  {analysis.status !== 'match' && (
                                    <div
                                      className={`print:hidden p-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 shadow-2xs border ${
                                        analysis.status === 'exceeded'
                                          ? 'bg-red-100 text-red-900 border-red-400 font-black animate-bounce'
                                          : 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                                      }`}
                                      title={`المجموع المدخل: ${analysis.totalSlotsMinutes}د / المخصص للفترة: ${analysis.windowMinutes}د`}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                                      <span>
                                        {analysis.status === 'exceeded'
                                          ? `⚠️ زيادة ${analysis.diff}د (${analysis.totalSlotsMinutes}د / متاح ${analysis.windowMinutes}د)`
                                          : `⚠️ نقص ${Math.abs(analysis.diff)}د (${analysis.totalSlotsMinutes}د / متاح ${analysis.windowMinutes}د)`}
                                      </span>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleOpenCell(day, 'afternoon_1', timings.afternoon1Start)}
                                    className="print:hidden w-full py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/50 hover:bg-amber-200/80 rounded border border-dashed border-amber-400 cursor-pointer"
                                  >
                                    + حصة أخرى
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCell(day, 'afternoon_1', timings.afternoon1Start)}
                                  className="w-full h-full min-h-[70px] flex flex-col items-center justify-center text-stone-400 hover:text-amber-700 hover:bg-amber-100/40 rounded-xl transition-all cursor-pointer border border-dashed border-stone-200 hover:border-amber-400 p-2"
                                >
                                  <span className="text-base font-black leading-none mb-1">+</span>
                                  <span className="text-[10px] font-bold">إضافة حصة</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Afternoon Break Row (استراحة) */}
                      <tr className="bg-stone-200/90 text-stone-800 border-t border-b border-stone-900 font-black text-xs">
                        <td colSpan={7} className={`border-r border-l-2 ${currentTheme.border} py-1 tracking-widest text-center`}>
                          اسـتـراحـة
                        </td>
                      </tr>

                      {/* Afternoon Sub-period 2 */}
                      <tr className={`h-28 border-b-2 ${currentTheme.border}`}>
                        {/* Timing Column: Afternoon 2 (Editable) */}
                        <td
                          onClick={() => {
                            setTempTimings(timings);
                            setIsTimingModalOpen(true);
                          }}
                          className={`border-r border-l-2 ${currentTheme.border} p-1 font-bold text-[11px] bg-stone-50/70 relative cursor-pointer hover:bg-amber-100/60 transition-colors`}
                        >
                          <div className="absolute top-1.5 left-0 right-0 text-center font-black">
                            {timings.afternoon2Start}
                          </div>
                          <div className="absolute bottom-1.5 left-0 right-0 text-center font-black">
                            {timings.afternoon2End}
                          </div>
                        </td>

                        {/* 6 Day Cells for Afternoon 2 */}
                        {DAYS_OF_WEEK.map((day) => {
                          const slots = getSlotsForPeriod(day, 'afternoon_2');
                          const analysis = getPeriodDurationAnalysis(day, 'afternoon_2');
                          return (
                            <td
                              key={`a2-${day}`}
                              className={`border-r border-l ${currentTheme.border} p-1.5 align-middle relative hover:bg-amber-50/40 transition-colors group`}
                            >
                              {slots.length > 0 ? (
                                <div className="space-y-1.5">
                                  {slots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      onClick={() => handleOpenCell(day, 'afternoon_2', timings.afternoon2Start, slot)}
                                      className={`p-1 rounded-lg ${currentTheme.slotBg} hover:opacity-90 cursor-pointer text-right transition-all shadow-2xs`}
                                    >
                                      <div className="font-black text-xs leading-tight">
                                        {slot.subject}
                                      </div>
                                      <div className={`text-[10px] ${currentTheme.slotTimeColor} font-black`}>
                                        {slot.startTime} - {slot.endTime}
                                      </div>
                                      <div className="text-[9px] text-stone-600 font-bold">
                                        {slot.group || profile.classGroup || 'فوج 1'}
                                      </div>
                                    </div>
                                  ))}

                                  {/* PROMINENT Duration Mismatch Warning Badge */}
                                  {analysis.status !== 'match' && (
                                    <div
                                      className={`print:hidden p-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 shadow-2xs border ${
                                        analysis.status === 'exceeded'
                                          ? 'bg-red-100 text-red-900 border-red-400 font-black animate-bounce'
                                          : 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                                      }`}
                                      title={`المجموع المدخل: ${analysis.totalSlotsMinutes}د / المخصص للفترة: ${analysis.windowMinutes}د`}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                                      <span>
                                        {analysis.status === 'exceeded'
                                          ? `⚠️ زيادة ${analysis.diff}د (${analysis.totalSlotsMinutes}د / متاح ${analysis.windowMinutes}د)`
                                          : `⚠️ نقص ${Math.abs(analysis.diff)}د (${analysis.totalSlotsMinutes}د / متاح ${analysis.windowMinutes}د)`}
                                      </span>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleOpenCell(day, 'afternoon_2', timings.afternoon2Start)}
                                    className="print:hidden w-full py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/50 hover:bg-amber-200/80 rounded border border-dashed border-amber-400 cursor-pointer"
                                  >
                                    + حصة أخرى
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCell(day, 'afternoon_2', timings.afternoon2Start)}
                                  className="w-full h-full min-h-[70px] flex flex-col items-center justify-center text-stone-400 hover:text-amber-700 hover:bg-amber-100/40 rounded-xl transition-all cursor-pointer border border-dashed border-stone-200 hover:border-amber-400 p-2"
                                >
                                  <span className="text-base font-black leading-none mb-1">+</span>
                                  <span className="text-[10px] font-bold">إضافة حصة</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Signatures Section (3 Official Approval Columns) */}
              <div className={`mt-8 pt-4 border-t-2 ${currentTheme.border} grid grid-cols-3 gap-4 text-center text-xs font-black`}>
                <div className="space-y-12">
                  <p className="underline decoration-1 underline-offset-4">توقيع الأستاذ(ة)</p>
                  <p className="text-stone-400 font-normal">........................</p>
                </div>
                <div className="space-y-12">
                  <p className="underline decoration-1 underline-offset-4">توقيع السيد مدير المؤسسة</p>
                  <p className="text-stone-400 font-normal">........................</p>
                </div>
                <div className="space-y-12">
                  <p className="underline decoration-1 underline-offset-4">توقيع السيد المفتش التربوي</p>
                  <p className="text-stone-400 font-normal">........................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: WORD-OFFICE STYLE & TYPOGRAPHY STUDIO                            */}
      {/* (Richer color palette & expanded Arabic typography fonts)                  */}
      {/* ========================================================================= */}
      {isStyleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black">استوديو التنسيق والخطوط (Word-Style Studio)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStyleModalOpen(false)}
                className="p-1 rounded-xl hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* 1. Custom Title Input */}
              <div>
                <label className="block font-black text-stone-800 dark:text-stone-200 mb-1.5">
                  عنوان وثيقة استعمال الزمن:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-bold text-sm"
                  placeholder="مثال: استعمال الزمن - المستوى الرابع"
                />
              </div>

              {/* 2. Arabic Font Family Selection (8+ Arabic Fonts like Word) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-amber-600" />
                    <span>نوع الخط العربي (Word Fonts):</span>
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">خطوط عربية كلاسيكية وحديثة</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(fontDefinitions).map(([key, f]) => {
                    const isSelected = fontFamily === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setFontFamily(key as any)}
                        style={{ fontFamily: f.fontCss }}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 font-black shadow-2xs'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 bg-stone-50/60 dark:bg-stone-800/40 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-black">{f.name}</div>
                          <div className="text-xs text-stone-500 font-normal">المملكة المغربية - استعمال الزمن</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Font Scale / Size */}
              <div>
                <label className="block font-black text-stone-800 dark:text-stone-200 mb-1.5">
                  حجم وتكثيف الخط:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'compact', name: 'مدمج (صغير)' },
                    { id: 'normal', name: 'معتمد (عادي)' },
                    { id: 'medium', name: 'متوسط' },
                    { id: 'large', name: 'بارز (كبير)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFontScale(s.id as any)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        fontScale === s.id
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-black shadow-2xs'
                          : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Rich Color Themes Palette (11 Curated Themes) */}
              <div>
                <label className="block font-black text-stone-800 dark:text-stone-200 mb-2">
                  لوحة الألوان الرسمية المعتمدة (11 نسقاً):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(themeClasses).map(([key, t]) => {
                    const isSelected = themeStyle === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setThemeStyle(key as any)}
                        className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-2xs font-black'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full shrink-0 shadow-inner border border-white/40 ${t.previewBg}`}
                        />
                        <div className="text-[11px] font-bold truncate leading-tight">
                          {t.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStyleModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveStyle}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>تطبيق التنسيق</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AI SCAN & OLD TIMETABLE IMAGE OCR EXTRACTION                     */}
      {/* ========================================================================= */}
      {isAiScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800">
            {/* Modal Header */}
            <div className="bg-amber-600 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <h3 className="text-base font-black">تصوير / استيراد صورة استعمال الزمن القديم</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAiScanModalOpen(false)}
                className="p-1 rounded-xl hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                قم بتصوير أو رفع وثيقة استعمال الزمن القديم وسيقوم الذكاء الاصطناعي باستخراج الحصص والمواقيت والأفواج آلياً لملء الجدول فوراً.
              </p>

              {/* Image Input Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-dashed border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex flex-col items-center justify-center gap-2 text-amber-800 dark:text-amber-300 font-black cursor-pointer transition-all"
                >
                  <Camera className="w-6 h-6" />
                  <span>التقاط بالكاميرا 📷</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-400 hover:bg-stone-50 dark:hover:bg-stone-800 flex flex-col items-center justify-center gap-2 text-stone-700 dark:text-stone-300 font-black cursor-pointer transition-all"
                >
                  <Upload className="w-6 h-6 text-amber-600" />
                  <span>رفع ملف صورة 📁</span>
                </button>
              </div>

              {/* Image Preview Box */}
              {scannedImagePreview && (
                <div className="space-y-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <div className="relative max-h-56 overflow-hidden rounded-xl bg-stone-900 flex items-center justify-center">
                    <img
                      src={scannedImagePreview}
                      alt="Timetable Preview"
                      className="max-h-56 w-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScannedImagePreview(null);
                        setScanResult(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md cursor-pointer"
                      title="حذف الصورة"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!scanResult && (
                    <button
                      type="button"
                      disabled={isScanningAi}
                      onClick={handleRunAiExtraction}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
                    >
                      {isScanningAi ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>جاري قراءة واستخراج الحصص بالذكاء الاصطناعي...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>بدء استخراج الحصص والمواقيت ⚡</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Image Scan Error Banner */}
              {scanError && (
                <ImageScanErrorBanner
                  customMessage={scanError}
                  onRetakePhoto={() => {
                    setScanError(null);
                    setScannedImagePreview(null);
                    cameraInputRef.current?.click();
                  }}
                  onUploadDifferentFile={() => {
                    setScanError(null);
                    setScannedImagePreview(null);
                    fileInputRef.current?.click();
                  }}
                />
              )}

              {/* Scan Results Display */}
              {scanResult && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>تم استخراج {scanResult.slots.length} حصة بنجاح!</span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1 text-[11px]">
                    {scanResult.slots.map((s, idx) => (
                      <div key={idx} className="p-1.5 bg-white dark:bg-stone-900 rounded-lg flex justify-between items-center">
                        <span className="font-bold">{s.day} - {s.subject}</span>
                        <span className="text-stone-500 font-mono">{s.startTime} - {s.endTime}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyAiResult('replace')}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
                    >
                      استبدال الجدول الحالي بالحصص المستخرجة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TIMINGS EDIT MODAL                                               */}
      {/* ========================================================================= */}
      {isTimingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200 dark:border-stone-800">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-black">تعديل مواقيت الفترات والأشطار</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTimingModalOpen(false)}
                className="p-1 rounded-xl hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTimings} className="p-6 space-y-4 text-xs">
              <div className="space-y-3">
                <h4 className="font-black text-stone-800 dark:text-stone-200">الفترة الصباحية (الشطر 1 و 2):</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">الشطر 1 (بداية):</label>
                    <input
                      type="time"
                      value={tempTimings.morning1Start}
                      onChange={(e) => setTempTimings({ ...tempTimings, morning1Start: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">الشطر 1 (نهاية):</label>
                    <input
                      type="time"
                      value={tempTimings.morning1End}
                      onChange={(e) => setTempTimings({ ...tempTimings, morning1End: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">الشطر 2 (بداية):</label>
                    <input
                      type="time"
                      value={tempTimings.morning2Start}
                      onChange={(e) => setTempTimings({ ...tempTimings, morning2Start: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">الشطر 2 (نهاية):</label>
                    <input
                      type="time"
                      value={tempTimings.morning2End}
                      onChange={(e) => setTempTimings({ ...tempTimings, morning2End: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <h4 className="font-black text-stone-800 dark:text-stone-200">الفترة المسائية (الشطر 1 و 2):</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">الشطر 1 (بداية):</label>
                    <input
                      type="time"
                      value={tempTimings.afternoon1Start}
                      onChange={(e) => setTempTimings({ ...tempTimings, afternoon1Start: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">الشطر 1 (نهاية):</label>
                    <input
                      type="time"
                      value={tempTimings.afternoon1End}
                      onChange={(e) => setTempTimings({ ...tempTimings, afternoon1End: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">الشطر 2 (بداية):</label>
                    <input
                      type="time"
                      value={tempTimings.afternoon2Start}
                      onChange={(e) => setTempTimings({ ...tempTimings, afternoon2Start: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">الشطر 2 (نهاية):</label>
                    <input
                      type="time"
                      value={tempTimings.afternoon2End}
                      onChange={(e) => setTempTimings({ ...tempTimings, afternoon2End: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimingModalOpen(false)}
                  className="px-4 py-2 text-stone-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
                >
                  حفظ المواقيت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SNAPSHOTS & SAVED TIMETABLES ARCHIVE                             */}
      {/* ========================================================================= */}
      {isSnapshotsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800">
            <div className="bg-amber-600 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5" />
                <h3 className="text-base font-black">أرشيف نماذج استعمال الزمن المحفوظة</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSnapshotsModalOpen(false)}
                className="p-1 rounded-xl hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Save Current as New Snapshot Form */}
              <form onSubmit={handleSaveSnapshot} className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
                <label className="block font-black text-amber-950 dark:text-amber-200 text-xs">
                  حفظ الجدول الحالي في الأرشيف للسنوات القادمة:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    placeholder={`مثال: نموذج ${profile.level || 'المستوى'} - فوج 1`}
                    className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl font-bold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ الآن</span>
                  </button>
                </div>
                {snapshotSuccessMsg && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-black text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{snapshotSuccessMsg}</span>
                  </p>
                )}
              </form>

              {/* List of Saved Snapshots */}
              <div className="space-y-2">
                <h4 className="font-black text-stone-800 dark:text-stone-200">النماذج المحفوظة ({savedSnapshots.length}):</h4>
                {savedSnapshots.length === 0 ? (
                  <p className="text-stone-400 text-center py-6">لا توجد نماذج محفوظة بعد في الأرشيف.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {savedSnapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="font-black text-stone-900 dark:text-stone-100 text-sm">
                            {snap.name}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {new Date(snap.savedAt).toLocaleDateString('ar-MA')} • {snap.slotsCount} حصة • {snap.level}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadSnapshot(snap)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs"
                          >
                            استرجاع
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="حذف من الأرشيف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CELL SLOT ADD / EDIT MODAL                                       */}
      {/* ========================================================================= */}
      {activeCellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 dark:border-stone-800">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                <h3 className="text-base font-black">
                  {activeCellModal.existingSlot ? 'تعديل الحصة' : 'إضافة حصة جديدة'} ({activeCellModal.day})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCellModal(null)}
                className="p-1 rounded-xl hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="p-6 space-y-4 text-xs">
              {/* Subject Selection */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">المادة الدراسية:</label>
                <select
                  value={cellSubject}
                  onChange={(e) => setCellSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold"
                >
                  <option value="اللغة العربية">اللغة العربية</option>
                  <option value="الرياضيات">الرياضيات</option>
                  <option value="Français">Français (اللغة الفرنسية)</option>
                  <option value="النشاط العلمي">النشاط العلمي</option>
                  <option value="التربية الإسلامية">التربية الإسلامية</option>
                  <option value="التربية الفنية">التربية الفنية</option>
                  <option value="التربية البدنية">التربية البدنية</option>
                  <option value="اللغة الأمازيغية">اللغة الأمازيغية</option>
                  <option value="التاريخ والجغرافيا">التاريخ والجغرافيا</option>
                  <option value="التربية المدنية">التربية المدنية</option>
                  <option value="الدعم والمواكبة">الدعم والمواكبة</option>
                  <option value="أنشطة الحياة المدرسية">أنشطة الحياة المدرسية</option>
                </select>
              </div>

              {/* Timing Controls (Start Time, Duration, End Time) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">وقت البداية:</label>
                  <input
                    type="time"
                    value={cellStartTime}
                    onChange={(e) => {
                      setCellStartTime(e.target.value);
                      setCellEndTime(calculateEndTime(e.target.value, cellDuration));
                    }}
                    className="w-full px-2 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">المدة (دقيقة):</label>
                  <select
                    value={cellDuration}
                    onChange={(e) => {
                      const dur = Number(e.target.value);
                      setCellDuration(dur);
                      setCellEndTime(calculateEndTime(cellStartTime, dur));
                    }}
                    className="w-full px-2 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold text-center"
                  >
                    <option value={30}>30 دقيقة</option>
                    <option value={45}>45 دقيقة</option>
                    <option value={50}>50 دقيقة</option>
                    <option value={55}>55 دقيقة</option>
                    <option value={60}>60 دقيقة (ساعة)</option>
                    <option value={75}>75 دقيقة</option>
                    <option value={80}>80 دقيقة</option>
                    <option value={90}>90 دقيقة (ساعة ونصف)</option>
                    <option value={105}>105 دقيقة</option>
                    <option value={120}>120 دقيقة (ساعتان)</option>
                    <option value={135}>135 دقيقة (شطر كامل)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">وقت النهاية:</label>
                  <input
                    type="time"
                    value={cellEndTime}
                    onChange={(e) => setCellEndTime(e.target.value)}
                    className="w-full px-2 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono text-center font-bold"
                  />
                </div>
              </div>

              {/* Group / Class Selection */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">الفوج / القسم:</label>
                <input
                  type="text"
                  value={cellGroup}
                  onChange={(e) => setCellGroup(e.target.value)}
                  placeholder="مثال: الفوج 1 / الفوج 2 / القسم كامل"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">ملاحظة بيداغوجية (اختياري):</label>
                <input
                  type="text"
                  value={cellNotes}
                  onChange={(e) => setCellNotes(e.target.value)}
                  placeholder="مثال: قاعة 3 / ورشة القراءة"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                {activeCellModal.existingSlot ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(activeCellModal.existingSlot!.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الحصة</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCellModal(null)}
                    className="px-4 py-2 text-stone-600 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
                  >
                    حفظ الحصة
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
