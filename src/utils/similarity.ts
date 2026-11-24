import { Doubt } from '../types';

export interface SimilarDoubtMatch {
  doubt: Doubt;
  score: number;
  matchedKeywords: string[];
}

const STOP_WORDS = new Set([
  'how',
  'why',
  'what',
  'the',
  'is',
  'in',
  'a',
  'to',
  'when',
  'for',
  'of',
  'with',
  'does',
  'do',
  'can',
  'i',
  'my',
  'and',
  'or',
  'are',
  'an',
  'it',
  'on',
  'be',
  'this',
  'that',
  'from',
  'using',
  'use',
  'get',
  'right',
  'after',
  'before',
  'about',
]);

const SEMANTIC_SYNONYM_GROUPS: string[][] = [
  ['segfault', 'segmentation', 'fault', 'crash', 'crashing', 'core', 'dumped'],
  ['memory', 'malloc', 'calloc', 'heap', 'allocate', 'allocation', 'garbage', 'zero', 'initialization', 'dangling', 'stack'],
  ['character', 'char', 'scanf', 'buffer', 'stdin', 'newline', 'input', 'skip', 'skips'],
  ['sort', 'sorting', 'merge', 'mergesort', 'quick', 'quicksort', 'complexity'],
  ['list', 'lists', 'linked', 'singly', 'node', 'nodes', 'reverse', 'reversing'],
  ['pointer', 'pointers', 'null', 'dereference', 'dereferencing', 'address', 'decay', 'sizeof', 'array', 'arrays'],
  ['recursion', 'recursive', 'base', 'recurrence', 'master', 'theorem'],
  ['bst', 'tree', 'trees', 'binary', 'delete', 'successor', 'subtree'],
  ['knapsack', 'dp', 'dynamic', 'programming', 'memoization', 'memoized'],
  ['eigenvalue', 'eigenvalues', 'matrix', 'diagonalizable', 'multiplicity'],
  ['python', 'mutable', 'default', 'argument', 'bucket', 'sentinel', 'none'],
  ['closure', 'closures', 'lambda', 'late', 'binding', 'scope', 'stale', 'useeffect'],
  ['copy', 'deepcopy', 'shallow', 'nested', '2d', 'grid'],
  ['gil', 'threading', 'multithreading', 'multiprocessing', 'parallelism', 'threads'],
  ['cpp', 'vector', 'push_back', 'reallocation', 'iterator', 'invalidation', 'reserve'],
  ['virtual', 'destructor', 'polymorphic', 'derived', 'base', 'vtable', 'raii', 'double'],
  ['move', 'rvalue', 'nrvo', 'rvo', 'unordered_map', 'hash', 'deleted'],
  ['promise', 'microtask', 'macrotask', 'settimeout', 'event', 'loop', 'async'],
  ['typescript', 'discriminated', 'union', 'exhaustive', 'never', 'narrowing', 'switch'],
  ['this', 'bind', 'arrow', 'receiver', 'method', 'callback'],
  ['java', 'string', 'pool', 'intern', 'equals', 'hashcode', 'hashmap', 'null'],
  ['concurrentmodificationexception', 'arraylist', 'removeif', 'stream', 'illegalstateexception', 'consumed'],
];

const SYNONYM_LOOKUP = new Map<string, string[]>();
for (const group of SEMANTIC_SYNONYM_GROUPS) {
  for (const term of group) {
    SYNONYM_LOOKUP.set(
      term,
      group.filter((g) => g !== term)
    );
  }
}

export function tokenize(text: string): string[] {
  const rawTokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const filtered: string[] = [];
  const seen = new Set<string>();

  for (const token of rawTokens) {
    if (STOP_WORDS.has(token)) continue;
    if (token.length < 2) continue;
    if (!seen.has(token)) {
      seen.add(token);
      filtered.push(token);
    }
  }
  return filtered;
}

export function findSimilarDoubts(
  title: string,
  description: string,
  doubts: Doubt[]
): SimilarDoubtMatch[] {
  const combinedInput = `${title} ${description}`.trim();
  if (combinedInput.length < 3) return [];

  const queryTokens = tokenize(combinedInput);
  if (queryTokens.length === 0) return [];

  const results: SimilarDoubtMatch[] = [];

  for (const doubt of doubts) {
    const targetText = `${doubt.title} ${doubt.description} ${doubt.topic} ${doubt.subject}`;
    const targetTokens = new Set(tokenize(targetText));

    const matchedKeywords: string[] = [];
    let weightedHits = 0;

    for (const qToken of queryTokens) {
      if (targetTokens.has(qToken)) {
        matchedKeywords.push(qToken);
        weightedHits += 1.0;
        continue;
      }

      // Check prefix/stem match (e.g. "revers" / "pointers" -> "pointer")
      let foundDirectStem = false;
      for (const tToken of targetTokens) {
        if (
          qToken.length >= 4 &&
          tToken.length >= 4 &&
          (tToken.startsWith(qToken) || qToken.startsWith(tToken))
        ) {
          matchedKeywords.push(qToken);
          weightedHits += 0.9;
          foundDirectStem = true;
          break;
        }
      }
      if (foundDirectStem) continue;

      // Check semantic-style synonym group
      const synonyms = SYNONYM_LOOKUP.get(qToken);
      if (synonyms) {
        const matchedSyn = synonyms.find((syn) => targetTokens.has(syn));
        if (matchedSyn) {
          matchedKeywords.push(`${qToken} ≈ ${matchedSyn}`);
          weightedHits += 0.78;
        }
      }
    }

    if (matchedKeywords.length === 0) continue;

    // Require at least 1 strong match if query is 1-2 words, or a meaningful ratio
    const coverage = weightedHits / Math.max(queryTokens.length, 1);
    const titleTokens = new Set(tokenize(doubt.title));
    const titleHits = queryTokens.filter(
      (q) =>
        titleTokens.has(q) ||
        (SYNONYM_LOOKUP.get(q) ?? []).some((syn) => titleTokens.has(syn))
    ).length;

    const rawScore = Math.round(
      Math.min(97, coverage * 72 + Math.min(titleHits * 11, 28))
    );

    if (rawScore >= 25) {
      results.push({
        doubt,
        score: rawScore,
        matchedKeywords: matchedKeywords.slice(0, 5),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 4);
}

export interface SourceMaterialItem {
  id: string;
  title: string;
  content: string;
  kind: 'pasted' | 'file' | 'preset' | 'pdf' | 'code';
}

export interface SourcePassageMatch {
  sourceId: string;
  sourceTitle: string;
  passage: string;
  score: number;
  matchedKeywords: string[];
}

function splitIntoPassages(rawContent: string): string[] {
  const normalized = rawContent.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const blocks = normalized
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  // Merge standalone short header lines (e.g. "1. Virtual Destructors:") with the next block
  const merged: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const current = blocks[i];
    const isShortHeading =
      current.length < 70 &&
      !current.includes('\n') &&
      (current.startsWith('#') || current.endsWith(':'));

    if (isShortHeading && i + 1 < blocks.length) {
      merged.push(`${current}\n${blocks[i + 1]}`);
      i += 1;
    } else {
      merged.push(current);
    }
  }

  // Subdivide overly long single paragraphs by sentences so answers stay focused
  const passages: string[] = [];
  for (const block of merged) {
    if (block.length <= 520) {
      passages.push(block);
      continue;
    }

    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 4) {
      for (let i = 0; i < lines.length; i += 3) {
        passages.push(lines.slice(i, i + 3).join('\n'));
      }
    } else {
      const sentences = block.split(/(?<=[.!?])\s+/);
      for (let i = 0; i < sentences.length; i += 2) {
        passages.push(sentences.slice(i, i + 2).join(' '));
      }
    }
  }

  return passages.filter((p) => p.length > 0);
}

export function findMatchingSourcePassages(
  query: string,
  sources: SourceMaterialItem[]
): SourcePassageMatch[] {
  const cleanQuery = query.trim();
  if (!cleanQuery || sources.length === 0) return [];

  let queryTokens = tokenize(cleanQuery);
  if (queryTokens.length === 0) {
    queryTokens = cleanQuery.toLowerCase().match(/[a-z0-9]{2,}/g) ?? [];
  }
  if (queryTokens.length === 0) return [];

  const matches: SourcePassageMatch[] = [];

  for (const source of sources) {
    const passages = splitIntoPassages(source.content);
    const titleTokens = new Set(tokenize(source.title));

    for (const passage of passages) {
      const passageTokens = new Set(tokenize(passage));
      const matchedKeywords: string[] = [];
      let weightedHits = 0;

      for (const qToken of queryTokens) {
        if (passageTokens.has(qToken)) {
          matchedKeywords.push(qToken);
          weightedHits += 1.0;
          continue;
        }

        let foundStem = false;
        for (const pToken of passageTokens) {
          if (
            qToken.length >= 4 &&
            pToken.length >= 4 &&
            (pToken.startsWith(qToken) || qToken.startsWith(pToken))
          ) {
            matchedKeywords.push(qToken);
            weightedHits += 0.88;
            foundStem = true;
            break;
          }
        }
        if (foundStem) continue;

        const synonyms = SYNONYM_LOOKUP.get(qToken);
        if (synonyms) {
          const matchedSyn = synonyms.find((syn) => passageTokens.has(syn));
          if (matchedSyn) {
            matchedKeywords.push(`${qToken} ≈ ${matchedSyn}`);
            weightedHits += 0.72;
            continue;
          }
        }

        if (titleTokens.has(qToken)) {
          matchedKeywords.push(qToken);
          weightedHits += 0.35;
        }
      }

      if (matchedKeywords.length === 0) continue;

      const coverage = weightedHits / Math.max(queryTokens.length, 1);
      const score = Math.round(
        Math.min(99, coverage * 78 + Math.min(matchedKeywords.length * 10, 22))
      );

      // Require at least meaningful overlap so unrelated passages are rejected
      const minScore = queryTokens.length === 1 ? 50 : 28;
      if (score >= minScore) {
        matches.push({
          sourceId: source.id,
          sourceTitle: source.title,
          passage,
          score,
          matchedKeywords: matchedKeywords.slice(0, 5),
        });
      }
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 2);
}
