import type { AcademicCategory, CommunityStats, Discussion, TopContributor } from "../types/community";

export const ACADEMIC_CATEGORIES: AcademicCategory[] = [
  {
    id: "tech-it",
    name: "Technology & IT",
    icon: "IT",
    description: "Artificial intelligence, software engineering, cloud infrastructure, and cybersecurity.",
    discussionsCount: 142
  },
  {
    id: "research-pubs",
    name: "Research & Publications",
    icon: "RES",
    description: "Methodologies, peer-review guidance, journal submissions, and preprint reviews.",
    discussionsCount: 98
  },
  {
    id: "student-comm",
    name: "Student Community",
    icon: "STU",
    description: "Study tips, course electives, exam preparations, and peer mentoring circles.",
    discussionsCount: 230
  },
  {
    id: "science-innov",
    name: "Science & Innovation",
    icon: "SCI",
    description: "Quantum materials, bio-nanotechnology, clean energy systems, and laboratory discoveries.",
    discussionsCount: 76
  },
  {
    id: "math-stats",
    name: "Mathematics & Statistics",
    icon: "MTH",
    description: "Stochastic modeling, machine learning calculus, probability, and biostatistics.",
    discussionsCount: 85
  },
  {
    id: "eng-tech",
    name: "Engineering & Technology",
    icon: "ENG",
    description: "Robotics, structural design, embedded systems, and sustainable civil projects.",
    discussionsCount: 114
  },
  {
    id: "biz-mgmt",
    name: "Business & Management",
    icon: "BIZ",
    description: "Technology entrepreneurship, organizational behavior, econometrics, and finance.",
    discussionsCount: 64
  },
  {
    id: "general-academic",
    name: "General Academic Discussions",
    icon: "GEN",
    description: "Academic ethics, grant applications, interdisciplinary panels, and higher ed trends.",
    discussionsCount: 120
  }
];

export const INITIAL_COMMUNITY_STATS: CommunityStats = {
  totalMembers: 3840,
  totalDiscussions: 929,
  totalResources: 412,
  activeToday: 184
};

export const INITIAL_DISCUSSIONS: Discussion[] = [
  {
    id: "disc-1",
    title: "Best practices for implementing Transformer self-attention from scratch in PyTorch?",
    content: "During our postgraduate seminar on deep neural architectures, several students asked about numerical stability when computing scaled dot-product attention without using `torch.nn.MultiheadAttention`. I have drafted a clean annotated implementation showing key-query projection, scaled softmax masking, and residual dropouts. What edge cases do researchers encounter when scaling sequence lengths past 8k tokens?",
    category: "Technology & IT",
    authorName: "Dr. Chen Wei",
    authorRole: "Lecturer",
    authorAvatar: "",
    createdAt: "2 hours ago",
    likesCount: 28,
    userLiked: false,
    commentsCount: 4,
    tags: ["PyTorch", "Deep Learning", "Transformers", "NLP"],
    attachments: [
      {
        id: "att-1",
        name: "Attention_Implementation_Guide.pdf",
        size: "1.4 MB",
        type: "pdf"
      },
      {
        id: "att-2",
        name: "self_attention_benchmark.py",
        size: "24 KB",
        type: "code"
      }
    ],
    comments: [
      {
        id: "comm-1",
        discussionId: "disc-1",
        authorName: "Maria Okafor",
        authorRole: "Researcher",
        createdAt: "1 hour ago",
        content: "Excellent overview Dr. Wei! In our lab, we frequently run into CUDA out-of-memory bottlenecks past 4k context windows. Switching to FlashAttention-2 kernels or chunked linear attention made an immediate 3x difference in gradient memory footprint.",
        likesCount: 9,
        userLiked: false
      },
      {
        id: "comm-2",
        discussionId: "disc-1",
        authorName: "Priya Nair",
        authorRole: "Student",
        createdAt: "45 mins ago",
        content: "Thank you for the benchmark script! The ablation on causal mask indexing helped clarify how future token leaking is prevented during training.",
        likesCount: 3,
        userLiked: false
      }
    ]
  },
  {
    id: "disc-2",
    title: "Guidance on selecting between IEEE Transactions vs. ACM Computing Surveys for survey paper",
    content: "Our research group has completed a 32-page comprehensive taxonomy of urban flood prediction models under compound climate scenarios. We are deciding between IEEE Transactions on Geoscience and Remote Sensing vs. ACM Computing Surveys. How does the review turnaround time and interdisciplinary visibility compare for authors in 2026?",
    category: "Research & Publications",
    authorName: "Prof. Tomas Ibarra",
    authorRole: "Researcher",
    authorAvatar: "",
    createdAt: "5 hours ago",
    likesCount: 34,
    userLiked: false,
    commentsCount: 3,
    tags: ["Peer Review", "IEEE", "ACM", "Survey Paper", "Climate"],
    attachments: [
      {
        id: "att-3",
        name: "Urban_Flood_Taxonomy_Draft_Abstract.pdf",
        size: "420 KB",
        type: "pdf"
      }
    ],
    comments: [
      {
        id: "comm-3",
        discussionId: "disc-2",
        authorName: "Dr. Luc Marchand",
        authorRole: "Lecturer",
        createdAt: "3 hours ago",
        content: "If the emphasis is primarily algorithmic modeling and data-driven computational taxonomies, ACM CSUR is unrivaled for citation longevity. However, IEEE TGRS will reach specialized geotechnical and remote sensing practitioners directly.",
        likesCount: 12,
        userLiked: false
      }
    ]
  },
  {
    id: "disc-3",
    title: "Tips for managing semester coursework while writing a Final Year Thesis",
    content: "Balancing 4 core engineering modules with a major laboratory thesis project feels overwhelming. How do senior students and faculty mentors recommend structuring weekly research blocks? Are tools like Zotero and Obsidian sufficient for literature synthesis?",
    category: "Student Community",
    authorName: "Hannah Lindgren",
    authorRole: "Student",
    authorAvatar: "",
    createdAt: "Yesterday",
    likesCount: 42,
    userLiked: true,
    commentsCount: 6,
    tags: ["Time Management", "Thesis", "Zotero", "Study Habits"],
    attachments: [
      {
        id: "att-4",
        name: "Weekly_Research_TimeBlock_Template.pdf",
        size: "310 KB",
        type: "pdf"
      }
    ],
    comments: [
      {
        id: "comm-4",
        discussionId: "disc-3",
        authorName: "Priya Nair",
        authorRole: "Student",
        createdAt: "Yesterday",
        content: "Protecting a dedicated 3-hour uninterrupted morning block (8 AM - 11 AM) specifically for thesis writing before attending afternoon lectures completely saved my term.",
        likesCount: 15,
        userLiked: false
      }
    ]
  },
  {
    id: "disc-4",
    title: "Empirical verification of reaction mechanisms using 2D NMR and DFT calculations",
    content: "We recently observed unexpected regio-selectivity in organocatalytic Mannich reactions. We have compiled our NOESY spectra and energy coordinate diagrams. We welcome suggestions on validating the transition state barrier with functional B3LYP vs. M06-2X.",
    category: "Science & Innovation",
    authorName: "Dr. Elena Petrova",
    authorRole: "Researcher",
    authorAvatar: "",
    createdAt: "2 days ago",
    likesCount: 19,
    userLiked: false,
    commentsCount: 2,
    tags: ["Chemistry", "NMR", "DFT", "Catalysis"],
    attachments: [
      {
        id: "att-5",
        name: "NOESY_Spectra_Dataset.zip",
        size: "3.2 MB",
        type: "dataset"
      }
    ],
    comments: [
      {
        id: "comm-5",
        discussionId: "disc-4",
        authorName: "Dr. Luc Marchand",
        authorRole: "Lecturer",
        createdAt: "1 day ago",
        content: "M06-2X is generally far superior for non-covalent dispersion interactions in organic catalysts compared to legacy B3LYP. Consider also Grimme's D3 dispersion correction.",
        likesCount: 7,
        userLiked: false
      }
    ]
  }
];

export const TOP_CONTRIBUTORS: TopContributor[] = [
  {
    id: "c-1",
    name: "Dr. Chen Wei",
    role: "Lecturer",
    department: "Computer Science & AI",
    reputationPoints: 2450,
    contributionsCount: 84
  },
  {
    id: "c-2",
    name: "Prof. Tomas Ibarra",
    role: "Researcher",
    department: "Civil & Environmental Eng.",
    reputationPoints: 1980,
    contributionsCount: 62
  },
  {
    id: "c-3",
    name: "Maria Okafor",
    role: "Researcher",
    department: "Data Science Institute",
    reputationPoints: 1720,
    contributionsCount: 51
  },
  {
    id: "c-4",
    name: "Priya Nair",
    role: "Student",
    department: "Software Engineering",
    reputationPoints: 1410,
    contributionsCount: 43
  }
];

export const POPULAR_TOPICS = [
  "Machine Learning",
  "Peer Review",
  "Thesis Writing",
  "PyTorch",
  "Biostatistics",
  "Clean Energy",
  "Time Management",
  "Open Science"
];
