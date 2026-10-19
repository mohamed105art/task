import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { History, Search, Filter } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLog } = useTasks();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredLogs = auditLog.filter(log => {
    if (typeFilter && log.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const inAction = log.action?.toLowerCase().includes(q);
      const inTitle = log.targetTitle?.toLowerCase().includes(q);
      const inDetails = log.details?.toLowerCase().includes(q);
      if (!inAction && !inTitle && !inDetails) return false;
    }
    return true;
  });

  const getActionBadge = (type?: string, action?: string) => {
    switch (type) {
      case 'create':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">➕ إنشاء</span>;
      case 'update':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">✏️ تعديل</span>;
      case 'done':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">✅ إنجاز</span>;
      case 'delete':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">🗑️ حذف</span>;
      case 'restore':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">↩️ استرجاع</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">⚙️ نظام</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>سجل العمليات والأحداث الزمنية (Audit Log)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            توثيق تلقائي زمني لكافة عمليات الإنشاء، التعديل، الإنجاز، والحذف لحماية سلامة البيانات
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في العمليات..."
              className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">جميع العمليات</option>
            <option value="create">إنشاء</option>
            <option value="update">تعديل</option>
            <option value="done">إنجاز</option>
            <option value="delete">حذف</option>
            <option value="restore">استرجاع</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-40 text-center">التاريخ والتوقيت</th>
                <th className="py-3 px-4 w-28 text-center">نوع الإجراء</th>
                <th className="py-3 px-4 min-w-[200px]">المهمة / العنصر المعني</th>
                <th className="py-3 px-4">تفاصيل وسياق العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    لا توجد أحداث مسجلة مطابقة.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 19) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getActionBadge(log.type, log.action)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {log.targetTitle || log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {log.details || '-'}
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
