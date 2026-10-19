import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  ClipboardList, 
  Sun, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Eye, 
  Edit3, 
  Check, 
  RotateCcw, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft 
} from 'lucide-react';
import { Task } from '../types/tasks';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenNewTaskModal: (initialDate?: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewTaskModal,
  onEditTask,
  onViewTask
}) => {
  const { 
    kpiStats, 
    tasks, 
    templates, 
    toggleTaskStatus, 
    deleteTask, 
    scheduleTaskForToday, 
    setFilters 
  } = useTasks();

  const [isTodaySectionFolded, setIsTodaySectionFolded] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Data sets
  const todayTasks = tasks.filter(t => !t.isBacklog && t.taskDate === todayStr && t.status !== 'منجزة' && t.status !== 'مكتملة');
  const futureTasks = tasks.filter(t => (t.isBacklog || !t.taskDate || (t.taskDate && t.taskDate > todayStr)) && t.status !== 'منجزة' && t.status !== 'مكتملة');
  const pendingTasks = tasks.filter(t => (t.status === 'معلقة' || t.status === 'متأخرة' || (t.taskDate && t.taskDate < todayStr)) && t.status !== 'منجزة' && t.status !== 'مكتملة' && !t.isBacklog);

  // Geographic breakdowns
  const geoBreakdown = [
    { name: 'الرباط (المصالح المركزية)', count: tasks.filter(t => t.destination?.includes('الرباط') || t.court?.includes('الرباط')).length, filterCity: 'الرباط' },
    { name: 'المحكمة الابتدائية بابن أحمد', count: tasks.filter(t => t.destination?.includes('أحمد') || t.court?.includes('أحمد')).length, filterCity: 'ابن أحمد' },
    { name: 'المحكمة الابتدائية ببرشيد', count: tasks.filter(t => t.destination?.includes('برشيد') || t.court?.includes('برشيد')).length, filterCity: 'برشيد' },
    { name: 'الدائرة القضائية بسطات (محلي)', count: tasks.filter(t => t.destination?.includes('سطات') || t.court?.includes('سطات')).length, filterCity: 'سطات' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP 5 HIGH-CONTRAST KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Tasks */}
        <div 
          onClick={() => { setFilters({}); onNavigate('tasks'); }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer border-t-2 border-t-blue-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المهام المسجلة</span>
            <ClipboardList className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-1 tabular-nums">
            {kpiStats.totalTasks}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{kpiStats.localCount} محلي · {kpiStats.externalCount} تنقل</span>
            <span className="text-blue-500 font-bold hover:underline">السجل ➜</span>
          </div>
        </div>

        {/* Scheduled Today */}
        <div 
          onClick={() => onNavigate('today')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-amber-500 hover:shadow-md transition-all cursor-pointer border-t-2 border-t-amber-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">مهام جارية اليوم</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-1 tabular-nums">
            {kpiStats.todayTasks}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>برنامج وتدخلات اليوم</span>
            <span className="text-amber-500 font-bold hover:underline">لوحة اليوم ➜</span>
          </div>
        </div>

        {/* Future / Backlog */}
        <div 
          onClick={() => onNavigate('backlog')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-purple-500 hover:shadow-md transition-all cursor-pointer border-t-2 border-t-purple-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">مهام مبرمجة ومفتوحة</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-1 tabular-nums">
            {kpiStats.futureTasks}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>مجدولة وقادمة</span>
            <span className="text-purple-500 font-bold hover:underline">البرمجة ➜</span>
          </div>
        </div>

        {/* Needs Follow-up / Overdue */}
        <div 
          onClick={() => { setFilters({ status: 'قيد المتابعة' }); onNavigate('tasks'); }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-red-500 hover:shadow-md transition-all cursor-pointer border-t-2 border-t-red-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تحتاج متابعة / تسوية</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-1 tabular-nums">
            {kpiStats.pendingTasks}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>قيد التتبع والمطابقة</span>
            <span className="text-red-500 font-bold hover:underline">تصفية ➜</span>
          </div>
        </div>

        {/* Completed */}
        <div 
          onClick={() => { setFilters({ status: 'منجزة' }); onNavigate('tasks'); }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer border-t-2 border-t-emerald-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">مهام منجزة ومستوفاة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-1 tabular-nums">
            {kpiStats.doneTasks}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>نسبة الإنجاز: {kpiStats.completionRate}%</span>
            <span className="text-emerald-500 font-bold hover:underline">المنجزة ➜</span>
          </div>
        </div>
      </div>

      {/* 2. ADAPTIVE TODAY SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              برنامج مهام اليوم الجارية ({todayTasks.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenNewTaskModal(todayStr)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مهمة لليوم</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTodaySectionFolded(!isTodaySectionFolded)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isTodaySectionFolded ? 'توسيع' : 'طي'}
            >
              {isTodaySectionFolded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isTodaySectionFolded && (
          <div className="mt-3 space-y-2">
            {todayTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                لا توجد مهام مبرمجة لليوم حالياً. يمكنك إضافة مهمة بالضغط على «مهمة لليوم» أعلاه أو جدولة مهمة من القائمة المبرمجة أدناه.
              </div>
            ) : (
              todayTasks.slice(0, 4).map(t => (
                <div 
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                      <span className="font-bold text-amber-600 dark:text-amber-400">اليوم</span>
                      <span>·</span>
                      <span className="truncate">📍 {t.destination}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">🏷️ {t.category}</span>
                    </div>
                    <div 
                      onClick={() => onViewTask(t)}
                      className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-500"
                    >
                      {t.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(t.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>إنجاز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTask(t)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="تعديل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(t.id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. FUTURE TASKS & BACKLOG FORECAST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              استشراف المهام المبرمجة والمستقبلية ({futureTasks.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('backlog')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>جدول البرمجة الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {futureTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              لا توجد مهام مبرمجة مستقبلاً.
            </div>
          ) : (
            futureTasks.slice(0, 3).map(t => (
              <div 
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {t.taskDate ? t.taskDate : '📌 مفتوحة بدون تاريخ'}
                    </span>
                    <span>·</span>
                    <span className="truncate">📍 {t.destination}</span>
                    <span>·</span>
                    <span>🏷️ {t.category}</span>
                  </div>
                  <div 
                    onClick={() => onViewTask(t)}
                    className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-purple-500"
                  >
                    {t.title}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => scheduleTaskForToday(t.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                  >
                    تعيين لليوم
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditTask(t)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="تعديل"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. GEOGRAPHIC JURISDICTION & REGIONAL TRIPS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              تنقلات وتدخلات الدائرة القضائية لسطات
            </h2>
          </div>
          <span className="text-xs text-slate-500">حسب مقرات المحاكم والمصالح</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {geoBreakdown.map(geo => (
            <div 
              key={geo.name}
              onClick={() => { setFilters({ destination: geo.filterCity }); onNavigate('tasks'); }}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{geo.name}</span>
              </div>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                {geo.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. QUICK TEMPLATES ACCELERATOR */}
      {templates.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
            ⚡ قوالب التدخلات السريعة (بنقرة واحدة):
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  onOpenNewTaskModal(todayStr);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                ⚡ {tpl.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
