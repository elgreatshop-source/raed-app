import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export type FileCategory = 'pdf' | 'word' | 'powerpoint' | 'excel' | 'text' | 'image' | 'other';
export type FileProcessStatus = 'processing' | 'ready' | 'error';

export interface UploadedAttachment {
  id: string;
  name: string;
  size: number;
  type: FileCategory;
  mimeType?: string;
  status: FileProcessStatus;
  errorMessage?: string;
  dataUrl?: string; // For images and PDFs
  extractedText?: string; // For Word, PowerPoint, Excel, Text documents
}

/**
 * Detects the category of the file based on extension and mime type.
 */
export function getFileTypeCategory(file: File): FileCategory {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();

  if (
    mime.startsWith('image/jpeg') ||
    mime.startsWith('image/png') ||
    mime.startsWith('image/jpg') ||
    mime.startsWith('image/webp') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp')
  ) {
    return 'image';
  }

  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword' ||
    name.endsWith('.docx') ||
    name.endsWith('.doc')
  ) {
    return 'word';
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mime === 'application/vnd.ms-powerpoint' ||
    name.endsWith('.pptx') ||
    name.endsWith('.ppt')
  ) {
    return 'powerpoint';
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mime === 'application/vnd.ms-excel' ||
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.csv')
  ) {
    return 'excel';
  }

  if (mime.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) {
    return 'text';
  }

  return 'other';
}

/**
 * Extracts plain text from a Text document (.txt, .md).
 */
export async function extractTextFromPlainText(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text.trim();
  } catch (err) {
    console.error('Error reading plain text file:', err);
    throw new Error('تعذر قراءة هذا الملف، يمكنك حذفه أو استبداله.');
  }
}

/**
 * Extracts plain text and table representations from an Excel spreadsheet (.xlsx, .xls, .csv).
 */
export async function extractTextFromExcel(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetTexts: string[] = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (sheet) {
        const csv = XLSX.utils.sheet_to_csv(sheet);
        if (csv && csv.trim().length > 0) {
          sheetTexts.push(`[ورقة العمل: ${sheetName}]:\n${csv.trim()}`);
        }
      }
    });

    if (sheetTexts.length === 0) {
      return `[جدول Excel: ${file.name} - لا توجد بيانات نصية داخل الأوراق]`;
    }

    return sheetTexts.join('\n\n');
  } catch (err) {
    console.error('Error extracting text from Excel document:', err);
    throw new Error('تعذر قراءة هذا الملف، يمكنك حذفه أو استبداله.');
  }
}

/**
 * Extracts plain text from a Word document (.docx or .doc).
 */
export async function extractTextFromWord(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  try {
    const arrayBuffer = await file.arrayBuffer();

    if (name.endsWith('.docx')) {
      // Try with mammoth first
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value && result.value.trim().length > 0) {
          return result.value.trim();
        }
      } catch (mammothErr) {
        console.warn('Mammoth parsing fallback to JSZip:', mammothErr);
      }

      // Fallback: Parse word/document.xml with JSZip
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        const text = parseXmlText(docXml, 'w:t');
        if (text && text.trim().length > 0) return text;
      }
    }

    // Binary .doc fallback: Extract printable text sequences
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const rawString = textDecoder.decode(arrayBuffer);
    const cleaned = rawString
      .replace(/[^\x20-\x7E\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length > 10) {
      return cleaned.slice(0, 15000);
    }

    return `[ملف Word: ${file.name}]`;
  } catch (err) {
    console.error('Error extracting text from Word document:', err);
    throw new Error('تعذر قراءة هذا الملف، يمكنك حذفه أو استبداله.');
  }
}

/**
 * Extracts plain text from a PowerPoint presentation (.pptx or .ppt).
 */
export async function extractTextFromPowerPoint(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  try {
    const arrayBuffer = await file.arrayBuffer();

    if (name.endsWith('.pptx')) {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const slideFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.match(/^ppt\/slides\/slide\d+\.xml$/)
      );

      // Sort slides numerically
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
        return numA - numB;
      });

      const slideTexts: string[] = [];

      for (let i = 0; i < slideFiles.length; i++) {
        const slideXml = await zip.file(slideFiles[i])?.async('text');
        if (slideXml) {
          const text = parseXmlText(slideXml, 'a:t');
          if (text) {
            slideTexts.push(`[شريحة ${i + 1}]:\n${text}`);
          }
        }
      }

      if (slideTexts.length > 0) {
        return slideTexts.join('\n\n');
      }
    }

    // Binary .ppt fallback
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const rawString = textDecoder.decode(arrayBuffer);
    const cleaned = rawString
      .replace(/[^\x20-\x7E\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length > 10) {
      return cleaned.slice(0, 15000);
    }

    return `[عرض PowerPoint: ${file.name}]`;
  } catch (err) {
    console.error('Error extracting text from PowerPoint presentation:', err);
    throw new Error('تعذر قراءة هذا الملف، يمكنك حذفه أو استبداله.');
  }
}

/**
 * Helper to extract tag text from XML strings
 */
function parseXmlText(xml: string, tagName: string): string {
  try {
    const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'g');
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      if (match[1]) {
        matches.push(match[1]);
      }
    }
    return matches.join(' ').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return '';
  }
}

/**
 * Reads a file as Base64 Data URL.
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Processes any uploaded file safely and returns a structured UploadedAttachment with per-file error isolation.
 */
export async function processUploadedFile(file: File): Promise<UploadedAttachment> {
  const category = getFileTypeCategory(file);
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  try {
    if (category === 'image' || category === 'pdf') {
      const dataUrl = await readFileAsDataURL(file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: category,
        mimeType: file.type || (category === 'pdf' ? 'application/pdf' : 'image/jpeg'),
        status: 'ready',
        dataUrl,
      };
    }

    if (category === 'word') {
      const extractedText = await extractTextFromWord(file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: 'word',
        mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        status: 'ready',
        extractedText,
      };
    }

    if (category === 'powerpoint') {
      const extractedText = await extractTextFromPowerPoint(file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: 'powerpoint',
        mimeType: file.type || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        status: 'ready',
        extractedText,
      };
    }

    if (category === 'excel') {
      const extractedText = await extractTextFromExcel(file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: 'excel',
        mimeType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        status: 'ready',
        extractedText,
      };
    }

    if (category === 'text') {
      const extractedText = await extractTextFromPlainText(file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: 'text',
        mimeType: file.type || 'text/plain',
        status: 'ready',
        extractedText,
      };
    }

    // Unsupported or unknown format
    return {
      id,
      name: file.name,
      size: file.size,
      type: 'other',
      mimeType: file.type || 'application/octet-stream',
      status: 'error',
      errorMessage: 'صيغة الملف غير مدعومة. الصيغ المدعومة تشمل: PDF، Word (.docx, .doc)، PowerPoint (.pptx, .ppt)، Excel (.xlsx, .xls, .csv)، الصور (.jpg, .png, .webp)، والنصوص (.txt, .md).',
    };
  } catch (error: any) {
    console.error(`Error processing file ${file.name}:`, error);
    return {
      id,
      name: file.name,
      size: file.size,
      type: category,
      mimeType: file.type || 'application/octet-stream',
      status: 'error',
      errorMessage: error?.message || 'تعذر قراءة هذا الملف بشكل سليم. يمكنك حذفه أو استبداله دون التأثير على بقية الملفات.',
    };
  }
}

/**
 * Formats bytes to human-readable size (e.g. 1.2 MB, 450 KB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Returns Arabic human-readable label and color style for file categories
 */
export function getFileCategoryInfo(type: FileCategory): { label: string; color: string; bg: string } {
  switch (type) {
    case 'pdf':
      return { label: 'مستند PDF', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60' };
    case 'word':
      return { label: 'Word (DOC/DOCX)', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60' };
    case 'powerpoint':
      return { label: 'PowerPoint (PPT/PPTX)', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60' };
    case 'excel':
      return { label: 'Excel (XLS/XLSX/CSV)', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' };
    case 'image':
      return { label: 'صورة (JPG/PNG/WEBP)', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' };
    case 'text':
      return { label: 'نص (TXT/MD)', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800' };
    default:
      return { label: 'ملف غير معروف', color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' };
  }
}


