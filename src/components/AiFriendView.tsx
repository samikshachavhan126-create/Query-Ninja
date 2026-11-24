import { useRef, useState } from 'react';
import {
  Bot,
  Send,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  SendToBack,
  BookOpen,
  FileUp,
  Plus,
  Trash2,
  Lock,
  FileText,
  Code2,
  Check,
  Paperclip,
} from 'lucide-react';
import { Answer, Doubt, Persona } from '../types';
import {
  SourceMaterialItem,
  findMatchingSourcePassages,
  findSimilarDoubts,
} from '../utils/similarity';

interface AiFriendViewProps {
  doubts: Doubt[];
  activePersona: Persona;
  onSelectDoubt: (doubtId: string) => void;
  onEscalateDoubt: (questionText: string) => Doubt;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  matchedDoubtId?: string;
  matchedDoubtTitle?: string;
  trustLabel?: 'Teacher-Verified' | 'Peer-Accepted' | 'Both';
  codeBlock?: string;
  needsEscalation?: boolean;
  escalationQuery?: string;
  escalatedDoubtId?: string;
  usingMaterials?: string[];
  exclusiveMatchedKeywords?: string[];
  exclusiveNotFoundQuery?: string;
}

interface ReferenceMaterialPreset {
  id: string;
  title: string;
  kind: 'pdf' | 'code';
  summary: string;
  suggestedQuestion: string;
  content: string;
}

const REFERENCE_MATERIALS: ReferenceMaterialPreset[] = [
  {
    id: 'ref-os-pdf',
    title: 'OS_Kernel_Inline_Asm_Notes.pdf',
    kind: 'pdf',
    summary: 'GCC asm volatile syntax, clobbers & RDTSC kernel driver notes',
    suggestedQuestion: 'How do I write inline assembly in a kernel driver?',
    content: `# Inline Assembly in Kernel Drivers (GCC / Clang)
In C/C++ kernel modules, inline assembly uses the \`asm volatile(...)\` extended syntax so the compiler will not reorder or eliminate hardware-critical instructions.

Basic format:
\`asm volatile("instruction" : output_operands : input_operands : clobbered_registers);\`

# Kernel Interrupts & Memory Barriers
Include \`"memory"\` in the clobber list whenever hardware registers or control state must stay synchronized with C memory accesses, and disable interrupts only in short critical sections.

Example — safely reading the CPU Time-Stamp Counter (RDTSC) in a driver:
\`\`\`c
uint64_t read_tsc(void) {
    uint32_t lo, hi;
    asm volatile("rdtsc" : "=a"(lo), "=d"(hi));
    return ((uint64_t)hi << 32) | lo;
}
\`\`\``,
  },
  {
    id: 'ref-c-pdf',
    title: 'C_Memory_And_Buffer_Handbook.pdf',
    kind: 'pdf',
    summary: 'scanf stdin buffer, malloc vs calloc, array decay & stack pointers',
    suggestedQuestion: 'Why does scanf skip my char input?',
    content: `# stdin Buffering with scanf('%c')
After reading an integer with \`scanf("%d", &choice)\`, the trailing newline ('\\n') stays in stdin. A subsequent \`scanf("%c", &ch)\` immediately reads that leftover newline instead of waiting. Adding a leading space (\`scanf(" %c", &ch)\`) skips whitespace and newlines.

\`\`\`c
scanf("%d", &choice);
scanf(" %c", &ch); // Leading space consumes leftover '\\n'
\`\`\`

# Heap Allocation: malloc() vs calloc()
\`malloc(bytes)\` allocates uninitialized heap memory containing previous garbage values. \`calloc(count, size)\` allocates and zero-initializes every byte to 0.

# Array Decay & Dangling Stack Pointers
Passing an array \`int nums[]\` to a function decays it to a pointer \`int *nums\`, so \`sizeof(nums)\` returns 8 bytes on 64-bit systems. Never return the address of a local stack array from a function.`,
  },
  {
    id: 'ref-py-code',
    title: 'python_pitfalls_reference.py',
    kind: 'code',
    summary: 'Mutable default args, loop closures, deepcopy & GIL concurrency',
    suggestedQuestion: 'Why does Python mutable default list keep old items?',
    content: `# Mutable Default Arguments in Python
Default arguments in Python are evaluated once at function definition time (\`def\`), not per call. Using \`items=[]\` shares one list across calls. Always use \`None\` as a sentinel:
\`\`\`python
def add_tag(tag: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append(tag)
    return items
\`\`\`

# Late-Binding Closures & Deep Copying
Lambdas inside loops look up \`i\` when invoked (late binding); bind early using \`lambda i=i: i\`. For 2D nested lists, \`grid.copy()\` only copies outer references—use \`copy.deepcopy(grid)\` to clone inner lists.

# GIL Multithreading vs Multiprocessing
CPython's Global Interpreter Lock (GIL) allows only one thread to execute Python bytecode at a time, so CPU-bound loops should use \`multiprocessing.Pool\` instead of \`threading\`.`,
  },
  {
    id: 'ref-cpp-code',
    title: 'cpp_stl_and_raii_guide.cpp',
    kind: 'code',
    summary: 'std::vector reallocation, virtual destructors, Rule of Zero & NRVO',
    suggestedQuestion: 'Why does std::vector push_back invalidate iterators?',
    content: `# std::vector Reallocation & Iterator Invalidation
When \`std::vector::push_back\` exceeds \`capacity()\`, it allocates a larger contiguous buffer, moves elements, and frees the old buffer—dangling any saved pointers or iterators. Call \`vec.reserve(n)\` beforehand or store integer indices.

\`\`\`cpp
std::vector<int> nums = {10, 20};
nums.reserve(16); // Prevents reallocation up to 16 elements
\`\`\`

# Virtual Destructors & RAII
Deleting a \`Derived\` instance through a \`Base*\` pointer requires \`virtual ~Base() = default;\` in the base class; otherwise \`~Derived()\` is skipped and leaks resources. Prefer \`std::vector\` or \`std::unique_ptr\` (Rule of Zero) over raw owning pointers.`,
  },
  {
    id: 'ref-jsts-pdf',
    title: 'JS_TS_EventLoop_And_Types.pdf',
    kind: 'pdf',
    summary: 'Promise microtasks vs setTimeout, `this` binding & TS never checks',
    suggestedQuestion: 'Why does Promise.then run before setTimeout?',
    content: `# Event Loop: Microtasks vs Macrotasks
After synchronous code clears the call stack, the JavaScript Event Loop drains the entire Microtask Queue (\`Promise.then\`, \`queueMicrotask\`) before executing the next Macrotask (\`setTimeout\`).

\`\`\`ts
setTimeout(() => console.log("A"), 0);        // Macrotask
Promise.resolve().then(() => console.log("B")); // Microtask (runs first)
console.log("C");                               // Sync
\`\`\`

# \`this\` Binding & TypeScript Exhaustive \`never\`
Passing \`timer.tick\` directly detaches the receiver so \`this\` becomes \`undefined\`; wrap in \`() => timer.tick()\`. In TypeScript discriminated unions, use a \`default: return assertNever(shape)\` helper to catch missing switch cases at compile time.`,
  },
  {
    id: 'ref-java-code',
    title: 'JavaCollectionsAndPool.java',
    kind: 'code',
    summary: 'String Pool vs equals(), HashMap hashCode contract & removeIf()',
    suggestedQuestion: 'Difference between == and equals() in Java String?',
    content: `# Java String Constant Pool vs Heap Strings
\`==\` compares object references, while \`.equals()\` compares character contents. String literals share pooled instances, whereas \`new String("hello")\` creates a distinct heap object.

\`\`\`java
String a = "hello";
String b = new String("hello");
System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
\`\`\`

# HashMap Contract & ConcurrentModificationException
Always override \`hashCode()\` alongside \`equals()\` using \`Objects.hash(...)\` so \`HashMap\` searches the right bucket. Never remove items inside a \`for-each\` loop—use \`list.removeIf(...)\` or \`Iterator.remove()\`.`,
  },
];

const DEFAULT_SAMPLE_CHIPS = [
  'Why does scanf skip my char input?',
  'Why does Python mutable default list keep old items?',
  'Why does std::vector push_back invalidate iterators?',
  'Why does Promise.then run before setTimeout?',
  'Difference between == and equals() in Java String?',
  'How do I write inline assembly in a kernel driver?',
];

function getGroundedAnswer(doubt: Doubt): Answer | null {
  const visible = doubt.answers.filter((a) => !a.isHiddenByModerator);
  return (
    visible.find((a) => a.isTeacherVerified && a.isPeerAccepted) ??
    visible.find((a) => a.isTeacherVerified) ??
    visible.find((a) => a.isPeerAccepted) ??
    null
  );
}

function extractFencedCode(passage: string): {
  prose: string;
  codeBlock?: string;
} {
  const fenceRegex = /```[a-zA-Z0-9_+-]*\n([\s\S]*?)```/;
  const match = passage.match(fenceRegex);
  if (!match) return { prose: passage };
  const prose = passage.replace(fenceRegex, '').trim();
  return {
    prose,
    codeBlock: match[1].trim(),
  };
}

export function AiFriendView({
  doubts,
  activePersona,
  onSelectDoubt,
  onEscalateDoubt,
}: AiFriendViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sources, setSources] = useState<SourceMaterialItem[]>([]);
  const [exclusiveMode, setExclusiveMode] = useState<boolean>(true);
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hey ${activePersona.shortName}! Burning the midnight oil? Ask me anything across C, Python, C++, JavaScript/TypeScript, Java, DSA, or Engineering Math. Attach any reference PDF or code document in "Attach Source Material" to constrain my answers strictly to those documents.`,
    },
  ]);

  const isExclusiveActive = exclusiveMode && sources.length > 0;

  const toggleReferencePreset = (preset: ReferenceMaterialPreset) => {
    setSources((prev) => {
      const exists = prev.some((s) => s.id === preset.id);
      if (exists) {
        return prev.filter((s) => s.id !== preset.id);
      }
      return [
        ...prev,
        {
          id: preset.id,
          title: preset.title,
          content: preset.content,
          kind: preset.kind,
        },
      ];
    });
    setExclusiveMode(true);
    setUploadNotice(null);
  };

  const handleAddCustomSource = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftContent.trim();
    if (!cleaned) return;

    const newItem: SourceMaterialItem = {
      id: `src-${Date.now()}`,
      title: draftTitle.trim() || `Custom_Notes_${sources.length + 1}.txt`,
      content: cleaned,
      kind: 'pasted',
    };

    setSources((prev) => [...prev, newItem]);
    setExclusiveMode(true);
    setDraftTitle('');
    setDraftContent('');
    setShowCustomForm(false);
    setUploadNotice(null);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (!text.trim()) {
        setUploadNotice(
          'Selected file appears empty. Try a readable text/code file or a reference PDF below.'
        );
        return;
      }
      const newItem: SourceMaterialItem = {
        id: `src-file-${Date.now()}`,
        title: file.name,
        content: text.trim().slice(0, 24000),
        kind: 'file',
      };
      setSources((prev) => [...prev, newItem]);
      setExclusiveMode(true);
      setUploadNotice(null);
    } catch {
      setUploadNotice(
        'Could not read that file. Try a plain text, markdown, or code file.'
      );
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSendQuery = (
    rawText: string,
    overrideExclusive?: boolean
  ) => {
    const query = rawText.trim();
    if (!query) return;

    const useExclusive =
      overrideExclusive !== undefined ? overrideExclusive : isExclusiveActive;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    let botMsg: ChatMessage;

    if (useExclusive && sources.length > 0) {
      const passageMatches = findMatchingSourcePassages(query, sources);

      if (passageMatches.length > 0) {
        const primary = passageMatches[0];
        const secondary = passageMatches[1];
        const parsedPrimary = extractFencedCode(primary.passage);
        const parsedSecondary = secondary
          ? extractFencedCode(secondary.passage)
          : null;

        const combinedProse = [
          parsedPrimary.prose || primary.passage,
          parsedSecondary && parsedSecondary.prose
            ? `\nAlso in ${secondary.sourceTitle}:\n${parsedSecondary.prose}`
            : '',
        ]
          .filter(Boolean)
          .join('\n');

        const usingMaterials = Array.from(
          new Set(passageMatches.map((m) => m.sourceTitle))
        );
        const keywords = Array.from(
          new Set(passageMatches.flatMap((m) => m.matchedKeywords))
        ).slice(0, 5);

        botMsg = {
          id: `bot-${Date.now() + 1}`,
          sender: 'assistant',
          text:
            combinedProse ||
            `Matched directly from ${usingMaterials.join(', ')}:`,
          codeBlock: parsedPrimary.codeBlock ?? parsedSecondary?.codeBlock,
          usingMaterials,
          exclusiveMatchedKeywords: keywords,
        };
      } else {
        const attachedNames = sources.map((s) => s.title).join(', ');
        botMsg = {
          id: `bot-${Date.now() + 1}`,
          sender: 'assistant',
          text: `I couldn’t find anything about "${query}" inside your attached source material (${attachedNames}). Because the knowledge base is constrained exclusively to your attached sources, I won't pull answers from outside threads.`,
          usingMaterials: sources.map((s) => s.title),
          exclusiveNotFoundQuery: query,
          needsEscalation: true,
          escalationQuery: query,
        };
      }
    } else {
      // Campus Mode: grounded search strictly over Peer-Accepted or Teacher-Verified doubts
      const candidates = findSimilarDoubts(query, '', doubts);
      const verifiedMatch = candidates.find(
        (c) => getGroundedAnswer(c.doubt) !== null
      );

      if (verifiedMatch) {
        const groundedAns = getGroundedAnswer(verifiedMatch.doubt)!;
        const trustLabel =
          groundedAns.isTeacherVerified && groundedAns.isPeerAccepted
            ? 'Both'
            : groundedAns.isTeacherVerified
              ? 'Teacher-Verified'
              : 'Peer-Accepted';

        botMsg = {
          id: `bot-${Date.now() + 1}`,
          sender: 'assistant',
          text: groundedAns.content,
          codeBlock: groundedAns.codeBlock,
          matchedDoubtId: verifiedMatch.doubt.id,
          matchedDoubtTitle: verifiedMatch.doubt.title,
          trustLabel,
        };
      } else {
        botMsg = {
          id: `bot-${Date.now() + 1}`,
          sender: 'assistant',
          text: `I couldn’t find a Teacher-Verified or Peer-Accepted campus solution for "${query}" yet. Rather than guessing, let’s route this directly to our faculty and peer solver queue so you get a rock-solid answer.`,
          needsEscalation: true,
          escalationQuery: query,
        };
      }
    }

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleSwitchToCampusAndReask = (query: string) => {
    setExclusiveMode(false);
    handleSendQuery(query, false);
  };

  const handleEscalateClick = (messageId: string, questionText: string) => {
    const createdDoubt = onEscalateDoubt(questionText);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              needsEscalation: false,
              escalatedDoubtId: createdDoubt.id,
            }
          : m
      )
    );
  };

  // Suggest prompts tailored to attached reference materials when constrained mode is active
  const activeSampleChips = isExclusiveActive
    ? Array.from(
        new Set([
          ...REFERENCE_MATERIALS.filter((r) =>
            sources.some((s) => s.id === r.id)
          ).map((r) => r.suggestedQuestion),
          ...DEFAULT_SAMPLE_CHIPS.slice(0, 3),
        ])
      ).slice(0, 5)
    : DEFAULT_SAMPLE_CHIPS;

  return (
    <section className="space-y-5">
      {/* Header Banner */}
      <div className="bg-indigo-600 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6" />
          </span>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold">
              24×7 AI Study Friend
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100">
              {isExclusiveActive
                ? `Constrained Knowledge Base • Using ${sources.length} attached ${
                    sources.length === 1 ? 'document' : 'documents'
                  } exclusively`
                : 'Grounded exclusively in Peer-Accepted & Teacher-Verified campus threads'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white whitespace-nowrap self-start sm:self-auto">
          {isExclusiveActive ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Constrained to Attached Material</span>
            </>
          ) : (
            <span>Zero-Hallucination Grounding</span>
          )}
        </span>
      </div>

      {/* 2-Column Workspace: Attach Source Material (Left 5) + Chat (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Attach Source Material Section */}
        <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Paperclip className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  Attach Source Material
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select reference PDFs or code documents to constrain AI answers
                </p>
              </div>
            </div>

            {sources.length > 0 && (
              <button
                type="button"
                role="switch"
                aria-checked={exclusiveMode}
                onClick={() => setExclusiveMode((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  exclusiveMode
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>{exclusiveMode ? 'Exclusive ON' : 'Exclusive OFF'}</span>
              </button>
            )}
          </div>

          {/* Selectable Mock Reference PDFs & Code Documents */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Reference PDFs &amp; Code Documents</span>
              </span>
              {sources.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSources([])}
                  className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Clear all ({sources.length})
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
              {REFERENCE_MATERIALS.map((preset) => {
                const isAttached = sources.some((s) => s.id === preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={isAttached}
                    onClick={() => toggleReferencePreset(preset)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                      isAttached
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                          preset.kind === 'pdf'
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/80'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/80'
                        }`}
                      >
                        {preset.kind === 'pdf' ? (
                          <FileText className="w-3.5 h-3.5" />
                        ) : (
                          <Code2 className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
                          {preset.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {preset.summary}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                        isAttached
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isAttached ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Attached</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Attach</span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Notes / Local File Upload Controls */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.c,.cpp,.h,.py,.js,.ts,.tsx,.java,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <FileUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Upload Local File</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCustomForm((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{showCustomForm ? 'Hide Custom Text' : 'Paste Custom Notes'}</span>
              </button>
            </div>

            {uploadNotice && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {uploadNotice}
              </p>
            )}

            {showCustomForm && (
              <form onSubmit={handleAddCustomSource} className="space-y-2 pt-1">
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Document name (e.g., Lecture_Notes.md)"
                  aria-label="Custom source document name"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  rows={4}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Paste notes, definitions, or code snippets..."
                  aria-label="Custom source material content"
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={!draftContent.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Custom Material</span>
                </button>
              </form>
            )}

            {/* Custom Uploaded / Pasted Sources List (if any) */}
            {sources.some((s) => s.kind === 'pasted' || s.kind === 'file') && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Custom Attached Files &amp; Notes:
                </p>
                {sources
                  .filter((s) => s.kind === 'pasted' || s.kind === 'file')
                  .map((src) => (
                    <div
                      key={src.id}
                      className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {src.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSource(src.id)}
                        aria-label={`Remove ${src.title}`}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT: Chat Container */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Active Mode Strip + Sample Prompt Chips */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            {isExclusiveActive && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Constrained Knowledge Base active ({sources.length}{' '}
                    {sources.length === 1 ? 'material' : 'materials'})
                  </span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 truncate max-w-full">
                  {sources.map((s) => s.title).join(' · ')}
                </span>
              </div>
            )}

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isExclusiveActive
                ? 'Query your attached source material (or test an out-of-scope question):'
                : 'Try a verified campus lookup or test an uncharted escalation:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {activeSampleChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendQuery(chip)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 transition-colors text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="p-5 space-y-4 max-h-[54vh] overflow-y-auto">
            {messages.map((msg) =>
              msg.sender === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-xl bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-xs">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </span>

                  <div className="max-w-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 space-y-3">
                    {/* 'Using [Material Name]' Badge(s) */}
                    {msg.usingMaterials && msg.usingMaterials.length > 0 && (
                      <div className="space-y-1.5 pb-2.5 border-b border-slate-200/80 dark:border-slate-700">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {msg.usingMaterials.map((materialName) => (
                            <span
                              key={materialName}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80"
                            >
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <span>Using {materialName}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Campus Grounded Match Header */}
                    {msg.matchedDoubtTitle && (
                      <div className="space-y-1.5 pb-2.5 border-b border-slate-200/80 dark:border-slate-700">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(msg.trustLabel === 'Peer-Accepted' ||
                            msg.trustLabel === 'Both') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                              <CheckCircle2 className="w-3 h-3" />
                              Peer-Accepted Source
                            </span>
                          )}
                          {(msg.trustLabel === 'Teacher-Verified' ||
                            msg.trustLabel === 'Both') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                              <ShieldCheck className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                              Teacher-Verified Source
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Matched Thread: {msg.matchedDoubtTitle}
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </p>

                    {msg.codeBlock && (
                      <pre className="p-3.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                        <code>{msg.codeBlock}</code>
                      </pre>
                    )}

                    {msg.exclusiveMatchedKeywords &&
                      msg.exclusiveMatchedKeywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Matched terms:
                          </span>
                          {msg.exclusiveMatchedKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                    {msg.matchedDoubtId && (
                      <div>
                        <button
                          type="button"
                          onClick={() => onSelectDoubt(msg.matchedDoubtId!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Full Verified Thread</span>
                        </button>
                      </div>
                    )}

                    {/* Action Row when Exclusive Mode didn't find a match or Campus Mode needs escalation */}
                    {(msg.exclusiveNotFoundQuery ||
                      (msg.needsEscalation && msg.escalationQuery)) && (
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        {msg.exclusiveNotFoundQuery && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSwitchToCampusAndReask(
                                msg.exclusiveNotFoundQuery!
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Search Campus Threads Instead</span>
                          </button>
                        )}

                        {msg.needsEscalation && msg.escalationQuery && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleEscalateClick(
                                  msg.id,
                                  msg.escalationQuery!
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
                            >
                              <SendToBack className="w-3.5 h-3.5" />
                              <span>Escalate to Faculty &amp; Solver Queue</span>
                            </button>
                            {!msg.exclusiveNotFoundQuery && (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                Routes straight to Unresolved Tracker
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {msg.escalatedDoubtId && (
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Escalated to Doubt Feed &amp; Unresolved Tracker!
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectDoubt(msg.escalatedDoubtId!)}
                          className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:underline"
                        >
                          View Escalated Doubt →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(input);
            }}
            className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isExclusiveActive
                  ? 'Ask strictly about your attached source material...'
                  : 'Ask a late-night question across Python, C++, JS/TS, Java, or C...'
              }
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
