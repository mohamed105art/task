import { TaskPriority, TaskStatus, GeographicScope, SubTask } from '../types/tasks';
import { normalizeArabicText } from '../utils/textUtils';

export interface ParsedVoiceTask {
  title: string;
  category: string;
  subcategory?: string;
  destination: string;
  city: string;
  scope: GeographicScope;
  taskDate?: string;
  isBacklog: boolean;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  subtasks: SubTask[];
  description: string;
  rawTranscript: string;
  detectedSummary: {
    domainDetected?: string;
    facilityDetected?: string;
    dateDetected?: string;
    priorityDetected?: string;
    subtasksDetectedCount: number;
  };
}

/**
 * Checks if the browser natively supports SpeechRecognition
 */
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

/**
 * Initializes a SpeechRecognition instance with Arabic dialect priority
 */
export function createSpeechRecognitionInstance(): any | null {
  if (!isSpeechRecognitionSupported()) return null;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'ar-MA'; // Moroccan Arabic, fallback to standard Arabic
  recognition.maxAlternatives = 1;
  return recognition;
}

/**
 * Intelligently parses spoken Arabic/French administrative dictation into the 6-stage E-Tasks V18 model
 */
export function parseVoiceTranscriptToTask(transcript: string, existingWorkplace = 'المديرية الإقليمية للعدل بسطات'): ParsedVoiceTask {
  const cleanTranscript = (transcript || '').trim();
  const norm = normalizeArabicText(cleanTranscript);
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  // 1. DATE & ORIGIN PARSING (Stage 1)
  let taskDate: string | undefined = todayISO;
  let isBacklog = false;
  let dateDetected = 'اليوم';

  if (norm.includes('بدون تاريخ') || norm.includes('مفتوحه') || norm.includes('برمجه مفتوحه') || norm.includes('لا تاريخ')) {
    isBacklog = true;
    taskDate = undefined;
    dateDetected = 'برمجة مفتوحة';
  } else if (norm.includes('غدا') || norm.includes('غدا صباحا') || norm.includes('الغد') || norm.includes('غدا')) {
    const tom = new Date(today);
    tom.setDate(tom.getDate() + 1);
    taskDate = tom.toISOString().split('T')[0];
    dateDetected = 'غداً';
  } else if (norm.includes('بعد غد')) {
    const afterTom = new Date(today);
    afterTom.setDate(afterTom.getDate() + 2);
    taskDate = afterTom.toISOString().split('T')[0];
    dateDetected = 'بعد غد';
  } else if (norm.includes('الاسبوع القادم') || norm.includes('الاسبوع الجاي')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    taskDate = nextWeek.toISOString().split('T')[0];
    dateDetected = 'الأسبوع القادم';
  }

  // 2. GEOGRAPHICAL INTELLIGENCE & REGIONAL FACILITIES (Stage 4)
  let destination = existingWorkplace;
  let city = 'سطات';
  let scope: GeographicScope = 'محلي';
  let facilityDetected = 'المديرية الإقليمية بسطات';

  if (norm.includes('برشيد')) {
    destination = 'المحكمة الابتدائية ببرشيد';
    city = 'برشيد';
    scope = 'تنقل خارجي';
    facilityDetected = 'ابتدائية برشيد';
  } else if (norm.includes('ابن احمد') || norm.includes('بن احمد')) {
    destination = 'المحكمة الابتدائية بابن أحمد (بن أحمد)';
    city = 'ابن أحمد';
    scope = 'تنقل خارجي';
    facilityDetected = 'ابتدائية ابن أحمد';
  } else if (norm.includes('الرباط') || norm.includes('المصالح المركزيه') || norm.includes('الوزاره')) {
    destination = 'المصالح المركزية بالرباط - وزارة العدل';
    city = 'الرباط';
    scope = 'تنقل خارجي';
    facilityDetected = 'المصالح المركزية بالرباط';
  } else if (norm.includes('الاستئناف') || norm.includes('محكمه الاستئناف')) {
    destination = 'محكمة الاستئناف بسطات';
    city = 'سطات';
    scope = 'محلي';
    facilityDetected = 'محكمة الاستئناف بسطات';
  } else if (norm.includes('قضاء الاسره') || norm.includes('الاسره')) {
    destination = 'قسم قضاء الأسرة بسطات';
    city = 'سطات';
    scope = 'محلي';
    facilityDetected = 'قسم قضاء الأسرة';
  } else if (norm.includes('الكاره')) {
    destination = 'مركز القاضي المقيم بالكارة وأولاد عبو';
    city = 'الكارة';
    scope = 'تنقل خارجي';
    facilityDetected = 'مركز الكارة';
  } else if (norm.includes('البروج')) {
    destination = 'المركز القضائي بالبروج';
    city = 'البروج';
    scope = 'تنقل خارجي';
    facilityDetected = 'المركز القضائي بالبروج';
  } else if (norm.includes('الجامعه') || norm.includes('جامعه الحسن الاول') || norm.includes('جامعه سطات')) {
    destination = 'جامعة الحسن الاول';
    city = 'سطات';
    scope = 'محلي';
    facilityDetected = 'جامعة الحسن الأول';
  }

  // 3. SMART DOMAIN / CATEGORY DETECTION (Stage 2)
  let category = 'مهام إدارية عامة';
  let domainDetected = 'مهام إدارية';

  if (norm.includes('مباراه') || norm.includes('امتحان') || norm.includes('مترشح') || norm.includes('حراسه') || norm.includes('لجنه')) {
    category = 'المباريات والامتحانات المهنية';
    domainDetected = 'المباريات والامتحانات';
  } else if (norm.includes('طونير') || norm.includes('حبر') || norm.includes('drum') || norm.includes('دروم') || norm.includes('طابعه')) {
    category = 'الطونير ومستهلكات الطباعة';
    domainDetected = 'الطونير والطباعة';
  } else if (norm.includes('توقيع') || norm.includes('esign') || norm.includes('pin') || norm.includes('شهاده') || norm.includes('ختم')) {
    category = 'Barid eSign والتوقيع الإلكتروني';
    domainDetected = 'التوقيع الإلكتروني';
  } else if (norm.includes('تشوير') || norm.includes('لافته') || norm.includes('لافتات') || norm.includes('ترقيم') || norm.includes('باندرول')) {
    category = 'التشوير والتنظيم الإداري';
    domainDetected = 'التشوير الإداري';
  } else if (norm.includes('صفقه') || norm.includes('سند طلب') || norm.includes('سند') || norm.includes('bc') || norm.includes('دفتر التحملات')) {
    category = 'الصفقات وسندات الطلب';
    domainDetected = 'الصفقات وسندات الطلب';
  } else if (norm.includes('حاسوب') || norm.includes('حواسيب') || norm.includes('شاشه') || norm.includes('كابل') || norm.includes('عتاد') || norm.includes('ماسح')) {
    category = 'المعدات والعتاد المعلوماتي';
    domainDetected = 'العتاد والمعلوماتيات';
  } else if (norm.includes('عطل') || norm.includes('اصلاح') || norm.includes('صيانه') || norm.includes('شبكه') || norm.includes('تدخل تقني')) {
    category = 'التدخلات التقنية';
    domainDetected = 'التدخلات التقنية';
  } else if (norm.includes('تنقل') || norm.includes('ماموريه') || norm.includes('امر بمهمه')) {
    category = 'مهام ميدانية وتنقلات';
    domainDetected = 'تنقل ومأمورية';
  }

  // 4. PRIORITY & LIFECYCLE STATES (Stage 5)
  let priority: TaskPriority = 'عادية';
  let priorityDetected = 'عادية';
  let status: TaskStatus = isBacklog ? 'مبرمجة' : 'قيد الإنجاز';
  let progress = isBacklog ? 0 : 50;

  if (norm.includes('عاجل') || norm.includes('عاجله') || norm.includes('طارئ') || norm.includes('مستعجل') || norm.includes('فورا')) {
    priority = 'عاجلة';
    priorityDetected = 'عاجلة وطارئة';
  } else if (norm.includes('مهم') || norm.includes('مهمه') || norm.includes('ضروري') || norm.includes('اولويه')) {
    priority = 'عالية';
    priorityDetected = 'عالية / مهمة';
  } else if (norm.includes('متوسط') || norm.includes('متوسطه')) {
    priority = 'متوسطة';
    priorityDetected = 'متوسطة';
  }

  if (norm.includes('منجز') || norm.includes('منجزه') || norm.includes('تم الانجاز') || norm.includes('اكتمل')) {
    status = 'منجزة';
    progress = 100;
  }

  // 5. CASCADING SUB-TASKS EXTRACTION (Stage 3)
  // Splits multi-action dictation phrases (e.g.: "تسليم الطونير ثم استرجاع الفارغ واعداد محضر الاستلام")
  const subtasks: SubTask[] = [];
  const actionSplitRegex = /(?:ثم|و كذلك|وكذلك|بالاضافة الى|بالإضافة إلى|مع|و\s+)/g;
  
  // Detect if dictation contains action verbs
  const knownActionKeywords = [
    'تسليم', 'استرجاع', 'معاينه', 'معاينة', 'تشخيص', 'اصلاح', 'إصلاح',
    'اعداد', 'إعداد', 'طبع', 'طباعه', 'طباعة', 'تثبيت', 'تفعيل', 'توقيع',
    'ارسال', 'إرسال', 'ايداع', 'إيداع', 'جرد', 'ترقيم', 'حصر', 'فحص', 'الحراسة', 'حراسة'
  ];

  // Extract sentences or chunks that look like sub-actions
  const rawParts = cleanTranscript.split(actionSplitRegex).map(s => s.trim()).filter(s => s.length > 3);
  
  rawParts.forEach((part, idx) => {
    const normPart = normalizeArabicText(part);
    const hasAction = knownActionKeywords.some(kw => normPart.includes(normalizeArabicText(kw)));
    
    // Only accept as a distinct subtask if it contains an action keyword or starts with a task verb
    if (hasAction && subtasks.length < 5) {
      let subTitle = part
        .replace(/^(تسجيل|اضافة|إضافة|مهمة|تدخل|قم بـ|أريد)\s+/i, '')
        .trim();
      
      // Capitalize first letter if latin, keep clean Arabic
      if (subTitle.length >= 4) {
        subtasks.push({
          id: `st-voice-${Date.now()}-${idx}`,
          title: subTitle,
          category,
          completed: false,
          done: false
        });
      }
    }
  });

  // 6. SMART TITLE REFINEMENT
  // Remove conversational voice preambles ("سجل لي مهمة", "أريد إضافة تدخل", "قم بتسجيل")
  let refinedTitle = cleanTranscript
    .replace(/^(سجل لي مهمة|سجل مهمة|سجل تدخل|قم بتسجيل|أريد تسجيل|أريد إضافة|إضافة مهمة)\s+/i, '')
    .trim();

  // If the dictation was very long, craft a concise title from the first clause
  if (refinedTitle.length > 90) {
    const firstClause = refinedTitle.split(/[\.\،\,]|(?:\s+(?:ثم|مع|من أجل|قصد)\s+)/)[0];
    refinedTitle = (firstClause && firstClause.trim().length > 10) ? firstClause.trim() : refinedTitle.slice(0, 85);
  }

  // Ensure title has proper casing/presence
  if (!refinedTitle) {
    refinedTitle = `تدخل ميداني - ${domainDetected}`;
  }

  return {
    title: refinedTitle,
    category,
    destination,
    city,
    scope,
    taskDate,
    isBacklog,
    priority,
    status,
    progress,
    subtasks,
    description: cleanTranscript,
    rawTranscript: cleanTranscript,
    detectedSummary: {
      domainDetected,
      facilityDetected,
      dateDetected,
      priorityDetected,
      subtasksDetectedCount: subtasks.length
    }
  };
}
