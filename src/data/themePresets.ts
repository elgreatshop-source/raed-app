import type React from 'react';
import { PrintTheme } from '../types';

export interface ColorPreset {
  id: string;
  label: string;
  description: string;
  primary: string;
  accent: string;
  border: string;
  previewHex: string;
}

export interface FontPreset {
  id: string;
  name: string;
  cssFamily: string;
  sample: string;
  category: 'sans' | 'serif' | 'display' | 'kufi';
}

export interface LatinFontPreset {
  id: string;
  name: string;
  cssFamily: string;
  sample: string;
}

export interface FontScalePreset {
  id: 'compact' | 'normal' | 'large' | 'xlarge';
  label: string;
  description: string;
  bodyClass: string;
  scaleFactor: number;
}

// Curated Main Color Palettes for Moroccan Educational Documents
export const MAIN_COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'pioneer-orange',
    label: 'برتقالي الريادة (المعتمد الرسمي TaRL)',
    description: 'اللون الرسمي المعتمد في حقائب مدارس الريادة وتكوينات TaRL',
    primary: '#d97706',
    accent: '#fef3c7',
    border: '#b45309',
    previewHex: '#d97706',
  },
  {
    id: 'emerald-green',
    label: 'أخضر زمردي وزاري (أكاديمي رسمي)',
    description: 'نمط هادئ ومريح للعين يعكس الطابع الأكاديمي والتربوي',
    primary: '#059669',
    accent: '#d1fae5',
    border: '#047857',
    previewHex: '#059669',
  },
  {
    id: 'classic-blue',
    label: 'أزرق ملكي أكاديمي (إداري وتربوي)',
    description: 'نمط رفيع مخصص للتقارير والملفات الإدارية والتفتيشية',
    primary: '#1d4ed8',
    accent: '#dbeafe',
    border: '#1e40af',
    previewHex: '#1d4ed8',
  },
  {
    id: 'indigo-official',
    label: 'نيلي رسمي وقور',
    description: 'درجة نيلية داكنة مريحة للطباعة الملونة عالية التباين',
    primary: '#4338ca',
    accent: '#e0e7ff',
    border: '#3730a3',
    previewHex: '#4338ca',
  },
  {
    id: 'maroon-academic',
    label: 'عنابي كلاسيكي متميز',
    description: 'طابع توثيقي تراثي أنيق للوثائق الرسمية',
    primary: '#881337',
    accent: '#ffe4e6',
    border: '#701a75',
    previewHex: '#881337',
  },
  {
    id: 'teal-ocean',
    label: 'تركوازي بحري هادئ',
    description: 'طابع عصري متوازن ومريح جداً للقراءة والتركيز',
    primary: '#0f766e',
    accent: '#ccfbf1',
    border: '#115e59',
    previewHex: '#0f766e',
  },
  {
    id: 'purple-royal',
    label: 'بنفسجي ملكي فاخر',
    description: 'طابع مميز للمذكرات والخطاطات الإبداعية',
    primary: '#7e22ce',
    accent: '#f3e8ff',
    border: '#6b21a8',
    previewHex: '#7e22ce',
  },
  {
    id: 'ruby-red',
    label: 'أحمر ياقوتي حيوي',
    description: 'درجة حمراء دافئة للأنشطة والتقويمات النشطة',
    primary: '#b91c1c',
    accent: '#fee2e2',
    border: '#991b1b',
    previewHex: '#b91c1c',
  },
  {
    id: 'golden-ochre',
    label: 'ذهبي مغربي دافئ',
    description: 'مستوحى من المعمار المغربي التراثي الأصيل',
    primary: '#ca8a04',
    accent: '#fef9c3',
    border: '#a16207',
    previewHex: '#ca8a04',
  },
  {
    id: 'olive-academic',
    label: 'أخضر زيتوني طبيعي',
    description: 'درجة طبيعية هادئة وممتازة للمذكرات اليومية',
    primary: '#4d7c0f',
    accent: '#ecfccb',
    border: '#3f6212',
    previewHex: '#4d7c0f',
  },
  {
    id: 'slate-navy',
    label: 'كحلي داكن رسمي',
    description: 'رسمية بالغة ودقة عالية في خطوط الجداول والمطابع',
    primary: '#0f172a',
    accent: '#f1f5f9',
    border: '#020617',
    previewHex: '#0f172a',
  },
  {
    id: 'sky-modern',
    label: 'سماوي معاصر منعش',
    description: 'طابع شبابي متفائل ومناسب للأنشطة التفاعلية',
    primary: '#0284c7',
    accent: '#e0f2fe',
    border: '#0369a1',
    previewHex: '#0284c7',
  },
  {
    id: 'eco-ink',
    label: 'اقتصادي أحادي اللون (توفير الحبر)',
    description: 'أبيض وأسود مع رماديات خفيفة لتوفير حبر الطابعة وسرعة السحب',
    primary: '#18181b',
    accent: '#f4f4f5',
    border: '#27272a',
    previewHex: '#18181b',
  },
];

// Rich Library of Arabic Font Types
export const ARABIC_FONT_PRESETS: FontPreset[] = [
  {
    id: 'cairo',
    name: 'خط كايرو (Cairo)',
    cssFamily: "'Cairo', sans-serif",
    sample: 'خط عصري وواضح جداً في الجداول والطباعة الرسمية',
    category: 'sans',
  },
  {
    id: 'alexandria',
    name: 'خط الإسكندرية (Alexandria)',
    cssFamily: "'Alexandria', sans-serif",
    sample: 'خط هندسي حديث ومتقن وعالي الوضوح في الشاشات والورق',
    category: 'sans',
  },
  {
    id: 'tajawal',
    name: 'خط تجوال (Tajawal)',
    cssFamily: "'Tajawal', sans-serif",
    sample: 'خط متوازن ومريح لقراءة الأنشطة والمذكرات اليومية',
    category: 'sans',
  },
  {
    id: 'almarai',
    name: 'خط المراعي (Almarai)',
    cssFamily: "'Almarai', sans-serif",
    sample: 'خط رسمي ومقروء بوضوح ممتاز للأوراق الرسمية',
    category: 'sans',
  },
  {
    id: 'amiri',
    name: 'خط أميري (Amiri)',
    cssFamily: "'Amiri', serif",
    sample: 'خط نسخي كلاسيكي مطبعي فخم وأصيل',
    category: 'serif',
  },
  {
    id: 'scheherazade',
    name: 'خط شهرزاد (Scheherazade New)',
    cssFamily: "'Scheherazade New', serif",
    sample: 'خط نسخي تراثي أصيل وممتع في قراءة النصوص الأدبية',
    category: 'serif',
  },
  {
    id: 'noto-kufi',
    name: 'خط كوفي حديث (Noto Kufi)',
    cssFamily: "'Noto Kufi Arabic', sans-serif",
    sample: 'خط كوفي حديث يمنح العناوين والجداول هيبة وبروزاً',
    category: 'kufi',
  },
  {
    id: 'noto-naskh',
    name: 'خط نوتو نسخ (Noto Naskh Arabic)',
    cssFamily: "'Noto Naskh Arabic', serif",
    sample: 'خط نسخ مقروء بدقة عالية للمضامين التعليمية',
    category: 'serif',
  },
  {
    id: 'noto-sans',
    name: 'خط نوتو سانس (Noto Sans Arabic)',
    cssFamily: "'Noto Sans Arabic', sans-serif",
    sample: 'خط عالمي حديث ذو انسيابية عالية',
    category: 'sans',
  },
  {
    id: 'readex',
    name: 'خط ريدكس برو (Readex Pro)',
    cssFamily: "'Readex Pro', sans-serif",
    sample: 'خط معاصر سلس ومريح وسهل القراءة السريعة',
    category: 'sans',
  },
  {
    id: 'el-messiri',
    name: 'خط المسيري (El Messiri)',
    cssFamily: "'El Messiri', sans-serif",
    sample: 'خط عربي مميز يجمع بين الحداثة والجمال الفني',
    category: 'display',
  },
  {
    id: 'changa',
    name: 'خط تشانغا (Changa)',
    cssFamily: "'Changa', sans-serif",
    sample: 'خط هندسي جريء وممتاز للجداول المنظمة',
    category: 'display',
  },
  {
    id: 'ibm-plex',
    name: 'خط آي بي إم بلكس (IBM Plex Arabic)',
    cssFamily: "'IBM Plex Sans Arabic', sans-serif",
    sample: 'خط مؤسساتي دقيق وعالي الاحترافية',
    category: 'sans',
  },
  {
    id: 'aref-ruqaa',
    name: 'خط رقعة أصيل (Aref Ruqaa)',
    cssFamily: "'Aref Ruqaa', serif",
    sample: 'خط رقعة عربي تراثي دافئ وجميل',
    category: 'serif',
  },
  {
    id: 'lateef',
    name: 'خط لطيف (Lateef)',
    cssFamily: "'Lateef', serif",
    sample: 'نمط مغاربي شرقي خفيف ومحبب',
    category: 'serif',
  },
];

// Rich Library of Latin / French Fonts
export const LATIN_FONT_PRESETS: LatinFontPreset[] = [
  {
    id: 'inter',
    name: 'Inter',
    cssFamily: "'Inter', sans-serif",
    sample: 'Moderne, universel et remarquablement lisible',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    cssFamily: "'Poppins', sans-serif",
    sample: 'Géométrique, harmonieux et chaleureux',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    cssFamily: "'Roboto', sans-serif",
    sample: 'Standard professionnel clair et équilibré',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    cssFamily: "'Plus Jakarta Sans', sans-serif",
    sample: 'Épuré, contemporain et soigné',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    cssFamily: "'Montserrat', sans-serif",
    sample: 'Titrage fort et typographie moderne',
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    cssFamily: "'Open Sans', sans-serif",
    sample: 'Neutre, net et très agréable à imprimer',
  },
  {
    id: 'nunito',
    name: 'Nunito',
    cssFamily: "'Nunito', sans-serif",
    sample: 'Arrondi, doux et très convivial pour le primaire',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    cssFamily: "'Playfair Display', serif",
    sample: 'Typographie classique, distinguée et élégante',
  },
  {
    id: 'fira-sans',
    name: 'Fira Sans',
    cssFamily: "'Fira Sans', sans-serif",
    sample: 'Technique, précis et structuré',
  },
];

// Font Scale Options
export const FONT_SCALE_PRESETS: FontScalePreset[] = [
  {
    id: 'compact',
    label: 'مقتضب (Compact)',
    description: 'تكثيف لاحتواء الورقة كاملة في صفحة A4 واحدة',
    bodyClass: 'text-[11px] leading-tight',
    scaleFactor: 0.9,
  },
  {
    id: 'normal',
    label: 'افتراضي (Normal)',
    description: 'حجم متوازن ومريح ومناسب لجميع المستندات',
    bodyClass: 'text-xs leading-normal',
    scaleFactor: 1.0,
  },
  {
    id: 'large',
    label: 'كبير (Large)',
    description: 'وضوح فائق وقراءة مريحة وسهلة',
    bodyClass: 'text-[13.5px] leading-relaxed',
    scaleFactor: 1.15,
  },
  {
    id: 'xlarge',
    label: 'كبير جداً (Extra Large)',
    description: 'أقصى حجم للقراءة السريعة والبارزة',
    bodyClass: 'text-[15px] leading-loose',
    scaleFactor: 1.3,
  },
];

// Helper to resolve font family CSS style
export function getFontFamilyCss(fontId?: string, isLatin = false): string {
  if (isLatin) {
    const foundLatin = LATIN_FONT_PRESETS.find((f) => f.id === fontId);
    return foundLatin ? foundLatin.cssFamily : "'Inter', -apple-system, sans-serif";
  }
  const foundArabic = ARABIC_FONT_PRESETS.find((f) => f.id === fontId);
  return foundArabic ? foundArabic.cssFamily : "'Cairo', 'Alexandria', sans-serif";
}

// Helper to build document container style object
export function getDocumentThemeStyle(theme: PrintTheme, isLatin = false): React.CSSProperties {
  const fontCss = getFontFamilyCss(isLatin ? theme.latinFontFamily : theme.fontFamily, isLatin);
  return {
    fontFamily: fontCss,
    '--theme-primary': theme.primaryColor || '#d97706',
    '--theme-accent': theme.accentColor || '#fef3c7',
    '--theme-border': theme.borderColor || '#b45309',
  } as React.CSSProperties;
}
