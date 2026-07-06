import type { CandidateExpression, ExpressionSense, Occurrence, Segment } from "@art/domain";

const generatedAt = "2026-06-13T00:00:00.000Z";
const baseCandidate = {
  userId: "user-1",
  articleId: "article-sample",
  segmentId: "segment-1",
  modelProvider: "fixture",
  modelName: "fixture-v1",
  promptVersion: "prompt-v1",
  generationVersion: "generation-v1",
  generatedAt,
  occurrenceCount: 1
} satisfies Partial<CandidateExpression>;

export const sampleSegment: Segment = {
  id: "segment-1",
  userId: "user-1",
  articleId: "article-sample",
  sequence: 1,
  text: "When the city began to roll out its new reading program, teachers noticed that momentum did not arrive all at once. The first group of students needed simple routines before the habit could pick up steam. Each lesson asked them to read the original paragraph first, then pause on a few expressions that carried the writer's meaning. Instead of turning the page into a dictionary, the tool offered a short local meaning and saved deeper notes for a second tap. This helped learners keep pace with the article while still collecting language worth reviewing later. Extra candidates could shore up understanding, but they stayed outside the main passage unless the learner wanted more.",
  wordCount: 109,
  generationStatus: "generated",
  progressStatus: "reading",
  createdAt: generatedAt,
  updatedAt: generatedAt,
  deletedAt: null
};

export const selectedCandidateIds = [
  "candidate-roll-out",
  "candidate-pick-up-steam",
  "candidate-keep-pace-with"
] as const;

export const sampleCandidates: CandidateExpression[] = [
  {
    ...baseCandidate,
    id: "candidate-roll-out",
    expression: "roll out",
    normalizedForm: "roll out",
    type: "phrasal_verb",
    meaningZh: "推出、发布",
    localMeaning: "make a new program available",
    sentence: "When the city began to roll out its new reading program, teachers noticed that momentum did not arrive all at once.",
    sentenceTranslation: "当这座城市开始推出新的阅读项目时，老师们注意到势头并不是一下子就形成的。",
    syntaxHint: "Main action: the city began to roll out the program.",
    difficulty: "B2",
    valueScore: 94,
    candidateStatus: "selected",
    statusReason: "High-value phrasal verb for product and policy contexts."
  },
  {
    ...baseCandidate,
    id: "candidate-pick-up-steam",
    expression: "pick up steam",
    normalizedForm: "pick up steam",
    type: "idiom",
    meaningZh: "逐渐加速、势头增强",
    localMeaning: "become stronger over time",
    sentence: "The first group of students needed simple routines before the habit could pick up steam.",
    sentenceTranslation: "第一批学生需要简单的固定流程，这个习惯之后才能逐渐形成势头。",
    syntaxHint: "The habit is the subject that becomes stronger.",
    difficulty: "B2",
    valueScore: 90,
    candidateStatus: "selected",
    statusReason: "Useful idiom for describing momentum."
  },
  {
    ...baseCandidate,
    id: "candidate-keep-pace-with",
    expression: "keep pace with",
    normalizedForm: "keep pace with",
    type: "collocation",
    meaningZh: "跟上、保持同步",
    localMeaning: "continue without falling behind",
    sentence: "This helped learners keep pace with the article while still collecting language worth reviewing later.",
    sentenceTranslation: "这帮助学习者跟上文章，同时仍能收集值得之后复习的语言。",
    syntaxHint: "keep pace with + noun means not fall behind it.",
    difficulty: "B1",
    valueScore: 88,
    candidateStatus: "selected",
    statusReason: "Common academic and workplace expression."
  },
  {
    ...baseCandidate,
    id: "candidate-shore-up",
    expression: "shore up",
    normalizedForm: "shore up",
    type: "phrasal_verb",
    meaningZh: "支撑、加强",
    localMeaning: "support something weak",
    sentence: "Extra candidates could shore up understanding, but they stayed outside the main passage unless the learner wanted more.",
    sentenceTranslation: "额外候选表达可以加强理解，但除非学习者想看更多，否则它们留在正文之外。",
    syntaxHint: "shore up + noun means strengthen it.",
    difficulty: "C1",
    valueScore: 80,
    candidateStatus: "backup_candidate",
    statusReason: "Useful but not essential for the main highlight limit."
  },
  {
    ...baseCandidate,
    id: "candidate-all-at-once",
    expression: "all at once",
    normalizedForm: "all at once",
    type: "collocation",
    meaningZh: "一下子、同时",
    localMeaning: "suddenly or together",
    sentence: "Teachers noticed that momentum did not arrive all at once.",
    sentenceTranslation: "老师们注意到势头并不是一下子就形成的。",
    syntaxHint: null,
    difficulty: "B1",
    valueScore: 76,
    candidateStatus: "ignored_over_limit",
    statusReason: "Useful, but suppressed by the segment highlight limit."
  }
];

export const sampleExpressionSenses: ExpressionSense[] = [
  {
    id: "sense-roll-out",
    userId: "user-1",
    expression: "roll out",
    normalizedForm: "roll out",
    type: "phrasal_verb",
    meaningZh: "推出、发布",
    difficulty: "B2",
    masteryStatus: "new",
    srsDueAt: null,
    reviewCount: 0,
    occurrenceCount: 1,
    mistakeCount: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    lapseCount: 0,
    createdAt: generatedAt,
    updatedAt: generatedAt,
    deletedAt: null
  },
  {
    id: "sense-pick-up-steam",
    userId: "user-1",
    expression: "pick up steam",
    normalizedForm: "pick up steam",
    type: "idiom",
    meaningZh: "逐渐加速、势头增强",
    difficulty: "B2",
    masteryStatus: "learning",
    srsDueAt: "2026-06-13T00:00:00.000Z",
    reviewCount: 0,
    occurrenceCount: 1,
    mistakeCount: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    lapseCount: 0,
    createdAt: generatedAt,
    updatedAt: generatedAt,
    deletedAt: null
  }
];

export const sampleOccurrences: Occurrence[] = [
  {
    id: "occurrence-roll-out",
    userId: "user-1",
    expressionSenseId: "sense-roll-out",
    articleId: "article-sample",
    segmentId: "segment-1",
    sentence: sampleCandidates[0]!.sentence,
    sentenceTranslation: sampleCandidates[0]!.sentenceTranslation,
    localMeaning: sampleCandidates[0]!.localMeaning,
    syntaxHint: sampleCandidates[0]!.syntaxHint,
    createdAt: generatedAt,
    updatedAt: generatedAt,
    deletedAt: null
  },
  {
    id: "occurrence-pick-up-steam",
    userId: "user-1",
    expressionSenseId: "sense-pick-up-steam",
    articleId: "article-sample",
    segmentId: "segment-1",
    sentence: sampleCandidates[1]!.sentence,
    sentenceTranslation: sampleCandidates[1]!.sentenceTranslation,
    localMeaning: sampleCandidates[1]!.localMeaning,
    syntaxHint: sampleCandidates[1]!.syntaxHint,
    createdAt: generatedAt,
    updatedAt: generatedAt,
    deletedAt: null
  }
];
