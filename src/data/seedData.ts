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
    permissionSummary:
      'Raise new doubts, rate explanations, and crown answers as Peer-Accepted.',
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
    permissionSummary:
      'Tackle open doubts, share annotated code snippets, and earn solver reputation.',
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
    permissionSummary:
      'Grant Teacher-Verified shields, author faculty notes, and moderate inaccurate replies.',
    accentClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
];

export const INITIAL_DOUBTS: Doubt[] = [
  {
    id: 'doubt-1',
    title:
      "Why does scanf('%c', &ch) skip user input right after reading an integer in C?",
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
        facultyNote:
          'Verified: Accurate explanation of stdin newline buffering and portable fix.',
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
    title:
      'What is the exact difference between malloc() and calloc() regarding memory initialization?',
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
    id: 'doubt-12',
    title:
      'Why does a Python default list argument (def add_tag(tag, items=[])) remember items from previous function calls?',
    description:
      'I wrote def add_tag(tag, items=[]): items.append(tag); return items. Calling add_tag("a") returns ["a"], as expected, but calling add_tag("b") later returns ["a", "b"] even though I omitted the second argument! Why does Python not reset items to an empty list on each call?',
    subject: 'Python',
    topic: 'Functions & Scope',
    authorName: 'Sneha',
    createdAt: 'Solved (18 hrs ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['mutable_default_bug.py'],
    answers: [
      {
        id: 'ans-1201',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '16 hrs ago',
        content:
          'In Python, default parameter values are evaluated once when the def statement is executed—not each time the function is called. Because a list is mutable, items.append(tag) mutates that single shared list stored on the function object (__defaults__). Always use None as the sentinel default and instantiate a fresh list inside the function body.',
        codeBlock: `def add_tag(tag: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append(tag)
    return items`,
        facultyNote:
          'Verified: Classic Python def-time binding rule. Use None sentinel for any mutable default (list, dict, set).',
        isPeerAccepted: true,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 16,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-17',
    title:
      'Why does my C++ iterator or pointer into std::vector crash after calling push_back()?',
    description:
      'I stored auto it = nums.begin(); and int* first = &nums[0]; before appending 10 more elements in a loop. Afterward, dereferencing *it or *first triggers undefined behavior or a segfault. Why does push_back invalidate iterators when I only added elements to the end?',
    subject: 'C++',
    topic: 'STL Containers',
    authorName: 'Rohan',
    createdAt: 'Solved (1d ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['vector_reallocation.cpp'],
    answers: [
      {
        id: 'ans-1701',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '20 hrs ago',
        content:
          'std::vector guarantees contiguous heap storage. Whenever size() exceeds capacity(), push_back allocates a new larger buffer (typically 1.5x or 2x capacity), moves/copies the old elements over, and frees the old buffer. Any pointer, reference, or iterator pointing into the old buffer is now dangling. Either pre-allocate with vec.reserve(n) beforehand or store integer indices instead of raw pointers.',
        codeBlock: `std::vector<int> nums = {10, 20};
nums.reserve(16); // Prevents reallocation up to 16 elements
int* first = &nums[0];
nums.push_back(30); // Safe while size <= capacity`,
        facultyNote:
          'Verified: Contiguous buffer reallocation invalidates all iterators, pointers, and references.',
        isPeerAccepted: true,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 13,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-22',
    title:
      'Why does Promise.resolve().then() always run before setTimeout(fn, 0) in JavaScript?',
    description:
      'In my Node/browser test script, setTimeout(() => console.log("A"), 0) appears on line 1 and Promise.resolve().then(() => console.log("B")) on line 2, followed by console.log("C"). The output is always C, B, A. Why does a 0ms timer lose to a Promise?',
    subject: 'JavaScript & TypeScript',
    topic: 'Event Loop & Async',
    authorName: 'Ananya',
    createdAt: 'Solved (14 hrs ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['event_loop_order.js'],
    answers: [
      {
        id: 'ans-2201',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '12 hrs ago',
        content:
          'Synchronous code ("C") runs on the call stack first. Once the call stack clears, the JavaScript Event Loop drains the entire Microtask Queue (where Promise .then/.catch/.finally and queueMicrotask callbacks wait) before pulling even a single task from the Macrotask/Task Queue (where setTimeout callbacks live).',
        codeBlock: `setTimeout(() => console.log("A"), 0);        // 3rd: Macrotask queue
Promise.resolve().then(() => console.log("B")); // 2nd: Microtask queue
console.log("C");                               // 1st: Synchronous call stack`,
        facultyNote:
          'Verified: Microtask queue always empties completely before the next macrotask tick.',
        isPeerAccepted: true,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 15,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-26',
    title:
      'Why does "hello" == "hello" return true in Java while new String("hello") == "hello" returns false?',
    description:
      'In Java, comparing two string literals with == evaluates to true, so I used == to compare user input from Scanner against a command string and it silently failed. How does Java store String literals differently from new String(...) objects?',
    subject: 'Java',
    topic: 'JVM & Strings',
    authorName: 'Dev',
    createdAt: 'Solved (1d ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['StringPoolDemo.java'],
    answers: [
      {
        id: 'ans-2601',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '21 hrs ago',
        content:
          'In Java, == compares object references (memory addresses), not character contents. String literals are automatically interned in the JVM String Constant Pool, so two identical literals point to the same pooled instance. However, new String("hello") or runtime Scanner input allocates a distinct String object on the heap. Always use .equals() (or Objects.equals(a, b)) for value equality.',
        codeBlock: `String a = "hello";
String b = new String("hello");

System.out.println(a == b);       // false (different heap references)
System.out.println(a.equals(b));  // true  (identical character sequence)`,
        facultyNote:
          'Verified: String Pool interning vs heap allocation — always use .equals() for String content.',
        isPeerAccepted: true,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 17,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-13',
    title:
      'Why do all lambda functions created inside a Python for-loop return the final loop value?',
    description:
      'I built a list of callbacks with funcs = [lambda: i for i in range(5)], expecting [f() for f in funcs] to return [0, 1, 2, 3, 4]. Instead, every single call returns 4! How do I capture each iteration value properly?',
    subject: 'Python',
    topic: 'Functions & Scope',
    authorName: 'Kabir',
    createdAt: '4 hrs ago',
    waitingHours: 0,
    status: 'peer_accepted',
    attachments: ['late_binding_closures.py'],
    answers: [
      {
        id: 'ans-1301',
        authorName: 'Kabir Verma',
        authorRole: '2nd Year • Top Solver',
        authorBadge: 'Quick Responder',
        createdAt: '3 hrs ago',
        content:
          'Python closures use late binding: the lambda looks up the variable i in the enclosing scope when the function is called, not when it is defined. By the time you call f(), the loop has finished and i holds 4. Bind the current value as a default argument (lambda i=i: i) so each function captures a snapshot at creation time.',
        codeBlock: `# Late binding (broken): all lambdas reference the same final i == 4
broken = [lambda: i for i in range(5)]

# Early binding via default parameter: returns [0, 1, 2, 3, 4]
fixed = [lambda i=i: i for i in range(5)]`,
        isPeerAccepted: true,
        isTeacherVerified: false,
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
    id: 'doubt-18',
    title:
      'Why does deleting a Derived object through a Base* pointer cause a memory leak without a virtual destructor?',
    description:
      'I have a polymorphic class hierarchy where Base* obj = new Derived(); holds a dynamically allocated buffer inside Derived. When I run delete obj;, only ~Base() runs and ~Derived() is completely skipped. Why is virtual needed on destructors?',
    subject: 'C++',
    topic: 'OOP & Polymorphism',
    authorName: 'Meera',
    createdAt: 'Solved (10 hrs ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['virtual_dtor_fix.cpp'],
    answers: [
      {
        id: 'ans-1801',
        authorName: 'Priya Deshmukh',
        authorRole: '2nd Year • Top Solver',
        authorBadge: 'Ninja Solver',
        createdAt: '9 hrs ago',
        content:
          'When a base destructor is non-virtual, delete basePtr performs static dispatch based solely on the pointer type Base*, invoking only ~Base() and leaving Derived resources leaked (technically undefined behavior per the C++ standard). Declaring virtual ~Base() = default; enables vtable dispatch so ~Derived() runs first, followed automatically by ~Base().',
        codeBlock: `class Base {
public:
  virtual ~Base() = default; // Ensures Derived::~Derived() runs via Base*
};`,
        facultyNote:
          'Verified: Every polymorphic base class with virtual methods must declare a virtual (or protected non-virtual) destructor.',
        isPeerAccepted: true,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 10,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-23',
    title:
      'Why does "this" become undefined when passing an object method directly to setTimeout or an event listener?',
    description:
      'When I call timer.tick(), this refers to timer and increments this.seconds. When I pass setTimeout(timer.tick, 1000), this becomes undefined inside tick() and throws a TypeError in strict mode. Why does extracting a method lose its owner?',
    subject: 'JavaScript & TypeScript',
    topic: 'Objects & this',
    authorName: 'Tanvi',
    createdAt: '3 hrs ago',
    waitingHours: 3,
    status: 'peer_accepted',
    attachments: ['this_binding_loss.ts'],
    answers: [
      {
        id: 'ans-2301',
        authorName: 'Kabir Verma',
        authorRole: '2nd Year • Top Solver',
        authorBadge: 'Quick Responder',
        createdAt: '2 hrs ago',
        content:
          'In JavaScript, regular function `this` is determined at call time—not where the method was defined. Passing timer.tick passes only the detached function reference without the receiver `timer`, so setTimeout invokes it as a plain function (where `this` is undefined in strict mode / ES modules). Wrap the call in an arrow function `() => timer.tick()` or bind it with `timer.tick.bind(timer)`.',
        codeBlock: `// Broken: detached method call loses receiver
setTimeout(timer.tick, 1000);

// Fixed: arrow wrapper preserves receiver call site
setTimeout(() => timer.tick(), 1000);`,
        isPeerAccepted: true,
        isTeacherVerified: false,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 9,
          notHelpful: 0,
          misleading: 0,
        },
      },
      {
        id: 'ans-2302',
        authorName: 'Rohan',
        authorRole: '1st Year • Classmate',
        authorBadge: 'Classmate',
        createdAt: '1 hr ago',
        content:
          'You have to declare every variable with var instead of const so setTimeout inherits the object scope.',
        isPeerAccepted: false,
        isTeacherVerified: false,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 0,
          notHelpful: 3,
          misleading: 4,
        },
      },
    ],
  },
  {
    id: 'doubt-27',
    title:
      'Why does HashMap.get() return null after overriding equals() on my Java key class without hashCode()?',
    description:
      'I created a StudentKey(int id, String dept) class and overrode equals() so two keys with identical fields match. However, after inserting map.put(new StudentKey(101, "CSE"), 95), calling map.get(new StudentKey(101, "CSE")) returns null!',
    subject: 'Java',
    topic: 'Collections & Hashing',
    authorName: 'Isha',
    createdAt: '5 hrs ago',
    waitingHours: 5,
    status: 'peer_accepted',
    attachments: ['StudentKeyHashBug.java'],
    answers: [
      {
        id: 'ans-2701',
        authorName: 'Sneha Patel',
        authorRole: '2nd Year • Helper',
        authorBadge: 'Helper Badge',
        createdAt: '4 hrs ago',
        content:
          'HashMap locates the bucket using key.hashCode() first and only calls equals() inside that bucket. If you override equals() without overriding hashCode(), the default Object.hashCode() uses distinct memory identities—so the lookup lands in the wrong bucket and never checks equals(). Override hashCode() using Objects.hash(id, dept) or use a Java record.',
        codeBlock: `@Override
public int hashCode() {
    return java.util.Objects.hash(id, dept);
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
    id: 'doubt-14',
    title:
      'Why does list.copy() still mutate my original 2D nested list in Python?',
    description:
      'I duplicated a 2D grid with backup = grid.copy() before running a backtracking solver. Even though I never touched grid directly, modifying backup[0][1] = 9 changed grid[0][1] too! Why did .copy() not protect the inner lists?',
    subject: 'Python',
    topic: 'Data Model & Copying',
    authorName: 'Aarav',
    createdAt: 'Solved (2d ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['shallow_vs_deep.py'],
    answers: [
      {
        id: 'ans-1401',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '2d ago',
        content:
          'list.copy() and slicing (grid[:]) create a shallow copy: they allocate a new outer list, but the elements inside still reference the exact same inner list objects in memory. Use copy.deepcopy(grid) (or [row[:] for row in grid] for a 2D list of primitives) when you need independent nested structures.',
        codeBlock: `import copy
backup = copy.deepcopy(grid) # Clones outer AND inner lists`,
        facultyNote:
          'Verified: Shallow copy duplicates only the top-level container references.',
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
    id: 'doubt-19',
    title:
      'Why does passing a C++ class containing a raw pointer by value trigger a double-free crash?',
    description:
      'My custom IntBuffer class allocates int* data = new int[n] in its constructor and calls delete[] data in ~IntBuffer(). As soon as I pass an IntBuffer by value to void inspect(IntBuffer b), the program aborts with "double free detected". How do I fix this cleanly?',
    subject: 'C++',
    topic: 'Memory & RAII',
    authorName: 'Dev',
    createdAt: '3 hrs ago',
    waitingHours: 3,
    status: 'peer_accepted',
    attachments: ['rule_of_five_buffer.cpp'],
    answers: [
      {
        id: 'ans-1901',
        authorName: 'Sneha Patel',
        authorRole: '2nd Year • Helper',
        authorBadge: 'Helper Badge',
        createdAt: '2 hrs ago',
        content:
          'The compiler-generated default copy constructor performs a shallow memberwise copy of the raw pointer `data`. Both the original object and the parameter `b` now own the same heap address, so when `b` goes out of scope and later the original goes out of scope, `delete[]` runs twice on the same address. Follow the Rule of Zero by replacing `int*` with `std::vector<int>` or `std::unique_ptr<int[]>`, or implement deep copy constructor & copy assignment (Rule of Three/Five).',
        codeBlock: `// Rule of Zero: automatic deep copy & safe destruction
class IntBuffer {
  std::vector<int> data;
public:
  explicit IntBuffer(size_t n) : data(n) {}
};`,
        isPeerAccepted: true,
        isTeacherVerified: false,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 7,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-24',
    title:
      'How do TypeScript discriminated unions and exhaustive "never" checks catch missing switch cases?',
    description:
      'I have a Shape union type (Circle | Rectangle | Triangle), and I added Triangle later, but forgot to handle it in my area() switch statement. How can TypeScript fail the build at compile time whenever a new union variant is missing?',
    subject: 'JavaScript & TypeScript',
    topic: 'TypeScript Types',
    authorName: 'Ananya',
    createdAt: 'Solved (1d ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['exhaustive_union.ts'],
    answers: [
      {
        id: 'ans-2401',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '20 hrs ago',
        content:
          'Give every member of the union a shared literal discriminant property (e.g. kind: "circle" | "rect" | "triangle") and pass the fallback in the default branch into a helper typed `(x: never): never`. If any case is unhandled, TypeScript knows the remaining type is not `never` and immediately raises a compile-time error.',
        codeBlock: `function assertNever(x: never): never {
  throw new Error("Unhandled variant: " + JSON.stringify(x));
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.r ** 2;
    case "rect": return shape.w * shape.h;
    default: return assertNever(shape); // Compile error if Triangle is missing!
  }
}`,
        facultyNote:
          'Verified: Exhaustiveness checking with `never` prevents silent runtime switch gaps.',
        isPeerAccepted: true,
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
    id: 'doubt-28',
    title:
      'Why does removing items inside a Java for-each loop throw ConcurrentModificationException?',
    description:
      'I wrote for (String task : tasks) { if (task.isEmpty()) tasks.remove(task); } on an ArrayList in single-threaded code and got ConcurrentModificationException! Why does it complain about concurrency when there is only one thread?',
    subject: 'Java',
    topic: 'Streams & Concurrency',
    authorName: 'Meera',
    createdAt: 'Solved (16 hrs ago)',
    waitingHours: 0,
    status: 'teacher_verified',
    attachments: ['ListRemovalFix.java'],
    answers: [
      {
        id: 'ans-2801',
        authorName: 'Prof. R. K. Kulkarni',
        authorRole: 'Faculty • Computer Engineering',
        authorBadge: 'Faculty',
        createdAt: '14 hrs ago',
        content:
          'The Java for-each loop uses an internal Iterator that tracks structural modifications via `modCount`. Calling `tasks.remove(...)` directly mutates the ArrayList without informing that iterator, triggering its fail-fast `ConcurrentModificationException` on the next step. Use `tasks.removeIf(String::isEmpty)` (Java 8+) or call `it.remove()` on an explicit `Iterator`.',
        codeBlock: `// Cleanest Java 8+ approach:
tasks.removeIf(String::isEmpty);

// Or with explicit Iterator:
Iterator<String> it = tasks.iterator();
while (it.hasNext()) {
    if (it.next().isEmpty()) it.remove();
}`,
        facultyNote:
          'Verified: Fail-fast modCount mismatch — use removeIf() or Iterator.remove().',
        isPeerAccepted: true,
        isTeacherVerified: true,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 15,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-15',
    title:
      'Why does "256 is 256" evaluate to True in Python while "257 is 257" returns False across separate lines?',
    description:
      'While testing Python identity checks in the interactive shell, a = 256; b = 256 gives a is b == True, yet x = 257; y = 257 on separate lines gives x is y == False! Should we avoid "is" for comparing numbers?',
    subject: 'Python',
    topic: 'Data Model & Copying',
    authorName: 'Tanvi',
    createdAt: '8 hrs ago',
    waitingHours: 8,
    status: 'unresolved',
    attachments: ['int_interning_test.py'],
    answers: [
      {
        id: 'ans-1501',
        authorName: 'Rohan',
        authorRole: '1st Year • Classmate',
        authorBadge: 'Classmate',
        createdAt: '5 hrs ago',
        content:
          'I noticed this too—maybe Python only caches 8-bit numbers? Still not sure when `is` is actually safe besides `None`.',
        isPeerAccepted: false,
        isTeacherVerified: false,
        isHiddenByModerator: false,
        moderationReason: '',
        ratings: {
          helpful: 1,
          notHelpful: 0,
          misleading: 0,
        },
      },
    ],
  },
  {
    id: 'doubt-16',
    title:
      'Why does Python multithreading run slower than single-threaded code for CPU-bound prime counting?',
    description:
      'I split checking 10 million integers for primality across 4 threading.Thread workers on an 8-core laptop, expecting a 4x speedup. Instead it took slightly longer than running one loop! Does the Global Interpreter Lock (GIL) block true CPU parallelism?',
    subject: 'Python',
    topic: 'Concurrency & GIL',
    authorName: 'Aarav',
    createdAt: '12 hrs ago',
    waitingHours: 12,
    status: 'unresolved',
    attachments: ['gil_benchmark.py'],
    answers: [],
  },
  {
    id: 'doubt-20',
    title:
      'Why can writing "return std::move(result);" inside a C++ function actually disable RVO and hurt performance?',
    description:
      'Our lab guidelines warned us never to wrap local return values in std::move(). I assumed forcing a move would always be faster or equal to copying—how does std::move interfere with Named Return Value Optimization (NRVO)?',
    subject: 'C++',
    topic: 'Move Semantics',
    authorName: 'Kabir',
    createdAt: '10 hrs ago',
    waitingHours: 10,
    status: 'unresolved',
    attachments: ['nrvo_vs_move.cpp'],
    answers: [],
  },
  {
    id: 'doubt-21',
    title:
      'How do I fix "use of deleted function" when using a custom struct as a key in std::unordered_map?',
    description:
      'My struct Coord { int x, y; }; works fine as a key in std::map once I define operator<, but switching to std::unordered_map<Coord, int> fails to compile with a huge template error about std::hash<Coord> being deleted.',
    subject: 'C++',
    topic: 'STL Containers',
    authorName: 'Isha',
    createdAt: '3 hrs ago',
    waitingHours: 3,
    status: 'unresolved',
    attachments: ['custom_hash_map.cpp'],
    answers: [],
  },
  {
    id: 'doubt-25',
    title:
      'Why does a JavaScript/TypeScript setInterval inside useEffect keep reading stale count = 0?',
    description:
      'I registered setInterval(() => setCount(count + 1), 1000) inside useEffect(..., []). The timer runs every second, yet count gets stuck at 1 forever instead of counting 1, 2, 3. How does a lexical closure freeze the old value?',
    subject: 'JavaScript & TypeScript',
    topic: 'Closures & Scope',
    authorName: 'Sneha',
    createdAt: '7 hrs ago',
    waitingHours: 7,
    status: 'unresolved',
    attachments: ['stale_closure_timer.tsx'],
    answers: [],
  },
  {
    id: 'doubt-29',
    title:
      'Why does reassigning an object parameter inside a Java method not update the caller reference, and why can a Stream only be used once?',
    description:
      'I wrote swapNodes(Node a, Node b) in Java and reassigned a = b inside the method, yet the caller variables stayed untouched. Also, calling .count() and then .toList() on the same Java Stream threw IllegalStateException: stream has already been operated upon.',
    subject: 'Java',
    topic: 'OOP & References',
    authorName: 'Rohan',
    createdAt: '6 hrs ago',
    waitingHours: 6,
    status: 'unresolved',
    attachments: ['ReferenceAndStreamPitfall.java'],
    answers: [],
  },
  {
    id: 'doubt-3',
    title:
      'How do I prevent a segmentation fault when reversing a singly linked list using recursion?',
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
    title:
      'Why is Merge Sort preferred over Quick Sort for linked lists despite O(n) extra space?',
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
    title:
      'How do I solve the Master Theorem recurrence T(n) = 2T(n/2) + n log n?',
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
        facultyNote:
          'Verified: Extended Master Theorem (k = 1) — common mid-sem exam question.',
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
    title:
      'Why does my BST delete() function lose the right subtree when removing a node with two children?',
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
    title:
      'When is a square matrix guaranteed to be diagonalizable if its eigenvalues repeat?',
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
        facultyNote:
          'Verified: Check GM = n - rank(A - lambda*I) for each repeated eigenvalue.',
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
    title:
      'Why does sizeof(arr) return 8 bytes inside a helper function instead of the actual array length?',
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
    title:
      'How do I convert a top-down memoized 0/1 Knapsack recursion into a 1D bottom-up DP array?',
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
    title:
      'Why do we check the Region of Convergence (ROC) before taking an inverse Laplace Transform?',
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
    title:
      'Why does returning a local char array pointer from a C function print garbage characters?',
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
