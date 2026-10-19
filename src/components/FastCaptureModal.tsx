import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { Zap, X } from 'lucide-react';

interface FastCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FastCaptureModal: React.FC<FastCaptureModalProps> = ({ isOpen, onClose }) => {
  const { createTask, courts, categories } = useTasks();
  const [inputText, setInputText] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setDestination('');
      setCategory(categories[0]?.name || 'مهام إدارية عامة');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    createTask({
      title: inputText.trim(),
      destination: destination.trim(),
      category: category.trim() || 'مهام إدارية عامة',
      status: 'قيد الإنجاز',
      priority: 'عادية',
      progress: 25,
      description: 'تم تسجيل هذا التدخل فجائياً عبر نافذة الإدخال السريع (Saisie Rapide).'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              إدخال فوري وسريع لمهمة (Saisie Rapide)
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              نص المهمة أو التدخل الفجائي:
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="مثال: تسليم طونير HP بابتدائية ابن أحمد، عطل مفتاح التوقيع..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              الوجهة المقترحة (اختياري):
            </label>
            <input
              type="text"
              list="fc-courts-list"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="ابتدائية سطات، برشيد، ابن أحمد..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
            />
            <datalist id="fc-courts-list">
              {courts.map(c => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition-all"
            >
              ⚡ تسجيل فوري
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
