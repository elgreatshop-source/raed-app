import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { App as CapApp } from '@capacitor/app';

/**
 * Checks if the application is running inside a native mobile shell (Android/iOS via Capacitor)
 */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch (e) {
    return false;
  }
}

/**
 * Registers Android Back Button listener with clean unsubscription.
 * Returns null if not running on native platform.
 */
export async function registerBackButtonListener(
  onBackAction: () => boolean | Promise<boolean>
): Promise<PluginListenerHandle | null> {
  if (!isNativeApp()) {
    return null;
  }

  try {
    const handle = await CapApp.addListener('backButton', async ({ canGoBack }) => {
      // Execute the custom handler; if it returns true, the back action is handled.
      // If false and cannot go back in web history, allow standard system behavior or minimize.
      const handled = await onBackAction();
      if (!handled) {
        if (canGoBack) {
          window.history.back();
        } else {
          // At root screen, minimize/exit app cleanly according to Android OS standards
          CapApp.exitApp();
        }
      }
    });
    return handle;
  } catch (err) {
    console.warn('Failed to register Android back button listener:', err);
    return null;
  }
}

/**
 * Captures a photo using Capacitor Camera API on native Android/iOS
 * Returns dataUrl and metadata, or null if canceled / dismissed.
 */
export async function takeNativePhoto(): Promise<{
  dataUrl: string;
  name: string;
  size: number;
  format: string;
} | null> {
  if (!isNativeApp()) {
    return null;
  }

  try {
    // Request permission only when user taps the camera button
    const permissionStatus = await Camera.checkPermissions();
    if (permissionStatus.camera !== 'granted') {
      const requestResult = await Camera.requestPermissions({ permissions: ['camera'] });
      if (requestResult.camera !== 'granted') {
        throw new Error('لم يتم منح إذن استخدام الكاميرا من إعدادات الهاتف.');
      }
    }

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      promptLabelHeader: 'الكاميرا التربوية',
      promptLabelCancel: 'إلغاء',
      promptLabelPhoto: 'التقاط صورة',
    });

    if (!photo || !photo.dataUrl) {
      return null;
    }

    const format = photo.format || 'jpeg';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = `وثيقة_مصورة_${timestamp}.${format}`;

    // Calculate approximate size from data URL
    const stringLength = photo.dataUrl.length - (photo.dataUrl.indexOf(',') + 1);
    const approximateSize = Math.ceil((stringLength * 3) / 4);

    return {
      dataUrl: photo.dataUrl,
      name,
      size: approximateSize,
      format,
    };
  } catch (err: any) {
    if (err.message && (err.message.includes('User cancelled') || err.message.includes('cancelled') || err.message.includes('canceled'))) {
      return null;
    }
    console.warn('Native camera capture error:', err);
    throw err;
  }
}

/**
 * Converts a Blob to a Base64 string for native filesystem storage
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data:...;base64, prefix
        const base64 = reader.result.split(',')[1] || reader.result;
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Shares a PDF file using Capacitor Share API on Native Android,
 * or Web Share API / direct download fallback on Web.
 */
export async function sharePdfNative(
  blob: Blob,
  fileName: string,
  title: string = 'وثيقة تربوية'
): Promise<boolean> {
  if (isNativeApp()) {
    try {
      const base64Data = await blobToBase64(blob);

      // Save PDF temporarily to device cache directory
      const tempPath = `raed_docs/${fileName}`;
      const fileResult = await Filesystem.writeFile({
        path: tempPath,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      // Open Android Native Share Sheet
      await Share.share({
        title: title,
        text: `وثيقة تربوية من تطبيق «رائد | مساعد الأستاذ»: ${fileName}`,
        url: fileResult.uri,
        dialogTitle: 'مشاركة وثيقة رائد التربوية',
      });

      return true;
    } catch (err: any) {
      if (err.message && (err.message.includes('canceled') || err.message.includes('cancelled') || err.message.includes('dismissed'))) {
        return true; // User opened dialog and dismissed it
      }
      console.warn('Native share error:', err);
      // Fallback to web share or download
    }
  }

  // Web fallback
  const file = new File([blob], fileName, { type: 'application/pdf' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
        text: `مرفق ملف PDF للوثيقة التربوية: ${fileName}`,
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share files error:', err);
      }
      return false;
    }
  } else if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: `تم إنشاء الوثيقة التربوية: ${fileName}`,
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share text error:', err);
      }
      return false;
    }
  }

  return false;
}
