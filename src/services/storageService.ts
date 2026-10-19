import { SystemData, Task, TaskFilterOptions, GeographicScope } from '../types/tasks';
import { INITIAL_SYSTEM_DATA } from '../data/initialData';

export const STORAGE_KEY = 'settat_personal_operations_system_v3';
export const PRE_RESTORE_SNAPSHOT_KEY = 'settat_ops_pre_restore_snapshot';

/**
 * XSS Sanitization helper: Escapes HTML characters in user-entered strings.
 */
export function sanitizeString(input?: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Geographic scope helper according to Settat Provincial Directorate jurisdiction.
 */
export function determineGeographicScope(city?: string, destination?: string): GeographicScope {
  const c = (city || '').trim().toLowerCase();
  const d = (destination || '').trim().toLowerCase();
  
  if (c.includes('سطات') || d.includes('سطات') || d.includes('المديرية الإقليمية')) {
    return 'محلي';
  }
  return 'تنقل خارجي';
}

/**
 * Loads system data from LocalStorage with 100% backward compatibility.
 * Falls back to INITIAL_SYSTEM_DATA if storage is empty or corrupted.
 */
export function loadSystemData(): SystemData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      persistSystemData(INITIAL_SYSTEM_DATA);
      return INITIAL_SYSTEM_DATA;
    }

    const parsed = JSON.parse(raw);
    
    // Ensure critical arrays and objects exist
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.tasks)) {
      console.warn('[E-Tasks Storage] Corrupted state detected. Resetting to initial verified data.');
      persistSystemData(INITIAL_SYSTEM_DATA);
      return INITIAL_SYSTEM_DATA;
    }

    // Normalizing tasks (e.g. converting legacy "مكتملة" to "منجزة", ensuring subtasks have boolean states)
    const normalizedTasks: Task[] = parsed.tasks.map((t: any) => {
      const status = t.status === 'مكتملة' ? 'منجزة' : (t.status || 'قيد الإنجاز');
      const priority = t.priority === 'مهمة' ? 'عالية' : (t.priority || 'عادية');
      const dest = t.destination || t.court || '';
      const city = t.city || (dest.includes('برشيد') ? 'برشيد' : (dest.includes('أحمد') ? 'ابن أحمد' : (dest.includes('الرباط') ? 'الرباط' : 'سطات')));
      
      const subtasks = Array.isArray(t.subtasks) ? t.subtasks.map((st: any, idx: number) => ({
        id: st.id || `st-${idx}-${Date.now()}`,
        title: st.title || '',
        category: st.category || t.category || '',
        completed: Boolean(st.completed || st.done),
        done: Boolean(st.completed || st.done)
      })) : [];

      return {
        ...t,
        status,
        priority,
        destination: dest,
        court: dest,
        city,
        scope: t.scope || determineGeographicScope(city, dest),
        subtasks,
        progress: typeof t.progress === 'number' ? t.progress : (status === 'منجزة' ? 100 : 0)
      };
    });

    return {
      tasks: normalizedTasks,
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : INITIAL_SYSTEM_DATA.categories,
      courts: Array.isArray(parsed.courts) && parsed.courts.length > 0 ? parsed.courts : INITIAL_SYSTEM_DATA.courts,
      toners: Array.isArray(parsed.toners) ? parsed.toners : INITIAL_SYSTEM_DATA.toners,
      templates: Array.isArray(parsed.templates) ? parsed.templates : INITIAL_SYSTEM_DATA.templates,
      settings: parsed.settings || INITIAL_SYSTEM_DATA.settings,
      profile: parsed.profile || INITIAL_SYSTEM_DATA.profile,
      missionLibrary: Array.isArray(parsed.missionLibrary) && parsed.missionLibrary.length > 0 ? parsed.missionLibrary : INITIAL_SYSTEM_DATA.missionLibrary,
      trash: Array.isArray(parsed.trash) ? parsed.trash : [],
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : INITIAL_SYSTEM_DATA.auditLog,
      savedTitles: Array.isArray(parsed.savedTitles) ? parsed.savedTitles : INITIAL_SYSTEM_DATA.savedTitles
    };
  } catch (err) {
    console.error('[E-Tasks Storage] Error reading LocalStorage:', err);
    return INITIAL_SYSTEM_DATA;
  }
}

/**
 * Persists the system state securely to LocalStorage with Quota check.
 */
export function persistSystemData(data: SystemData): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('[E-Tasks Storage] LocalStorage write failed (QuotaExceededError or security sandbox):', err);
    return false;
  }
}

/**
 * Auto-learns user inputs (titles, categories, court destinations) into the system.
 */
export function autoLearnEntities(state: SystemData, task: Partial<Task>): SystemData {
  const updated = { ...state };
  let modified = false;

  // 1. Title learning
  if (task.title && task.title.trim()) {
    const t = task.title.trim();
    if (!updated.savedTitles) updated.savedTitles = [];
    if (!updated.savedTitles.includes(t)) {
      updated.savedTitles = [t, ...updated.savedTitles.filter(x => x !== t)].slice(0, 50);
      modified = true;
    }
  }

  // 2. Category & Subcategory learning
  if (task.category && task.category.trim()) {
    const catName = task.category.trim();
    const existingCat = updated.categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    
    if (!existingCat) {
      updated.categories = [
        ...updated.categories,
        {
          id: `cat-${Date.now()}`,
          name: catName,
          icon: '📁',
          subs: task.subcategory ? [task.subcategory.trim(), 'عام'] : ['عام']
        }
      ];
      modified = true;
    } else if (task.subcategory && task.subcategory.trim()) {
      const subName = task.subcategory.trim();
      if (!existingCat.subs) existingCat.subs = [];
      if (!existingCat.subs.includes(subName)) {
        existingCat.subs = [...existingCat.subs, subName];
        modified = true;
      }
    }
  }

  // 3. Destination learning
  if (task.destination && task.destination.trim()) {
    const destName = task.destination.trim();
    const courtExists = updated.courts.some(c => c.name.toLowerCase() === destName.toLowerCase());
    if (!courtExists) {
      const city = task.city || (destName.includes('برشيد') ? 'برشيد' : (destName.includes('أحمد') ? 'ابن أحمد' : (destName.includes('الرباط') ? 'الرباط' : 'سطات')));
      updated.courts = [
        {
          id: `court-${Date.now()}`,
          name: destName,
          city,
          scope: determineGeographicScope(city, destName),
          type: 'مرفق قضائي / وجهة مسجلة',
          status: 'active'
        },
        ...updated.courts
      ];
      modified = true;
    }
  }

  return modified ? updated : state;
}

/**
 * Filter & Sort logic for tasks.
 */
export function queryTasks(tasks: Task[], options: TaskFilterOptions): Task[] {
  const q = (options.searchQuery || '').toLowerCase().trim();
  const dest = (options.destination || '').trim();
  const cat = (options.category || '').trim();
  const sc = options.scope || '';
  const st = options.status || '';
  const pr = options.priority || '';
  const isBacklogFilter = options.isBacklog;
  const missionId = options.missionId;

  let results = tasks.filter(t => {
    // Search query matches title, description, or destination
    if (q) {
      const inTitle = t.title?.toLowerCase().includes(q);
      const inDesc = t.description?.toLowerCase().includes(q);
      const inDest = t.destination?.toLowerCase().includes(q) || t.court?.toLowerCase().includes(q);
      const inCat = t.category?.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inDest && !inCat) return false;
    }

    if (dest && t.destination !== dest && t.court !== dest) return false;
    if (cat && t.category !== cat) return false;
    if (sc && t.scope !== sc) return false;
    if (missionId && t.missionId !== missionId) return false;

    if (st) {
      if (st === 'منجزة' && t.status !== 'منجزة' && t.status !== 'مكتملة') return false;
      if (st !== 'منجزة' && t.status !== st) return false;
    }

    if (pr && t.priority !== pr) return false;

    if (typeof isBacklogFilter === 'boolean') {
      const isTaskBacklog = Boolean(t.isBacklog || !t.taskDate);
      if (isBacklogFilter !== isTaskBacklog) return false;
    }

    return true;
  });

  // Sorting
  const sort = options.sortOrder || 'newest';
  if (sort === 'newest') {
    results.sort((a, b) => (b.taskDate || '').localeCompare(a.taskDate || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
  } else if (sort === 'oldest') {
    results.sort((a, b) => (a.taskDate || '').localeCompare(b.taskDate || '') || (a.createdAt || '').localeCompare(b.createdAt || ''));
  } else if (sort === 'priority') {
    const weight: Record<string, number> = { 'عاجلة': 5, 'عالية': 4, 'مهمة': 3.5, 'متوسطة': 2.5, 'عادية': 2, 'منخفضة': 1 };
    results.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0));
  } else if (sort === 'timeline') {
    const today = new Date().toISOString().split('T')[0];
    results.sort((a, b) => {
      const aToday = a.taskDate === today;
      const bToday = b.taskDate === today;
      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;
      return (a.taskDate || '9999').localeCompare(b.taskDate || '9999');
    });
  }

  return results;
}
