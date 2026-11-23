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
  ['memory', 'malloc', 'calloc', 'heap', 'allocate', 'allocation', 'garbage', 'zero', 'initialization'],
  ['character', 'char', 'scanf', 'buffer', 'stdin', 'newline', 'input', 'skip', 'skips'],
  ['sort', 'sorting', 'merge', 'mergesort', 'quick', 'quicksort', 'complexity'],
  ['list', 'lists', 'linked', 'singly', 'node', 'nodes', 'reverse', 'reversing'],
  ['pointer', 'pointers', 'null', 'dereference', 'dereferencing', 'address'],
  ['recursion', 'recursive', 'base'],
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
