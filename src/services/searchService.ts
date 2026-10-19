import { Task, TaskSearchResult, SearchMatchDetail } from '../types/tasks';
import { normalizeArabicText, tokenizeQuery } from '../utils/textUtils';

/**
 * Global Search Engine for E-Tasks Justice Settat
 * Performs real-time multi-token relevance scoring across title, description, tags, categories,
 * sub-tasks, destinations, and administrative notes.
 */
export function searchHistoricalTasks(tasks: Task[], query: string): TaskSearchResult[] {
  if (!query || !query.trim() || !tasks || tasks.length === 0) {
    return [];
  }

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [];

  const results: TaskSearchResult[] = [];

  for (const task of tasks) {
    let score = 0;
    const matches: SearchMatchDetail[] = [];
    const matchedTokenSet = new Set<string>();

    // 1. Title Search (Highest weight: 10)
    const normTitle = normalizeArabicText(task.title || '');
    if (normTitle) {
      let titleMatched = false;
      for (const token of tokens) {
        if (normTitle.includes(token)) {
          score += 10;
          matchedTokenSet.add(token);
          titleMatched = true;
          // Exact prefix bonus
          if (normTitle.startsWith(token)) score += 5;
        }
      }
      if (titleMatched) {
        matches.push({
          field: 'title',
          fieldLabel: 'العنوان',
          snippet: task.title
        });
      }
    }

    // 2. Tags Search (Weight: 8)
    const taskTags = Array.isArray(task.tags) ? task.tags : [];
    // Also include auto-derived tags from category and subcategory
    const allTags = [...taskTags];
    if (task.category) allTags.push(task.category);
    if (task.subcategory) allTags.push(task.subcategory);

    const normTags = allTags.map(normalizeArabicText);
    let tagsMatched = false;
    for (const token of tokens) {
      if (normTags.some(t => t.includes(token))) {
        score += 8;
        matchedTokenSet.add(token);
        tagsMatched = true;
      }
    }
    if (tagsMatched && allTags.length > 0) {
      matches.push({
        field: 'tags',
        fieldLabel: 'الوسوم والتصنيف',
        snippet: allTags.join(' · ')
      });
    }

    // 3. Destination & Court Search (Weight: 6)
    const normDest = normalizeArabicText(`${task.destination || ''} ${task.court || ''} ${task.city || ''}`);
    if (normDest) {
      let destMatched = false;
      for (const token of tokens) {
        if (normDest.includes(token)) {
          score += 6;
          matchedTokenSet.add(token);
          destMatched = true;
        }
      }
      if (destMatched) {
        matches.push({
          field: 'destination',
          fieldLabel: 'الوجهة / المحكمة',
          snippet: `${task.destination || task.court || ''}${task.city ? ` (${task.city})` : ''}`
        });
      }
    }

    // 4. Description & Notes Search (Weight: 5)
    const rawDesc = `${task.description || ''} ${task.notes || ''}`.trim();
    const normDesc = normalizeArabicText(rawDesc);
    if (normDesc) {
      let descMatched = false;
      for (const token of tokens) {
        if (normDesc.includes(token)) {
          score += 5;
          matchedTokenSet.add(token);
          descMatched = true;
        }
      }
      if (descMatched) {
        // Find best snippet around match
        const snippet = rawDesc.length > 120 ? `${rawDesc.slice(0, 120)}...` : rawDesc;
        matches.push({
          field: 'description',
          fieldLabel: 'التفاصيل والملاحظات',
          snippet
        });
      }
    }

    // 5. Subtasks Search (Weight: 5)
    if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
      const matchedSubs: string[] = [];
      for (const sub of task.subtasks) {
        const normSub = normalizeArabicText(sub.title || '');
        let isSubHit = false;
        for (const token of tokens) {
          if (normSub.includes(token)) {
            score += 4;
            matchedTokenSet.add(token);
            isSubHit = true;
          }
        }
        if (isSubHit) {
          matchedSubs.push(sub.title);
        }
      }
      if (matchedSubs.length > 0) {
        matches.push({
          field: 'subtasks',
          fieldLabel: 'العمليات الفرعية',
          snippet: matchedSubs.slice(0, 2).join(' ، ')
        });
      }
    }

    // Criteria: Must match all tokens across any of the fields (conjunctive search)
    const matchesAllTokens = tokens.every(token => matchedTokenSet.has(token));

    if (matchesAllTokens && score > 0) {
      results.push({
        task,
        score,
        matches
      });
    }
  }

  // Sort by score descending, then by date descending
  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (b.task.taskDate || '').localeCompare(a.task.taskDate || '') ||
           (b.task.createdAt || '').localeCompare(a.task.createdAt || '');
  });
}
