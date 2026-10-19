import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Plus, Check, Edit3, Trash2, X } from 'lucide-react';

interface CalendarViewProps {
  onOpenNewTaskModal: (date?: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

const MOROCCAN_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onViewTask
}) => {
  const { tasks, toggleTaskStatus, deleteTask } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Default to October 2026 or current
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: string; tasks: Task[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayStr = new Date().toISOString().split('T')[0];

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Deterministic day status calculation
  const getDayBorderClass = (dayTasks: Task[], dateStr: string) => {
    if (dayTasks.length === 0) return 'border-slate-200 dark:border-slate-800';

    const uncompleted = dayTasks.filter(t => t.status !== 'منجزة' && t.status !== 'مكتملة');
    if (uncompleted.length === 0) {
      // All completed -> Green
      return 'border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10';
    }

    // Has overdue or urgent uncompleted -> Red
    const hasOverdueOrUrgent = uncompleted.some(t => 
      t.status === 'متأخرة' || t.status === 'معلقة' || t.priority === 'عاجلة' || (dateStr < todayStr)
    );
    if (hasOverdueOrUrgent) {
      return 'border-2 border-red-500 bg-red-50/20 dark:bg-red-950/10';
    }

    // Has in-progress uncompleted -> Yellow
    const hasInProgress = uncompleted.some(t => t.status === 'قيد الإنجاز' || t.status === 'قيد المتابعة');
    if (hasInProgress) {
      return 'border-2 border-amber-500 bg-amber-50/20 dark:bg-amber-950/10';
    }

    // Remaining uncompleted -> Blue
    return 'border-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10';
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            التقويم الزمني للمهام والتدخلات
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            title="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="font-bold text-xs text-slate-900 dark:text-white min-w-[120px] text-center">
            {MOROCCAN_MONTHS[month]} {year}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            title="الشهر التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            اليوم
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-bold text-slate-500">
          {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((d, i) => (
            <div key={d} className={`py-1 ${i === 0 || i === 6 ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 text-xs">
          {/* Previous month trailing days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => {
            const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
            return (
              <div 
                key={`prev-${i}`} 
                className="min-h-[72px] sm:min-h-[88px] p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-800/10 opacity-30 cursor-not-allowed"
              >
                <span className="font-mono text-slate-400">{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.taskDate === dateStr);
            const count = dayTasks.length;
            const isToday = dateStr === todayStr;

            const dayOfWeek = new Date(year, month, day).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const borderCls = getDayBorderClass(dayTasks, dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDayTasks({ date: dateStr, tasks: dayTasks })}
                className={`
                  min-h-[72px] sm:min-h-[88px] p-2 rounded-lg transition-all cursor-pointer flex flex-col justify-between
                  ${isWeekend ? 'bg-slate-50 dark:bg-slate-800/20' : 'bg-white dark:bg-slate-900'}
                  ${borderCls}
                  ${isToday ? 'ring-2 ring-blue-500 shadow-sm' : ''}
                  hover:shadow-md hover:scale-[1.01]
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono font-bold text-xs ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {day}
                  </span>
                  {count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center tabular-nums">
                      {count}
                    </span>
                  )}
                </div>

                {count > 0 && (
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {dayTasks[0]?.destination ? `📍 ${dayTasks[0].destination.split(' ')[0]}` : dayTasks[0]?.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Inspector Drawer / Modal */}
      {selectedDayTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  📅 مهام يوم: {selectedDayTasks.date}
                </h3>
                <span className="text-xs text-slate-500">
                  {selectedDayTasks.tasks.length} مهام مسجلة لهذا التاريخ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayTasks(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  const targetDate = selectedDayTasks.date;
                  setSelectedDayTasks(null);
                  onOpenNewTaskModal(targetDate);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مهمة لهذا اليوم</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {selectedDayTasks.tasks.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  لا توجد مهام مسجلة في هذا اليوم. اضغط «إضافة مهمة لهذا اليوم» لبرمجة تدخل.
                </div>
              ) : (
                selectedDayTasks.tasks.map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                        <span>📍 {t.destination}</span>
                        <span>·</span>
                        <span>🏷️ {t.category}</span>
                      </div>
                      <div 
                        onClick={() => { setSelectedDayTasks(null); onViewTask(t); }}
                        className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-500"
                      >
                        {t.title}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => { toggleTaskStatus(t.id); setSelectedDayTasks(null); }}
                        className="p-1.5 rounded-lg border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                        title="إنجاز"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedDayTasks(null); onEditTask(t); }}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
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
        </div>
      )}
    </div>
  );
};
