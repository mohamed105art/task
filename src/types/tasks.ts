/**
 * E-Tasks Justice Settat V18 Enterprise
 * Strict TypeScript Type Definitions with 100% Backward Compatibility
 */

export type TaskStatus = 
  | 'جديدة' 
  | 'مبرمجة' 
  | 'قيد الإنجاز' 
  | 'قيد المتابعة' 
  | 'معلقة' 
  | 'متأخرة' 
  | 'منجزة' 
  | 'مكتملة';

export type TaskPriority = 
  | 'منخفضة' 
  | 'عادية' 
  | 'متوسطة' 
  | 'عالية' 
  | 'مهمة' 
  | 'عاجلة';

export type GeographicScope = 'محلي' | 'تنقل خارجي' | 'داخلي' | 'خارجي';

export interface SubTask {
  id: string;
  title: string;
  category?: string;
  completed: boolean;
  done?: boolean;
}

export interface TaskLogEntry {
  date: string;
  time?: string;
  text: string;
}

export interface RecordedContext {
  userName: string;
  userRole: string;
  grade?: string;
  organization: string;
  service: string;
  workplace: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  category: string;
  subcategory?: string;
  type?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  taskDate?: string;
  dueDate?: string;
  isMultiDay?: boolean;
  isBacklog?: boolean;
  destination: string;
  court?: string;
  city?: string;
  scope?: GeographicScope;
  location?: string;
  tags?: string[];
  subtasks: SubTask[];
  logs?: TaskLogEntry[];
  recordedContext?: RecordedContext;
  missionId?: string;
  missionNumber?: number;
  orderDate?: string;
  departureDate?: string;
  returnDate?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  completionDate?: string;
  deletedAt?: string;
  deletedBy?: string;
  keep_link?: string;
  source?: string;
  is_imported?: boolean;
  original_date?: string;
  import_date?: string;
  person?: string;
  responsible?: string;
}

export interface SubCategoryItem {
  id: string;
  title: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  keywords?: string[];
  subs?: string[];
  subCategories?: SubCategoryItem[];
}

export interface CourtDestination {
  id: string;
  name: string;
  city?: string;
  type?: string;
  scope?: GeographicScope;
  address?: string;
  phone?: string;
  email?: string;
  contact?: string;
  notes?: string;
  status?: 'active' | 'archived';
}

export interface TonerItem {
  id: string;
  ref: string;
  brand: string;
  model: string;
  color: string;
  type: string;
  compatiblePrinters: string;
  stock: number;
  minStock: number;
}

export interface TaskTemplate {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  type?: string;
  priority: TaskPriority;
  court?: string;
  desc?: string;
  docType?: string;
}

export interface MissionLibraryItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  missionType: 'principale' | 'habituelle' | 'personnalisee';
  defaultDestination?: string;
  defaultPriority: TaskPriority;
  keywords?: string[];
  defaultSubtasks: Array<{ id: string; title: string }>;
  reportTemplate?: string;
  status: 'active' | 'archived';
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  jobTitle: string;
  grade?: string;
  organization: string;
  service?: string;
  workplace?: string;
  mainDomain?: string;
  ministry?: string;
  officialStampText?: string;
  phone?: string;
  email?: string;
  responsibilities?: string;
  coreMissionsSummary?: string;
  recurringMissionsSummary?: string;
  isCustomModified?: boolean;
  updatedAt?: string;
}

export interface SidebarLabels {
  dashboard: string;
  today: string;
  backlog: string;
  calendar: string;
  tasks: string;
  report: string;
  trash: string;
  settings: string;
  library?: string;
}

export interface AppSettings {
  systemName: string;
  userName: string;
  userRole: string;
  department: string;
  ministry: string;
  logoUrl?: string;
  headerText?: string;
  footerText?: string;
  officialStampText?: string;
  itemsPerPage?: number;
  theme?: 'dark' | 'light';
  uiDensity?: 'compact' | 'comfortable' | 'spacious';
  fontScale?: 'sm' | 'md' | 'lg';
  defaultStartupView?: 'dashboard' | 'today' | 'tasks' | 'calendar' | 'backlog';
  defaultSidebarCollapsed?: boolean;
  defaultPriority?: TaskPriority;
  defaultStatus?: TaskStatus;
  autoCompleteWhenSubtasksDone?: boolean;
  categoryKeywords?: Record<string, string[]>;
  sidebarLabels?: SidebarLabels;
  logoImg?: string;
  headerImg?: string;
  footerImg?: string;
}

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  action: string;
  details?: string;
  type?: 'create' | 'update' | 'done' | 'delete' | 'restore' | 'system';
  targetTitle?: string;
  taskId?: string;
}

export interface SystemData {
  tasks: Task[];
  categories: Category[];
  courts: CourtDestination[];
  toners: TonerItem[];
  templates: TaskTemplate[];
  settings: AppSettings;
  profile?: UserProfile;
  missionLibrary?: MissionLibraryItem[];
  trash: Task[];
  auditLog: AuditLogEntry[];
  savedTitles?: string[];
  missionsRegistry?: Array<{
    num: number;
    orderDate: string;
    departureDate: string;
    returnDate: string;
    destination: string;
    court: string;
  }>;
}

export interface TaskFilterOptions {
  searchQuery?: string;
  destination?: string;
  category?: string;
  scope?: GeographicScope | '';
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  date?: string;
  isBacklog?: boolean;
  missionId?: string;
  sortOrder?: 'newest' | 'oldest' | 'priority' | 'timeline';
}

export type SearchMatchField = 'title' | 'description' | 'tags' | 'category' | 'subcategory' | 'destination' | 'subtasks' | 'notes';

export interface SearchMatchDetail {
  field: SearchMatchField;
  fieldLabel: string;
  snippet: string;
}

export interface TaskSearchResult {
  task: Task;
  score: number;
  matches: SearchMatchDetail[];
}

