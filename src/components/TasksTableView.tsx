import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { 
  Search, 
  RotateCcw, 
  Printer, 
  MoreVertical, 
  Check, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';

interface TasksTableViewProps {
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onPrintA4Summary?: () => void;
}

export const TasksTableView: React.FC<TasksTableViewProps> = ({
  onEditTask,
  onViewTask,
  onPrintA4Summary
}) => {
  const { 
    filteredTasks, 
    filterOptions, 
    setFilters, 
    resetFilters, 
    toggleTaskStatus, 
    deleteTask,
    categories,
    courts
  } = useTasks();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination calculation
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  const handlePrintSummary = () => {
    if (onPrintA4Summary) {
      onPrintA4Summary();
      return;
    }
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'منجزة':
      case 'مكتملة':
        return <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✓ منجزة</span>;
      case 'قيد الإنجاز':
        return <span className="text-xs font-bold text-blue-600 dark:text-blue-400">⚙️ قيد الإنجاز</span>;
      case 'قيد المتابعة':
        return <span className="text-xs font-bold text-amber-600 dark:text-amber-400">🔄 قيد المتابعة</span>;
      case 'متأخرة':
      case 'معلقة':
        return <span className="text-xs font-bold text-red-600 dark:text-red-400">⚠️ {status}</span>;
      default:
        return <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">📅 مبرمجة</span>;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'عاجلة':
        return 'text-red-600 dark:text-red-400 font-extrabold';
      case 'عالية':
      case 'مهمة':
        return 'text-amber-600 dark:text-amber-400 font-bold';
      case 'متوسطة':
        return 'text-blue-600 dark:text-blue-400 font-semibold';
      default:
        return 'text-slate-500 dark:text-slate-400 font-medium';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. FILTER CONTROLS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              سجل المهام والعمليات
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              ({totalItems} مهمة مطابقة)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              title="إعادة تعيين الفلاتر"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>مسح الفلاتر</span>
            </button>

            <button
              type="button"
              onClick={handlePrintSummary}
              title="طباعة كشف المهام الحالية بصيغة A4"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة كشف A4</span>
            </button>
          </div>
        </div>

        {/* Multi-criteria Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={filterOptions.searchQuery || ''}
              onChange={e => { setFilters({ searchQuery: e.target.value }); setCurrentPage(1); }}
              placeholder="بحث في العنوان، التفاصيل..."
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          {/* Destination Filter */}
          <select
            value={filterOptions.destination || ''}
            onChange={e => { setFilters({ destination: e.target.value }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">جميع الوجهات والمحاكم</option>
            {courts.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterOptions.category || ''}
            onChange={e => { setFilters({ category: e.target.value }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">جميع التصنيفات</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Scope Filter */}
          <select
            value={filterOptions.scope || ''}
            onChange={e => { setFilters({ scope: e.target.value as any }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">جميع النطاقات</option>
            <option value="محلي">محلي (سطات)</option>
            <option value="تنقل خارجي">تنقل خارجي (خارج سطات)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterOptions.status || ''}
            onChange={e => { setFilters({ status: e.target.value as any }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="قيد الإنجاز">قيد الإنجاز</option>
            <option value="مبرمجة">مبرمجة</option>
            <option value="قيد المتابعة">قيد المتابعة</option>
            <option value="متأخرة">متأخرة</option>
            <option value="منجزة">منجزة ومستوفاة</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterOptions.priority || ''}
            onChange={e => { setFilters({ priority: e.target.value as any }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">جميع الأولويات</option>
            <option value="عاجلة">عاجلة وطارئة</option>
            <option value="عالية">عالية / مهمة</option>
            <option value="متوسطة">متوسطة</option>
            <option value="عادية">عادية</option>
            <option value="منخفضة">منخفضة</option>
          </select>
        </div>
      </div>

      {/* 2. HIGH-DENSITY DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-28 text-center">التاريخ</th>
                <th className="py-3 px-4 min-w-[240px]">موضوع التدخل والعمليات الفرعية</th>
                <th className="py-3 px-4 w-36">التصنيف</th>
                <th className="py-3 px-4 w-44">الوجهة والنطاق</th>
                <th className="py-3 px-4 w-24 text-center">الأولوية</th>
                <th className="py-3 px-4 w-28 text-center">الحالة</th>
                <th className="py-3 px-4 w-24 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    لا توجد مهام مطابقة لخيارات البحث المحددة.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map(task => {
                  const subtasksTotal = task.subtasks?.length || 0;
                  const subtasksDone = task.subtasks?.filter(s => s.completed || s.done).length || 0;
                  const isMenuOpen = activeMenuId === task.id;

                  return (
                    <tr 
                      key={task.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {task.taskDate ? task.taskDate : <span className="text-purple-600 dark:text-purple-400 font-bold">مفتوحة</span>}
                      </td>

                      {/* Title & Subtasks */}
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => onViewTask(task)}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-500 cursor-pointer text-xs"
                          title={task.title}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {task.description}
                          </div>
                        )}
                        {subtasksTotal > 0 && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              ☑️ {subtasksDone}/{subtasksTotal} عمليات
                            </span>
                            <span>·</span>
                            <span>{task.progress}%</span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {task.category}
                        </span>
                        {task.subcategory && (
                          <span className="text-[10px] text-slate-400 block">
                            {task.subcategory}
                          </span>
                        )}
                      </td>

                      {/* Destination & Scope */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          📍 {task.destination}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {task.city || 'سطات'} · {task.scope}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className={`py-3 px-4 text-center text-xs ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(task.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center relative">
                        <div className="inline-block">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : task.id)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            title="خيارات"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30 text-right">
                              <button
                                type="button"
                                onClick={() => { setActiveMenuId(null); onViewTask(task); }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                                <span>معاينة</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveMenuId(null); onEditTask(task); }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                                <span>تعديل</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveMenuId(null); toggleTaskStatus(task.id); }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{task.status === 'منجزة' ? 'إعادة فتح' : 'إنجاز'}</span>
                              </button>
                              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                              <button
                                type="button"
                                onClick={() => { setActiveMenuId(null); deleteTask(task.id); }}
                                className="w-full px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>سلة المهملات</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            عرض {totalItems > 0 ? startIndex + 1 : 0} إلى {Math.min(startIndex + itemsPerPage, totalItems)} من أصل {totalItems}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-slate-700 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
