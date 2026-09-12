import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Formats a clean, structured PDF file name according to Moroccan pedagogical standards.
 * Example output: المذكرة_اليومية_اللغة_العربية_المستوى_الرابع_2026-09-22.pdf
 */
export function formatPdfFileName(
  docType?: string,
  subject?: string,
  level?: string,
  date?: string,
  lessonTitle?: string
): string {
  const sanitize = (text?: string): string => {
    if (!text) return '';
    return text
      .trim()
      .replace(/[\\/:\*\?"<>\|]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_');
  };

  let typeLabel = 'وثيقة_تربوية';
  if (docType === 'daily_journal' || docType === 'journal') {
    typeLabel = 'المذكرة_اليومية';
  } else if (docType === 'arabic' || (docType === 'mind_map' && subject?.includes('عربي'))) {
    typeLabel = 'خطاطة_اللغة_العربية';
  } else if (docType === 'math' || (docType === 'mind_map' && subject?.includes('رياضيات'))) {
    typeLabel = 'خطاطة_الرياضيات';
  } else if (docType === 'french' || (docType === 'mind_map' && (subject?.toLowerCase().includes('fran') || subject === 'Français'))) {
    typeLabel = 'Carte_Francais';
  } else if (docType === 'mind_map') {
    typeLabel = 'الخطاطة_الذهنية';
  } else if (docType === 'lesson_plan') {
    typeLabel = 'الجذاذة_التربوية';
  } else if (docType === 'evaluation') {
    typeLabel = 'شبكة_التقويم';
  } else if (docType === 'all') {
    typeLabel = 'الحزمة_التربوية_الشاملة';
  }

  const subj = sanitize(subject) || 'عام';
  const lvl = sanitize(level) || 'ابتدائي';
  const dt = sanitize(date) || new Date().toISOString().split('T')[0];
  const lsn = sanitize(lessonTitle);

  if (lsn && lsn !== 'عام' && lsn.length <= 30) {
    return `${typeLabel}_${subj}_${lvl}_${lsn}_${dt}.pdf`;
  }

  return `${typeLabel}_${subj}_${lvl}_${dt}.pdf`;
}

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  quality?: number; // 0 to 1
  scale?: number; // html2canvas resolution scale, default 2.5
  onProgress?: (step: string) => void;
}

/**
 * High-quality multi-page A4 PDF generator using structured DOM rendering
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  fileName: string,
  options: PdfExportOptions = {}
): Promise<{ pdf: jsPDF; blob: Blob; url: string }> {
  const { orientation = 'portrait', scale = 2.5, onProgress } = options;

  if (onProgress) onProgress('جاري معالجة صفحات وتنسيق الوثيقة بدقة A4...');

  // A4 standard sizes in mm
  const isLandscape = orientation === 'landscape';
  const pageWidthMm = isLandscape ? 297 : 210;
  const pageHeightMm = isLandscape ? 210 : 297;

  // Render element canvas with high DPI and crisp text rendering
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: isLandscape ? 1200 : 900,
    onclone: (clonedDoc) => {
      // Ensure all inputs and textareas in clone render without form outlines
      const inputs = clonedDoc.querySelectorAll('input, textarea');
      inputs.forEach((inp: any) => {
        inp.style.border = 'none';
        inp.style.outline = 'none';
        inp.style.background = 'transparent';
      });
    },
  });

  if (onProgress) onProgress('جاري إنشاء ملف الـ PDF وحساب ترقيم الصفحات...');

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = pageWidthMm;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  let pageNumber = 1;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeightMm;

  // Multi-page slicing if content exceeds 1 A4 page
  while (heightLeft > 2) {
    position = -(pageHeightMm * pageNumber);
    pdf.addPage();
    pageNumber++;
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeightMm;
  }

  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);

  return { pdf, blob, url };
}

/**
 * Downloads a generated PDF file directly to user device
 */
export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}

import { sharePdfNative } from '../services/nativeBridge';

/**
 * Shares a PDF file using Capacitor Share API on Android or Web Share API on Web
 */
export async function sharePdfBlob(
  blob: Blob,
  fileName: string,
  title: string = 'وثيقة تربوية'
): Promise<boolean> {
  return sharePdfNative(blob, fileName, title);
}
