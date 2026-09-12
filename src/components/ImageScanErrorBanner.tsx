import React from 'react';
import { Camera, AlertTriangle, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

export interface ImageScanErrorBannerProps {
  onRetakePhoto: () => void;
  onUploadDifferentFile?: () => void;
  customMessage?: string;
}

export const ImageScanErrorBanner: React.FC<ImageScanErrorBannerProps> = ({
  onRetakePhoto,
  onUploadDifferentFile,
  customMessage = 'الصورة غير واضحة بما يكفي للتحليل.',
}) => {
  return (
    <div
      id="image-scan-error-banner"
      className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-2xl space-y-3.5 text-right animate-in fade-in duration-300"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
            {customMessage}
          </h4>
          <p className="text-[11px] sm:text-xs text-amber-900/80 dark:text-amber-300/80 font-medium leading-relaxed">
            لتفادي التخمين الخاطئ وضمان استخراج دقيق للمعلومات البيداغوجية، يرجى إعادة التقاط الصورة باتباع الإرشادات التالية:
          </p>
        </div>
      </div>

      {/* Guidelines Box */}
      <div className="bg-white/80 dark:bg-stone-900/80 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 space-y-1.5 text-xs text-stone-800 dark:text-stone-200">
        <div className="flex items-center gap-2">
          <span className="text-amber-600 font-bold">•</span>
          <span className="font-bold">اجعل الصفحة مستقيمة وبزاوية متوازية.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-600 font-bold">•</span>
          <span className="font-bold">استخدم إضاءة جيدة وتجنب الظلال والانعكاسات.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-600 font-bold">•</span>
          <span className="font-bold">تأكد من ظهور الصفحة كاملة ووضوح الكلمات والجداول.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onRetakePhoto}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>إعادة التصوير</span>
        </button>

        {onUploadDifferentFile && (
          <button
            type="button"
            onClick={onUploadDifferentFile}
            className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <span>اختيار ملف أو مستند آخر</span>
          </button>
        )}
      </div>
    </div>
  );
};
