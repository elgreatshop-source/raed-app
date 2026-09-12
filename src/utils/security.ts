/**
 * Security & Input Sanitization Utilities for Rayed (رائد)
 * Implements strict sanitization, input validation, and safe local persistence.
 */

// Basic XSS & HTML tag stripper
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Strip control chars, script tags, javascript: protocols
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Deep sanitize object values
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      cleanObj[sanitizeString(key)] = sanitizeObject(value);
    }
    return cleanObj as T;
  }
  return obj;
}

// Safe JSON parse with fallback and prototype pollution guard
export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      delete parsed.__proto__;
      delete parsed.constructor;
      delete parsed.prototype;
    }
    return parsed as T;
  } catch (e) {
    console.warn('Security: Failed to safely parse JSON data from storage, returning fallback.', e);
    return fallback;
  }
}

// Validate teacher profile inputs
export function validateTeacherProfile(profile: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!profile || typeof profile !== 'object') {
    return { isValid: false, errors: ['بيانات الأستاذ غير صالحة.'] };
  }

  if (!profile.teacherName || profile.teacherName.trim().length < 2) {
    errors.push('يرجى إدخال اسم الأستاذ(ة) بشكل صحيح.');
  }
  if (!profile.school || profile.school.trim().length < 2) {
    errors.push('يرجى تحديد اسم المؤسسة التعليمية.');
  }
  if (!profile.level) {
    errors.push('يرجى تحديد المستوى الدراسي.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
