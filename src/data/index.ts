import type {
  Note,
  Question,
  ResumeData,
  Scholarship,
  Subject,
} from '../types'

/* ------------------------------------------------------------------ */
/*  Taxonomy: subjects -> chapters -> topics                           */
/* ------------------------------------------------------------------ */

export const subjects: Subject[] = [
  {
    id: 'cs101',
    name: 'Introduction to Computer Science',
    code: 'CS 101',
    color: 'lavender',
    chapters: [
      {
        id: 'cs101-c1',
        name: 'Programming Fundamentals',
        topics: [
          { id: 'cs101-t1', name: 'Variables & Data Types' },
          { id: 'cs101-t2', name: 'Control Flow' },
          { id: 'cs101-t3', name: 'Functions & Recursion' },
        ],
      },
      {
        id: 'cs101-c2',
        name: 'Data Structures',
        topics: [
          { id: 'cs101-t4', name: 'Arrays & Strings' },
          { id: 'cs101-t5', name: 'Linked Lists' },
          { id: 'cs101-t6', name: 'Stacks & Queues' },
        ],
      },
      {
        id: 'cs101-c3',
        name: 'Algorithms & Complexity',
        topics: [
          { id: 'cs101-t7', name: 'Searching & Sorting' },
          { id: 'cs101-t8', name: 'Big-O Analysis' },
        ],
      },
    ],
  },
  {
    id: 'math201',
    name: 'Calculus & Linear Algebra',
    code: 'MATH 201',
    color: 'mint',
    chapters: [
      {
        id: 'math201-c1',
        name: 'Differential Calculus',
        topics: [
          { id: 'math201-t1', name: 'Limits & Continuity' },
          { id: 'math201-t2', name: 'Derivatives & Applications' },
        ],
      },
      {
        id: 'math201-c2',
        name: 'Integral Calculus',
        topics: [
          { id: 'math201-t3', name: 'Definite & Indefinite Integrals' },
          { id: 'math201-t4', name: 'Integration Techniques' },
        ],
      },
      {
        id: 'math201-c3',
        name: 'Linear Algebra',
        topics: [
          { id: 'math201-t5', name: 'Matrices & Determinants' },
          { id: 'math201-t6', name: 'Eigenvalues & Eigenvectors' },
        ],
      },
    ],
  },
  {
    id: 'phy110',
    name: 'Classical & Modern Physics',
    code: 'PHY 110',
    color: 'blue',
    chapters: [
      {
        id: 'phy110-c1',
        name: 'Mechanics',
        topics: [
          { id: 'phy110-t1', name: "Newton's Laws" },
          { id: 'phy110-t2', name: 'Work, Energy & Power' },
        ],
      },
      {
        id: 'phy110-c2',
        name: 'Electromagnetism',
        topics: [
          { id: 'phy110-t3', name: "Coulomb's Law & Fields" },
          { id: 'phy110-t4', name: 'Circuits & Magnetism' },
        ],
      },
    ],
  },
  {
    id: 'econ150',
    name: 'Principles of Economics',
    code: 'ECON 150',
    color: 'peach',
    chapters: [
      {
        id: 'econ150-c1',
        name: 'Microeconomics',
        topics: [
          { id: 'econ150-t1', name: 'Supply & Demand' },
          { id: 'econ150-t2', name: 'Elasticity' },
          { id: 'econ150-t3', name: 'Market Structures' },
        ],
      },
      {
        id: 'econ150-c2',
        name: 'Macroeconomics',
        topics: [
          { id: 'econ150-t4', name: 'GDP & National Income' },
          { id: 'econ150-t5', name: 'Inflation & Unemployment' },
        ],
      },
    ],
  },
  {
    id: 'eng120',
    name: 'Academic Writing & Communication',
    code: 'ENG 120',
    color: 'lavender',
    chapters: [
      {
        id: 'eng120-c1',
        name: 'Essay Craft',
        topics: [
          { id: 'eng120-t1', name: 'Thesis & Argumentation' },
          { id: 'eng120-t2', name: 'Citation & Referencing' },
        ],
      },
      {
        id: 'eng120-c2',
        name: 'Professional Communication',
        topics: [
          { id: 'eng120-t3', name: 'Technical Reports' },
          { id: 'eng120-t4', name: 'Presentations & Public Speaking' },
        ],
      },
    ],
  },
]

export function getSubject(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id)
}

export function getChapter(subjectId: string, chapterId: string) {
  return getSubject(subjectId)?.chapters.find((c) => c.id === chapterId)
}

export function getTopic(subjectId: string, chapterId: string, topicId: string) {
  return getChapter(subjectId, chapterId)?.topics.find((t) => t.id === topicId)
}

export interface TaxonomyPath {
  subject?: Subject
  chapter?: { id: string; name: string }
  topic?: { id: string; name: string }
}

/** Resolve subject/chapter/topic display names for a piece of content. */
export function taxonomyOf(ids: {
  subjectId: string
  chapterId: string
  topicId: string
}): TaxonomyPath {
  const subject = getSubject(ids.subjectId)
  const chapter = subject?.chapters.find((c) => c.id === ids.chapterId)
  const topic = chapter?.topics.find((t) => t.id === ids.topicId)
  return { subject, chapter, topic }
}

/* ------------------------------------------------------------------ */
/*  Module A: past-paper questions with answer scripts                 */
/* ------------------------------------------------------------------ */

export const questions: Question[] = [
  {
    id: 'q-cs-001',
    subjectId: 'cs101',
    chapterId: 'cs101-c1',
    topicId: 'cs101-t3',
    year: 2025,
    examType: 'Final',
    marks: 10,
    difficulty: 'Medium',
    text: 'Write a recursive function `power(x, n)` that computes x raised to n without using built-in exponentiation. State its time complexity and explain how you would convert it to an iterative form.',
    answer:
      'Step 1: Base case — if n = 0, return 1.\nStep 2: Recursive case — return x * power(x, n - 1).\nStep 3: Time complexity is O(n) since the recursion depth equals n; space is O(n) for the call stack.\nStep 4: Iterative form — initialise result = 1 and multiply x in a loop n times, giving O(n) time and O(1) space.\nBonus: fast exponentiation by squaring reduces this to O(log n).',
    contributedBy: 'Ayesha K.',
    verified: true,
  },
  {
    id: 'q-cs-002',
    subjectId: 'cs101',
    chapterId: 'cs101-c2',
    topicId: 'cs101-t5',
    year: 2025,
    examType: 'Midterm',
    marks: 8,
    difficulty: 'Medium',
    text: 'Given a singly linked list, write pseudocode to reverse it in place. What is the time and space complexity of your approach?',
    answer:
      'Step 1: Initialise three pointers — prev = null, curr = head, next = null.\nStep 2: While curr is not null: next = curr.next; curr.next = prev; prev = curr; curr = next.\nStep 3: Set head = prev.\nTime: O(n) single pass. Space: O(1) since only three pointers are used.',
    contributedBy: 'Rohan M.',
    verified: true,
  },
  {
    id: 'q-cs-003',
    subjectId: 'cs101',
    chapterId: 'cs101-c3',
    topicId: 'cs101-t8',
    year: 2024,
    examType: 'Final',
    marks: 6,
    difficulty: 'Easy',
    text: 'Arrange the following in increasing order of asymptotic growth: O(n log n), O(1), O(2^n), O(n^2), O(log n). Justify each adjacency in one line.',
    answer:
      'Order: O(1) < O(log n) < O(n log n) < O(n^2) < O(2^n).\nConstant beats logarithmic (no growth vs slow growth); logarithmic grows slower than any linearithmic term; n log n is dominated by the quadratic for large n; exponentials outgrow every polynomial.',
    contributedBy: 'Prof. verified bank',
    verified: true,
  },
  {
    id: 'q-cs-004',
    subjectId: 'cs101',
    chapterId: 'cs101-c2',
    topicId: 'cs101-t6',
    year: 2024,
    examType: 'Quiz',
    marks: 5,
    difficulty: 'Easy',
    text: 'Explain the difference between a stack and a queue, and give one real-world computing application of each.',
    answer:
      'Stack: LIFO — last element pushed is the first popped. Application: undo mechanism / function call stack.\nQueue: FIFO — first element enqueued is the first dequeued. Application: printer job scheduling / BFS traversal.',
    contributedBy: 'Meera S.',
    verified: false,
  },
  {
    id: 'q-cs-005',
    subjectId: 'cs101',
    chapterId: 'cs101-c3',
    topicId: 'cs101-t7',
    year: 2023,
    examType: 'Final',
    marks: 12,
    difficulty: 'Hard',
    text: 'Implement binary search on a sorted array. Prove that it runs in O(log n) time, and state two preconditions for its correctness.',
    answer:
      'Step 1: lo = 0, hi = n - 1. While lo <= hi: mid = (lo + hi) / 2; if a[mid] = target return mid; if a[mid] < target lo = mid + 1 else hi = mid - 1.\nStep 2: Each iteration halves the search interval, so after k steps the interval size is n / 2^k; the loop ends when this is 1, i.e. k = log2 n → O(log n).\nPreconditions: (1) the array is sorted, (2) random access (indexing) is O(1).',
    contributedBy: 'Ayesha K.',
    verified: true,
  },
  {
    id: 'q-math-001',
    subjectId: 'math201',
    chapterId: 'math201-c1',
    topicId: 'math201-t1',
    year: 2025,
    examType: 'Midterm',
    marks: 8,
    difficulty: 'Medium',
    text: 'Evaluate lim(x→0) (sin 3x) / (5x) using standard limit results. Show all steps.',
    answer:
      'Step 1: Rewrite as (3/5) · sin(3x)/(3x).\nStep 2: Let u = 3x; as x→0, u→0.\nStep 3: Apply the standard result lim(u→0) sin u / u = 1.\nTherefore the limit equals 3/5.',
    contributedBy: 'Daniel O.',
    verified: true,
  },
  {
    id: 'q-math-002',
    subjectId: 'math201',
    chapterId: 'math201-c1',
    topicId: 'math201-t2',
    year: 2025,
    examType: 'Final',
    marks: 10,
    difficulty: 'Hard',
    text: 'A closed cylindrical can must hold 500 cm³. Find the radius and height that minimise the surface area. Justify that your answer is a minimum.',
    answer:
      'Step 1: Constraint V = πr²h = 500 → h = 500/(πr²).\nStep 2: Surface S = 2πr² + 2πrh = 2πr² + 1000/r.\nStep 3: dS/dr = 4πr − 1000/r² = 0 → r³ = 250/π → r = (250/π)^(1/3) ≈ 4.30 cm.\nStep 4: h = 500/(πr²) = 2r ≈ 8.60 cm.\nStep 5: d²S/dr² = 4π + 2000/r³ > 0 for r > 0, confirming a minimum.',
    contributedBy: 'Prof. verified bank',
    verified: true,
  },
  {
    id: 'q-math-003',
    subjectId: 'math201',
    chapterId: 'math201-c2',
    topicId: 'math201-t4',
    year: 2024,
    examType: 'Final',
    marks: 8,
    difficulty: 'Medium',
    text: 'Evaluate ∫ x·e^x dx and ∫ ln(x) dx using integration by parts. State the formula you use.',
    answer:
      'Formula: ∫ u dv = uv − ∫ v du.\n(1) u = x, dv = e^x dx → ∫ x e^x dx = x e^x − e^x + C = e^x(x − 1) + C.\n(2) u = ln x, dv = dx → ∫ ln x dx = x ln x − x + C.',
    contributedBy: 'Sana P.',
    verified: true,
  },
  {
    id: 'q-math-004',
    subjectId: 'math201',
    chapterId: 'math201-c3',
    topicId: 'math201-t6',
    year: 2024,
    examType: 'Midterm',
    marks: 10,
    difficulty: 'Hard',
    text: 'Find the eigenvalues and corresponding eigenvectors of A = [[4, 1], [2, 3]].',
    answer:
      'Step 1: Characteristic equation det(A − λI) = (4−λ)(3−λ) − 2 = λ² − 7λ + 10 = 0.\nStep 2: λ = 5 and λ = 2.\nStep 3: For λ = 5: (A − 5I)v = 0 → −v1 + v2 = 0 → eigenvector (1, 1).\nStep 4: For λ = 2: 2v1 + v2 = 0 → eigenvector (1, −2).',
    contributedBy: 'Daniel O.',
    verified: true,
  },
  {
    id: 'q-phy-001',
    subjectId: 'phy110',
    chapterId: 'phy110-c1',
    topicId: 'phy110-t2',
    year: 2025,
    examType: 'Final',
    marks: 8,
    difficulty: 'Medium',
    text: 'A 1200 kg car accelerates from rest to 25 m/s over 200 m. Calculate the work done on the car and the average net force applied, using the work–energy theorem.',
    answer:
      'Step 1: Work–energy theorem: W = ΔKE = ½mv² − 0 = 0.5 × 1200 × 25² = 375,000 J.\nStep 2: W = F·d → F = 375,000 / 200 = 1,875 N average net force.',
    contributedBy: 'Ibrahim L.',
    verified: true,
  },
  {
    id: 'q-phy-002',
    subjectId: 'phy110',
    chapterId: 'phy110-c2',
    topicId: 'phy110-t3',
    year: 2024,
    examType: 'Midterm',
    marks: 6,
    difficulty: 'Easy',
    text: "State Coulomb's law in vector form and compute the force between two charges of +3 μC and −2 μC separated by 30 cm. Is it attractive or repulsive?",
    answer:
      "Step 1: F = k q1 q2 / r² with k = 8.99 × 10⁹ N·m²/C².\nStep 2: F = 8.99e9 × (3e-6 × 2e-6) / 0.3² ≈ 0.60 N.\nStep 3: Opposite signs → the force is attractive, directed along the line joining the charges.",
    contributedBy: 'Meera S.',
    verified: false,
  },
  {
    id: 'q-phy-003',
    subjectId: 'phy110',
    chapterId: 'phy110-c1',
    topicId: 'phy110-t1',
    year: 2023,
    examType: 'Quiz',
    marks: 5,
    difficulty: 'Easy',
    text: 'A 5 kg block rests on a rough horizontal surface (μs = 0.4, μk = 0.3). A horizontal force of 15 N is applied. Will the block move? If so, find its acceleration. (g = 9.8 m/s²)',
    answer:
      'Step 1: Maximum static friction = μs·N = 0.4 × 5 × 9.8 = 19.6 N.\nStep 2: Applied 15 N < 19.6 N, so the block does NOT move; static friction matches the applied force at 15 N and acceleration is 0.',
    contributedBy: 'Ibrahim L.',
    verified: true,
  },
  {
    id: 'q-econ-001',
    subjectId: 'econ150',
    chapterId: 'econ150-c1',
    topicId: 'econ150-t1',
    year: 2025,
    examType: 'Midterm',
    marks: 8,
    difficulty: 'Medium',
    text: 'Using a supply–demand diagram, analyse the effect of a binding price ceiling on the market for rental housing. Identify winners, losers and the resulting inefficiency.',
    answer:
      'Step 1: A binding ceiling sits below equilibrium rent → quantity demanded exceeds quantity supplied → shortage.\nStep 2: Winners: tenants who secure housing at the lower rent. Losers: landlords and would-be tenants priced out by scarcity.\nStep 3: Inefficiency: deadweight loss from mutually beneficial trades that no longer occur, plus misallocation (search costs, reduced maintenance).',
    contributedBy: 'Zara H.',
    verified: true,
  },
  {
    id: 'q-econ-002',
    subjectId: 'econ150',
    chapterId: 'econ150-c1',
    topicId: 'econ150-t2',
    year: 2024,
    examType: 'Final',
    marks: 6,
    difficulty: 'Easy',
    text: 'The price of coffee rises from $2 to $2.40 and quantity demanded falls from 100 to 90 cups per day. Compute the price elasticity of demand using the midpoint method and interpret it.',
    answer:
      'Step 1: %ΔQ = (90 − 100)/95 ≈ −10.5%. %ΔP = (2.40 − 2)/2.20 ≈ 18.2%.\nStep 2: PED = −10.5 / 18.2 ≈ −0.58.\nStep 3: |PED| < 1 → demand is inelastic; revenue rises when price increases.',
    contributedBy: 'Zara H.',
    verified: true,
  },
  {
    id: 'q-econ-003',
    subjectId: 'econ150',
    chapterId: 'econ150-c2',
    topicId: 'econ150-t4',
    year: 2024,
    examType: 'Final',
    marks: 8,
    difficulty: 'Medium',
    text: 'Define GDP and explain the expenditure approach. Why are transfer payments such as unemployment benefits excluded from GDP?',
    answer:
      'Step 1: GDP = market value of all final goods and services produced within a country in a period.\nStep 2: Expenditure approach: GDP = C + I + G + (X − M).\nStep 3: Transfer payments are excluded because no good or service is produced in exchange; counting them would double-count output when recipients spend the money.',
    contributedBy: 'Prof. verified bank',
    verified: true,
  },
  {
    id: 'q-eng-001',
    subjectId: 'eng120',
    chapterId: 'eng120-c1',
    topicId: 'eng120-t1',
    year: 2025,
    examType: 'Final',
    marks: 10,
    difficulty: 'Medium',
    text: 'Outline the structure of an argumentative essay. For each section, state its purpose and one common pitfall students make.',
    answer:
      'Introduction: hook + context + debatable thesis. Pitfall: vague or factual (non-debatable) thesis.\nBody paragraphs: topic sentence, evidence, analysis, link back. Pitfall: summarising sources instead of analysing them.\nCounterargument & rebuttal: shows balance. Pitfall: attacking a straw man.\nConclusion: synthesise, restate significance. Pitfall: introducing new evidence.',
    contributedBy: 'Lena W.',
    verified: true,
  },
  {
    id: 'q-eng-002',
    subjectId: 'eng120',
    chapterId: 'eng120-c2',
    topicId: 'eng120-t3',
    year: 2024,
    examType: 'Midterm',
    marks: 6,
    difficulty: 'Easy',
    text: 'List and briefly describe the standard sections of a technical report.',
    answer:
      'Title page; Abstract (150–250 word summary); Introduction (problem, objectives); Methods (procedure, reproducible); Results (data, figures); Discussion (interpretation, limitations); Conclusion & Recommendations; References; Appendices (raw data).',
    contributedBy: 'Lena W.',
    verified: true,
  },
  {
    id: 'q-cs-006',
    subjectId: 'cs101',
    chapterId: 'cs101-c1',
    topicId: 'cs101-t2',
    year: 2025,
    examType: 'Quiz',
    marks: 4,
    difficulty: 'Easy',
    text: 'Trace the output of a for-loop that prints the first 5 Fibonacci numbers. Then rewrite it using a while loop.',
    answer:
      'Output: 0 1 1 2 3.\nWhile version: initialise a = 0, b = 1, count = 0; while count < 5: print a; a, b = b, a + b; count++.',
    contributedBy: 'Rohan M.',
    verified: true,
  },
]

/* ------------------------------------------------------------------ */
/*  Module B: peer notes & answer scripts                              */
/* ------------------------------------------------------------------ */

export const notes: Note[] = [
  {
    id: 'n-001',
    title: 'Big-O Cheat Sheet with Growth Graphs',
    type: 'note',
    subjectId: 'cs101',
    chapterId: 'cs101-c3',
    topicId: 'cs101-t8',
    author: 'Ayesha K.',
    content:
      'One-page reference covering O(1) through O(n!), common operation costs for arrays/lists/hash maps, and rules of thumb: drop constants, keep dominant term, nested loops multiply.',
    createdAt: '2026-01-18T10:00:00Z',
    baseVotes: 42,
    verified: true,
    flagged: false,
  },
  {
    id: 'n-002',
    title: 'Integration by Parts — 20 Solved Examples',
    type: 'answer-script',
    subjectId: 'math201',
    chapterId: 'math201-c2',
    topicId: 'math201-t4',
    author: 'Sana P.',
    content:
      'Step-by-step worked solutions progressing from x·e^x to cyclic cases like e^x·sin x, including the LIATE heuristic for choosing u.',
    createdAt: '2026-01-25T14:30:00Z',
    baseVotes: 35,
    verified: true,
    flagged: false,
  },
  {
    id: 'n-003',
    title: 'Elasticity: Formula Sheet & Exam Traps',
    type: 'note',
    subjectId: 'econ150',
    chapterId: 'econ150-c1',
    topicId: 'econ150-t2',
    author: 'Zara H.',
    content:
      'Midpoint vs point elasticity, determinants of PED, and the five most common exam traps (unit-free measure, sign conventions, revenue test).',
    createdAt: '2026-02-02T09:15:00Z',
    baseVotes: 18,
    verified: false,
    flagged: false,
  },
  {
    id: 'n-004',
    title: "Newton's Laws Problem-Solving Framework",
    type: 'note',
    subjectId: 'phy110',
    chapterId: 'phy110-c1',
    topicId: 'phy110-t1',
    author: 'Ibrahim L.',
    content:
      'Free-body diagram first, resolve forces along chosen axes, then apply ΣF = ma per axis. Includes inclined-plane and pulley templates.',
    createdAt: '2026-02-10T16:45:00Z',
    baseVotes: 27,
    verified: true,
    flagged: false,
  },
  {
    id: 'n-005',
    title: 'Linked List Reversal — Visual Walkthrough',
    type: 'answer-script',
    subjectId: 'cs101',
    chapterId: 'cs101-c2',
    topicId: 'cs101-t5',
    author: 'Rohan M.',
    content:
      'Pointer-by-pointer trace of the three-pointer iterative reversal, plus the elegant recursive variant and when each is preferable.',
    createdAt: '2026-02-14T11:20:00Z',
    baseVotes: 15,
    verified: false,
    flagged: true,
  },
  {
    id: 'n-006',
    title: 'Thesis Statement Worksheet (with exemplars)',
    type: 'note',
    subjectId: 'eng120',
    chapterId: 'eng120-c1',
    topicId: 'eng120-t1',
    author: 'Lena W.',
    content:
      'From topic to debatable claim: the "Although X, Y because Z" scaffold, ten graded exemplar theses, and a self-review rubric.',
    createdAt: '2026-03-01T08:00:00Z',
    baseVotes: 22,
    verified: false,
    flagged: false,
  },
  {
    id: 'n-007',
    title: 'Eigenvalues in 5 Steps',
    type: 'note',
    subjectId: 'math201',
    chapterId: 'math201-c3',
    topicId: 'math201-t6',
    author: 'Daniel O.',
    content:
      'Characteristic polynomial → roots → null space per root → check with Av = λv. Includes 2×2 and 3×3 templates and diagonalisation preview.',
    createdAt: '2026-03-05T13:10:00Z',
    baseVotes: 31,
    verified: true,
    flagged: false,
  },
  {
    id: 'n-008',
    title: 'Circuits Crash Notes: KCL, KVL & Nodal Analysis',
    type: 'note',
    subjectId: 'phy110',
    chapterId: 'phy110-c2',
    topicId: 'phy110-t4',
    author: 'Meera S.',
    content:
      'Sign conventions that avoid 90% of errors, worked 3-loop example, and a decision tree for series/parallel reduction.',
    createdAt: '2026-03-12T19:40:00Z',
    baseVotes: 12,
    verified: false,
    flagged: false,
  },
]

/* ------------------------------------------------------------------ */
/*  Module D: scholarship directory                                    */
/* ------------------------------------------------------------------ */

export const scholarships: Scholarship[] = [
  {
    id: 'sch-001',
    name: 'National Merit-cum-Means Scholarship',
    provider: 'Ministry of Education',
    category: 'Government',
    amount: 12000,
    currency: 'USD',
    deadline: '2026-11-30',
    region: 'National',
    description:
      'Flagship government grant for undergraduates with outstanding academic records and family income below the national median. Renewable annually subject to a 3.0 GPA.',
    eligibility: [
      'Enrolled full-time in an accredited undergraduate programme',
      'Family annual income below USD 25,000',
      'Minimum 3.0 / 4.0 GPA in the most recent academic year',
      'No other concurrent government scholarship',
    ],
    documents: ['Marksheet', 'Income Certificate', 'Bank Details', 'Passport Photo'],
    tags: ['merit', 'need-based', 'renewable'],
  },
  {
    id: 'sch-002',
    name: 'BrightFuture STEM Award',
    provider: 'BrightFuture Foundation',
    category: 'Private',
    amount: 5000,
    currency: 'USD',
    deadline: '2026-12-15',
    region: 'International',
    description:
      'Private award for first- and second-year STEM undergraduates who demonstrate leadership in community tech initiatives. Includes a mentorship programme with industry engineers.',
    eligibility: [
      'Declared major in a STEM discipline',
      'Completed at least one semester with 2.8+ GPA',
      'Demonstrated community or open-source involvement',
      'Two recommendation letters',
    ],
    documents: ['Transcript', 'SOP', 'Two Recommendation Letters', 'Resume'],
    tags: ['STEM', 'mentorship', 'leadership'],
  },
  {
    id: 'sch-003',
    name: 'OBC Post-Matric Scholarship',
    provider: 'State Welfare Department',
    category: 'Reserved Quota',
    amount: 3600,
    currency: 'USD',
    deadline: '2027-01-20',
    region: 'State-wide',
    description:
      'Reserved-quota scheme supporting students from OBC communities across all years of undergraduate study. Covers tuition support plus a monthly maintenance allowance.',
    eligibility: [
      'Valid OBC (non-creamy layer) certificate',
      'Family annual income below USD 12,000',
      'Enrolled in any recognised undergraduate programme',
      'Domicile of the state',
    ],
    documents: ['Caste Certificate', 'Income Certificate', 'Marksheet', 'Domicile Certificate', 'Bank Details'],
    tags: ['OBC', 'reserved quota', 'maintenance allowance'],
  },
  {
    id: 'sch-004',
    name: 'University Chancellor’s Need-Based Grant',
    provider: 'Office of Financial Aid',
    category: 'University Aid',
    amount: 8000,
    currency: 'USD',
    deadline: '2026-10-31',
    region: 'On-campus',
    description:
      'Institutional grant covering up to 60% of tuition for students with demonstrated financial need. Automatically reconsidered each semester.',
    eligibility: [
      'Admitted to any bachelor’s programme at the university',
      'Completed financial aid application (FAFSA-equivalent)',
      'Satisfactory academic progress each semester',
    ],
    documents: ['Marksheet', 'Income Certificate', 'Admission Letter'],
    tags: ['tuition', 'need-based', 'on-campus'],
  },
  {
    id: 'sch-005',
    name: 'Minority Communities Excellence Fellowship',
    provider: 'National Minorities Commission',
    category: 'Reserved Quota',
    amount: 6500,
    currency: 'USD',
    deadline: '2026-12-05',
    region: 'National',
    description:
      'Fellowship for students from notified minority communities pursuing professional undergraduate degrees, covering tuition and a book allowance.',
    eligibility: [
      'Belongs to a notified minority community',
      'Secured admission to a professional UG programme',
      'Family annual income below USD 18,000',
      'Minimum 60% in the qualifying examination',
    ],
    documents: ['Community Certificate', 'Marksheet', 'Income Certificate', 'SOP'],
    tags: ['minority', 'professional degree', 'fellowship'],
  },
  {
    id: 'sch-006',
    name: 'Women in Engineering Scholarship',
    provider: 'TechEquity Trust',
    category: 'Private',
    amount: 7500,
    currency: 'USD',
    deadline: '2027-02-14',
    region: 'International',
    description:
      'Supports women pursuing engineering degrees worldwide, with priority for applicants from underrepresented regions. Includes an annual summit invitation.',
    eligibility: [
      'Identify as a woman',
      'Enrolled or admitted to an accredited engineering programme',
      'Essay on widening participation in engineering (max 800 words)',
    ],
    documents: ['SOP', 'Transcript', 'Admission Letter', 'Passport Photo'],
    tags: ['women', 'engineering', 'international'],
  },
  {
    id: 'sch-007',
    name: 'State Merit Scholarship for First-Generation Students',
    provider: 'State Higher Education Council',
    category: 'Government',
    amount: 4200,
    currency: 'USD',
    deadline: '2027-01-10',
    region: 'State-wide',
    description:
      'For students who are the first in their family to attend university, awarded on the basis of entrance-examination rank.',
    eligibility: [
      'First-generation university student (self-declaration)',
      'Top 15% rank in the state entrance examination',
      'Domicile of the state',
    ],
    documents: ['Marksheet', 'Domicile Certificate', 'Entrance Rank Card', 'Bank Details'],
    tags: ['first-generation', 'merit', 'entrance rank'],
  },
  {
    id: 'sch-008',
    name: 'Global South Access Bursary',
    provider: 'International Education Fund',
    category: 'Private',
    amount: 10000,
    currency: 'USD',
    deadline: '2026-11-15',
    region: 'International',
    description:
      'High-value bursary for students from low-income countries studying abroad, covering tuition top-ups and living costs.',
    eligibility: [
      'Citizen of a low- or lower-middle-income country',
      'Offer letter from a partner university',
      'Demonstrated financial need',
    ],
    documents: ['Passport', 'Admission Letter', 'Income Certificate', 'SOP', 'Bank Details'],
    tags: ['international', 'living costs', 'high value'],
  },
  {
    id: 'sch-009',
    name: 'SC/ST Residential Scholarship',
    provider: 'Tribal & Social Justice Ministry',
    category: 'Reserved Quota',
    amount: 5400,
    currency: 'USD',
    deadline: '2026-12-31',
    region: 'National',
    description:
      'Comprehensive support for SC/ST students including hostel fees, mess charges and a book grant, tenable for the full duration of the degree.',
    eligibility: [
      'Valid SC/ST certificate',
      'Admission to a recognised undergraduate programme',
      'Family annual income below USD 10,000',
    ],
    documents: ['Caste Certificate', 'Income Certificate', 'Marksheet', 'Hostel Admission Proof'],
    tags: ['SC/ST', 'residential', 'full duration'],
  },
  {
    id: 'sch-010',
    name: 'Alumni Association Hardship Fund',
    provider: 'University Alumni Association',
    category: 'University Aid',
    amount: 2500,
    currency: 'USD',
    deadline: '2027-03-01',
    region: 'On-campus',
    description:
      'Rolling emergency fund for continuing students facing sudden financial hardship (family income loss, medical emergencies). Decisions within three weeks.',
    eligibility: [
      'Completed at least one semester at the university',
      'Documented sudden change in financial circumstances',
      'Statement from a faculty advisor',
    ],
    documents: ['Hardship Statement', 'Income Certificate', 'Faculty Advisor Letter'],
    tags: ['emergency', 'rolling', 'hardship'],
  },
]

/* ------------------------------------------------------------------ */
/*  Module C: ATS keyword bank & helpers                               */
/* ------------------------------------------------------------------ */

export const ATS_ACTION_VERBS = [
  'developed',
  'engineered',
  'led',
  'designed',
  'implemented',
  'analysed',
  'optimised',
  'automated',
  'collaborated',
  'launched',
  'reduced',
  'increased',
  'built',
  'managed',
  'researched',
]

export const ATS_KEYWORDS_BY_ROLE: Record<string, string[]> = {
  'Software Engineer': [
    'javascript',
    'typescript',
    'react',
    'node.js',
    'python',
    'sql',
    'git',
    'rest api',
    'testing',
    'ci/cd',
    'agile',
    'data structures',
    'algorithms',
    'cloud',
    'docker',
  ],
  'Data Analyst': [
    'sql',
    'excel',
    'python',
    'pandas',
    'tableau',
    'power bi',
    'statistics',
    'data visualisation',
    'reporting',
    'etl',
    'dashboards',
    'a/b testing',
  ],
  'Marketing Associate': [
    'seo',
    'content marketing',
    'social media',
    'google analytics',
    'campaign',
    'email marketing',
    'market research',
    'branding',
    'copywriting',
    'crm',
  ],
  'Mechanical Engineer': [
    'cad',
    'solidworks',
    'fea',
    'thermodynamics',
    'manufacturing',
    'gd&t',
    'prototyping',
    'matlab',
    'lean',
    'six sigma',
  ],
  'Finance Intern': [
    'financial modelling',
    'excel',
    'valuation',
    'accounting',
    'forecasting',
    'budgeting',
    'bloomberg',
    'risk analysis',
    'reconciliation',
  ],
}

export const ATS_ROLES = Object.keys(ATS_KEYWORDS_BY_ROLE)

export const sampleResume: ResumeData = {
  fullName: 'Alex Rivera',
  email: 'alex.rivera@university.edu',
  phone: '+1 (555) 014-2210',
  location: 'Austin, TX',
  links: 'linkedin.com/in/alexrivera github.com/alexrivera',
  summary:
    'Third-year computer science undergraduate with hands-on experience building full-stack web applications through coursework and a software engineering internship. Developed and tested REST API features used by 2,000+ students; seeking a software engineer internship to apply data structures and agile practices to production systems.',
  education: [
    {
      id: 'edu-1',
      school: 'State University',
      degree: 'B.Sc.',
      field: 'Computer Science',
      startYear: '2023',
      endYear: '2027 (expected)',
      gpa: '3.6/4.0',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Campus Tech Labs',
      role: 'Software Engineering Intern',
      startDate: 'Jun 2025',
      endDate: 'Aug 2025',
      bullets:
        'Developed and tested 12 REST API endpoints in Node.js serving 2,000+ student accounts\nOptimised SQL queries, reducing dashboard load time by 35%\nCollaborated in a 5-person agile team using git and CI/CD pipelines',
    },
  ],
  projects: [
    {
      id: 'prj-1',
      name: 'Study Group Finder',
      tech: 'React, Firebase, Tailwind CSS',
      description:
        'Built a React web app that matches students into study groups; implemented authentication and real-time chat for 300+ active users.',
    },
  ],
  skills: 'JavaScript, TypeScript, React, Node.js, Python, SQL, Git, REST API, Testing, Agile',
  targetRole: 'Software Engineer',
}
