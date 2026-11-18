import type { BookItem } from "../types/book";

export const INITIAL_BOOKS: BookItem[] = [
  {
    id: "b001",
    title: "Introduction to Machine Learning for Beginners",
    author: "Maria Okafor",
    year: 2024,
    language: "en",
    isbn: "9781000000011",
    subjects: ["machine learning", "artificial intelligence", "data science"],
    abstract: "A gentle first course in learning from data, covering regression, classification and model evaluation with no heavy maths.",
    rating: 4.8,
    reviewsCount: 342,
    coverImage: "/ai.jpg",
    coverGradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    badge: "Bestseller",
    category: "Featured Books",
    aiSummary: {
      executiveSummary: "This book provides an intuitive, hands-on gateway into the foundations of Machine Learning. Maria Okafor removes the barrier of advanced calculus and linear algebra by focusing on conceptual clarity, visual intuitions, and real-world Python workflows for regression, classification, and validation.",
      keyTakeaways: [
        "Machine Learning is fundamentally pattern recognition from empirical data rather than rigid rule-based programming.",
        "Supervised learning builds mappings from labeled examples (features to targets), while unsupervised learning discovers inherent groupings.",
        "Overfitting occurs when models memorize training noise; robust train/validation/test splits and regularization prevent this.",
        "Model evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC) must be carefully chosen based on dataset balance and cost of false positives."
      ],
      coreConcepts: [
        { term: "Supervised Learning", explanation: "Algorithms trained on input-output pairs to learn predictive functions." },
        { term: "Overfitting vs Underfitting", explanation: "The balance between capturing true signals without fitting idiosyncratic dataset noise." },
        { term: "Cross-Validation", explanation: "Resampling technique (e.g. 5-fold) to assess generalized model performance." }
      ],
      targetAudience: "Undergraduate computer science students, aspiring data analysts, and software developers transitioning into AI.",
      estimatedReadTime: "4 hours 30 mins",
      difficulty: "Beginner",
      sampleQuestions: [
        "What is the core difference between regression and classification?",
        "How do we combat overfitting in simple models?",
        "When should precision be prioritized over recall?"
      ],
      quickAiAnswers: {
        "What is the core difference between regression and classification?": "Regression predicts continuous numerical values (such as housing prices or temperatures), whereas classification predicts discrete categorical labels (such as spam vs. not spam, or disease diagnosis).",
        "How do we combat overfitting in simple models?": "Overfitting is countered through cross-validation, regularization (L1/L2 penalties), pruning tree depth, simplifying model complexity, or collecting more training data.",
        "When should precision be prioritized over recall?": "Prioritize precision when false positives carry a heavy penalty (e.g., spam filtering or fraud detection where legitimate users should not be wrongly locked out)."
      }
    },
    chapters: [
      {
        id: 1,
        title: "1. The Philosophy of Learning from Data",
        readTimeMinutes: 12,
        content: [
          "For decades, classical computing operated on explicit instructions: programmers wrote deterministic algorithms that ingested inputs and applied hand-crafted rules to produce outputs.",
          "Machine learning shifts this paradigm entirely. Instead of human programmers defining rules, learning algorithms deduce the underlying rules from observational data. By exposing a system to thousands of historical examples, it develops statistical representations capable of generalizing to unseen scenarios.",
          "Consider the task of identifying fraudulent credit card transactions. A human engineer cannot realistically anticipate every variation of fraudulent behavior across global currencies and merchant categories. However, a model trained on millions of past transactions can discern subtle multivariate anomalies that elude manual heuristics.",
          "As we embark on this journey, our primary goal is not merely to memorize formulas, but to develop an intuition for how algorithms perceive uncertainty, optimize loss functions, and generalize knowledge."
        ]
      },
      {
        id: 2,
        title: "2. Linear Models & The Cost Function",
        readTimeMinutes: 18,
        content: [
          "The simplest yet most enduring pillar of machine learning is linear regression. At its core, linear regression assumes that a linear relationship connects our independent features (X) to our continuous dependent target (y).",
          "Mathematically, we formulate our hypothesis as: ŷ = w₁x₁ + w₂x₂ + ... + wₙxₙ + b, where w represents weight parameters and b is the intercept bias term.",
          "To determine how well our hypothesis fits the real data, we define a Cost Function, commonly the Mean Squared Error (MSE). The MSE quantifies the average squared distance between our model predictions and the ground truth labels.",
          "Optimization algorithms like Gradient Descent iteratively update weights by taking steps proportional to the negative gradient of the loss surface, sliding downhill toward the global minimum error."
        ]
      },
      {
        id: 3,
        title: "3. Classification and Logistic Regression",
        readTimeMinutes: 15,
        content: [
          "When our prediction target is categorical rather than continuous, linear regression falls short because its outputs are unbounded. To predict probabilities between 0 and 1, we introduce the Sigmoid activation function.",
          "Logistic regression applies the sigmoid transformation to a linear equation, yielding a calibrated probability distribution for binary classification problems.",
          "Decision boundaries can be tuned depending on the cost matrix of the application. For medical diagnostic screening, setting a lower decision threshold ensures higher sensitivity (recall), capturing potential cases even at the cost of additional confirmatory tests."
        ]
      }
    ]
  },
  {
    id: "b002",
    title: "Deep Learning Foundations",
    author: "Chen Wei",
    year: 2021,
    language: "en",
    isbn: "9781000000028",
    subjects: ["neural networks", "deep learning", "artificial intelligence"],
    abstract: "Explains how neural networks are built, trained and tuned, with worked examples for images and text.",
    rating: 4.9,
    reviewsCount: 512,
    coverImage: "/ai.jpg",
    coverGradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    badge: "Trending",
    category: "Featured Books",
    aiSummary: {
      executiveSummary: "A comprehensive exposition of modern deep neural architectures. Chen Wei explains multilayer perceptrons, backpropagation through computational graphs, convolutional networks for visual perception, and transformers for sequential attention.",
      keyTakeaways: [
        "Deep architectures learn hierarchical feature abstractions from raw high-dimensional inputs.",
        "Backpropagation applies the chain rule of calculus to compute loss gradients across millions of parameters efficiently.",
        "Modern optimizers (Adam, AdamW) with learning rate schedulers and normalization layers (BatchNorm, LayerNorm) stabilize deep convergence.",
        "Self-attention mechanisms allow models to capture non-local dependencies across sequences without recurrence bottlenecks."
      ],
      coreConcepts: [
        { term: "Backpropagation", explanation: "Efficient algorithm for computing partial derivatives of a scalar loss function with respect to all network weights." },
        { term: "Activation Functions", explanation: "Non-linear functions (ReLU, GELU, Swish) that allow multi-layer networks to approximate arbitrary functions." },
        { term: "Self-Attention", explanation: "A computation mechanism that weights the relevance of all tokens in an input sequence against each other simultaneously." }
      ],
      targetAudience: "Graduate students, research engineers, and ML practitioners seeking a rigorous understanding of deep learning internals.",
      estimatedReadTime: "6 hours 15 mins",
      difficulty: "Advanced",
      sampleQuestions: [
        "Why is non-linearity critical in multi-layer perceptrons?",
        "How does batch normalization accelerate neural network convergence?",
        "What advantage does self-attention offer over recurrent neural networks?"
      ],
      quickAiAnswers: {
        "Why is non-linearity critical in multi-layer perceptrons?": "Without non-linear activations, any cascade of linear layers collapses mathematically into a single linear matrix multiplication, preventing the network from learning complex non-linear functions.",
        "How does batch normalization accelerate neural network convergence?": "Batch normalization mitigates internal covariate shift by standardizing layer inputs across minibatches, allowing higher learning rates and reducing sensitivity to initialization.",
        "What advantage does self-attention offer over recurrent neural networks?": "Self-attention processes sequence tokens in parallel rather than sequentially, eliminating the vanishing gradient problem over long horizons and scaling efficiently on GPU hardware."
      }
    },
    chapters: [
      {
        id: 1,
        title: "1. Biological & Computational Perceptrons",
        readTimeMinutes: 20,
        content: [
          "The inception of artificial neural networks traces back to Warren McCulloch and Walter Pitts in 1943, who modeled simple biological neurons as binary threshold units.",
          "Frank Rosenblatt later formulated the single-layer Perceptron. While revolutionary, Marvin Minsky and Seymour Papert demonstrated in 1969 that single-layer perceptrons could not compute non-linear boolean functions such as XOR.",
          "The resolution required multilayer networks equipped with non-linear activation functions and a scalable credit-assignment algorithm: the backpropagation of errors."
        ]
      },
      {
        id: 2,
        title: "2. The Computational Graph and Backpropagation",
        readTimeMinutes: 25,
        content: [
          "Modern deep learning libraries represent forward computations as directed acyclic graphs (DAGs). Each node represents an operation or tensor state.",
          "During the forward pass, intermediate activation tensors are computed and stored. In the reverse pass, automatic differentiation sweeps backward from the scalar loss, systematically accumulating partial derivatives using vector-Jacobian products.",
          "Vanishing and exploding gradients represent primary optimization hurdles, which modern architectures mitigate via residual skip connections and normalized weight initializations (He and Xavier schemes)."
        ]
      }
    ]
  },
  {
    id: "b003",
    title: "Atomic Habits for Students",
    author: "Priya Nair",
    year: 2023,
    language: "en",
    isbn: "9781000000035",
    subjects: ["study skills", "motivation", "productivity"],
    abstract: "Practical ways to stop procrastinating, build routines and stay focused through exam season.",
    rating: 4.7,
    reviewsCount: 820,
    coverImage: "/ai.jpg",
    coverGradient: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    badge: "Popular",
    category: "Popular",
    aiSummary: {
      executiveSummary: "A student-tailored operational guide based on behavioral science. Priya Nair unpacks the mechanics of cue-craving-response-reward habit loops and demonstrates how micro-adjustments in study environments reliably compound into top academic performance.",
      keyTakeaways: [
        "Focus on system and identity architecture rather than relying on fickle motivation or willpower.",
        "The Two-Minute Rule: shrink daunting study tasks until resistance to starting drops to zero.",
        "Environment design trumps willpower: optimize study spaces to make productive cues obvious and distracting cues invisible.",
        "Active recall and spaced repetition yield 3x retention efficiency compared to passive re-reading."
      ],
      coreConcepts: [
        { term: "Habit Stacking", explanation: "Pairing a new desired study habit directly after an established daily routine." },
        { term: "Friction Engineering", explanation: "Increasing steps required to indulge in distractions while minimizing steps to start learning." },
        { term: "Identity-Based Habits", explanation: "Shifting focus from 'I need to study' to 'I am a diligent scholar who masters challenging subjects'." }
      ],
      targetAudience: "High school and university students preparing for demanding academic terms or competitive exams.",
      estimatedReadTime: "3 hours 45 mins",
      difficulty: "Beginner",
      sampleQuestions: [
        "How can students break the cycle of exam cramming and procrastination?",
        "What is the most effective way to design a distraction-free study zone?",
        "How does habit stacking work in a busy academic schedule?"
      ],
      quickAiAnswers: {
        "How can students break the cycle of exam cramming and procrastination?": "By shifting to distributed micro-sessions: commit to 20 minutes of active retrieval each day rather than 12-hour weekend cram marathons.",
        "What is the most effective way to design a distraction-free study zone?": "Dedicate a single desk exclusively for academic work, store smartphones in another room, and use site blockers during study blocks.",
        "How does habit stacking work in a busy academic schedule?": "Use the formula: 'After I [current habit], I will [new academic habit]'. E.g., 'After I pour my morning coffee, I will review flashcards for 10 minutes.'"
      }
    },
    chapters: [
      {
        id: 1,
        title: "1. The Anatomy of Academic Procrastination",
        readTimeMinutes: 14,
        content: [
          "Procrastination is rarely an issue of laziness or defective character. Neurobiologically, it is an emotional regulation problem: our limbic system seeks immediate relief from perceived boredom, anxiety, or feelings of inadequacy.",
          "When faced with a 40-page research paper or an impending calculus exam, the human brain registers the immense scope as a threat, triggering avoidance behaviors such as social media scrolling.",
          "By decomposing massive academic goals into atomic two-minute starting actions, we bypass the limbic trigger and activate momentum."
        ]
      },
      {
        id: 2,
        title: "2. The 4 Laws of Student Habit Formation",
        readTimeMinutes: 16,
        content: [
          "Law 1: Make it Obvious. Place textbooks, open notebooks, and scheduled study planners directly in your visual field upon entering your room.",
          "Law 2: Make it Attractive. Pair challenging problem sets with an enjoyable environment or study partner.",
          "Law 3: Make it Easy. Reduce friction: set up your IDE or reference books the night before so you can start working in under five seconds.",
          "Law 4: Make it Satisfying. Track consecutive study streaks visually on a calendar to trigger intrinsic dopamine rewards."
        ]
      }
    ]
  },
  {
    id: "b004",
    title: "Apprendre la statistique avec R",
    author: "Luc Marchand",
    year: 2019,
    language: "fr",
    isbn: "9781000000042",
    subjects: ["statistics", "R programming", "data analysis"],
    abstract: "Introduction aux probabilites et a l'inference statistique avec des exemples en R.",
    rating: 4.6,
    reviewsCount: 190,
    coverImage: "/ai.jpg",
    coverGradient: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
    badge: "Academic",
    category: "Featured Research",
    aiSummary: {
      executiveSummary: "Un manuel universitaire rigoureux guidant l'étudiant à travers la théorie des probabilités et l'inférence statistique moderne à l'aide de l'écosystème R et Tidyverse. Illustré d'exemples empiriques réels en biologie et sciences sociales.",
      keyTakeaways: [
        "Maîtrise de la manipulation des données avec dplyr et visualisation graphique avancée avec ggplot2.",
        "Compréhension approfondie des lois de probabilités fondamentales (Normale, Poisson, Student, Binomiale).",
        "Formulation rigoureuse des tests d'hypothèses statistiques, calcul des p-valeurs et intervalles de confiance.",
        "Modélisation de régression linéaire simple et multiple avec diagnostic des résidus."
      ],
      coreConcepts: [
        { term: "Inférence Statistique", explanation: "Déduction des propriétés d'une population globale à partir d'un échantillon représentatif." },
        { term: "Test d'Hypothèse (p-valeur)", explanation: "Probabilité d'obtenir une statistique au moins aussi extrême que celle observée sous l'hypothèse nulle." },
        { term: "Tidyverse", explanation: "Collection cohérente de packages R conçus pour la science des données moderne." }
      ],
      targetAudience: "Étudiants francophones en sciences économiques, statistiques appliquées et bio-informatique.",
      estimatedReadTime: "5 heures 10 mins",
      difficulty: "Intermediate",
      sampleQuestions: [
        "Comment interpréter correctement une valeur p inférieure à 0.05 ?",
        "Quels sont les postulats clés du modèle de régression linéaire sous R ?",
        "Pourquoi privilégier ggplot2 aux fonctions graphiques de base ?"
      ],
      quickAiAnswers: {
        "Comment interpréter correctement une valeur p inférieure à 0.05 ?": "Une p-valeur < 0.05 indique que les données observées sont peu plausibles sous l'hypothèse nulle, justifiant son rejet au seuil de 5%.",
        "Quels sont les postulats clés du modèle de régression linéaire sous R ?": "Linéarité de la relation, indépendance des erreurs, homoscédasticité et normalité des résidus."
      }
    },
    chapters: [
      {
        id: 1,
        title: "1. Introduction aux Données et à l'Environnement R",
        readTimeMinutes: 15,
        content: [
          "Le langage R s'est imposé comme la référence incontournable de la recherche statistique universitaire.",
          "Dans ce chapitre initial, nous explorons l'installation de RStudio, la gestion des structures de données fondamentales (vecteurs, dataframes, listes) et les opérations de vectorisation qui confèrent à R sa puissance expressive.",
          "Nous débutons également l'analyse exploratoire grâce aux verbes de transformation du package dplyr : filter, select, mutate et summarise."
        ]
      },
      {
        id: 2,
        title: "2. Les Distributions de Probabilités",
        readTimeMinutes: 20,
        content: [
          "Toute démarche d'inférence repose sur la modélisation mathématique de l'incertitude.",
          "Nous étudions en détail la loi normale, ses propriétés de symétrie, et le théorème central limite qui justifie son ubiquité dans l'analyse d'échantillons de grande taille.",
          "À travers des simulations R interactives, nous visualisons la convergence empirique des moyennes d'échantillonnage vers la distribution gaussienne théorique."
        ]
      }
    ]
  },
  {
    id: "b005",
    title: "A Short History of the Silk Road",
    author: "Hannah Lindgren",
    year: 2015,
    language: "en",
    isbn: "9781000000059",
    subjects: ["history", "trade", "asia"],
    abstract: "Follows the trade routes linking China, Central Asia and Europe, and the goods, faiths and ideas that travelled along them.",
    rating: 4.8,
    reviewsCount: 430,
    coverImage: "/ai.jpg",
    coverGradient: "linear-gradient(135deg, #ba8b02 0%, #181818 100%)",
    badge: "Featured",
    category: "Featured Books",
    aiSummary: {
      executiveSummary: "An evocative historical chronicle tracing the ancient transit arteries spanning from Chang'an to Rome. Hannah Lindgren demonstrates how the Silk Road was far more than a trade conduit for luxury goods; it was the world's first global information network, catalyzing religious dispersion, technological exchange, and cross-civilizational synthesis.",
      keyTakeaways: [
        "The Silk Road was not a single paved highway, but a dynamic, evolving network of oasis pathways and maritime routes.",
        "Along with silk, ceramics, and spices traveled pivotal technologies: papermaking, gunpowder, mathematics, and sericulture.",
        "Buddhism, Nestorian Christianity, Manichaeism, and Islam spread across Central Asia via merchant caravanserais.",
        "Geopolitical shifts (the rise and fragmentation of the Mongol Empire) fundamentally dictated the prosperity and decline of overland routes."
      ],
      coreConcepts: [
        { term: "Caravanserai", explanation: "Fortified roadside inns providing shelter, market access, and security for long-distance desert merchants." },
        { term: "Pax Mongolica", explanation: "A period of relative stability across Eurasia under Mongol rule that drastically reduced overland transit risk." },
        { term: "Cultural Syncretism", explanation: "The blending of diverse cultural and artistic traditions, exemplified by Greco-Buddhist sculpture in Gandhara." }
      ],
      targetAudience: "History enthusiasts, international relations scholars, and curious readers exploring Eurasian historical networks.",
      estimatedReadTime: "4 hours 10 mins",
      difficulty: "Beginner",
      sampleQuestions: [
        "Why was Central Asia central to the transmission of world religions?",
        "How did papermaking reach the West via the Silk Road?",
        "What caused the eventual decline of overland Silk Road trading hubs?"
      ],
      quickAiAnswers: {
        "Why was Central Asia central to the transmission of world religions?": "Oasis cities like Samarkand, Dunhuang, and Bukhara functioned as cosmopolitan crossroads where monastic communities, diplomatic envoys, and polyglot merchants interacted freely.",
        "How did papermaking reach the West via the Silk Road?": "Following the Battle of Talas in 751 CE, captured Chinese artisans transmitted papermaking techniques to Samarkand, whence it diffused through Baghdad to Europe.",
        "What caused the eventual decline of overland Silk Road trading hubs?": "The European Age of Discovery established faster, cheaper maritime ocean routes, rendering grueling desert caravans economically uncompetitive."
      }
    },
    chapters: [
      {
        id: 1,
        title: "1. The Awakening of the Caravan Routes",
        readTimeMinutes: 16,
        content: [
          "In the 2nd century BCE, Han dynasty envoy Zhang Qian set forth westward into the perilous Taklamakan Desert on a diplomatic mission to secure alliances against the Xiongnu nomads.",
          "Though captured and held captive for years, Zhang Qian returned with astonishing reports of majestic Heavenly Horses in Fergana and wealthy kingdoms thirsting for Chinese silk.",
          "This pivotal expedition ignited an economic exchange that would bind continents together for over fifteen hundred years."
        ]
      },
      {
        id: 2,
        title: "2. Oasis Kingdoms and Desert Crossroads",
        readTimeMinutes: 18,
        content: [
          "Navigating the desert required stopping at fragile oasis settlements sustained by underground karez irrigation channels.",
          "Cities such as Kashgar, Khotan, and Turpan emerged as flourishing cultural capitals. Here, merchants traded jade for medicinal herbs, exchanged currency with Sogdian intermediaries, and funded monastic cave temples filled with vibrant murals."
        ]
      }
    ]
  },
  {
    id: "b006",
    title: "Climate Change and Coastal Cities",
    author: "Tomas Ibarra",
    year: 2022,
    language: "en",
    isbn: "9781000000066",
    subjects: ["climate change", "urban planning", "sea level rise"],
    abstract: "How rising seas and storms reshape planning, insurance and infrastructure in major port cities.",
    rating: 4.85,
    reviewsCount: 310,
    coverImage: "/ai.jpg",
    coverGradient: "linear-gradient(135deg, #005c97 0%, #363795 100%)",
    badge: "Academic",
    category: "Featured Research",
    aiSummary: {
      executiveSummary: "A multidisciplinary analysis of sea level rise impacts on metropolitan coastal zones. Tomas Ibarra synthesizes hydrodynamic climate projections, geotechnical engineering solutions, and municipal economics to evaluate adaptation frameworks for the world's most vulnerable seaports.",
      keyTakeaways: [
        "Metropolitan coastal resilience requires combining hard seawall engineering with nature-based buffer systems (mangroves, wetlands).",
        "Municipal bond ratings and property insurance underwriting will force climate adaptation investments faster than political mandates.",
        "Compound flooding (simultaneous storm surges, sea level rise, and heavy rainfall) overwhelms legacy gravity-based drainage infrastructure.",
        "Managed retreat policies must be proactively planned to avoid socio-economic inequity and displacement."
      ],
      coreConcepts: [
        { term: "Compound Flooding", explanation: "Simultaneous co-occurrence of multiple flood drivers (tidal surge + extreme precipitation + riverine runoff)." },
        { term: "Nature-Based Infrastructure", explanation: "Restoring living shorelines and barrier islands to attenuate wave energy naturally." },
        { term: "Managed Retreat", explanation: "Strategic, phased relocation of communities and municipal assets away from high-risk coastal hazard zones." }
      ],
      targetAudience: "Urban planners, civil engineers, municipal policymakers, and environmental scientists.",
      estimatedReadTime: "5 hours 20 mins",
      difficulty: "Intermediate",
      sampleQuestions: [
        "What is the difference between hard seawall defense and living shoreline adaptation?",
        "How is the property insurance industry driving urban climate resilience?",
        "Why are delta cities uniquely vulnerable to relative sea level rise?"
      ],
      quickAiAnswers: {
        "What is the difference between hard seawall defense and living shoreline adaptation?": "Hard seawalls reflect wave energy and can cause offshore erosion, whereas living shorelines (wetlands, dunes, reefs) absorb wave momentum while providing ecological habitats.",
        "How is the property insurance industry driving urban climate resilience?": "Insurers withdrawing coverage or drastically raising premiums in flood-prone zones signals actual risk to property owners and municipal lenders, demanding defensive capital improvements."
      }
    },
    chapters: [
      {
        id: 1,
        title: "1. Projecting 21st-Century Sea Level Dynamics",
        readTimeMinutes: 22,
        content: [
          "Thermal expansion of seawater coupled with accelerated ice sheet discharge in Greenland and Antarctica represents the defining geophysical challenge of our century.",
          "Global mean sea level rise does not distribute uniformly: regional gravitational pull, ocean current circulation, and local land subsidence dramatically alter relative sea levels at coastal ports.",
          "Cities built on river deltas—such as Jakarta, New Orleans, and Bangkok—experience amplified relative rise due to aggressive groundwater extraction causing the land itself to sink."
        ]
      },
      {
        id: 2,
        title: "2. Redesigning the Urban Edge",
        readTimeMinutes: 24,
        content: [
          "Traditional civil engineering championed static barriers: massive concrete seawalls, surge barriers, and pump stations.",
          "However, modern urban resilience embraces amphibious architecture, permeable pavements, sponge-city retention basins, and elevated transit corridors designed to accommodate episodic flooding without cataclysmic disruption."
        ]
      }
    ]
  },
  {
    id: "b007",
    title: "Organic Chemistry Made Clear",
    author: "Elena Petrova",
    year: 2018,
    language: "en",
    isbn: "9781000000073",
    subjects: ["chemistry", "organic reactions", "laboratory methods"],
    abstract: "A step-by-step guide to reaction mechanisms, with practice problems and common exam pitfalls.",
    rating: 4.75,
    reviewsCount: 670,
    coverImage: "/ai.jpg",
    coverGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    badge: "Popular",
    category: "New Arrivals",
    aiSummary: {
      executiveSummary: "A crystal-clear guide demystifying reaction mechanisms in carbon-based molecules. Elena Petrova replaces rote memorization with electron-flow logic, arrow-pushing formalism, and stereochemical spatial analysis.",
      keyTakeaways: [
        "Organic reactions are governed by nucleophile-electrophile attractions and thermodynamic stability.",
        "Mastering curved-arrow notation reveals the choreography of electron movement during bond cleavage and formation.",
        "Understanding transition states and carbocation stability (hyperconjugation and resonance) allows accurate prediction of regio- and stereoselectivity.",
        "Spectroscopy (NMR, IR, Mass Spec) provides the analytical fingerprinting toolkit for verifying synthetic pathways."
      ],
      coreConcepts: [
        { term: "Nucleophile vs Electrophile", explanation: "Electron-rich species seeking positive centers versus electron-deficient species accepting electron pairs." },
        { term: "SN1 vs SN2 Mechanisms", explanation: "Stepwise unimolecular substitution via a carbocation intermediate versus concerted bimolecular backside attack." },
        { term: "Resonance Stabilization", explanation: "Delocalization of pi electrons over adjacent p-orbitals, lowering overall molecular energy." }
      ],
      targetAudience: "Pre-med students, undergraduate chemistry and chemical engineering majors.",
      estimatedReadTime: "4 hours 45 mins",
      difficulty: "Intermediate",
      sampleQuestions: [
        "What factors favor an SN2 substitution over an SN1 pathway?",
        "How does hyperconjugation stabilize tertiary carbocations?",
        "Why is infrared spectroscopy useful for identifying functional groups?"
      ],
      quickAiAnswers: {
        "What factors favor an SN2 substitution over an SN1 pathway?": "Uncrowded primary or secondary substrates, strong nucleophiles, and polar aprotic solvents favor the single-step bimolecular SN2 route.",
        "How does hyperconjugation stabilize tertiary carbocations?": "Overlap between adjacent filled C-H sigma bonds and the empty p-orbital of the carbocation delocalizes positive charge, stabilizing the intermediate."
      }
    },
    chapters: [
      {
        id: 1,
        title: "1. The Grammar of Organic Curved Arrows",
        readTimeMinutes: 16,
        content: [
          "The greatest misconception held by incoming organic chemistry students is that success requires brute-force memorization of hundreds of named reactions.",
          "In truth, organic chemistry is a coherent symbolic language governed by a handful of fundamental principles. Curved arrows always track the movement of electrons, never positive nuclei.",
          "By mastering how electronegative atoms polarize sigma and pi bonds, you will intuitively identify where nucleophilic attacks occur without memorizing the outcome in advance."
        ]
      },
      {
        id: 2,
        title: "2. Nucleophilic Substitutions and Eliminations",
        readTimeMinutes: 20,
        content: [
          "The four fundamental pathways—SN1, SN2, E1, and E2—represent a perpetual competition determined by substrate sterics, nucleophile strength, base basicity, and solvent polarity.",
          "In this chapter, we build an infallible diagnostic decision matrix that guides you directly to the correct kinetic or thermodynamic product on every examination problem."
        ]
      }
    ]
  },
  {
    id: "b008",
    title: "Python Programming for Data Analysis",
    author: "Maria Okafor",
    year: 2025,
    language: "en",
    isbn: "9781000000080",
    subjects: ["python", "data analysis", "programming"],
    abstract: "Learn to clean, explore and visualise datasets using Python, pandas and plotting libraries.",
    rating: 4.95,
    reviewsCount: 940,
    coverImage: "/ai.jpg",
    coverGradient: "linear-gradient(135deg, #434343 0%, #000000 100%)",
    badge: "New",
    category: "New Arrivals",
    aiSummary: {
      executiveSummary: "A practical 2025 modern playbook for working with structured datasets in Python. Maria Okafor guides readers through vectorization with NumPy, tabular data wrangling with pandas 2.0, high-speed data formats (Parquet, Arrow), and storytelling visualizations.",
      keyTakeaways: [
        "Vectorized operations in NumPy and pandas deliver 50x-100x performance gains over native Python loops.",
        "Mastering data cleansing (handling missing values, datetime casting, categorical encoding) is 80% of real-world data analytics.",
        "Method chaining in pandas produces clean, readable, reproducible transformation pipelines.",
        "Interactive visualizations with Seaborn and Plotly bridge technical findings with executive decision-making."
      ],
      coreConcepts: [
        { term: "Vectorization", explanation: "Delegating computational loops to optimized underlying C routines operating on contiguous memory blocks." },
        { term: "Method Chaining", explanation: "Writing fluent pandas code where successive operations are chained in a single readable expression." },
        { term: "Exploratory Data Analysis (EDA)", explanation: "The iterative process of summarizing main characteristics of data via visual and quantitative summaries." }
      ],
      targetAudience: "Data analysts, scientists, software engineers, and researchers processing empirical datasets.",
      estimatedReadTime: "5 hours 00 mins",
      difficulty: "Beginner",
      sampleQuestions: [
        "Why is vectorization so much faster than writing Python for-loops?",
        "How do you handle missing values in pandas without distorting distributions?",
        "What is the difference between shallow and deep copies in pandas DataFrames?"
      ],
      quickAiAnswers: {
        "Why is vectorization so much faster than writing Python for-loops?": "Vectorization executes operations in low-level compiled C without Python interpreter overhead, type-checking each element, or dynamic dispatch penalties.",
        "How do you handle missing values in pandas without distorting distributions?": "Assess whether data is Missing Completely at Random (MCAR) or Missing at Random (MAR). For numerical columns, consider median imputation with missingness indicators, or domain-specific interpolation."
      }
    },
    chapters: [
      {
        id: 1,
        title: "1. The Modern Python Data Stack",
        readTimeMinutes: 15,
        content: [
          "Python's ascendancy as the dominant language for data analytics is not accidental: it combines human-friendly syntax with blistering underlying computational engines.",
          "In this opening chapter, we configure a modern reproducible environment using virtual environments, JupyterLab, and uv/pip.",
          "We explore how NumPy arrays store homogeneous data types in contiguous memory buffers, enabling CPU SIMD vector extensions to process millions of numbers in milliseconds."
        ]
      },
      {
        id: 2,
        title: "2. Data Cleansing & Transformation with pandas",
        readTimeMinutes: 22,
        content: [
          "Real-world data is notoriously messy: missing entries, inconsistent date strings, duplicate records, and skewed outliers.",
          "We delve into pandas DataFrame architecture, indexing strategies, hierarchical groupings, and robust imputation techniques.",
          "By the conclusion of this chapter, you will construct end-to-end data pipelines capable of ingesting raw CSVs and outputting analysis-ready parquet tables."
        ]
      }
    ]
  }
];

export function getBookById(id: string): BookItem | undefined {
  return INITIAL_BOOKS.find((b) => b.id.toLowerCase() === id.toLowerCase());
}

export function getAllBooks(): BookItem[] {
  return INITIAL_BOOKS;
}
