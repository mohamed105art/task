import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

export const TrashView: React.FC = () => {
  const { trash, restoreTask, deleteTask, emptyTrash } = useTasks();

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>سلة المهملات والأمان ({trash.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            المهام المحذوفة مؤقتاً لحمايتها من الحذف غير المقصود مع إمكانية استرجاعها فوراً
          </p>
        </div>

        {trash.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('⚠️ هل أنت متأكد من رغبتك في تفريغ سلة المهملات نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
                emptyTrash();
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تفريغ سلة المهملات</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-36 text-center">تاريخ الحذف</th>
                <th className="py-3 px-4">موضوع المهمة المحذوفة</th>
                <th className="py-3 px-4 w-36">التصنيف</th>
                <th className="py-3 px-4 w-44">الوجهة</th>
                <th className="py-3 px-4 w-36 text-center">إجراءات الأمان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {trash.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    سلة المهملات فارغة حالياً. لا توجد عناصر محذوفة.
                  </td>
                </tr>
              ) : (
                trash.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {task.deletedAt ? task.deletedAt.replace('T', ' ').slice(0, 16) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{task.title}</div>
                      {task.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">{task.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">{task.category}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">📍 {task.destination}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => restoreTask(task.id)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                          title="استرجاع إلى السجل النشط"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                          <span>استرجاع</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`حذف نهائي للمهمة: "${task.title}"؟`)) {
                              deleteTask(task.id, true);
                            }
                          }}
                          className="p-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="حذف نهائي"
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
