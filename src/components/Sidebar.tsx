import React from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  BarChart3, 
  Sun, 
  Bookmark, 
  Calendar, 
  ClipboardList, 
  History, 
  Trash2, 
  Settings, 
  Plus, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  User,
  FileText
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNewTaskModal: () => void;
  onOpenFastCaptureModal: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  onOpenNewTaskModal,
  onOpenFastCaptureModal,
  mobileOpen,
  onCloseMobile
}) => {
  const { kpiStats, tasks, profile, settings } = useTasks();

  const navItems = [
    { id: 'dashboard', label: settings?.sidebarLabels?.dashboard || 'لوحة القيادة والمؤشرات', icon: BarChart3, badge: null },
    { id: 'today', label: settings?.sidebarLabels?.today || 'لوحة إدارة اليوم', icon: Sun, badge: kpiStats.todayTasks > 0 ? kpiStats.todayTasks : null, badgeColor: 'bg-amber-500 text-white' },
    { id: 'backlog', label: settings?.sidebarLabels?.backlog || 'برمجة المهام', icon: Bookmark, badge: kpiStats.futureTasks > 0 ? kpiStats.futureTasks : null, badgeColor: 'bg-purple-600 text-white' },
    { id: 'calendar', label: settings?.sidebarLabels?.calendar || 'التقويم الزمني', icon: Calendar, badge: null },
    { id: 'tasks', label: settings?.sidebarLabels?.tasks || 'سجل المهام والعمليات', icon: ClipboardList, badge: kpiStats.totalTasks, badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
    { id: 'report', label: settings?.sidebarLabels?.report || 'تقرير خاص بالمهمة', icon: FileText, badge: null },
    { id: 'audit', label: 'سجل العمليات (Audit Log)', icon: History, badge: null },
    { id: 'trash', label: settings?.sidebarLabels?.trash || 'سلة المهملات', icon: Trash2, badge: kpiStats.trashCount > 0 ? kpiStats.trashCount : null, badgeColor: 'bg-red-500 text-white' }
  ];

  // Last 5 active tasks for recent section
  const recentTasks = tasks.slice(0, 5);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 right-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300
        ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        {/* Section 1: Header Brand & Toggle */}
        <div 
          onDoubleClick={onToggleCollapse}
          title="انقر مرتين على الحافة لطي أو توسيع القائمة"
          className={`p-3 border-b border-slate-200 dark:border-slate-800 flex shrink-0 transition-all ${
            isCollapsed 
              ? 'flex-col items-center justify-center gap-2 py-3' 
              : 'flex-row items-center justify-between gap-2'
          }`}
        >
          <div 
            onClick={() => { onSelectView('dashboard'); onCloseMobile(); }}
            className={`flex items-center gap-2.5 cursor-pointer overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
            title="المديرية الإقليمية لوزارة العدل بسطات"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-lg shadow-sm">
              ⚖️
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {settings.systemName || 'نظام تدبير المهام'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  المديرية الإقليمية بسطات
                </span>
              </div>
            )}
          </div>

          {/* Toggle Button - ALWAYS Visible in both Expanded and Collapsed states! */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`
              w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all flex items-center justify-center shrink-0 shadow-sm
              ${isCollapsed ? 'mx-auto' : 'hidden md:flex'}
            `}
            title={isCollapsed ? 'توسيع القائمة الجانبية (Ctrl+B / Alt+S)' : 'طي القائمة الجانبية (Ctrl+B / Alt+S)'}
          >
            {isCollapsed ? (
              /* RTL Collapsed: points left ◀ toward the workspace to expand */
              <ChevronLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              /* RTL Expanded: points right ▶ toward the right edge to collapse */
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Section 2: Action Buttons */}
        <div className="p-3 flex flex-col gap-2 shrink-0 border-b border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={() => { onOpenNewTaskModal(); onCloseMobile(); }}
            title="إضافة مهمة جديدة"
            className={`
              flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 active:scale-95 transition-all
              ${isCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full py-2.5 px-3'}
            `}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>إضافة مهمة</span>}
          </button>

          <button
            type="button"
            onClick={() => { onOpenFastCaptureModal(); onCloseMobile(); }}
            title="إدخال سريع وفوري (Quick Capture)"
            className={`
              flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-xs hover:bg-amber-500/20 transition-all
              ${isCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full py-2 px-3'}
            `}
          >
            <Zap className="w-4 h-4 shrink-0 text-amber-500" />
            {!isCollapsed && <span>إدخال فوري</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-global-search'));
              onCloseMobile();
            }}
            title="بحث شامل فوري (Ctrl+K)"
            className={`
              flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all
              ${isCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full py-2 px-3'}
            `}
          >
            <span className="text-sm">🔍</span>
            {!isCollapsed && <span>بحث شامل</span>}
          </button>
        </div>

        {/* Section 3: Navigation Links & Recents (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1 text-xs">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { onSelectView(item.id); onCloseMobile(); }}
                title={item.label}
                className={`
                  flex items-center justify-between gap-2.5 rounded-lg py-2.5 px-3 font-semibold transition-all
                  ${isActive 
                    ? 'bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'}
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Recent Tasks List */}
          {!isCollapsed && recentTasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5 block">
                الأحدث مسجلة
              </span>
              <div className="flex flex-col gap-1">
                {recentTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => { onSelectView('tasks'); onCloseMobile(); }}
                    title={t.title}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer flex items-center gap-1.5 truncate"
                  >
                    <span className="text-slate-400">·</span>
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Footer User Card & Settings */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={() => { onSelectView('settings'); onCloseMobile(); }}
            title="الإعدادات"
            className={`
              flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
              ${currentView === 'settings' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : ''}
              ${isCollapsed ? 'justify-center px-0' : ''}
            `}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400" />
            {!isCollapsed && <span>الإعدادات والنسخ</span>}
          </button>

          <div 
            onClick={() => { onSelectView('settings'); onCloseMobile(); }}
            className={`
              flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer
              ${isCollapsed ? 'justify-center p-2' : ''}
            `}
            title={`${profile.fullName || settings.userName} - ${profile.organization || settings.department}`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile.fullName || settings.userName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {profile.jobTitle || settings.userRole}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
