import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { Bookmark, Search, Plus, Calendar, Check, Edit3, Trash2, Eye } from 'lucide-react';

interface BacklogViewProps {
  onOpenNewTaskModal: () => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onViewTask
}) => {
  const { tasks, scheduleTaskForToday, toggleTaskStatus, deleteTask } = useTasks();
  const [subFilter, setSubFilter] = useState<'all' | 'future' | 'open'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const backlogTasks = tasks.filter(t => {
    const isDone = t.status === 'منجزة' || t.status === 'مكتملة';
    if (isDone) return false;

    const isFuture = Boolean(t.taskDate && t.taskDate > todayStr);
    const isOpen = Boolean(t.isBacklog || !t.taskDate);
    const isEligible = isFuture || isOpen || t.status === 'مبرمجة';
    if (!isEligible) return false;

    if (subFilter === 'future' && !isFuture) return false;
    if (subFilter === 'open' && !isOpen) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = t.title?.toLowerCase().includes(q);
      const inDest = t.destination?.toLowerCase().includes(q);
      const inCat = t.category?.toLowerCase().includes(q);
      if (!inTitle && !inDest && !inCat) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Sub-filter bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-600" />
            <span>برمجة المهام (المهام المستقبلية والمفتوحة)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            إدارة المشاريع والتدخلات التي تنتظر البرمجة أو لها مواعيد لاحقة
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة مبرمجة</span>
        </button>
      </div>

      {/* Filter Tabs and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setSubFilter('all')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${subFilter === 'all' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            الكل ({tasks.filter(t => (t.isBacklog || !t.taskDate || (t.taskDate && t.taskDate > todayStr)) && t.status !== 'منجزة').length})
          </button>
          <button
            type="button"
            onClick={() => setSubFilter('future')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${subFilter === 'future' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            🗓️ مجدولة بموعد
          </button>
          <button
            type="button"
            onClick={() => setSubFilter('open')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${subFilter === 'open' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            📌 مفتوحة بدون تاريخ (Backlog)
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في المهام المبرمجة..."
            className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Backlog Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-32 text-center">الموعد / البرمجة</th>
                <th className="py-3 px-4">موضوع المهمة والتفاصيل</th>
                <th className="py-3 px-4 w-36">التصنيف</th>
                <th className="py-3 px-4 w-44">الوجهة المقترحة</th>
                <th className="py-3 px-4 w-24 text-center">الأولوية</th>
                <th className="py-3 px-4 w-36 text-center">الإجراء المباشر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {backlogTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    لا توجد مهام مبرمجة أو مفتوحة مطابقة.
                  </td>
                </tr>
              ) : (
                backlogTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-[11px] whitespace-nowrap">
                      {task.taskDate ? (
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          📅 {task.taskDate}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          📌 مفتوحة
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div 
                        onClick={() => onViewTask(task)}
                        className="font-bold text-slate-900 dark:text-white hover:text-purple-600 cursor-pointer text-xs"
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {task.category}
                    </td>

                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                      📍 {task.destination}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-bold">
                      {task.priority}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => scheduleTaskForToday(task.id)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          title="تعيين للتنفيذ اليوم"
                        >
                          📅 اليوم
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                          title="تعديل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="p-1 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
