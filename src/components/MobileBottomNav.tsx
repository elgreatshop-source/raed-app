import React from 'react';
import {
  Home,
  CalendarDays,
  PlusCircle,
  Archive,
  ClipboardCheck,
} from 'lucide-react';
import { AppScreen } from '../types';

interface MobileBottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  savedCount: number;
  onOpenProfile: () => void;
  primaryColor?: string;
}

export function MobileBottomNav({
  currentScreen,
  onNavigate,
  savedCount,
  onOpenProfile,
  primaryColor = '#d97706',
}: MobileBottomNavProps) {
  // If user is in the middle of onboarding, hide navigation bar
  if (currentScreen === 'onboarding') return null;

  const navItems = [
    {
      id: 'home' as const,
      label: 'الرئيسية',
      icon: Home,
      isActive: currentScreen === 'home',
      onClick: () => onNavigate('home'),
    },
    {
      id: 'agenda' as const,
      label: 'اليومية',
      icon: CalendarDays,
      isActive: currentScreen === 'agenda',
      onClick: () => onNavigate('agenda'),
    },
    {
      id: 'ingest' as const,
      label: 'تحضير اليوم',
      icon: PlusCircle,
      isActive: currentScreen === 'ingest',
      isCenterAction: true,
      onClick: () => onNavigate('ingest'),
    },
    {
      id: 'evaluation' as const,
      label: 'التقويم',
      icon: ClipboardCheck,
      isActive: currentScreen === 'evaluation',
      onClick: () => onNavigate('evaluation'),
    },
    {
      id: 'archive' as const,
      label: 'السجل',
      icon: Archive,
      badge: savedCount > 0 ? savedCount : undefined,
      isActive: currentScreen === 'archive',
      onClick: () => onNavigate('archive'),
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      aria-label="شريط التنقل السفلي"
      className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)] print:hidden transition-colors"
      dir="rtl"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-end justify-items-center px-1 pt-1.5 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenterAction) {
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={item.onClick}
                className="group relative -top-3 flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 focus:outline-none"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                    item.isActive
                      ? 'ring-3 ring-amber-400 ring-offset-2 dark:ring-offset-stone-900 scale-105'
                      : 'hover:brightness-110'
                  }`}
                  style={{ backgroundColor: primaryColor }}
                >
                  <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[9px] font-black mt-1 leading-none transition-colors ${
                    item.isActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-stone-700 dark:text-stone-300 font-bold'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 focus:outline-none min-h-[44px] ${
                item.isActive
                  ? 'text-amber-600 dark:text-amber-400 font-black'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-bold'
              }`}
            >
              {/* Top Active Indicator Line */}
              {item.isActive && (
                <div
                  className="absolute -top-1.5 w-6 h-1 rounded-full animate-in fade-in zoom-in-75 duration-150"
                  style={{ backgroundColor: primaryColor }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Refined badge counter for archive */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] bg-amber-600 dark:bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 shadow-2xs ring-1 ring-white dark:ring-stone-900">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-1 leading-tight text-center truncate max-w-[58px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

