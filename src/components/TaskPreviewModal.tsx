import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { X, Calendar, MapPin, Tag, Check, Edit3, Trash2 } from 'lucide-react';

interface TaskPreviewModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export const TaskPreviewModal: React.FC<TaskPreviewModalProps> = ({ task, onClose, onEdit }) => {
  const { toggleTaskStatus, deleteTask } = useTasks();
  if (!task) return null;

  const isDone = task.status === 'منجزة' || task.status === 'مكتملة';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              تفاصيل ومعاينة المهمة
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5">
          <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{task.destination}</span>
            </span>
            <span>·</span>
            <span>📍 {task.city || 'سطات'} ({task.scope || 'محلي'})</span>
            <span>·</span>
            <span>🏷️ {task.category}</span>
          </div>

          <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
            {task.title}
          </h2>

          {/* Metadata Card */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">تاريخ المهمة:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {task.taskDate ? task.taskDate : '📌 مفتوحة بدون تاريخ'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">الحالة:</span>
              <span className={`font-bold ${isDone ? 'text-emerald-600' : 'text-blue-600'}`}>
                {task.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">الأولوية:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {task.priority}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">نسبة التقدم:</span>
              <span className="font-mono font-bold text-blue-600">{task.progress}%</span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">التفاصيل والملاحظات:</span>
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                ☑️ العمليات والمهام الفرعية المنجزة ({task.subtasks.length}):
              </span>
              <div className="space-y-1">
                {task.subtasks.map((st, i) => (
                  <div 
                    key={st.id || i}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 border border-slate-100 dark:border-slate-800"
                  >
                    <span className={st.completed || st.done ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                      {st.completed || st.done ? '✓' : '◻'}
                    </span>
                    <span className={st.completed || st.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => { deleteTask(task.id); onClose(); }}
            className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>نقل إلى سلة المهملات</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { toggleTaskStatus(task.id); onClose(); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${isDone ? 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isDone ? 'إعادة فتح' : 'إنجاز'}</span>
            </button>

            <button
              type="button"
              onClick={() => { onClose(); onEdit(task); }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
