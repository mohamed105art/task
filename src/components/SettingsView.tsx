import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Settings, 
  User, 
  BookOpen, 
  Sliders, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Check, 
  Tag, 
  MapPin, 
  Moon, 
  Sun, 
  CheckCircle2 
} from 'lucide-react';
import { Category, CourtDestination, TaskPriority, TaskStatus } from '../types/tasks';

export const SettingsView: React.FC = () => {
  const { 
    profile, 
    settings, 
    categories, 
    courts, 
    savedTitles, 
    tasks, 
    updateProfile, 
    updateSettings, 
    setTheme, 
    updateCategories, 
    updateCourts, 
    updateSavedTitles, 
    resetLearnedDictionaries, 
    clearCompletedTasks, 
    factoryResetSystem, 
    exportBackupJSON, 
    importBackupJSON 
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'profile' | 'dictionaries' | 'appearance' | 'workflow' | 'backup'>('dictionaries');

  // Profile fields state
  const [fullName, setFullName] = useState(profile.fullName || settings.userName || '');
  const [jobTitle, setJobTitle] = useState(profile.jobTitle || settings.userRole || '');
  const [organization, setOrganization] = useState(profile.organization || settings.department || '');
  const [service, setService] = useState(profile.service || 'مصلحة تدبير الممتلكات والعتاد والمعلوميات');
  const [workplace, setWorkplace] = useState(profile.workplace || 'المديرية الإقليمية للعدل بسطات');
  const [mainDomain, setMainDomain] = useState(profile.mainDomain || 'التدبير الإداري والتقني واللوجستي');
  const [profileSaved, setProfileSaved] = useState(false);

  // New Title modal/inline input
  const [newTitleInput, setNewTitleInput] = useState('');
  
  // New Court modal/inline input
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtCity, setNewCourtCity] = useState('سطات');

  // New Category inline input
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📁');

  // Backup file status
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // Approximate storage calculation
  const storageBytes = (() => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        const v = localStorage.getItem(k || '') || '';
        total += (k ? k.length : 0) + v.length;
      }
      return total * 2; // UTF-16
    } catch (e) {
      return 1024 * 50;
    }
  })();
  const storageKB = Math.round(storageBytes / 1024);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      jobTitle,
      organization,
      service,
      workplace,
      mainDomain
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAddTitle = () => {
    if (!newTitleInput.trim()) return;
    const t = newTitleInput.trim();
    if (!savedTitles.includes(t)) {
      updateSavedTitles([t, ...savedTitles]);
    }
    setNewTitleInput('');
  };

  const handleRemoveTitle = (titleToRemove: string) => {
    updateSavedTitles(savedTitles.filter(t => t !== titleToRemove));
  };

  const handleAddCourt = () => {
    if (!newCourtName.trim()) return;
    const name = newCourtName.trim();
    const city = newCourtCity.trim() || 'سطات';
    const scope = city.includes('سطات') ? 'محلي' : 'تنقل خارجي';

    const newCourt: CourtDestination = {
      id: `court-${Date.now()}`,
      name,
      city,
      scope,
      type: 'مرفق قضائي مسجل',
      status: 'active'
    };
    updateCourts([newCourt, ...courts]);
    setNewCourtName('');
    setNewCourtCity('سطات');
  };

  const handleDeleteCourt = (id: string) => {
    if (window.confirm('هل تريد إزالة هذا المرفق القضائي من الدليل؟')) {
      updateCourts(courts.filter(c => c.id !== id));
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon.trim() || '📁',
      subs: ['عام']
    };
    updateCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('هل تريد حذف هذا التصنيف؟')) {
      updateCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = importBackupJSON(content);
      setImportFeedback({
        success: res.success,
        text: res.success ? `✅ تم بنجاح استرجاع ${res.count} مهمة وكافة القواميس والإعدادات!` : `❌ ${res.message}`
      });
      setTimeout(() => setImportFeedback(null), 5000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Control Center Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>مركز التحكم والإعدادات الشاملة (Enterprise Control Center)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            إدارة متقدمة للقواميس، قواعد التعلم الذاتي، المظهر المؤسساتي، وفاحص الذاكرة المحلية
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('dictionaries')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'dictionaries' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            📚 القواميس والتعلم الذاتي
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            👤 البطاقة المهنية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'appearance' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            🎨 المظهر والواجهة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'workflow' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            ⚙️ سير العمل والافتراضات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'backup' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            💾 البيانات وفاحص الذاكرة
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: AUTO-LEARNING & DICTIONARY MANAGER (إدارة القواميس والتعلم الذاتي)
          ======================================================== */}
      {activeTab === 'dictionaries' && (
        <div className="space-y-5">
          {/* 1.1 Autocomplete Titles Registry */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>عناوين التدخلات المحفوظة للإكمال التلقائي ({savedTitles.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  تُقترح هذه العناوين تلقائياً بمجرد فتح استمارة المهمة لتسريع الإدخال
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل تريد استعادة العناوين الافتراضية؟')) {
                    resetLearnedDictionaries();
                  }
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                ↺ استرجاع الافتراضي
              </button>
            </div>

            {/* Add new title inline */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitleInput}
                onChange={e => setNewTitleInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTitle(); }}
                placeholder="أضف عنوان مهمة جديد إلى القاموس..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTitle}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة عنوان</span>
              </button>
            </div>

            {/* List of titles */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 p-1">
              {savedTitles.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-xs text-slate-800 dark:text-slate-200"
                >
                  <span className="font-semibold truncate">{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTitle(t)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="حذف من القاموس"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1.2 Locations & Courts Registry */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>دليل المحاكم والمرافق القضائية ({courts.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  تحديد المقار الدائمة والنطاق الجغرافي التلقائي (محلي بسطات vs تنقل خارجي)
                </p>
              </div>
            </div>

            {/* Add new court */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newCourtName}
                onChange={e => setNewCourtName(e.target.value)}
                placeholder="اسم المرفق (مثال: محكمة الاستئناف بالدار البيضاء)..."
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 sm:col-span-2"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCourtCity}
                  onChange={e => setNewCourtCity(e.target.value)}
                  placeholder="المدينة..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCourt}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
              </div>
            </div>

            {/* Courts Table */}
            <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">اسم المرفق / المحكمة</th>
                    <th className="py-2.5 px-3">المدينة</th>
                    <th className="py-2.5 px-3">النطاق التلقائي</th>
                    <th className="py-2.5 px-3 w-16 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {courts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">📍 {c.name}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{c.city || 'سطات'}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.scope === 'محلي' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'}`}>
                          {c.scope || 'محلي'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteCourt(c.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1.3 Categories & Keyword Auto-mapping */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  <span>مجالات وتصنيفات التدخل ({categories.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  قواعد الربط الذكي بالكلمات المفتاحية والتفريعات المرتبطة بكل مجال
                </p>
              </div>
            </div>

            {/* Add new category */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatIcon}
                onChange={e => setNewCatIcon(e.target.value)}
                placeholder="رمز (Emoji)..."
                className="w-16 px-2 py-2 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
              />
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="اسم التصنيف الجديد..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة تصنيف</span>
              </button>
            </div>

            {/* Categories list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {categories.map(c => (
                <div 
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{c.icon || '📁'}</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-400">({c.subs?.length || 0} تفريعات)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(c.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: PROFESSIONAL PROFILE
          ======================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-blue-500" />
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
              البطاقة المهنية وتخصيص المنصب الإداري والتقني
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الاسم الكامل للمسؤول:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الوظيفة / الصفة:</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المديرية / الهيئة:</label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المصلحة أو القسم:</label>
                <input
                  type="text"
                  value={service}
                  onChange={e => setService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">مقر العمل الرئيسي:</label>
                <input
                  type="text"
                  value={workplace}
                  onChange={e => setWorkplace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المجال الرئيسي:</label>
                <input
                  type="text"
                  value={mainDomain}
                  onChange={e => setMainDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {profileSaved ? '✓ تم حفظ وتحديث البطاقة المهنية بنجاح' : ''}
              </span>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                💾 حفظ البطاقة المهنية
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          TAB 3: APPEARANCE & UI CUSTOMIZATION (تخصيص الواجهة والمظهر)
          ======================================================== */}
      {activeTab === 'appearance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-blue-500" />
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
              تخصيص المظهر وتجربة العرض المؤسساتية
            </h3>
          </div>

          {/* Theme Mode Selector with High-Contrast Presets */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">
              وضع الألوان والتباين:
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${settings.theme === 'light' ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20 font-bold' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs">الوضع النهاري المؤسساتي</div>
                  <div className="text-[10px] text-slate-500">خلفية فاتحة ناصعة وتباين عالٍ</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${settings.theme === 'dark' ? 'border-blue-500 bg-slate-800 text-white ring-2 ring-blue-500/30 font-bold' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs">وضع أوبسيديان الليلي (Obsidian)</div>
                  <div className="text-[10px] text-slate-400">تباين فائق ومريح للعين</div>
                </div>
              </button>
            </div>
          </div>

          {/* Font Scale */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">
              حجم الخط وتكبير النصوص:
            </label>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg'] as const).map(scale => {
                const isSelected = (settings.fontScale || 'md') === scale;
                const labels = { sm: 'مدمج (14px)', md: 'قياسي (16px)', lg: 'كبير للمطالعة (18px)' };
                return (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => updateSettings({ fontScale: scale })}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {labels[scale]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Startup View */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">
              الشاشة الافتراضية عند فتح التطبيق:
            </label>
            <select
              value={settings.defaultStartupView || 'dashboard'}
              onChange={e => updateSettings({ defaultStartupView: e.target.value as any })}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
            >
              <option value="dashboard">لوحة القيادة والمؤشرات (Dashboard)</option>
              <option value="today">لوحة إدارة اليوم (Today Board)</option>
              <option value="tasks">سجل المهام والعمليات (Tasks Registry)</option>
              <option value="calendar">التقويم الزمني (Calendar)</option>
              <option value="backlog">برمجة المهام (Backlog)</option>
            </select>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: WORKFLOW & DEFAULT PARAMETERS (سير العمل والبارامترات الافتراضية)
          ======================================================== */}
      {activeTab === 'workflow' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-purple-500" />
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
              ضبط سلوك سير العمل وحسابات الإنجاز
            </h3>
          </div>

          <div className="space-y-4 max-w-lg">
            {/* Auto Complete when Subtasks 100% */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  الإنجاز التلقائي للمهمة عند استيفاء العمليات الفرعية (100%):
                </span>
                <span className="text-[11px] text-slate-500">
                  تغيير حالة المهمة آلياً إلى «منجزة» بمجرد التأشير على كافة العمليات
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCompleteWhenSubtasksDone !== false}
                onChange={e => updateSettings({ autoCompleteWhenSubtasksDone: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 cursor-pointer"
              />
            </div>

            {/* Default Priority */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                الأولوية الافتراضية للمهام الجديدة:
              </label>
              <select
                value={settings.defaultPriority || 'عادية'}
                onChange={e => updateSettings({ defaultPriority: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
              >
                <option value="عادية">🟢 عادية (عمل يومي روتيني)</option>
                <option value="متوسطة">🔵 متوسطة (مأمورية / متابعة)</option>
                <option value="عالية">🟠 عالية / مهمة</option>
                <option value="عاجلة">🔴 عاجلة وطارئة</option>
              </select>
            </div>

            {/* Default Status */}
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                الحالة الافتراضية للمهام الجديدة:
              </label>
              <select
                value={settings.defaultStatus || 'قيد الإنجاز'}
                onChange={e => updateSettings({ defaultStatus: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
              >
                <option value="قيد الإنجاز">⚙️ قيد الإنجاز</option>
                <option value="مبرمجة">📅 مبرمجة</option>
                <option value="جديدة">🆕 جديدة</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: DATA, BACKUP & STORAGE INSPECTOR (إدارة البيانات وفاحص الذاكرة)
          ======================================================== */}
      {activeTab === 'backup' && (
        <div className="space-y-5 text-xs">
          {/* Storage Health Inspector Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                  فاحص سلامة الذاكرة المحلية (LocalStorage Health Inspector)
                </h3>
              </div>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full text-[11px]">
                {storageKB} KB مستخدمة
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                <div className="text-[11px] text-slate-500">إجمالي المهام المخزنة</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">{tasks.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                <div className="text-[11px] text-slate-500">المحاكم والوجهات</div>
                <div className="text-xl font-extrabold text-emerald-600 tabular-nums">{courts.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                <div className="text-[11px] text-slate-500">العناوين المحفوظة</div>
                <div className="text-xl font-extrabold text-purple-600 tabular-nums">{savedTitles.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
                <div className="text-[11px] text-slate-500">التصنيفات الذكية</div>
                <div className="text-xl font-extrabold text-amber-500 tabular-nums">{categories.length}</div>
              </div>
            </div>

            {/* Granular Reset & Maintenance Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                عمليات الصيانة وإعادة الضبط الدقيقة:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل تريد مسح ذاكرة الاقتراحات وإعادة ضبط القواميس إلى الحالة الافتراضية؟ (لن يتم حذف أي مهام مسجلة).')) {
                      resetLearnedDictionaries();
                      alert('تمت استعادة القواميس الافتراضية بنجاح.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>مسح ذاكرة الاقتراحات فقط</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل تريد مسح وأرشفة كافة المهام المنجزة والمستوفاة من السجل النشط؟')) {
                      clearCompletedTasks();
                      alert('تم تنظيف المهام المنجزة بنجاح.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>مسح المهام المنجزة فقط</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('⚠️ تحذير أمني شديد:\nهل أنت متأكد من رغبتك في إعادة ضبط المصنع الشاملة؟ سيتم حذف كافة التعديلات واستعادة الحالة الأولية للمديرية.')) {
                      factoryResetSystem();
                      alert('تمت استعادة ضبط المصنع بنجاح.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>إعادة ضبط المصنع الشامل (Factory Reset)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup Export & Restore */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>النسخ الاحتياطي وتصدير واسترجاع ملف JSON الشامل</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">تصدير ملف النسخة الاحتياطية:</span>
                <p className="text-[11px] text-slate-500">
                  تحميل ملف JSON كامل ومطابق يحتوي على كافة المهام (75+)، الوجهات، التصنيفات، القوالب، وسجل العمليات.
                </p>
                <button
                  type="button"
                  onClick={exportBackupJSON}
                  className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير نسخة احتياطية كاملة (JSON)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">استرجاع بيانات من ملف JSON:</span>
                <p className="text-[11px] text-slate-500">
                  اختر ملف نسخة احتياطية سابقة لاستعادة حالتك دون فقدان التوافق.
                </p>
                <label className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>تحديد ملف JSON واسترجاع</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileRestore}
                    className="hidden"
                  />
                </label>
                {importFeedback && (
                  <div className={`p-2 rounded-lg text-[11px] font-bold ${importFeedback.success ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                    {importFeedback.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
