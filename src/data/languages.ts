export const SUBJECT_OPTIONS = [
  'C Programming',
  'Python',
  'C++',
  'JavaScript & TypeScript',
  'Java',
  'Data Structures',
  'Algorithms',
  'Engineering Mathematics',
] as const;

export const UNRESOLVED_SUBJECT_FILTERS = [
  'All Subjects',
  ...SUBJECT_OPTIONS,
] as const;

export const QUICK_TOPICS_BY_SUBJECT: Record<string, string[]> = {
  'C Programming': [
    'Pointers & Memory',
    'Input/Output',
    'Arrays & Strings',
    'Structs & File I/O',
  ],
  Python: [
    'Functions & Scope',
    'Data Model & Copying',
    'Concurrency & GIL',
    'Iterators & Typing',
  ],
  'C++': [
    'Memory & RAII',
    'STL Containers',
    'OOP & Polymorphism',
    'Move Semantics',
  ],
  'JavaScript & TypeScript': [
    'Event Loop & Async',
    'TypeScript Types',
    'Closures & Scope',
    'Objects & this',
  ],
  Java: [
    'JVM & Strings',
    'Collections & Hashing',
    'OOP & References',
    'Streams & Concurrency',
  ],
  'Data Structures': [
    'Pointers & Memory',
    'Trees & Graphs',
    'Sorting',
    'Linked Lists',
  ],
  Algorithms: [
    'Recursion',
    'Dynamic Programming',
    'Greedy & Graphs',
    'Complexity Analysis',
  ],
  'Engineering Mathematics': [
    'Linear Algebra',
    'Laplace Transforms',
    'Probability',
    'Differential Equations',
  ],
};

export const CODE_FILENAME_BY_SUBJECT: Record<string, string> = {
  'C Programming': 'snippet.c',
  Python: 'script.py',
  'C++': 'solution.cpp',
  'JavaScript & TypeScript': 'index.ts',
  Java: 'Main.java',
  'Data Structures': 'structure.cpp',
  Algorithms: 'algorithm.py',
  'Engineering Mathematics': 'derivation.txt',
};

export function inferSubjectAndTopicFromQuery(query: string): {
  subject: string;
  topic: string;
} {
  const q = query.toLowerCase();

  if (
    /\b(python|py|gil|deepcopy|multiprocessing|lambda|dict|tuple|comprehension|asyncio|pandas|numpy)\b/.test(
      q
    )
  ) {
    return { subject: 'Python', topic: 'Functions & Scope' };
  }

  if (
    /\b(c\+\+|cpp|std::|vector|unique_ptr|shared_ptr|raii|virtual|destructor|unordered_map|rvalue|nrvo|template)\b/.test(
      q
    )
  ) {
    return { subject: 'C++', topic: 'Memory & RAII' };
  }

  if (
    /\b(javascript|typescript|js|ts|promise|microtask|macrotask|settimeout|event loop|useeffect|closure|keyof|never|discriminated|arrow function)\b/.test(
      q
    )
  ) {
    return { subject: 'JavaScript & TypeScript', topic: 'Event Loop & Async' };
  }

  if (
    /\b(java|jvm|hashmap|hashcode|arraylist|concurrentmodificationexception|string pool|equals|stream)\b/.test(
      q
    )
  ) {
    return { subject: 'Java', topic: 'Collections & Hashing' };
  }

  if (
    /\b(tree|bst|linked list|graph|stack|queue|heap|sort|merge sort|quick sort)\b/.test(
      q
    )
  ) {
    return { subject: 'Data Structures', topic: 'Trees & Graphs' };
  }

  if (
    /\b(dp|dynamic programming|knapsack|recursion|master theorem|complexity|big o)\b/.test(
      q
    )
  ) {
    return { subject: 'Algorithms', topic: 'Dynamic Programming' };
  }

  if (
    /\b(matrix|eigenvalue|laplace|roc|integral|probability|linear algebra)\b/.test(
      q
    )
  ) {
    return { subject: 'Engineering Mathematics', topic: 'Linear Algebra' };
  }

  return { subject: 'C Programming', topic: 'Pointers & Memory' };
}
