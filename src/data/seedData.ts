import { Doubt, Persona } from '../types';

export const PERSONAS: Persona[] = [
  {
    id: 'asker',
    dropdownLabel: 'Student (Asker — Aarav)',
    shortName: 'Aarav',
    fullName: 'Aarav Sharma',
    postingIdentityLabel: 'Aarav Sharma (1st Year Student)',
    roleTitle: 'Student · Asker',
    metaText: 'First Year CSE',
    permissionSummary: 'Can post doubts, rate answers, and mark answers as Peer-Accepted.',
    accentClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'peer',
    dropdownLabel: 'Student (Peer Solver — Priya)',
    shortName: 'Priya',
    fullName: 'Priya Deshmukh',
    postingIdentityLabel: 'Priya Deshmukh (Peer Solver · Rank #2)',
    roleTitle: 'Peer Solver',
    metaText: 'Top Solver Rank #2',
    permissionSummary: 'Can answer open doubts, attach code snippets, and earn solver ratings.',
    accentClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'teacher',
    dropdownLabel: 'Teacher / Moderator — Prof. Sharma',
    shortName: 'Prof. Sharma',
    fullName: 'Prof. R. K. Kulkarni',
    postingIdentityLabel: 'Prof. R. K. Kulkarni (Faculty Moderator)',
    roleTitle: 'Teacher / Moderator',
    metaText: 'Computer Engineering',
    permissionSummary: 'Can grant Teacher-Verified shields and hide misleading answers.',
    accentClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
];

export const INITIAL_DOUBTS: Doubt[] = [
  {
    id: 'doubt-1',
    title: "Why does scanf('%c', &ch) skip user input right after reading an integer in C?",
    description:
      "I am writing a simple menu program in C where I first read an integer using scanf('%d', &choice) and immediately ask for a character with scanf('%c', &ch). When I run it, the program skips waiting for my character input altogether and moves to the next printf. Why is the buffer behaving like this?",
    subject: 'C Programming',
    topic: 'Input/Output',
    authorName: 'Aarav',
    createdAt: 'Solved (1d ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['scanf_buffer_repro.c'],
    answers: [
      {
        id: 'ans-101',
        authorName: 'Priya Deshmukh',
        authorRole: '2nd Year • Top Solver',
        authorBadge: 'Ninja Solver',
        createdAt: '22 hrs ago',
        content:
          "When you enter a number and press Enter, scanf('%d', &choice) reads only the digits and leaves the trailing newline character ('\\n') sitting in the stdin input buffer. On the very next line, scanf('%c', &ch) immediately consumes that leftover '\\n' instead of waiting for fresh keyboard input. Adding a single leading space before %c tells scanf to skip any whitespace characters (including newlines) before reading your character.",
        codeBlock: `int choice;
char ch;

scanf("%d", &choice);
scanf(" %c", &ch); // Notice the leading space before %c to consume leftover '\\n'`,
        facultyNote: 'Verified: Accurate explanation of stdin newline buffering and portable fix.',
        isPeerAccepted: true,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 14,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-2',
    title: 'What is the exact difference between malloc() and calloc() regarding memory initialization?',
    description:
      'In our lab assignment on dynamic arrays, my lab partner used calloc() while I used malloc() for an integer array of size n. My array printed random negative numbers before I assigned values, whereas theirs printed zeros. Are they interchangeable if we initialize manually later?',
    subject: 'C Programming',
    topic: 'Pointers & Memory',
    authorName: 'Aarav',
    createdAt: '2 hrs ago',
    waitingHours: 2,
    status: 'peer_accepted',
    attachments: ['heap_alloc_test.c', 'memory_layout.png'],
    answers: [
      {
        id: 'ans-201',
        authorName: 'Priya Deshmukh',
        authorRole: '2nd Year • Top Solver',
        authorBadge: 'Ninja Solver',
        createdAt: '1 hr ago',
        content:
          'malloc(size_in_bytes) allocates a single contiguous block of heap memory without clearing it, so it contains whatever garbage bytes were previously at those addresses. calloc(num_elements, size_of_each) takes two arguments and explicitly zero-initializes every allocated bit to 0. If you plan to overwrite every index immediately (like reading from a file), malloc is slightly faster because it skips the zeroing pass.',
        codeBlock: `int *a = (int *)malloc(5 * sizeof(int));   // Uninitialized (contains garbage values)
int *b = (int *)calloc(5, sizeof(int));    // Zero-initialized (all 5 elements are 0)`,
        attachmentLabel: 'heap_comparison_diagram.png',
        isPeerAccepted: true,
        isTeacherVerified: false,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 8,
          notHelpful: 0,
          misleading: 0,
        },
      },
      {
        id: 'ans-202',
        authorName: 'Vikram_99',
        authorRole: '1st Year • Classmate',
        authorBadge: 'Classmate',
        createdAt: '45 mins ago',
        content:
          'Both do the exact same thing, calloc is just an outdated syntax from Turbo C.',
        isPeerAccepted: false,
        isTeacherVerified: false,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 0,
          notHelpful: 2,
          misleading: 5,
        },
      },
    ],
  },
  {
    id: 'doubt-3',
    title: 'How do I prevent a segmentation fault when reversing a singly linked list using recursion?',
    description:
      'My recursive reverseList(Node* head) function works fine for 5 nodes in my dry run, but crashes with a Segmentation Fault (core dumped) whenever I pass an empty list or reach the tail node. I think my base case or head->next->next pointer reassignment is dereferencing NULL.',
    subject: 'Data Structures',
    topic: 'Pointers & Memory',
    authorName: 'Rohan',
    createdAt: '14 hrs ago',
    waitingHours: 14,
    status: 'unresolved',
    attachments: ['reverse_list_segfault.c'],
    answers: [],
  },
  {
    id: 'doubt-4',
    title: 'Why is Merge Sort preferred over Quick Sort for linked lists despite O(n) extra space?',
    description:
      'In class today, our professor mentioned that Merge Sort is the standard choice for sorting singly linked lists, whereas Quick Sort is preferred for arrays. Does Merge Sort still require O(n) auxiliary space on a linked list, or can we merge nodes in-place by just rewiring next pointers?',
    subject: 'Data Structures',
    topic: 'Sorting',
    authorName: 'Sneha',
    createdAt: '45 mins ago',
    waitingHours: 0.75,
    status: 'unresolved',
    attachments: ['sort_complexity_notes.pdf'],
    answers: [],
  },
];
