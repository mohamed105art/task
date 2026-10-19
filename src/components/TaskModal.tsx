import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task, SubTask, TaskPriority, TaskStatus } from '../types/tasks';
import { X, Calendar, MapPin, Plus, Trash2, CheckCircle2, Sliders, ChevronDown } from 'lucide-react';
import { VoiceDictationBar } from './VoiceDictationBar';
import { ParsedVoiceTask } from '../services/voiceParserService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  initialDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  initialDate
}) => {
  const { 
    createTask, 
    updateTask, 
    categories, 
    courts, 
    savedTitles, 
    profile, 
    missionLibrary 
  } = useTasks();

  const todayStr = new Date().toISOString().split('T')[0];

  // Stage 1: Origin & Date
  const [taskDate, setTaskDate] = useState(initialDate || todayStr);
  const [isBacklog, setIsBacklog] = useState(false);

  // Stage 2: Smart Title & Category
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('مهام إدارية عامة');
  const [subcategory, setSubcategory] = useState('');
  const [isTitleSuggestionsOpen, setIsTitleSuggestionsOpen] = useState(false);
  const [missionId, setMissionId] = useState('');

  // Stage 3: Cascading Dynamic Sub-tasks
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [trailingSubtaskInput, setTrailingSubtaskInput] = useState('');

  // Stage 4: Geographical Intelligence
  const [destination, setDestination] = useState('المديرية الإقليمية للعدل بسطات');
  const [city, setCity] = useState('سطات');
  const [isNewCityPromptOpen, setIsNewCityPromptOpen] = useState(false);

  // Stage 5: Priority & Progress Slider
  const [priority, setPriority] = useState<TaskPriority>('عادية');
  const [status, setStatus] = useState<TaskStatus>('قيد الإنجاز');
  const [progress, setProgress] = useState(50);
  const [description, setDescription] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Synchronize when opening for edit or new
  useEffect(() => {
    if (taskToEdit) {
      setTaskDate(taskToEdit.taskDate || '');
      setIsBacklog(Boolean(taskToEdit.isBacklog || !taskToEdit.taskDate));
      setTitle(taskToEdit.title || '');
      setCategory(taskToEdit.category || 'مهام إدارية عامة');
      setSubcategory(taskToEdit.subcategory || '');
      setDestination(taskToEdit.destination || 'المديرية الإقليمية للعدل بسطات');
      setCity(taskToEdit.city || 'سطات');
      setPriority(taskToEdit.priority || 'عادية');
      setStatus(taskToEdit.status || 'قيد الإنجاز');
      setProgress(taskToEdit.progress !== undefined ? taskToEdit.progress : 50);
      setDescription(taskToEdit.description || '');
      setShowNotes(Boolean(taskToEdit.description));
      setSubtasks(taskToEdit.subtasks ? [...taskToEdit.subtasks] : []);
      setMissionId(taskToEdit.missionId || '');
      setTrailingSubtaskInput('');
    } else {
      const defaultDate = initialDate || todayStr;
      setTaskDate(defaultDate);
      setIsBacklog(false);
      setTitle('');
      setCategory('مهام إدارية عامة');
      setSubcategory('');
      setDestination(profile.workplace || 'المديرية الإقليمية للعدل بسطات');
      setCity('سطات');
      setPriority('عادية');
      setStatus('قيد الإنجاز');
      setProgress(50);
      setDescription('');
      setShowNotes(false);
      setSubtasks([]);
      setMissionId('');
      setTrailingSubtaskInput('');
    }
  }, [taskToEdit, initialDate, isOpen, profile]);

  if (!isOpen) return null;

  // Auto-detect domain/category from keywords in Title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const lower = val.toLowerCase();

    if (lower.includes('مباراة') || lower.includes('امتحان') || lower.includes('مترشح')) {
      setCategory('المباريات والامتحانات المهنية');
    } else if (lower.includes('طونير') || lower.includes('حبر') || lower.includes('drum') || lower.includes('طابعة')) {
      setCategory('الطونير ومستهلكات الطباعة');
    } else if (lower.includes('توقيع') || lower.includes('esign') || lower.includes('pin') || lower.includes('شهادة')) {
      setCategory('Barid eSign والتوقيع الإلكتروني');
    } else if (lower.includes('تشوير') || lower.includes('لافتة') || lower.includes('ترقيم')) {
      setCategory('التشوير والتنظيم الإداري');
    } else if (lower.includes('صفقة') || lower.includes('سند') || lower.includes('bc')) {
      setCategory('الصفقات وسندات الطلب');
    } else if (lower.includes('حاسوب') || lower.includes('شاشة') || lower.includes('كابل') || lower.includes('عتاد')) {
      setCategory('المعدات والعتاد المعلوماتي');
    } else if (lower.includes('عطل') || lower.includes('صيانة') || lower.includes('شبكة')) {
      setCategory('التدخلات التقنية');
    } else if (lower.includes('تنقل') || lower.includes('الرباط') || lower.includes('مهمة')) {
      setCategory('مهام ميدانية وتنقلات');
    }
  };

  // Adding trailing subtask dynamically (Stage 3 progressive cascading)
  const handleTrailingSubtaskSubmit = () => {
    if (!trailingSubtaskInput.trim()) return;
    const newSub: SubTask = {
      id: `st-${Date.now()}-${subtasks.length}`,
      title: trailingSubtaskInput.trim(),
      category: category,
      completed: false,
      done: false
    };
    const updated = [...subtasks, newSub];
    setSubtasks(updated);
    setTrailingSubtaskInput('');

    // If progress was 0, bump slightly
    if (progress === 0) setProgress(25);
  };

  const handleToggleSubtask = (idx: number) => {
    const updated = [...subtasks];
    updated[idx].completed = !updated[idx].completed;
    updated[idx].done = updated[idx].completed;
    setSubtasks(updated);

    // Auto calculate progress
    const doneCount = updated.filter(s => s.completed || s.done).length;
    const newProgress = Math.round((doneCount / updated.length) * 100);
    setProgress(newProgress);

    if (newProgress === 100) {
      setStatus('منجزة');
    } else if (status === 'منجزة' && newProgress < 100) {
      setStatus('قيد الإنجاز');
    }
  };

  const handleRemoveSubtask = (idx: number) => {
    const updated = subtasks.filter((_, i) => i !== idx);
    setSubtasks(updated);
    if (updated.length > 0) {
      const doneCount = updated.filter(s => s.completed || s.done).length;
      setProgress(Math.round((doneCount / updated.length) * 100));
    }
  };

  // Destination Change & City Intelligence (Stage 4)
  const handleDestinationChange = (val: string) => {
    setDestination(val);
    const existingCourt = courts.find(c => c.name.toLowerCase() === val.toLowerCase());
    
    if (existingCourt && existingCourt.city) {
      setCity(existingCourt.city);
      setIsNewCityPromptOpen(false);
    } else {
      // Check if text indicates a known city
      if (val.includes('برشيد')) setCity('برشيد');
      else if (val.includes('أحمد') || val.includes('احمد')) setCity('ابن أحمد');
      else if (val.includes('الرباط')) setCity('الرباط');
      else if (val.includes('البروج')) setCity('البروج');
      else if (val.includes('الكارة')) setCity('الكارة');
      else if (val.includes('مراكش')) setCity('مراكش');
      else setCity('سطات');

      // If user typed a custom new place, offer city verification
      if (val.trim().length > 3 && !existingCourt) {
        setIsNewCityPromptOpen(true);
      } else {
        setIsNewCityPromptOpen(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Check if trailing subtask was typed without pressing enter
    let finalSubtasks = [...subtasks];
    if (trailingSubtaskInput.trim()) {
      finalSubtasks.push({
        id: `st-${Date.now()}-${finalSubtasks.length}`,
        title: trailingSubtaskInput.trim(),
        category,
        completed: false,
        done: false
      });
    }

    const taskPayload: Partial<Task> = {
      title: title.trim(),
      taskDate: isBacklog ? '' : taskDate,
      isBacklog,
      category,
      subcategory,
      destination: destination.trim(),
      court: destination.trim(),
      city,
      priority,
      status,
      progress,
      description: description.trim(),
      subtasks: finalSubtasks,
      missionId
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskPayload);
    } else {
      createTask(taskPayload);
    }

    onClose();
  };

  // Automated Voice Transcript Ingestion into 6-Stage Form
  const handleVoiceParsed = (parsed: ParsedVoiceTask) => {
    setTitle(parsed.title);
    setCategory(parsed.category);
    setDestination(parsed.destination);
    setCity(parsed.city);
    setPriority(parsed.priority);
    setStatus(parsed.status);
    setProgress(parsed.progress);
    setIsBacklog(parsed.isBacklog);
    if (parsed.taskDate) {
      setTaskDate(parsed.taskDate);
    }
    if (parsed.subtasks && parsed.subtasks.length > 0) {
      setSubtasks(parsed.subtasks);
    }
    if (parsed.description) {
      setDescription(parsed.description);
      setShowNotes(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={() => setIsTitleSuggestionsOpen(false)}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {taskToEdit ? '✏️' : '➕'}
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {taskToEdit ? 'تعديل وتوسيع بيانات المهمة' : 'تسجيل مهمة أو تدخل ميداني'}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* VOICE DICTATION & 6-STAGE AUTO-PARSER BAR */}
          <VoiceDictationBar 
            onVoiceParsed={handleVoiceParsed} 
            workplace={profile?.workplace || 'المديرية الإقليمية للعدل بسطات'} 
          />

          {/* STAGE 1: DATE & ORIGIN */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <label className="font-bold text-slate-700 dark:text-slate-300">موعد المهمة:</label>
              {!isBacklog ? (
                <input
                  type="date"
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:border-blue-500"
                />
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">
                  📌 مفتوحة (بدون تاريخ محدد)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => { setIsBacklog(false); setTaskDate(todayStr); }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${!isBacklog && taskDate === todayStr ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => {
                  const tom = new Date();
                  tom.setDate(tom.getDate() + 1);
                  setIsBacklog(false);
                  setTaskDate(tom.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 rounded-lg font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              >
                غداً
              </button>
              <button
                type="button"
                onClick={() => setIsBacklog(!isBacklog)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${isBacklog ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
              >
                برمجة مفتوحة
              </button>
            </div>
          </div>

          {/* STAGE 2: SMART TITLE & AUTO-LEARNING CATEGORY */}
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                🎯 عنوان المهمة أو التدخل:
              </label>
              <span className="text-[11px] text-slate-400">
                التعرف التلقائي على المجال الذكي
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                onFocus={() => setIsTitleSuggestionsOpen(true)}
                onClick={e => e.stopPropagation()}
                placeholder="ماذا ستنجز؟ (مثال: تسليم طونير HP، تنظيم مباراة، تفعيل توقيع...)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-sm"
              />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setIsTitleSuggestionsOpen(!isTitleSuggestionsOpen); }}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Title Suggestions Dropdown */}
              {isTitleSuggestionsOpen && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto py-1"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    أحدث العناوين المقترحة
                  </div>
                  {savedTitles.slice(0, 10).map((t, i) => (
                    <div
                      key={i}
                      onClick={() => { handleTitleChange(t); setIsTitleSuggestionsOpen(false); }}
                      className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate">{t}</span>
                      <span className="text-[10px] text-blue-500">اختر ↵</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inferred or Selected Category Selector */}
            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-400 font-semibold">المجال:</span>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="bg-transparent text-blue-600 dark:text-blue-400 font-bold focus:outline-none cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name} className="dark:bg-slate-800 dark:text-white">
                    {c.icon || '🏷️'} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STAGE 3: CASCADING DYNAMIC SUB-TASKS */}
          <div className="space-y-2 bg-slate-50/60 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                ☑️ العمليات والمهام الفرعية (تظهر ديناميكياً):
              </label>
              <span className="text-[11px] text-slate-400">
                {subtasks.length} عمليات
              </span>
            </div>

            {/* List of existing subtasks */}
            <div className="space-y-1.5">
              {subtasks.map((st, idx) => (
                <div 
                  key={st.id || idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={Boolean(st.completed || st.done)}
                      onChange={() => handleToggleSubtask(idx)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={`truncate font-semibold ${st.completed || st.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {st.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="إزالة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Trailing Subtask Input (Auto-cascading) */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={trailingSubtaskInput}
                onChange={e => setTrailingSubtaskInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTrailingSubtaskSubmit();
                  }
                }}
                placeholder={`+ أضف مهمة فرعية ${subtasks.length + 1} (اكتب ثم اضغط Enter)...`}
                className="flex-1 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleTrailingSubtaskSubmit}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* STAGE 4: GEOGRAPHICAL INTELLIGENCE */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>الوجهة / المحكمة / المرفق القضائي:</span>
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {city} ({city.includes('سطات') ? 'محلي' : 'تنقل خارجي'})
              </span>
            </div>

            <input
              type="text"
              list="destinations-list"
              value={destination}
              onChange={e => handleDestinationChange(e.target.value)}
              placeholder="اختر أو اكتب مقراً أو وجهة (مثل: ابتدائية برشيد، ابن أحمد...)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
            <datalist id="destinations-list">
              {courts.map(c => (
                <option key={c.id} value={c.name}>{c.city}</option>
              ))}
            </datalist>

            {/* Conditional City prompt for new places */}
            {isNewCityPromptOpen && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                <span className="text-emerald-800 dark:text-emerald-300 font-semibold">
                  ✨ وجهة جديدة! بأي مدينة تتواجد لحفظها في السجل؟
                </span>
                <div className="flex gap-1">
                  {['سطات', 'برشيد', 'ابن أحمد', 'الرباط'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setCity(c); setIsNewCityPromptOpen(false); }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${city === c ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STAGE 5: PRIORITY & PROGRESS CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
            {/* Priority 4-Tier Segmented Control */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                الأولوية:
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
                {(['عادية', 'متوسطة', 'عالية', 'عاجلة'] as TaskPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1 rounded text-[11px] font-bold transition-all ${priority === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifecycle State: 4-state selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                الحالة:
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
                {[
                  { id: 'مبرمجة', label: '📅 مبرمجة' },
                  { id: 'قيد الإنجاز', label: '⚙️ جارية' },
                  { id: 'قيد المتابعة', label: '🔄 متابعة' },
                  { id: 'منجزة', label: '✅ منجزة' }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      const newStatus = st.id as TaskStatus;
                      setStatus(newStatus);
                      if (newStatus === 'منجزة') {
                        setProgress(100);
                        setSubtasks(prev => prev.map(s => ({ ...s, completed: true, done: true })));
                      } else if (newStatus === 'مبرمجة') {
                        setProgress(0);
                      } else if (newStatus === 'قيد المتابعة') {
                        if (progress === 0 || progress === 100) setProgress(75);
                      } else {
                        if (progress === 0 || progress === 100) setProgress(50);
                      }
                    }}
                    className={`py-1 rounded text-[10px] font-bold transition-all ${
                      status === st.id 
                        ? (st.id === 'منجزة' ? 'bg-emerald-600 text-white' : (st.id === 'قيد المتابعة' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'))
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Slider 0-100% */}
            <div className="sm:col-span-2 space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600 dark:text-slate-400">مؤشر التقدم:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setProgress(val);
                  if (val === 100) {
                    setStatus('منجزة');
                    setSubtasks(prev => prev.map(s => ({ ...s, completed: true, done: true })));
                  } else if (val === 0) {
                    setStatus('مبرمجة');
                  } else if (val >= 70) {
                    setStatus('قيد المتابعة');
                  } else {
                    setStatus('قيد الإنجاز');
                  }
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Optional Notes Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>{showNotes ? '▲ إخفاء الملاحظات الإضافية' : '+ إضافة ملاحظات أو تفاصيل تقنية (اختياري)'}</span>
            </button>
            {showNotes && (
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="تفاصيل إضافية حول التدخل أو أرقام المراجع والمحاضر..."
                className="w-full mt-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
              />
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0 bg-slate-50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            {taskToEdit ? '💾 حفظ التعديلات' : '💾 تسجيل المهمة'}
          </button>
        </div>
      </div>
    </div>
  );
};
