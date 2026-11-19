import type { BookItem } from "../types/book";

export const INITIAL_BOOKS: BookItem[] = [
  {
    id: "b001",
    title: "Mathematics for Machine Learning",
    author: "Marc Peter Deisenroth, A. Aldo Faisal & Cheng Soon Ong",
    year: 2020,
    language: "en",
    isbn: "9781108455145",
    subjects: ["machine learning", "linear algebra", "probability", "mathematics"],
    abstract:
      "Bridges the mathematical gap for machine learning, covering linear algebra, analytic geometry, matrix decompositions, vector calculus, probability, optimization, and four foundational ML algorithms.",
    rating: 4.9,
    reviewsCount: 640,
    coverImage:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-covers/b001-mml-cover.jpg",
    coverGradient: "linear-gradient(135deg, #102B46 0%, #2563EB 100%)",
    pdfUrl:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-pdfs/b001/mathematics-for-machine-learning.pdf",
    badge: "Bestseller",
    category: "Featured Books",
    aiSummary: {
      executiveSummary:
        "A self-contained mathematical foundation for modern machine learning, connecting linear algebra, vector calculus, probability, and optimization directly to linear regression, PCA, GMMs, and SVMs.",
      keyTakeaways: [
        "Matrix decompositions (SVD, eigendecomposition) reveal low-dimensional structure in high-dimensional data.",
        "Vector calculus and automatic differentiation underpin gradient-based optimization of ML models.",
        "Probabilistic modeling frames learning as maximum likelihood and Bayesian inference.",
      ],
      coreConcepts: [
        { term: "Linear Algebra", explanation: "Vector spaces, inner products, projections, and matrix factorizations." },
        { term: "Continuous Optimization", explanation: "Gradient descent, Lagrange multipliers, and convex duality." },
        { term: "Dimensionality Reduction", explanation: "Principal Component Analysis (PCA) from projection and variance perspectives." },
      ],
      targetAudience: "Undergraduate and graduate students in computer science, engineering, and data science.",
      estimatedReadTime: "6 hours 30 mins",
      difficulty: "Intermediate",
      sampleQuestions: [
        "How does Singular Value Decomposition relate to Principal Component Analysis?",
        "Why do we use Lagrange multipliers in Support Vector Machines?",
      ],
    },
    chapters: [
      {
        id: 1,
        title: "1. Introduction and Motivation",
        readTimeMinutes: 14,
        content: [
          "Machine learning builds predictive and analytical models directly from data by combining linear algebra, analytic geometry, calculus, probability, and optimization.",
          "Switch to PDF Viewer mode above to inspect the full Cambridge University Press open-access edition, or use the AI Reading Companion to ask questions about any theorem or derivation.",
        ],
      },
    ],
  },
  {
    id: "b002",
    title: "Think Python: How to Think Like a Computer Scientist (2nd Ed.)",
    author: "Allen B. Downey",
    year: 2015,
    language: "en",
    isbn: "9781491939369",
    subjects: ["python", "programming", "computer science"],
    abstract:
      "A hands-on introduction to software design and computational thinking in Python 3, progressing from variables, functions, and recursion to data structures, object-oriented programming, and debugging.",
    rating: 4.8,
    reviewsCount: 910,
    coverImage:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-covers/b002-think-python-cover.jpg",
    coverGradient: "linear-gradient(135deg, #0f253c 0%, #1e4a74 100%)",
    pdfUrl:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-pdfs/b002/think-python-2e.pdf",
    badge: "Popular",
    category: "Featured Books",
    aiSummary: {
      executiveSummary:
        "Teaches core computer science problem-solving through Python 3 with clear incremental exercises covering functions, recursion, strings, lists, dictionaries, files, and classes.",
      keyTakeaways: [
        "Computational thinking decomposes complex problems into testable, reusable functions.",
        "Choosing the right built-in data structure (list, tuple, dict, set) dramatically simplifies algorithms.",
        "Systematic debugging isolates syntax, runtime, and semantic errors.",
      ],
      coreConcepts: [
        { term: "Recursion", explanation: "Functions that solve problems by reducing them to smaller self-similar base cases." },
        { term: "Hash-Backed Dictionaries", explanation: "Key-value mappings offering O(1) average lookup performance." },
        { term: "Object-Oriented Design", explanation: "Encapsulating data attributes and methods into cohesive classes." },
      ],
      targetAudience: "Introductory computer science students and self-taught programmers.",
      estimatedReadTime: "5 hours 15 mins",
      difficulty: "Beginner",
      sampleQuestions: [
        "What is the difference between mutable lists and immutable tuples in Python?",
        "How does recursion use the call stack?",
      ],
    },
    chapters: [
      {
        id: 1,
        title: "1. The Way of the Program",
        readTimeMinutes: 12,
        content: [
          "The single most important skill for a computer scientist is problem solving: formulating problems, thinking creatively about solutions, and expressing solutions clearly and accurately.",
          "Switch to PDF Viewer mode above to read the complete Green Tea Press open-access textbook.",
        ],
      },
    ],
  },
  {
    id: "b003",
    title: "Think Stats: Exploratory Data Analysis in Python (2nd Ed.)",
    author: "Allen B. Downey",
    year: 2014,
    language: "en",
    isbn: "9781491907337",
    subjects: ["statistics", "data analysis", "python", "probability"],
    abstract:
      "An applied introduction to probability and statistics for programmers, emphasizing computational simulation, empirical distributions, hypothesis testing, estimation, regression, and survival analysis on real datasets.",
    rating: 4.75,
    reviewsCount: 485,
    coverImage:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-covers/b003-think-stats-cover.jpg",
    coverGradient: "linear-gradient(135deg, #134e5e 0%, #1e4a74 100%)",
    pdfUrl:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-pdfs/b003/think-stats-2e.pdf",
    badge: "Featured",
    category: "Popular",
    aiSummary: {
      executiveSummary:
        "Uses Python simulations and real national survey datasets to teach empirical distributions, CDFs, hypothesis testing, linear regression, and time-series analysis.",
      keyTakeaways: [
        "Empirical Cumulative Distribution Functions (CDFs) reveal distribution shapes without histogram binning artifacts.",
        "Permutation and resampling simulations make statistical hypothesis testing intuitive and transparent.",
        "Correlation does not establish causation; multivariate regression helps control confounding factors.",
      ],
      coreConcepts: [
        { term: "PMF & CDF", explanation: "Probability mass functions and cumulative distribution functions for empirical datasets." },
        { term: "Resampling & p-values", explanation: "Estimating the probability of observing an effect under a null hypothesis." },
      ],
      targetAudience: "Students in data science, applied statistics, and software engineering.",
      estimatedReadTime: "4 hours 45 mins",
      difficulty: "Intermediate",
      sampleQuestions: [
        "Why are CDFs often preferred over histograms when comparing two distributions?",
        "How does permutation testing compute a p-value?",
      ],
    },
    chapters: [
      {
        id: 1,
        title: "1. Exploratory Data Analysis",
        readTimeMinutes: 14,
        content: [
          "Statistical thinking turns raw empirical data into validated insights through data cleaning, distribution analysis, and computational hypothesis testing.",
          "Switch to PDF Viewer mode above to explore the full dataset examples and Python code.",
        ],
      },
    ],
  },
  {
    id: "b004",
    title: "Open Data Structures (in Python)",
    author: "Pat Morin",
    year: 2013,
    language: "en",
    isbn: "9781927356388",
    subjects: ["data structures", "algorithms", "python", "computer science"],
    abstract:
      "A rigorous open-access computer science textbook covering array-based lists, linked lists, skip lists, hash tables, binary search trees, red-black trees, heaps, sorting, and graph representations with Python implementations.",
    rating: 4.85,
    reviewsCount: 530,
    coverImage:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-covers/b004-open-data-structures-cover.jpg",
    coverGradient: "linear-gradient(135deg, #102B46 0%, #3b5998 100%)",
    pdfUrl:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-pdfs/b004/open-data-structures-python.pdf",
    badge: "Academic",
    category: "Featured Books",
    aiSummary: {
      executiveSummary:
        "Provides rigorous asymptotic analysis and clean Python implementations of core abstract data types including dynamic arrays, skip lists, hash tables, balanced trees, heaps, and graphs.",
      keyTakeaways: [
        "Amortized analysis explains why doubling dynamic arrays achieves O(1) average append time.",
        "Randomized skip lists and treaps achieve O(log n) expected time with simpler invariants than strict trees.",
        "Choosing adjacency lists vs. matrices directly impacts graph traversal memory and speed.",
      ],
      coreConcepts: [
        { term: "Amortized Complexity", explanation: "Averaging occasional expensive resize operations across sequences of fast operations." },
        { term: "Balanced Search Trees", explanation: "Maintaining O(log n) height for fast ordered lookup, insertion, and deletion." },
      ],
      targetAudience: "Computer science undergraduates studying Data Structures and Algorithms.",
      estimatedReadTime: "6 hours 00 mins",
      difficulty: "Intermediate",
      sampleQuestions: [
        "How does amortized O(1) resizing work in an ArrayStack?",
        "When should you prefer a hash table over a balanced binary search tree?",
      ],
    },
    chapters: [
      {
        id: 1,
        title: "1. Introduction to Data Structures",
        readTimeMinutes: 15,
        content: [
          "Every software system relies on data structures to organize, index, and retrieve data efficiently under strict time and memory constraints.",
          "Switch to PDF Viewer mode above to inspect the full Athabasca University Press open-access edition.",
        ],
      },
    ],
  },
  {
    id: "b005",
    title: "Foundations of Data Science",
    author: "Avrim Blum, John Hopcroft & Ravindran Kannan",
    year: 2020,
    language: "en",
    isbn: "9781108485067",
    subjects: ["data science", "algorithms", "machine learning", "graph theory"],
    abstract:
      "Developed by Turing Award winner John Hopcroft with Avrim Blum and Ravindran Kannan, this text presents the modern theoretical foundations of data science: high-dimensional geometry, SVD, random walks, streaming algorithms, clustering, and topic modeling.",
    rating: 4.9,
    reviewsCount: 410,
    coverImage:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-covers/b005-fds-cover.jpg",
    coverGradient: "linear-gradient(135deg, #173859 0%, #2563EB 100%)",
    pdfUrl:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-pdfs/b005/foundations-of-data-science.pdf",
    badge: "Academic",
    category: "Featured Research",
    aiSummary: {
      executiveSummary:
        "Explores the mathematical theory behind massive modern datasets, from counterintuitive high-dimensional geometry to spectral clustering, random graphs, and streaming sketches.",
      keyTakeaways: [
        "In high dimensions, almost all volume of a sphere concentrates near its surface and equator.",
        "Singular Value Decomposition provides optimal low-rank matrix approximations.",
        "Streaming algorithms compute accurate frequency and distinct-element estimates in sublinear space.",
      ],
      coreConcepts: [
        { term: "High-Dimensional Geometry", explanation: "Concentration of measure and Johnson-Lindenstrauss random projections." },
        { term: "Markov Chains & Random Walks", explanation: "Stationary distributions, mixing times, and PageRank." },
      ],
      targetAudience: "Advanced undergraduate and graduate students in computer science and data science.",
      estimatedReadTime: "7 hours 00 mins",
      difficulty: "Advanced",
      sampleQuestions: [
        "What does the Johnson-Lindenstrauss lemma guarantee for random projections?",
        "How do streaming algorithms estimate distinct items with limited memory?",
      ],
    },
    chapters: [
      {
        id: 1,
        title: "1. High-Dimensional Space",
        readTimeMinutes: 18,
        content: [
          "Modern data science represents documents, images, and graphs as vectors in thousands of dimensions where geometric intuition changes dramatically.",
          "Switch to PDF Viewer mode above to explore the complete manuscript.",
        ],
      },
    ],
  },
  {
    id: "b006",
    title: "Think Bayes: Bayesian Statistics in Python",
    author: "Allen B. Downey",
    year: 2021,
    language: "en",
    isbn: "9781492089469",
    subjects: ["bayesian statistics", "probability", "python", "data science"],
    abstract:
      "A computational approach to Bayesian statistics using Python, teaching prior/posterior updating, conjugate distributions, hierarchical models, decision analysis, and MCMC through real-world problems.",
    rating: 4.85,
    reviewsCount: 520,
    coverImage:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-covers/b006-think-bayes-cover.jpg",
    coverGradient: "linear-gradient(135deg, #005c97 0%, #363795 100%)",
    pdfUrl:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-pdfs/b006/think-bayes.pdf",
    badge: "Trending",
    category: "New Arrivals",
    aiSummary: {
      executiveSummary:
        "Replaces heavy integral calculus with discrete Python probability distributions so readers can build, update, and interpret Bayesian models intuitively.",
      keyTakeaways: [
        "Bayes' Theorem updates prior beliefs using the likelihood of observed evidence to form posterior distributions.",
        "Discrete grid approximations make multi-parameter Bayesian inference accessible with simple Python code.",
        "Posterior predictive distributions directly support risk-aware decision making.",
      ],
      coreConcepts: [
        { term: "Prior & Posterior", explanation: "Representing uncertainty before and after observing empirical data." },
        { term: "Credible Intervals", explanation: "Direct probability intervals computed from the posterior distribution." },
      ],
      targetAudience: "Students, engineers, and analysts learning practical Bayesian modeling.",
      estimatedReadTime: "5 hours 00 mins",
      difficulty: "Intermediate",
      sampleQuestions: [
        "How does Bayesian updating work step by step on new observations?",
        "What is the difference between a Bayesian credible interval and a confidence interval?",
      ],
    },
    chapters: [
      {
        id: 1,
        title: "1. Bayes's Theorem",
        readTimeMinutes: 14,
        content: [
          "Bayesian statistics frames probability as a degree of belief updated systematically whenever new evidence arrives.",
          "Switch to PDF Viewer mode above to work through the complete Python notebooks and examples.",
        ],
      },
    ],
  },
  {
    id: "b007",
    title: "Pro Git (2nd Edition)",
    author: "Scott Chacon & Ben Straub",
    year: 2024,
    language: "en",
    isbn: "9781484200773",
    subjects: ["software engineering", "git", "version control", "devops"],
    abstract:
      "The comprehensive open-source guide to Git version control, covering repository fundamentals, branching and rebasing workflows, distributed collaboration, GitHub workflows, debugging with bisect, hooks, and Git internals.",
    rating: 4.85,
    reviewsCount: 870,
    coverImage:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-covers/b007-pro-git-cover.png",
    coverGradient: "linear-gradient(135deg, #102B46 0%, #1d4ed8 100%)",
    pdfUrl:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-pdfs/b007/pro-git-2e.pdf",
    badge: "New",
    category: "New Arrivals",
    aiSummary: {
      executiveSummary:
        "The authoritative reference to Git's snapshot object model, branching strategies, distributed workflows, rebasing, hooks, submodules, and repository internals.",
      keyTakeaways: [
        "Git stores full snapshots of project trees as content-addressed SHA objects rather than file-by-file diffs.",
        "Lightweight branches are simply movable pointers to commit objects.",
        "Interactive rebase, reflog, and bisect turn Git into a powerful engineering debugging toolkit.",
      ],
      coreConcepts: [
        { term: "Three-Tree Architecture", explanation: "Working directory, staging index, and committed HEAD history." },
        { term: "Merge vs. Rebase", explanation: "Preserving parallel branch history versus replaying linear commits." },
      ],
      targetAudience: "All software engineering students, developers, and DevOps practitioners.",
      estimatedReadTime: "5 hours 30 mins",
      difficulty: "Beginner",
      sampleQuestions: [
        "When should teams use git merge versus git rebase?",
        "How does git bisect locate the commit that introduced a regression?",
      ],
    },
    chapters: [
      {
        id: 1,
        title: "1. Getting Started with Version Control",
        readTimeMinutes: 12,
        content: [
          "Distributed version control allows engineering teams to collaborate safely, audit every historical change, and recover instantly from mistakes.",
          "Switch to PDF Viewer mode above to browse the complete official Pro Git 2nd Edition.",
        ],
      },
    ],
  },
  {
    id: "b008",
    title: "Think DSP: Digital Signal Processing in Python",
    author: "Allen B. Downey",
    year: 2016,
    language: "en",
    isbn: "9781491938454",
    subjects: ["signal processing", "fourier transform", "python", "engineering"],
    abstract:
      "A practical engineering introduction to digital signal processing in Python, covering periodic signals, spectral decomposition, spectrograms, noise, autocorrelation, discrete cosine transforms, and digital filters.",
    rating: 4.8,
    reviewsCount: 395,
    coverImage:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-covers/b008-think-dsp-cover.jpg",
    coverGradient: "linear-gradient(135deg, #1e293b 0%, #2563EB 100%)",
    pdfUrl:
      "https://hnfsswqprgwsmvcltxtr.supabase.co/storage/v1/object/public/book-pdfs/b008/think-dsp.pdf",
    badge: "Academic",
    category: "Featured Research",
    aiSummary: {
      executiveSummary:
        "Introduces spectral analysis, FFTs, convolution, filtering, and audio signal synthesis from the ground up using interactive Python workflows.",
      keyTakeaways: [
        "Any periodic signal can be decomposed into a sum of sinusoidal frequency components via Fourier analysis.",
        "Sampling below the Nyquist rate causes high frequencies to alias into lower frequencies.",
        "Convolution in the time domain corresponds directly to multiplication in the frequency domain.",
      ],
      coreConcepts: [
        { term: "Fast Fourier Transform (FFT)", explanation: "Efficient O(n log n) computation of discrete frequency spectra." },
        { term: "Spectrograms", explanation: "Visualizing how a signal's frequency spectrum evolves over time." },
      ],
      targetAudience: "Engineering, physics, and computer science students exploring audio and signal processing.",
      estimatedReadTime: "4 hours 30 mins",
      difficulty: "Intermediate",
      sampleQuestions: [
        "What is aliasing and how does the Nyquist frequency prevent it?",
        "How does convolution relate to filtering in the frequency domain?",
      ],
    },
    chapters: [
      {
        id: 1,
        title: "1. Sounds and Signals",
        readTimeMinutes: 13,
        content: [
          "Digital signal processing bridges continuous physical phenomena like sound and radio waves with discrete computational algorithms.",
          "Switch to PDF Viewer mode above to explore the complete Green Tea Press edition.",
        ],
      },
    ],
  },
];

export function getBookById(id: string): BookItem | undefined {
  return INITIAL_BOOKS.find((b) => b.id.toLowerCase() === id.toLowerCase());
}

export function getAllBooks(): BookItem[] {
  return INITIAL_BOOKS;
}
