import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { FileText, Printer, RotateCcw } from 'lucide-react';

export const MissionReportView: React.FC = () => {
  const { tasks, profile, settings } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('__manual__');
  const [destination, setDestination] = useState('المحكمة الابتدائية بسطات');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('مهمة وتدخل إداري وتقني');
  const [notes, setNotes] = useState('تم تنفيذ المهمة على أكمل وجه واستيفاء كافة التدخلات والإجراءات الإدارية والتقنية المطلوبة وفق الضوابط المعمول بها.');

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (taskId === '__manual__') {
      setDestination('المحكمة الابتدائية بسطات');
      setDate(new Date().toISOString().split('T')[0]);
      setSubject('مهمة وتدخل إداري وتقني');
      setNotes('تم تنفيذ المهمة على أكمل وجه واستيفاء كافة الإجراءات.');
    } else {
      const t = tasks.find(x => x.id === taskId);
      if (t) {
        setDestination(t.destination || 'المديرية الإقليمية للعدل بسطات');
        setDate(t.taskDate || new Date().toISOString().split('T')[0]);
        setSubject(t.title || '');
        setNotes(t.description || 'تم إنجاز التدخل الميداني واستيفاء كافة المحاضر والإشهادات المطلوبة.');
      }
    }
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Control Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between no-print">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>تقرير خاص بالمهمة الإدارية والميدانية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            استخراج وطباعة تقرير إداري رسمي معتمد بصيغة A4 لوزارة العدل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTaskSelect('__manual__')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إدخال يدوي جديد</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🖨️ طباعة التقرير (A4)</span>
          </button>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              اختر المهمة المعنية لتعبئة المعطيات تلقائياً:
            </label>
            <select
              value={selectedTaskId}
              onChange={e => handleTaskSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
            >
              <option value="__manual__">➕ إدخال يدوي حر جديد</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.taskDate || 'مفتوحة'} - {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              مكان التدخل / الوجهة الرسمية:
            </label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              القائم بالمهمة:
            </label>
            <input
              type="text"
              readOnly
              value={profile.fullName || settings.userName || 'محمد ايت حمادي'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              المصلحة / الإدارة:
            </label>
            <input
              type="text"
              readOnly
              value={profile.organization || settings.department || 'المديرية الإقليمية بسطات'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              تاريخ المهمة:
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            موضوع المهمة والغرض منها:
          </label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            تفاصيل وملاحظات سير تنفيذ المهمة:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* Official A4 Printable Document Sheet */}
      <div 
        id="official-mission-sheet"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl border border-slate-200 shadow-md font-sans text-xs leading-relaxed"
      >
        {/* Official Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1 mb-6">
          <div className="font-extrabold text-sm text-slate-900">
            {profile.ministry || settings.ministry || 'المملكة المغربية - وزارة العدل'}
          </div>
          <div className="font-bold text-xs text-slate-700">
            {profile.organization || settings.department || 'المديرية الإقليمية بسطات'}
          </div>
          {profile.service && (
            <div className="text-[11px] text-slate-600 font-semibold">
              {profile.service}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-lg font-black text-slate-900 underline inline-block">
            تقرير خاص بالمهمة الإدارية والميدانية
          </h1>
        </div>

        {/* Metadata Table */}
        <div className="border border-slate-300 rounded-lg p-3.5 mb-6 space-y-2 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-4">
            <div>• <strong>الشخص القائم بالمهمة:</strong> <u>{profile.fullName || settings.userName || 'محمد ايت حمادي'}</u> ({profile.jobTitle || settings.userRole})</div>
            <div>• <strong>المصلحة / الإدارة:</strong> {profile.organization || settings.department}</div>
            <div>• <strong>مكان التدخل / الوجهة:</strong> <strong>{destination}</strong></div>
            <div>• <strong>تاريخ المهمة:</strong> <span className="font-mono font-bold">{date || '(غير محدد)'}</span></div>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-6 space-y-1">
          <strong className="text-slate-900 block">موضوع المهمة والغرض منها:</strong>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900 text-xs leading-relaxed">
            {subject}
          </div>
        </div>

        {/* Subtasks if present */}
        {selectedTask && selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
          <div className="mb-6 space-y-1">
            <strong className="text-slate-900 block">العمليات والإجراءات الفرعية المنجزة:</strong>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
              {selectedTask.subtasks.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span>{st.completed || st.done ? '☑️' : '◻️'}</span>
                  <span>{st.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Notes */}
        <div className="mb-12 space-y-1">
          <strong className="text-slate-900 block">تفاصيل وملاحظات سير تنفيذ المهمة:</strong>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[120px] whitespace-pre-wrap text-slate-900 text-xs leading-loose">
            {notes}
          </div>
        </div>

        {/* Official Signatures */}
        <div className="flex justify-between items-start pt-6 border-t border-slate-200 text-xs">
          <div className="text-center w-48 space-y-8">
            <strong>توقيع القائم بالمهمة:</strong>
            <div className="font-bold underline text-slate-900">
              {profile.fullName || settings.userName || 'محمد ايت حمادي'}
            </div>
          </div>

          <div className="text-center w-48 space-y-8">
            <strong>{profile.officialStampText || settings.officialStampText || 'تأشيرة السيد المدير الإقليمي'}:</strong>
            <div className="text-slate-400">
              ..................................
            </div>
          </div>
        </div>

        {/* Official Footer */}
        <div className="text-center pt-8 mt-8 border-t border-slate-200 text-[10px] text-slate-500">
          {settings.footerText || 'المديرية الإقليمية للعدل بسطات - مصلحة تدبير الممتلكات والعتاد والمعلوماتيات'}
        </div>
      </div>
    </div>
  );
};
