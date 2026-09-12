/**
 * Pioneer Rayed (رائد) - Central Technical Error Logger & Human Translator
 *
 * Catches, records, and normalizes technical errors for developer diagnostics
 * while providing user-friendly, clear, empathetic Arabic messages.
 */

export type ErrorCategory =
  | 'auth'
  | 'firestore'
  | 'gemini'
  | 'upload'
  | 'camera'
  | 'pdf'
  | 'network'
  | 'system';

export interface TechnicalLogEntry {
  id: string;
  timestamp: string;
  category: ErrorCategory;
  message: string;
  technicalDetails?: any;
  stack?: string;
}

const MAX_LOGS = 50;
const inMemoryLogs: TechnicalLogEntry[] = [];

// Sensitive field blacklist to scrub from logs
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshtoken',
  'accesstoken',
  'apikey',
  'secret',
  'authorization',
  'credential',
  'cookie',
  'privatekey',
]);

function scrubSensitiveData(data: any, depth = 0): any {
  if (depth > 4 || data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // Check if string contains base64 image or long data URL
    if (data.startsWith('data:image/') || data.length > 2000) {
      return `[Truncated Data: length ${data.length}]`;
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => scrubSensitiveData(item, depth + 1));
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret')) {
        clean[key] = '[REDACTED]';
      } else {
        clean[key] = scrubSensitiveData(value, depth + 1);
      }
    }
    return clean;
  }
  return data;
}

/**
 * Log technical error to developer console and circular memory buffer with sensitive data scrubbing
 */
export function logTechnicalError(
  category: ErrorCategory,
  error: unknown,
  metadata?: Record<string, any>
): TechnicalLogEntry {
  const rawMessage = error instanceof Error ? error.message : String(error);
  // Scrub any sensitive words from the error message itself
  const scrubbedMessage = rawMessage.replace(/(?:key|token|password|secret|bearer)=([^\s&]+)/gi, '$1=[REDACTED]');
  const stack = error instanceof Error ? error.stack : undefined;
  const scrubbedMetadata = metadata ? scrubSensitiveData(metadata) : undefined;

  const entry: TechnicalLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    category,
    message: scrubbedMessage,
    technicalDetails: {
      metadata: scrubbedMetadata,
    },
    stack,
  };

  inMemoryLogs.unshift(entry);
  if (inMemoryLogs.length > MAX_LOGS) {
    inMemoryLogs.pop();
  }

  // Structured developer console output
  console.group(`[Rayed Technical Log] [${category.toUpperCase()}] ${new Date().toLocaleTimeString()}`);
  console.error('Message:', scrubbedMessage);
  if (scrubbedMetadata) console.info('Metadata:', scrubbedMetadata);
  if (stack) console.debug('Stack:', stack);
  console.groupEnd();

  return entry;
}

/**
 * Retrieve recent technical logs for in-app diagnostics
 */
export function getRecentTechnicalLogs(): TechnicalLogEntry[] {
  return [...inMemoryLogs];
}

/**
 * Clear recent logs
 */
export function clearTechnicalLogs(): void {
  inMemoryLogs.length = 0;
}

/**
 * Translates technical error codes and exceptions into user-friendly Arabic messages
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  category: ErrorCategory = 'system',
  fallbackMessage: string = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
): string {
  if (!navigator.onLine) {
    return 'لا يوجد اتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى.';
  }

  const rawMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const rawCode = (error as any)?.code || '';

  // 1. Network / Offline / Timeout Errors
  if (
    category === 'network' ||
    rawMessage.includes('network') ||
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('fetch failed') ||
    rawMessage.includes('the client is offline') ||
    rawMessage.includes('net::err') ||
    rawMessage.includes('timeout') ||
    rawMessage.includes('aborted') ||
    rawMessage.includes('enotfound') ||
    rawMessage.includes('econnrefused') ||
    rawCode === 'auth/network-request-failed' ||
    rawCode === 'unavailable'
  ) {
    if (rawMessage.includes('timeout') || rawMessage.includes('aborted')) {
      return 'استغرقت معالجة الطلب وقتاً أطول من المتوقع. يمكنك النقر مجدداً على زر التوليد لإعادة المحاولة دون فقدان مدخلاتك.';
    }
    return 'لا يوجد اتصال بالإنترنت أو تعذر الوصول إلى خادم الذكاء الاصطناعي. يرجى التحقق من اتصال الهاتف والمحاولة مجدداً.';
  }

  // 2. Gemini / AI Errors
  if (category === 'gemini' || rawMessage.includes('gemini') || rawMessage.includes('generative')) {
    if (rawMessage.includes('429') || rawMessage.includes('quota') || rawMessage.includes('rate limit')) {
      return 'تم تجاوز الحد الأقصى من الطلبات مؤقتاً. يرجى الانتظار قليلاً ثم إعادة المحاولة.';
    }
    if (rawMessage.includes('safety') || rawMessage.includes('blocked')) {
      return 'تعذر إكمال التحليل بسبب قيود السلامة على المحتوى المرفق.';
    }
    return 'تعذر إكمال التحليل في الوقت الحالي. يمكنك إعادة المحاولة دون فقدان ملفاتك.';
  }

  // 3. Image / Camera OCR Quality
  if (
    category === 'camera' ||
    rawMessage.includes('blurry') ||
    rawMessage.includes('unreadable') ||
    rawMessage.includes('غير واضحة') ||
    rawMessage.includes('ocr')
  ) {
    return 'الصورة غير واضحة بما يكفي للتحليل. يرجى إعادة التصوير بزاوية مستقيمة وإضاءة مناسبة.';
  }

  // 4. File Upload & Format Errors
  if (category === 'upload') {
    if (rawMessage.includes('size') || rawMessage.includes('large') || rawMessage.includes('كبير')) {
      return 'يتجاوز حجم هذا الملف الحد الأقصى (30 ميغابايت). يمكنك حذفه أو استبداله.';
    }
    if (rawMessage.includes('format') || rawMessage.includes('unsupported') || rawMessage.includes('صيغة')) {
      return 'صيغة الملف غير مدعومة. الصيغ المدعومة تشمل: PDF، Word، PowerPoint، Excel، الصور، والنصوص.';
    }
    return 'تعذر قراءة هذا الملف. يمكنك حذفه أو استبداله دون التأثير على بقية الملفات.';
  }

  // 5. Firebase / Firestore Errors
  if (category === 'firestore' || rawCode.startsWith('firestore/') || rawMessage.includes('firestore')) {
    if (rawCode === 'permission-denied' || rawMessage.includes('permission')) {
      return 'ليس لديك الصلاحية الكافية للوصول إلى هذه الوثيقة أو تعديلها.';
    }
    if (rawCode === 'not-found') {
      return 'الوثيقة المطلوبة غير موجودة أو تم حذفها مسبقاً.';
    }
    return 'تعذر حفظ الوثيقة في الوقت الحالي. تم الاحتفاظ ببياناتك لتكرار المحاولة.';
  }

  // 6. Authentication & Session Errors
  if (category === 'auth' || rawCode.startsWith('auth/')) {
    if (rawCode === 'auth/popup-closed-by-user') {
      return 'تم إغلاق نافذة تسجيل الدخول قبل إتمام المصادقة.';
    }
    if (rawCode === 'auth/popup-blocked') {
      return 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة للمتابعة.';
    }
    if (rawCode === 'auth/user-token-expired' || rawCode === 'auth/requires-recent-login') {
      return 'انتهت صلاحية جلسة تسجيل الدخول. يرجى إعادة تسجيل الدخول لمتابعة المزامنة السحابية.';
    }
    if (rawCode === 'auth/invalid-credential' || rawCode === 'auth/wrong-password') {
      return 'بيانات تسجيل الدخول غير صحيحة. يرجى التحقق وإعادة المحاولة.';
    }
    if (rawCode === 'auth/user-not-found') {
      return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني.';
    }
    return 'تعذر إتمام عملية المصادقة. يرجى إعادة المحاولة.';
  }

  // 7. PDF Export Errors
  if (category === 'pdf') {
    return 'تعذر تصدير ملف PDF في الوقت الحالي. يرجى التحقق من محتوى الوثيقة والمحاولة مجدداً.';
  }

  return fallbackMessage;
}
