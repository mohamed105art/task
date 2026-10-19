import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { Sun, AlertTriangle, Calendar, CheckCircle2, Plus, ChevronDown, ChevronUp, Check, Edit3, Trash2, Eye } from 'lucide-react';

interface TodayBoardViewProps {
  onOpenNewTaskModal: (date?: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export const TodayBoardView: React.FC<TodayBoardViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onViewTask
}) => {
  const { tasks, toggleTaskStatus, deleteTask, scheduleTaskForToday } = useTasks();
  const todayStr = new Date().toISOString().split('T')[0];

  const [openSections, setOpenSections] = useState({
    scheduled: true,
    pending: true,
    future: false,
    done: false
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isDoneTask = (t: Task) => t.status === 'منجزة' || t.status === 'مكتملة';

  const scheduledToday = tasks.filter(t => !t.isBacklog && t.taskDate === todayStr && !isDoneTask(t));
  const pendingTasks = tasks.filter(t => (t.status === 'معلقة' || t.status === 'متأخرة' || (t.taskDate && t.taskDate < todayStr)) && t.taskDate !== todayStr && !t.isBacklog && !isDoneTask(t));
  const futureTasks = tasks.filter(t => (t.isBacklog || !t.taskDate || (t.taskDate && t.taskDate > todayStr)) && !isDoneTask(t));
  const recentlyDone = tasks.filter(isDoneTask).slice(0, 10);

  const renderTaskCard = (t: Task, isFuture = false) => {
    const isDone = isDoneTask(t);

    return (
      <div 
        key={t.id}
        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {t.taskDate ? t.taskDate : '📌 برمجة مفتوحة'}
            </span>
            <span>·</span>
            <span className="truncate">📍 {t.destination}</span>
            <span>·</span>
            <span>🏷️ {t.category}</span>
            <span>·</span>
            <span className={`font-bold ${t.priority === 'عاجلة' ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
              {t.priority}
            </span>
          </div>
          <div 
            onClick={() => onViewTask(t)}
            className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-500"
          >
            {t.title}
          </div>
          {t.description && (
            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {t.description}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          {isFuture && (
            <button
              type="button"
              onClick={() => scheduleTaskForToday(t.id)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              تعيين لليوم
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleTaskStatus(t.id)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${isDone ? 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isDone ? 'إعادة فتح' : 'إنجاز'}</span>
          </button>

          <button
            type="button"
            onClick={() => onEditTask(t)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="تعديل"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => deleteTask(t.id)}
            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50"
            title="حذف"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>لوحة إدارة اليوم الميدانية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تتبع العمليات والتدخلات المبرمجة والجارية لليوم مع استشراف المهام المتأخرة والقادمة
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenNewTaskModal(todayStr)}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>مهمة لليوم</span>
        </button>
      </div>

      {/* Accordion 1: Scheduled Today */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('scheduled')}
          className="w-full p-4 flex items-center justify-between text-right bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-xs text-slate-900 dark:text-white">مهام اليوم الجارية</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
              {scheduledToday.length}
            </span>
          </div>
          {openSections.scheduled ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {openSections.scheduled && (
          <div className="p-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
            {scheduledToday.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">لا توجد مهام مبرمجة لليوم حالياً.</div>
            ) : (
              scheduledToday.map(t => renderTaskCard(t))
            )}
          </div>
        )}
      </div>

      {/* Accordion 2: Needs Follow-up & Overdue */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('pending')}
          className="w-full p-4 flex items-center justify-between text-right bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="font-bold text-xs text-slate-900 dark:text-white">مهام متأخرة أو تحتاج تسوية واستكمال</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500 text-white">
              {pendingTasks.length}
            </span>
          </div>
          {openSections.pending ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {openSections.pending && (
          <div className="p-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
            {pendingTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">ممتاز! لا توجد مهام متأخرة أو معلقة، كافة العمليات مستوفاة.</div>
            ) : (
              pendingTasks.map(t => renderTaskCard(t))
            )}
          </div>
        )}
      </div>

      {/* Accordion 3: Future Programmed Tasks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('future')}
          className="w-full p-4 flex items-center justify-between text-right bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-xs text-slate-900 dark:text-white">المهام المبرمجة مستقبلاً (استشراف المهام القادمة)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-600 text-white">
              {futureTasks.length}
            </span>
          </div>
          {openSections.future ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {openSections.future && (
          <div className="p-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
            {futureTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">لا توجد مهام مبرمجة مستقبلاً.</div>
            ) : (
              futureTasks.map(t => renderTaskCard(t, true))
            )}
          </div>
        )}
      </div>

      {/* Accordion 4: Recently Completed Tasks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('done')}
          className="w-full p-4 flex items-center justify-between text-right bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-xs text-slate-900 dark:text-white">مهام أنجزت مؤخراً</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
              {recentlyDone.length}
            </span>
          </div>
          {openSections.done ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {openSections.done && (
          <div className="p-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
            {recentlyDone.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">لم يتم إنجاز مهام حديثاً.</div>
            ) : (
              recentlyDone.map(t => renderTaskCard(t))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
