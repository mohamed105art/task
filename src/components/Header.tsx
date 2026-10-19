import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Moon, Sun, Download, Menu } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onToggleSidebar }) => {
  const { settings, toggleTheme, exportBackupJSON } = useTasks();
  const theme = settings?.theme || 'dark';

  const viewTitles: Record<string, string> = {
    dashboard: settings?.sidebarLabels?.dashboard || 'لوحة القيادة والمؤشرات',
    today: settings?.sidebarLabels?.today || 'لوحة إدارة اليوم',
    backlog: settings?.sidebarLabels?.backlog || 'برمجة المهام',
    calendar: settings?.sidebarLabels?.calendar || 'التقويم الزمني',
    tasks: settings?.sidebarLabels?.tasks || 'سجل المهام والعمليات',
    report: settings?.sidebarLabels?.report || 'تقرير خاص بالمهمة',
    audit: 'سجل العمليات والتتبع الزمني',
    trash: settings?.sidebarLabels?.trash || 'سلة المهملات',
    settings: settings?.sidebarLabels?.settings || 'الإعدادات'
  };

  return (
    <header className="h-14 px-4 sm:px-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      {/* Right side in RTL: Hamburger for mobile + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="تبديل القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <span className="text-slate-400 dark:text-slate-500 text-xs">🏛️</span>
          <span className="text-slate-300 dark:text-slate-600 text-xs">/</span>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white">
            {viewTitles[currentView] || 'لوحة القيادة والمؤشرات'}
          </h1>
        </div>
      </div>

      {/* Center / Actions: Search shortcut button */}
      <button
        type="button"
        onClick={() => {
          const evt = new CustomEvent('open-global-search');
          window.dispatchEvent(evt);
        }}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 hover:border-blue-400 hover:text-slate-900 dark:hover:text-white transition-all text-xs"
        title="بحث شامل في كافة التدخلات التاريخية (Ctrl+K)"
      >
        <span>🔍</span>
        <span>بحث شامل في التدخلات...</span>
        <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600">
          Ctrl+K
        </kbd>
      </button>

      {/* Left side in RTL: Quick backup & Theme toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={exportBackupJSON}
          title="تصدير نسخة احتياطية كاملة (JSON)"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-blue-500" />
          <span>حفظ نسخة احتياطية</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
          className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>
      </div>
    </header>
  );
};
