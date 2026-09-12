import React, { useState, useEffect } from 'react';
import { PrintTheme } from '../types';
import {
  MAIN_COLOR_PRESETS,
  ARABIC_FONT_PRESETS,
  LATIN_FONT_PRESETS,
  FONT_SCALE_PRESETS,
  getFontFamilyCss,
} from '../data/themePresets';
import {
  Palette,
  Type,
  Check,
  CheckCircle2,
  X,
  Sparkles,
  Sliders,
  Maximize2,
  Eye,
} from 'lucide-react';

interface ThemeFontSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: PrintTheme;
  onApplyTheme: (newTheme: PrintTheme) => void;
  title?: string;
}

export const ThemeFontSettingsModal: React.FC<ThemeFontSettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onApplyTheme,
  title = 'إعدادات الألوان والخطوط للوثائق والمذكرات',
}) => {
  // Temporary state while user is choosing in the modal
  const [selectedColorId, setSelectedColorId] = useState<string>(
    currentTheme.styleName || 'pioneer-orange'
  );
  const [selectedArabicFont, setSelectedArabicFont] = useState<string>(
    currentTheme.fontFamily || 'cairo'
  );
  const [selectedLatinFont, setSelectedLatinFont] = useState<string>(
    currentTheme.latinFontFamily || 'inter'
  );
  const [selectedScale, setSelectedScale] = useState<'compact' | 'normal' | 'large' | 'xlarge'>(
    currentTheme.fontScale || 'normal'
  );
  const [headerVisible, setHeaderVisible] = useState<boolean>(
    currentTheme.headerVisible ?? true
  );

  // Sync with prop when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedColorId(currentTheme.styleName || 'pioneer-orange');
      setSelectedArabicFont(currentTheme.fontFamily || 'cairo');
      setSelectedLatinFont(currentTheme.latinFontFamily || 'inter');
      setSelectedScale(currentTheme.fontScale || 'normal');
      setHeaderVisible(currentTheme.headerVisible ?? true);
    }
  }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  const currentColorPreset =
    MAIN_COLOR_PRESETS.find((c) => c.id === selectedColorId) || MAIN_COLOR_PRESETS[0];
  const currentArabicPreset =
    ARABIC_FONT_PRESETS.find((f) => f.id === selectedArabicFont) || ARABIC_FONT_PRESETS[0];
  const currentLatinPreset =
    LATIN_FONT_PRESETS.find((f) => f.id === selectedLatinFont) || LATIN_FONT_PRESETS[0];
  const currentScalePreset =
    FONT_SCALE_PRESETS.find((s) => s.id === selectedScale) || FONT_SCALE_PRESETS[1];

  // Handle OK button click
  const handleConfirmAndSave = () => {
    const updatedTheme: PrintTheme = {
      styleName: currentColorPreset.id,
      primaryColor: currentColorPreset.primary,
      accentColor: currentColorPreset.accent,
      borderColor: currentColorPreset.border,
      fontFamily: selectedArabicFont,
      latinFontFamily: selectedLatinFont,
      fontScale: selectedScale,
      headerVisible: headerVisible,
    };

    localStorage.setItem('pioneer_print_theme', JSON.stringify(updatedTheme));
    onApplyTheme(updatedTheme);
    onClose();
  };

  return (
    <div
      id="theme-font-settings-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        id="theme-font-settings-dialog"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm transition-colors"
              style={{ backgroundColor: currentColorPreset.primary }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{title}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                حدد اللون والخط المفضلين من القوائم ثم اضغط موافق لتطبيق الخيارات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. Main Colors List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. قائمة الألوان الرئيسية المعتمدة:</span>
              </label>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                اللون الحالي:{' '}
                <span className="font-black text-stone-800 dark:text-stone-200">
                  {currentColorPreset.label}
                </span>
              </span>
            </div>

            {/* Selectable Dropdown List */}
            <div className="relative">
              <select
                id="main-color-select-list"
                value={selectedColorId}
                onChange={(e) => setSelectedColorId(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-2xl py-3 px-4 font-bold text-xs sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none transition-all cursor-pointer shadow-2xs"
              >
                {MAIN_COLOR_PRESETS.map((color) => (
                  <option key={color.id} value={color.id}>
                    ● {color.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick-Click Color Swatches Grid */}
            <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MAIN_COLOR_PRESETS.map((color) => {
                const isSelected = color.id === selectedColorId;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-right transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-stone-900 dark:border-white bg-stone-100 dark:bg-stone-800 shadow-2xs scale-[1.02]'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-850'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-white dark:border-stone-900"
                      style={{ backgroundColor: color.primary }}
                    />
                    <span
                      className={`text-[11px] truncate font-bold ${
                        isSelected
                          ? 'text-stone-950 dark:text-white'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {color.label.split('(')[0].trim()}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-stone-200 dark:bg-stone-800" />

          {/* 2. Arabic Font Type List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. قائمة نوع الخط العربي (Arabic Font):</span>
              </label>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                {ARABIC_FONT_PRESETS.length} خيارات خطوط متاحة
              </span>
            </div>

            {/* Selectable Dropdown List */}
            <select
              id="arabic-font-select-list"
              value={selectedArabicFont}
              onChange={(e) => setSelectedArabicFont(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-2xl py-3 px-4 font-bold text-xs sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none transition-all cursor-pointer shadow-2xs"
            >
              {ARABIC_FONT_PRESETS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name} — {font.sample}
                </option>
              ))}
            </select>

            {/* Arabic Font Live Preview Card */}
            <div
              className="p-3 bg-amber-50/50 dark:bg-stone-800/80 rounded-2xl border border-amber-200/60 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-sm transition-all"
              style={{ fontFamily: currentArabicPreset.cssFamily }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-xs text-amber-800 dark:text-amber-400">
                  معاينة الخط العربي المختار ({currentArabicPreset.name}):
                </span>
              </div>
              <p className="text-sm font-semibold leading-relaxed">
                «المملكة المغربية — وزارة التربية الوطنية والتعليم الأولي والرياضة — مذكرة الأنشطة اليومية والخطاطات الذهنية لمدارس الريادة»
              </p>
            </div>
          </div>

          <div className="h-px bg-stone-200 dark:bg-stone-800" />

          {/* 3. Latin / French Font Type List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. قائمة نوع الخط الفرنسي واللاتيني (Police Française / Latine):</span>
              </label>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                {LATIN_FONT_PRESETS.length} polices
              </span>
            </div>

            {/* Selectable Dropdown List */}
            <select
              id="latin-font-select-list"
              value={selectedLatinFont}
              onChange={(e) => setSelectedLatinFont(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-2xl py-3 px-4 font-bold text-xs sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none transition-all cursor-pointer shadow-2xs"
            >
              {LATIN_FONT_PRESETS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name} — {font.sample}
                </option>
              ))}
            </select>

            {/* Latin Font Live Preview Card */}
            <div
              className="p-3 bg-stone-100/70 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-sm transition-all"
              style={{ fontFamily: currentLatinPreset.cssFamily }}
              dir="ltr"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-stone-600 dark:text-stone-400">
                  Aperçu de la police française ({currentLatinPreset.name}) :
                </span>
              </div>
              <p className="text-sm font-semibold leading-relaxed">
                Royaume du Maroc — Écoles Pionnières — Cahier Journal & Carte Mentale de Français
              </p>
            </div>
          </div>

          <div className="h-px bg-stone-200 dark:bg-stone-800" />

          {/* 4. Font Scale and Header Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. مقاس وكثافة الخط للطباعة:</span>
              </label>
              <select
                id="font-scale-select-list"
                value={selectedScale}
                onChange={(e) => setSelectedScale(e.target.value as any)}
                className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-2xl py-2.5 px-3 font-bold text-xs focus:border-amber-500 outline-none cursor-pointer"
              >
                {FONT_SCALE_PRESETS.map((scale) => (
                  <option key={scale.id} value={scale.id}>
                    {scale.label} — {scale.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>الترويسة الرسمية في المذكرة:</span>
              </label>
              <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800 dark:text-stone-200">
                  <input
                    type="checkbox"
                    checked={headerVisible}
                    onChange={(e) => setHeaderVisible(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>إظهار الترويسة في المذكرة اليومية</span>
                </label>
              </div>
            </div>
          </div>

          {/* 5. Real-Time Composite Preview Banner */}
          <div
            className="rounded-2xl p-4 text-white shadow-md transition-all flex flex-col gap-2"
            style={{
              backgroundColor: currentColorPreset.primary,
              fontFamily: currentArabicPreset.cssFamily,
            }}
          >
            <div className="flex items-center justify-between text-xs opacity-90 pb-1 border-b border-white/20">
              <span className="flex items-center gap-1 font-bold">
                <Eye className="w-3.5 h-3.5" />
                معاينة المظهر النهائي للوثائق عند الطباعة
              </span>
              <span className="font-bold">{currentColorPreset.label}</span>
            </div>
            <div className="text-base sm:text-lg font-black">
              المذكرة اليومية والخطاطة الذهنية — مقاربة طارل TaRL
            </div>
            <div
              className="text-xs opacity-90 font-medium"
              style={{ fontFamily: currentLatinPreset.cssFamily }}
              dir="ltr"
            >
              Exemple : Séance 12 — Activités d'Enseignement Explicite & Pratique Guidée
            </div>
          </div>
        </div>

        {/* Modal Footer with OK Button */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            id="btn-confirm-theme-font-ok"
            onClick={handleConfirmAndSave}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-6 sm:px-8 py-3 rounded-2xl text-sm font-black shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>موافق (OK) — تطبيق وحفظ الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
