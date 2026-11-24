import { Doubt, Persona } from '../types';

export const PERSONAS: Persona[] = [
  {
    id: 'asker',
    dropdownLabel: 'Student Asker — Aarav',
    shortName: 'Aarav',
    fullName: 'Aarav Sharma',
    postingIdentityLabel: 'Aarav Sharma (1st Year Student)',
    roleTitle: 'Student · Asker',
    metaText: 'First Year CSE',
    permissionSummary: 'Raise new doubts, rate explanations, and crown answers as Peer-Accepted.',
    accentClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'peer',
    dropdownLabel: 'Peer Solver — Priya',
    shortName: 'Priya',
    fullName: 'Priya Deshmukh',
    postingIdentityLabel: 'Priya Deshmukh (Peer Solver · Rank #2)',
    roleTitle: 'Peer Solver',
    metaText: 'Top Solver Rank #2',
    permissionSummary: 'Tackle open doubts, share annotated code snippets, and earn solver reputation.',
    accentClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'teacher',
    dropdownLabel: 'Faculty Moderator — Prof. Kulkarni',
    shortName: 'Prof. Kulkarni',
    fullName: 'Prof. R. K. Kulkarni',
    postingIdentityLabel: 'Prof. R. K. Kulkarni (Faculty Moderator)',
    roleTitle: 'Faculty Moderator',
    metaText: 'Computer Engineering',
    permissionSummary: 'Grant Teacher-Verified shields, author faculty notes, and moderate inaccurate replies.',
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
  {
    id: 'doubt-5',
    title: 'How do I solve the Master Theorem recurrence T(n) = 2T(n/2) + n log n?',
    description:
      'For standard T(n) = 2T(n/2) + n, Case 2 gives O(n log n). When f(n) has an extra log n factor like n log n, does Case 2 still apply directly or do we use the extended Master Theorem with log^k n?',
    subject: 'Algorithms',
    topic: 'Recursion',
    authorName: 'Kabir',
    createdAt: '1 day ago',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['master_theorem_worksheet.pdf'],
    answers: [
      {
        id: 'ans-501',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '20 hrs ago',
        content:
          'Standard Case 2 compares f(n) against n^(log_b a). Here a = 2, b = 2, so n^(log_2 2) = n. Because f(n) = n * (log n)^1 matches Theta(n^(log_b a) * log^k n) with k = 1 >= 0, the extended Case 2 applies cleanly and adds one power of log n: T(n) = Theta(n log^2 n).',
        facultyNote: 'Verified: Extended Master Theorem (k = 1) — common mid-sem exam question.',
        isPeerAccepted: true,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 19,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-6',
    title: 'Why does my BST delete() function lose the right subtree when removing a node with two children?',
    description:
      'I replace the node value with its inorder successor, then free the successor node. However, when the inorder successor itself has a right child, that subtree disappears and causes an infinite loop during inorder traversal.',
    subject: 'Data Structures',
    topic: 'Trees & Graphs',
    authorName: 'Meera',
    createdAt: '9 hrs ago',
    waitingHours: 9,
    status: 'unresolved',
    attachments: ['bst_delete_bug.c'],
    answers: [
      {
        id: 'ans-601',
        authorName: 'Rohan',
        authorRole: '1st Year • Classmate',
        authorBadge: 'Classmate',
        createdAt: '5 hrs ago',
        content:
          'Try writing a separate parent pointer loop before freeing the successor, though I am not sure if it still breaks when the successor is the immediate right child of root.',
        isPeerAccepted: false,
        isTeacherVerified: false,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 1,
          notHelpful: 1,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-7',
    title: 'When is a square matrix guaranteed to be diagonalizable if its eigenvalues repeat?',
    description:
      'Our linear algebra tutorial states distinct eigenvalues always imply diagonalizability, but we hit a 3x3 matrix with eigenvalue lambda = 2 repeated twice. How do we test whether P^(-1)AP exists without computing the full inverse?',
    subject: 'Engineering Mathematics',
    topic: 'Linear Algebra',
    authorName: 'Ananya',
    createdAt: '2 days ago',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['eigenvalue_tutorial_q4.pdf'],
    answers: [
      {
        id: 'ans-701',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '1 day ago',
        content:
          'Compare the algebraic multiplicity (AM — how many times lambda repeats in det(A - lambda*I) = 0) with the geometric multiplicity (GM = nullity of A - lambda*I, i.e., n - rank(A - lambda*I)). A matrix is diagonalizable over R if and only if all eigenvalues are real and GM == AM for every repeated eigenvalue.',
        facultyNote: 'Verified: Check GM = n - rank(A - lambda*I) for each repeated eigenvalue.',
        isPeerAccepted: false,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 11,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-8',
    title: 'Why does sizeof(arr) return 8 bytes inside a helper function instead of the actual array length?',
    description:
      'In main(), sizeof(nums) / sizeof(nums[0]) correctly prints 10 for my int nums[10] array. As soon as I pass nums into void printArray(int nums[]), sizeof(nums) evaluates to 8 bytes on my 64-bit machine.',
    subject: 'C Programming',
    topic: 'Pointers & Memory',
    authorName: 'Dev',
    createdAt: '5 hrs ago',
    waitingHours: 0,
    status: 'peer_accepted',
    attachments: ['array_decay_demo.c'],
    answers: [
      {
        id: 'ans-801',
        authorName: 'Priya Deshmukh',
        authorRole: '2nd Year • Top Solver',
        authorBadge: 'Ninja Solver',
        createdAt: '4 hrs ago',
        content:
          'When you pass an array to a function in C, it undergoes array-to-pointer decay: int nums[] in a parameter list is treated by the compiler as int *nums. On a 64-bit system, a pointer occupies 8 bytes regardless of how many elements it points to. Always compute the length in the caller scope and pass size_t n as an extra parameter.',
        codeBlock: `void printArray(const int *nums, size_t len) {
  for (size_t i = 0; i < len; i++) {
    printf("%d ", nums[i]);
  }
}`,
        isPeerAccepted: true,
        isTeacherVerified: false,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 12,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-9',
    title: 'How do I convert a top-down memoized 0/1 Knapsack recursion into a 1D bottom-up DP array?',
    description:
      'My 2D dp[i][w] table passes all small test cases, but I keep overwriting values from the same item when I try to compress it into a single 1D dp[w] array. Should the inner weight loop run forwards or backwards?',
    subject: 'Algorithms',
    topic: 'Dynamic Programming',
    authorName: 'Aarav',
    createdAt: '4 hrs ago',
    waitingHours: 4,
    status: 'unresolved',
    attachments: ['knapsack_1d_trace.png'],
    answers: [],
  },
  {
    id: 'doubt-10',
    title: 'Why do we check the Region of Convergence (ROC) before taking an inverse Laplace Transform?',
    description:
      'Two different time-domain signals—one causal and one anti-causal—seem to produce the exact same algebraic fraction 1 / (s + 3). How does the ROC disambiguate which time-domain signal we get back?',
    subject: 'Engineering Mathematics',
    topic: 'Laplace Transforms',
    authorName: 'Isha',
    createdAt: '7 hrs ago',
    waitingHours: 7,
    status: 'unresolved',
    attachments: ['laplace_roc_notes.pdf'],
    answers: [],
  },
  {
    id: 'doubt-11',
    title: 'Why does returning a local char array pointer from a C function print garbage characters?',
    description:
      'I wrote char* getGreeting() with char msg[32] = "Hello"; return msg; inside it. GCC gave a warning about returning the address of a local variable, and printf("%s", getGreeting()) prints random symbols at runtime.',
    subject: 'C Programming',
    topic: 'Pointers & Memory',
    authorName: 'Tanvi',
    createdAt: '11 hrs ago',
    waitingHours: 11,
    status: 'unresolved',
    attachments: ['dangling_stack_ptr.c'],
    answers: [],
  },
];
