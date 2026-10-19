import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { 
  Task, 
  TaskFilterOptions, 
  SystemData, 
  Category, 
  CourtDestination, 
  TaskTemplate, 
  MissionLibraryItem, 
  UserProfile, 
  AppSettings, 
  AuditLogEntry,
  TaskStatus,
  SubTask
} from '../types/tasks';
import { 
  loadSystemData, 
  persistSystemData, 
  autoLearnEntities, 
  determineGeographicScope, 
  queryTasks,
  STORAGE_KEY
} from '../services/storageService';
import { INITIAL_SYSTEM_DATA } from '../data/initialData';
import { searchHistoricalTasks } from '../services/searchService';
import { TaskSearchResult } from '../types/tasks';

// Reducer Action Types
type TaskAction =
  | { type: 'INIT_STATE'; payload: SystemData }
  | { type: 'CREATE_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { id: string; permanent?: boolean } }
  | { type: 'RESTORE_TASK'; payload: { id: string } }
  | { type: 'EMPTY_TRASH' }
  | { type: 'TOGGLE_STATUS'; payload: { id: string } }
  | { type: 'UPDATE_SUBTASK'; payload: { taskId: string; subtaskId: string; completed: boolean } }
  | { type: 'ADD_SUBTASK'; payload: { taskId: string; title: string; category?: string } }
  | { type: 'REMOVE_SUBTASK'; payload: { taskId: string; subtaskId: string } }
  | { type: 'SCHEDULE_FOR_TODAY'; payload: { id: string } }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'UPDATE_CATEGORIES'; payload: Category[] }
  | { type: 'UPDATE_COURTS'; payload: CourtDestination[] }
  | { type: 'UPDATE_SAVED_TITLES'; payload: string[] }
  | { type: 'RESET_LEARNED_DICTIONARIES' }
  | { type: 'CLEAR_COMPLETED_TASKS' }
  | { type: 'FACTORY_RESET' }
  | { type: 'RESTORE_BACKUP'; payload: SystemData };

function taskReducer(state: SystemData, action: TaskAction): SystemData {
  let newState: SystemData;

  switch (action.type) {
    case 'INIT_STATE':
      return action.payload;

    case 'CREATE_TASK': {
      const task = action.payload;
      const learnedState = autoLearnEntities(state, task);
      
      const newAuditLog: AuditLogEntry = {
        id: `alog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'create',
        action: 'تسجيل مهمة جديدة',
        targetTitle: task.title,
        details: `الوجهة: ${task.destination} | التصنيف: ${task.category} | الأولوية: ${task.priority}`,
        taskId: task.id
      };

      newState = {
        ...learnedState,
        tasks: [task, ...learnedState.tasks],
        auditLog: [newAuditLog, ...learnedState.auditLog]
      };
      break;
    }

    case 'UPDATE_TASK': {
      const { id, updates } = action.payload;
      const existingTask = state.tasks.find(t => t.id === id);
      if (!existingTask) return state;

      const mergedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Auto-recalculate scope if city or destination changed
      if (updates.city || updates.destination) {
        mergedTask.scope = determineGeographicScope(mergedTask.city, mergedTask.destination);
      }

      // Auto-sync progress if status updated to 'منجزة'
      if (updates.status === 'منجزة' && existingTask.status !== 'منجزة') {
        mergedTask.progress = 100;
        mergedTask.subtasks = mergedTask.subtasks.map(s => ({ ...s, completed: true, done: true }));
        mergedTask.completedAt = new Date().toISOString();
      }

      const learnedState = autoLearnEntities(state, mergedTask);

      const auditEntry: AuditLogEntry = {
        id: `alog-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'update',
        action: 'تعديل معطيات المهمة',
        targetTitle: mergedTask.title,
        details: `تحديث الحالة إلى: ${mergedTask.status} | النسبة: ${mergedTask.progress}%`,
        taskId: id
      };

      newState = {
        ...learnedState,
        tasks: learnedState.tasks.map(t => t.id === id ? mergedTask : t),
        auditLog: [auditEntry, ...learnedState.auditLog]
      };
      break;
    }

    case 'DELETE_TASK': {
      const { id, permanent } = action.payload;
      if (permanent) {
        newState = {
          ...state,
          trash: state.trash.filter(t => t.id !== id),
          auditLog: [
            {
              id: `alog-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'delete',
              action: 'حذف نهائي للمهمة',
              details: 'تم الحذف النهائي من سلة المهملات',
              taskId: id
            },
            ...state.auditLog
          ]
        };
      } else {
        const taskToDelete = state.tasks.find(t => t.id === id);
        if (!taskToDelete) return state;

        const deletedTask: Task = {
          ...taskToDelete,
          deletedAt: new Date().toISOString(),
          deletedBy: state.settings.userName || 'المستخدم'
        };

        newState = {
          ...state,
          tasks: state.tasks.filter(t => t.id !== id),
          trash: [deletedTask, ...state.trash],
          auditLog: [
            {
              id: `alog-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'delete',
              action: 'نقل إلى سلة المهملات',
              targetTitle: taskToDelete.title,
              details: `تاريخ الحذف: ${new Date().toLocaleDateString('ar-MA')}`,
              taskId: id
            },
            ...state.auditLog
          ]
        };
      }
      break;
    }

    case 'RESTORE_TASK': {
      const { id } = action.payload;
      const taskToRestore = state.trash.find(t => t.id === id);
      if (!taskToRestore) return state;

      const restoredTask = { ...taskToRestore };
      delete restoredTask.deletedAt;
      delete restoredTask.deletedBy;

      newState = {
        ...state,
        trash: state.trash.filter(t => t.id !== id),
        tasks: [restoredTask, ...state.tasks],
        auditLog: [
          {
            id: `alog-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'restore',
            action: 'استرجاع من سلة المهملات',
            targetTitle: restoredTask.title,
            details: 'تمت استعادة المهمة بنجاح إلى جدول المهام النشط',
            taskId: id
          },
          ...state.auditLog
        ]
      };
      break;
    }

    case 'EMPTY_TRASH':
      newState = {
        ...state,
        trash: [],
        auditLog: [
          {
            id: `alog-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'delete',
            action: 'تفريغ سلة المهملات',
            details: `تم مسح ${state.trash.length} عناصر محذوفة نهائياً`
          },
          ...state.auditLog
        ]
      };
      break;

    case 'TOGGLE_STATUS': {
      const { id } = action.payload;
      const task = state.tasks.find(t => t.id === id);
      if (!task) return state;

      const isNowDone = task.status !== 'منجزة' && task.status !== 'مكتملة';
      const updatedStatus: TaskStatus = isNowDone ? 'منجزة' : 'قيد الإنجاز';
      const updatedProgress = isNowDone ? 100 : 50;

      const updatedTask: Task = {
        ...task,
        status: updatedStatus,
        progress: updatedProgress,
        subtasks: isNowDone 
          ? task.subtasks.map(st => ({ ...st, completed: true, done: true }))
          : task.subtasks,
        completedAt: isNowDone ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString()
      };

      newState = {
        ...state,
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        auditLog: [
          {
            id: `alog-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: isNowDone ? 'done' : 'update',
            action: isNowDone ? 'إنجاز المهمة' : 'إعادة فتح المهمة',
            targetTitle: task.title,
            details: `الحالة الجديدة: ${updatedStatus}`,
            taskId: id
          },
          ...state.auditLog
        ]
      };
      break;
    }

    case 'UPDATE_SUBTASK': {
      const { taskId, subtaskId, completed } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;

      const updatedSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed, done: completed } : st
      );

      // Auto-calculate parent task progress based on subtasks completion percentage
      const totalSubs = updatedSubtasks.length;
      const doneSubs = updatedSubtasks.filter(s => s.completed || s.done).length;
      const calculatedProgress = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : task.progress;
      
      const isAutoCompleted = calculatedProgress === 100 && totalSubs > 0;
      const status: TaskStatus = isAutoCompleted ? 'منجزة' : (task.status === 'منجزة' && calculatedProgress < 100 ? 'قيد الإنجاز' : task.status);

      const updatedTask: Task = {
        ...task,
        subtasks: updatedSubtasks,
        progress: calculatedProgress,
        status,
        updatedAt: new Date().toISOString()
      };

      newState = {
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
      };
      break;
    }

    case 'ADD_SUBTASK': {
      const { taskId, title, category } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;

      const newSubtask: SubTask = {
        id: `st-${Date.now()}-${task.subtasks.length}`,
        title: title.trim(),
        category: category || task.category,
        completed: false,
        done: false
      };

      const updatedSubtasks = [...task.subtasks, newSubtask];
      const doneSubs = updatedSubtasks.filter(s => s.completed || s.done).length;
      const calculatedProgress = Math.round((doneSubs / updatedSubtasks.length) * 100);

      const updatedTask: Task = {
        ...task,
        subtasks: updatedSubtasks,
        progress: calculatedProgress,
        status: calculatedProgress === 100 ? 'منجزة' : (task.status === 'منجزة' ? 'قيد الإنجاز' : task.status),
        updatedAt: new Date().toISOString()
      };

      newState = {
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
      };
      break;
    }

    case 'REMOVE_SUBTASK': {
      const { taskId, subtaskId } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;

      const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
      const totalSubs = updatedSubtasks.length;
      const doneSubs = updatedSubtasks.filter(s => s.completed || s.done).length;
      const calculatedProgress = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : task.progress;

      const updatedTask: Task = {
        ...task,
        subtasks: updatedSubtasks,
        progress: calculatedProgress,
        status: calculatedProgress === 100 && totalSubs > 0 ? 'منجزة' : task.status,
        updatedAt: new Date().toISOString()
      };

      newState = {
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
      };
      break;
    }

    case 'SCHEDULE_FOR_TODAY': {
      const { id } = action.payload;
      const todayISO = new Date().toISOString().split('T')[0];
      const task = state.tasks.find(t => t.id === id);
      if (!task) return state;

      const scheduledTask: Task = {
        ...task,
        taskDate: todayISO,
        isBacklog: false,
        status: task.status === 'مبرمجة' || task.status === 'جديدة' ? 'قيد الإنجاز' : task.status,
        progress: task.progress === 0 ? 50 : task.progress,
        updatedAt: new Date().toISOString()
      };

      newState = {
        ...state,
        tasks: state.tasks.map(t => t.id === id ? scheduledTask : t),
        auditLog: [
          {
            id: `alog-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'update',
            action: 'برمجة المهمة للتنفيذ اليوم',
            targetTitle: task.title,
            details: `الموعد الجديد: ${todayISO}`,
            taskId: id
          },
          ...state.auditLog
        ]
      };
      break;
    }

    case 'UPDATE_PROFILE': {
      const updatedProfile: UserProfile = {
        ...(state.profile || {} as UserProfile),
        ...action.payload,
        updatedAt: new Date().toISOString()
      };

      newState = {
        ...state,
        profile: updatedProfile,
        settings: {
          ...state.settings,
          userName: updatedProfile.fullName || state.settings.userName,
          userRole: updatedProfile.jobTitle || state.settings.userRole,
          department: updatedProfile.organization || state.settings.department
        }
      };
      break;
    }

    case 'UPDATE_SETTINGS': {
      newState = {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      break;
    }

    case 'TOGGLE_THEME': {
      const currentTheme = state.settings.theme || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      newState = {
        ...state,
        settings: {
          ...state.settings,
          theme: nextTheme
        }
      };
      break;
    }

    case 'SET_THEME': {
      newState = {
        ...state,
        settings: {
          ...state.settings,
          theme: action.payload
        }
      };
      break;
    }

    case 'UPDATE_CATEGORIES': {
      newState = {
        ...state,
        categories: action.payload
      };
      break;
    }

    case 'UPDATE_COURTS': {
      newState = {
        ...state,
        courts: action.payload
      };
      break;
    }

    case 'UPDATE_SAVED_TITLES': {
      newState = {
        ...state,
        savedTitles: action.payload
      };
      break;
    }

    case 'RESET_LEARNED_DICTIONARIES': {
      newState = {
        ...state,
        savedTitles: [...INITIAL_SYSTEM_DATA.savedTitles || []],
        categories: JSON.parse(JSON.stringify(INITIAL_SYSTEM_DATA.categories)),
        courts: JSON.parse(JSON.stringify(INITIAL_SYSTEM_DATA.courts)),
        auditLog: [
          {
            id: `alog-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'system',
            action: 'إعادة ضبط قواميس التعلم الذاتي',
            details: 'تمت استعادة عناوين وتصنيفات ومقار المحاكم الافتراضية'
          },
          ...state.auditLog
        ]
      };
      break;
    }

    case 'CLEAR_COMPLETED_TASKS': {
      const remainingTasks = state.tasks.filter(t => t.status !== 'منجزة' && t.status !== 'مكتملة');
      const clearedCount = state.tasks.length - remainingTasks.length;
      newState = {
        ...state,
        tasks: remainingTasks,
        auditLog: [
          {
            id: `alog-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'delete',
            action: 'مسح وأرشفة المهام المنجزة',
            details: `تم تنظيف ${clearedCount} مهمة منجزة من السجل النشط`
          },
          ...state.auditLog
        ]
      };
      break;
    }

    case 'FACTORY_RESET': {
      newState = JSON.parse(JSON.stringify(INITIAL_SYSTEM_DATA));
      break;
    }

    case 'RESTORE_BACKUP':
      return action.payload;

    default:
      return state;
  }

  // Persist state to LocalStorage
  persistSystemData(newState);
  return newState;
}

interface KPIStats {
  totalTasks: number;
  todayTasks: number;
  futureTasks: number;
  pendingTasks: number;
  doneTasks: number;
  completionRate: number;
  localCount: number;
  externalCount: number;
  trashCount: number;
}

interface TaskContextValue {
  // State
  state: SystemData;
  tasks: Task[];
  filteredTasks: Task[];
  trash: Task[];
  categories: Category[];
  courts: CourtDestination[];
  templates: TaskTemplate[];
  missionLibrary: MissionLibraryItem[];
  profile: UserProfile;
  settings: AppSettings;
  auditLog: AuditLogEntry[];
  savedTitles: string[];
  filterOptions: TaskFilterOptions;
  kpiStats: KPIStats;

  // Global Search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  searchResults: TaskSearchResult[];
  searchTasks: (query: string) => TaskSearchResult[];

  // Actions
  createTask: (data: Partial<Task>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string, permanent?: boolean) => void;
  restoreTask: (id: string) => void;
  emptyTrash: () => void;
  toggleTaskStatus: (id: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  addSubtask: (taskId: string, title: string, category?: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;
  scheduleTaskForToday: (id: string) => void;
  setFilters: (filters: Partial<TaskFilterOptions>) => void;
  resetFilters: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  updateCategories: (categories: Category[]) => void;
  updateCourts: (courts: CourtDestination[]) => void;
  updateSavedTitles: (titles: string[]) => void;
  resetLearnedDictionaries: () => void;
  clearCompletedTasks: () => void;
  factoryResetSystem: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => { success: boolean; message: string; count?: number };
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, null, loadSystemData);
  const [filterOptions, setFilterOptions] = React.useState<TaskFilterOptions>({
    searchQuery: '',
    destination: '',
    category: '',
    scope: '',
    status: '',
    priority: '',
    sortOrder: 'newest'
  });

  // Global Real-Time Search State
  const [globalSearchQuery, setGlobalSearchQuery] = React.useState<string>('');

  // Apply theme & font scale synchronously to DOM document & LocalStorage
  useEffect(() => {
    const theme = state.settings?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark-mode', theme === 'dark');
    
    try {
      localStorage.setItem('theme', theme);
      localStorage.setItem('ops_v3_theme', theme);
    } catch(e) {}

    const fontScale = state.settings?.fontScale || 'md';
    document.documentElement.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg');
    document.documentElement.classList.add(`font-scale-${fontScale}`);
  }, [state.settings?.theme, state.settings?.fontScale]);

  // Real-time Global Search Results with memoization
  const searchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    return searchHistoricalTasks(state.tasks, globalSearchQuery);
  }, [state.tasks, globalSearchQuery]);

  // Arbitrary Search function for manual queries
  const searchTasks = useCallback((query: string): TaskSearchResult[] => {
    return searchHistoricalTasks(state.tasks, query);
  }, [state.tasks]);

  // Filtered tasks calculation
  const filteredTasks = useMemo(() => {
    return queryTasks(state.tasks, filterOptions);
  }, [state.tasks, filterOptions]);

  // Dynamic KPI Stats calculation
  const kpiStats: KPIStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = state.tasks.length;
    let todayCount = 0;
    let futureCount = 0;
    let pendingCount = 0;
    let doneCount = 0;
    let localCount = 0;
    let extCount = 0;

    state.tasks.forEach(t => {
      const isDone = t.status === 'منجزة' || t.status === 'مكتملة';
      if (isDone) doneCount++;

      // Today's active tasks
      if (!t.isBacklog && t.taskDate === todayStr && !isDone) {
        todayCount++;
      }

      // Future & Backlog tasks
      if ((t.isBacklog || !t.taskDate || (t.taskDate && t.taskDate > todayStr)) && !isDone) {
        futureCount++;
      }

      // Pending / Overdue
      if (!isDone && !t.isBacklog && (t.status === 'معلقة' || t.status === 'متأخرة' || (t.taskDate && t.taskDate < todayStr))) {
        pendingCount++;
      }

      // Geo split
      if (t.scope === 'محلي') {
        localCount++;
      } else {
        extCount++;
      }
    });

    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    return {
      totalTasks: total,
      todayTasks: todayCount,
      futureTasks: futureCount,
      pendingTasks: pendingCount,
      doneTasks: doneCount,
      completionRate,
      localCount,
      externalCount: extCount,
      trashCount: state.trash.length
    };
  }, [state.tasks, state.trash]);

  // Action Handlers
  const createTask = useCallback((data: Partial<Task>): Task => {
    const todayISO = new Date().toISOString().split('T')[0];
    const dest = data.destination || data.court || state.profile?.workplace || 'المديرية الإقليمية للعدل بسطات';
    const city = data.city || (dest.includes('برشيد') ? 'برشيد' : (dest.includes('أحمد') ? 'ابن أحمد' : (dest.includes('الرباط') ? 'الرباط' : 'سطات')));
    const scope = data.scope || determineGeographicScope(city, dest);

    const isBacklog = Boolean(data.isBacklog || !data.taskDate);
    const date = isBacklog ? '' : (data.taskDate || todayISO);
    
    let status: TaskStatus = data.status || (isBacklog ? 'مبرمجة' : (date > todayISO ? 'مبرمجة' : 'قيد الإنجاز'));
    let progress = typeof data.progress === 'number' ? data.progress : (status === 'منجزة' ? 100 : (status === 'مبرمجة' ? 0 : 50));

    const cleanSubtasks: SubTask[] = Array.isArray(data.subtasks) 
      ? data.subtasks.filter(s => s && s.title && s.title.trim()).map((st, i) => ({
          id: st.id || `st-${Date.now()}-${i}`,
          title: st.title.trim(),
          category: st.category || data.category || 'عام',
          completed: Boolean(st.completed || st.done),
          done: Boolean(st.completed || st.done)
        }))
      : [];

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: data.title ? data.title.trim() : 'تدخل إداري وتقني',
      description: data.description ? data.description.trim() : '',
      category: data.category ? data.category.trim() : 'مهام إدارية عامة',
      subcategory: data.subcategory ? data.subcategory.trim() : '',
      status,
      priority: data.priority || 'عادية',
      progress,
      taskDate: date,
      isBacklog,
      destination: dest,
      court: dest,
      city,
      scope,
      subtasks: cleanSubtasks,
      missionId: data.missionId || '',
      recordedContext: {
        userName: state.profile?.fullName || state.settings?.userName || 'المستخدم النشط',
        userRole: state.profile?.jobTitle || state.settings?.userRole || 'إطار إداري وتقني',
        grade: state.profile?.grade || '',
        organization: state.profile?.organization || state.settings?.department || 'المديرية الإقليمية للعدل بسطات',
        service: state.profile?.service || 'مصلحة تدبير الممتلكات والعتاد والمعلوميات',
        workplace: state.profile?.workplace || 'المديرية الإقليمية للعدل بسطات'
      },
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'CREATE_TASK', payload: newTask });
    return newTask;
  }, [state.profile, state.settings]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const deleteTask = useCallback((id: string, permanent?: boolean) => {
    dispatch({ type: 'DELETE_TASK', payload: { id, permanent } });
  }, []);

  const restoreTask = useCallback((id: string) => {
    dispatch({ type: 'RESTORE_TASK', payload: { id } });
  }, []);

  const emptyTrash = useCallback(() => {
    dispatch({ type: 'EMPTY_TRASH' });
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: { id } });
  }, []);

  const updateSubtask = useCallback((taskId: string, subtaskId: string, completed: boolean) => {
    dispatch({ type: 'UPDATE_SUBTASK', payload: { taskId, subtaskId, completed } });
  }, []);

  const addSubtask = useCallback((taskId: string, title: string, category?: string) => {
    dispatch({ type: 'ADD_SUBTASK', payload: { taskId, title, category } });
  }, []);

  const removeSubtask = useCallback((taskId: string, subtaskId: string) => {
    dispatch({ type: 'REMOVE_SUBTASK', payload: { taskId, subtaskId } });
  }, []);

  const scheduleTaskForToday = useCallback((id: string) => {
    dispatch({ type: 'SCHEDULE_FOR_TODAY', payload: { id } });
  }, []);

  const setFilters = useCallback((filters: Partial<TaskFilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...filters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions({
      searchQuery: '',
      destination: '',
      category: '',
      scope: '',
      status: '',
      priority: '',
      sortOrder: 'newest'
    });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const updateCategories = useCallback((categories: Category[]) => {
    dispatch({ type: 'UPDATE_CATEGORIES', payload: categories });
  }, []);

  const updateCourts = useCallback((courts: CourtDestination[]) => {
    dispatch({ type: 'UPDATE_COURTS', payload: courts });
  }, []);

  const updateSavedTitles = useCallback((titles: string[]) => {
    dispatch({ type: 'UPDATE_SAVED_TITLES', payload: titles });
  }, []);

  const resetLearnedDictionaries = useCallback(() => {
    dispatch({ type: 'RESET_LEARNED_DICTIONARIES' });
  }, []);

  const clearCompletedTasks = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED_TASKS' });
  }, []);

  const factoryResetSystem = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'FACTORY_RESET' });
  }, []);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const exportBackupJSON = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `E-Tasks-Justice-Settat-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state]);

  const importBackupJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.tasks)) {
        return { success: false, message: 'بنية ملف النسخة الاحتياطية غير صالحة: حقل المهام مفقود' };
      }

      dispatch({ type: 'RESTORE_BACKUP', payload: parsed });
      persistSystemData(parsed);
      return { success: true, message: 'تم استرجاع البيانات بنجاح', count: parsed.tasks.length };
    } catch (err: any) {
      return { success: false, message: `خطأ أثناء قراءة الملف: ${err.message}` };
    }
  }, []);

  const value = useMemo<TaskContextValue>(() => ({
    state,
    tasks: state.tasks,
    filteredTasks,
    trash: state.trash,
    categories: state.categories,
    courts: state.courts,
    templates: state.templates,
    missionLibrary: state.missionLibrary || [],
    profile: state.profile || ({} as UserProfile),
    settings: state.settings,
    auditLog: state.auditLog,
    savedTitles: state.savedTitles || [],
    filterOptions,
    kpiStats,
    globalSearchQuery,
    setGlobalSearchQuery,
    searchResults,
    searchTasks,
    createTask,
    updateTask,
    deleteTask,
    restoreTask,
    emptyTrash,
    toggleTaskStatus,
    updateSubtask,
    addSubtask,
    removeSubtask,
    scheduleTaskForToday,
    setFilters,
    resetFilters,
    toggleTheme,
    setTheme,
    updateCategories,
    updateCourts,
    updateSavedTitles,
    resetLearnedDictionaries,
    clearCompletedTasks,
    factoryResetSystem,
    updateProfile,
    updateSettings,
    exportBackupJSON,
    importBackupJSON
  }), [
    state,
    filteredTasks,
    filterOptions,
    kpiStats,
    globalSearchQuery,
    searchResults,
    searchTasks,
    createTask,
    updateTask,
    deleteTask,
    restoreTask,
    emptyTrash,
    toggleTaskStatus,
    updateSubtask,
    addSubtask,
    removeSubtask,
    scheduleTaskForToday,
    setFilters,
    resetFilters,
    toggleTheme,
    setTheme,
    updateCategories,
    updateCourts,
    updateSavedTitles,
    resetLearnedDictionaries,
    clearCompletedTasks,
    factoryResetSystem,
    updateProfile,
    updateSettings,
    exportBackupJSON,
    importBackupJSON
  ]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
