import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logTechnicalError } from '../utils/logger';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    logTechnicalError('system', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
  };

  private handleGoHome = () => {
    this.handleReset();
    window.location.hash = '';
    window.location.reload();
  };

  private handleCopyError = () => {
    const errorText = `${this.state.error?.name || 'Error'}: ${this.state.error?.message || ''}\n\nStack:\n${
      this.state.error?.stack || ''
    }\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 3000);
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          id="global-error-boundary"
          className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center p-4 sm:p-6 select-text"
          dir="rtl"
        >
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 sm:p-8 text-center space-y-5 animate-in fade-in duration-300">
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Titles */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                حدث خطأ غير متوقع
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                واجه التطبيق حالة غير متوقعة أثناء معالجة الواجهة. لا تقلق، لقد تم تسجيل الخطورة تلقائياً ولم تفقد بياناتك المحفوظة.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                id="btn-error-boundary-retry"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>

              <button
                type="button"
                id="btn-error-boundary-home"
                onClick={this.handleGoHome}
                className="w-full py-2.5 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>العودة للرئيسية</span>
              </button>
            </div>

            {/* Collapsible Technical Details for developer diagnosis */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-right">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="text-[11px] font-bold text-stone-500 dark:text-stone-400 hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>التفاصيل التقنية للتشخيص (للمطورين)</span>
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-left dir-ltr space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-stone-500">
                    <span className="font-mono">Technical Error Details</span>
                    <button
                      type="button"
                      onClick={this.handleCopyError}
                      className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      {this.state.copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{this.state.copied ? 'تم النسخ' : 'نسخ التفاصيل'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-red-600 dark:text-red-400 overflow-x-auto whitespace-pre-wrap max-h-36">
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
