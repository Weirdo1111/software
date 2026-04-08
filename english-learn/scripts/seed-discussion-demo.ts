import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type UserKey =
  | "you"
  | "mia"
  | "tutor"
  | "admin"
  | "edison"
  | "tianbo"
  | "wzx"
  | "bob";

type CommentSeed = {
  author: UserKey;
  content: string;
  minutesAfter: number;
};

type PostSeed = {
  category: "grammar" | "listening" | "reading" | "writing" | "speaking" | "assessment" | "experience";
  title: string;
  content: string;
  author: UserKey;
  views: number;
  likes: UserKey[];
  comments: CommentSeed[];
};

const userAliases: Record<UserKey, string[]> = {
  you: ["you"],
  mia: ["mia"],
  tutor: ["tutor-team"],
  admin: ["admin"],
  edison: ["Edison", "edison"],
  tianbo: ["tianbo"],
  wzx: ["wzx", "wax"],
  bob: ["bob"],
};

const posts: PostSeed[] = [
  {
    category: "grammar",
    title: "When should I use \"the\" before abstract nouns in academic writing?",
    content:
      "I understand the general rule that abstract nouns often appear without an article, but in research summaries I still hesitate with phrases like \"the education system\", \"education\", and \"the importance of education\". I want a practical rule for deciding when the noun is general and when it is specific enough to need \"the\".",
    author: "edison",
    views: 82,
    likes: ["mia", "tutor", "tianbo"],
    comments: [
      {
        author: "tutor",
        minutesAfter: 45,
        content:
          "A useful test is whether the noun points to one identifiable system, idea, or context. If your reader can ask \"which one?\" and you can answer it from the sentence, \"the\" is usually justified.",
      },
      {
        author: "mia",
        minutesAfter: 130,
        content:
          "I fixed this by collecting examples from journal abstracts. Seeing pairs like \"education is essential\" versus \"the education system in Finland\" made the distinction much clearer.",
      },
    ],
  },
  {
    category: "grammar",
    title: "How can I stop mixing present perfect and past simple in reports?",
    content:
      "My teacher keeps marking tense shifts in my weekly progress reports. I know present perfect connects past actions to the present, but when I explain what I studied last week and what effect it has now, I keep switching tenses inconsistently. I need a cleaner way to think about timeline and result.",
    author: "wzx",
    views: 67,
    likes: ["you", "tutor"],
    comments: [
      {
        author: "you",
        minutesAfter: 55,
        content:
          "What helped me was separating event sentences from result sentences. I write the finished action in past simple first, then add one sentence in present perfect only if the current result still matters.",
      },
      {
        author: "tutor",
        minutesAfter: 180,
        content:
          "That is a solid strategy. Another check is whether you can add a finished time marker like \"yesterday\" or \"last week\". If yes, present perfect is usually the wrong choice.",
      },
    ],
  },
  {
    category: "listening",
    title: "How do you catch signposting in fast lecture recordings?",
    content:
      "I usually understand key vocabulary, but I still miss the structure of longer lectures. The speaker moves from examples to arguments so quickly that I only notice the shift after it has already happened. I want a method for training myself to hear signposting language early enough to organize notes better.",
    author: "you",
    views: 96,
    likes: ["mia", "tutor", "admin"],
    comments: [
      {
        author: "tutor",
        minutesAfter: 30,
        content:
          "Try building a personal list of transition phrases by function: contrast, cause, concession, summary, and emphasis. Repeated exposure makes them stand out faster than trying to listen for every content word.",
      },
      {
        author: "admin",
        minutesAfter: 155,
        content:
          "I also leave a wide margin in my notes just for structure markers. Writing \"new point\", \"example\", or \"counterargument\" is often enough to keep the lecture organized.",
      },
    ],
  },
  {
    category: "listening",
    title: "What is the best way to review a lecture without replaying everything?",
    content:
      "After each listening practice, I replay too much of the recording and end up spending nearly twice the original lecture time on review. I want a more efficient process that helps me identify where my breakdown happened without turning review into another full listening session.",
    author: "mia",
    views: 74,
    likes: ["you", "tutor", "edison"],
    comments: [
      {
        author: "edison",
        minutesAfter: 40,
        content:
          "I now review in three layers: first the question I missed, then the exact sentence that answered it, then the reason I missed it. That cut my review time a lot.",
      },
      {
        author: "tutor",
        minutesAfter: 125,
        content:
          "That is efficient because it targets the processing failure. If you classify the mistake as vocabulary, attention, note-taking, or inference, patterns become visible after a few sessions.",
      },
    ],
  },
  {
    category: "reading",
    title: "How do you stop rereading dense academic paragraphs?",
    content:
      "In reading practice I often understand a paragraph sentence by sentence, but I still feel uncertain about the whole meaning and end up rereading it two or three times. This slows me down so much that I panic later in the passage. I want a strategy that improves certainty without constant backtracking.",
    author: "tianbo",
    views: 88,
    likes: ["mia", "tutor", "bob"],
    comments: [
      {
        author: "bob",
        minutesAfter: 70,
        content:
          "I force myself to write a five-word summary after each paragraph before moving on. If I cannot do that, I know exactly where the gap is instead of rereading everything blindly.",
      },
      {
        author: "tutor",
        minutesAfter: 150,
        content:
          "That works because it converts passive reading into a comprehension check. You can also mark only one sentence to revisit later instead of looping through the full paragraph immediately.",
      },
    ],
  },
  {
    category: "reading",
    title: "Which annotation method actually helps with inference questions?",
    content:
      "I have tried underlining a lot, but during review the page just looks crowded and I still miss inference questions. I want to know whether people are marking relationships, author attitude, evidence, or something else that makes difficult questions easier to answer under time pressure.",
    author: "edison",
    views: 64,
    likes: ["you", "mia"],
    comments: [
      {
        author: "you",
        minutesAfter: 35,
        content:
          "I stopped underlining full phrases and only circle attitude words plus arrows for contrast and cause. It looks much cleaner and helps me locate the author's position quickly.",
      },
      {
        author: "mia",
        minutesAfter: 95,
        content:
          "Same here. I also put a question mark next to any sentence that feels like an implied claim, because those often become inference questions later.",
      },
    ],
  },
  {
    category: "writing",
    title: "How do you build stronger topic sentences in essays?",
    content:
      "My body paragraphs are usually clear once I start explaining examples, but my topic sentences sound vague and generic. They often repeat the question instead of making a focused claim. I want to improve paragraph openings so the reader immediately understands the argument direction.",
    author: "you",
    views: 101,
    likes: ["tutor", "edison", "wzx"],
    comments: [
      {
        author: "tutor",
        minutesAfter: 25,
        content:
          "A strong topic sentence should do more than announce the theme. It should state the paragraph's position, ideally with a clear limitation or mechanism, so the explanation that follows feels inevitable.",
      },
      {
        author: "wzx",
        minutesAfter: 115,
        content:
          "I started drafting topic sentences after outlining examples, not before. That made them much more specific because I already knew what evidence the paragraph would use.",
      },
    ],
  },
  {
    category: "writing",
    title: "How can I reduce repetitive linking words in academic writing?",
    content:
      "When I reread my essays, I notice I rely on \"however\", \"therefore\", and \"moreover\" too often. The logic is correct, but the writing sounds mechanical. I would like a better way to create flow without forcing the same connectors into every paragraph and sentence.",
    author: "mia",
    views: 59,
    likes: ["you", "tutor"],
    comments: [
      {
        author: "edison",
        minutesAfter: 50,
        content:
          "I replaced many connectors with sentence structure instead. For example, contrast can come from concession clauses or from ordering information more carefully, not only from a transition word.",
      },
      {
        author: "tutor",
        minutesAfter: 170,
        content:
          "Exactly. If the logical relation is already obvious from the sentence pattern, adding a connector may be redundant. Cohesion should feel earned, not decorative.",
      },
    ],
  },
  {
    category: "speaking",
    title: "How do you sound natural in pair discussions when nervous?",
    content:
      "During speaking practice I know what I want to say, but as soon as the discussion starts I become overly formal and start producing memorized phrases. The result is grammatically safe but not conversational. I want to sound more responsive and natural without losing control completely.",
    author: "bob",
    views: 76,
    likes: ["you", "mia", "tutor"],
    comments: [
      {
        author: "mia",
        minutesAfter: 45,
        content:
          "I practiced with a small bank of reaction starters instead of full memorized answers: \"I see your point\", \"That depends\", \"I would partly agree\". That gave me flexibility without freezing.",
      },
      {
        author: "tutor",
        minutesAfter: 140,
        content:
          "Natural speaking usually comes from managing turns, not sounding advanced. If you can respond directly to your partner and then extend one idea, the interaction already feels more authentic.",
      },
    ],
  },
  {
    category: "speaking",
    title: "What is the best way to extend answers without rambling?",
    content:
      "I understand that short answers hurt my speaking score, but when I try to add detail I sometimes drift away from the question. I need a simple structure for extending answers that still feels relevant and spontaneous rather than memorized.",
    author: "wzx",
    views: 70,
    likes: ["you", "tianbo", "tutor"],
    comments: [
      {
        author: "you",
        minutesAfter: 65,
        content:
          "I use a quick three-step pattern: answer, reason, example. If I still have time, I add a short comparison. That keeps me focused and stops the answer from becoming random.",
      },
      {
        author: "tianbo",
        minutesAfter: 125,
        content:
          "The comparison step is underrated. It gives you one more layer of detail without forcing a long story.",
      },
    ],
  },
  {
    category: "assessment",
    title: "What should a final-week mock exam routine look like?",
    content:
      "I have one week before an internal assessment and I am unsure whether I should keep studying new material or focus entirely on timed mocks. I want a realistic routine that balances stamina, error review, and confidence instead of just doing random full tests every day.",
    author: "admin",
    views: 93,
    likes: ["you", "tutor", "edison"],
    comments: [
      {
        author: "tutor",
        minutesAfter: 20,
        content:
          "The final week should be selective. Full mocks are useful, but only if there is time to review them properly. Otherwise you are mainly rehearsing mistakes and fatigue.",
      },
      {
        author: "edison",
        minutesAfter: 110,
        content:
          "Before my last exam, I alternated one full mock day with one targeted review day. My confidence improved because I could actually fix something between tests.",
      },
    ],
  },
  {
    category: "assessment",
    title: "How do you review mistakes after a diagnostic test efficiently?",
    content:
      "I did a full diagnostic test and ended up with too many corrections to review. Some mistakes were careless, some were vocabulary gaps, and some were strategy problems. I need a system for sorting them so the review becomes useful instead of just a long list of red marks.",
    author: "tianbo",
    views: 62,
    likes: ["mia", "tutor", "admin"],
    comments: [
      {
        author: "admin",
        minutesAfter: 35,
        content:
          "I divide errors into three buckets: knowledge, process, and timing. That simple classification tells me whether I need study, a new strategy, or better pacing practice.",
      },
      {
        author: "tutor",
        minutesAfter: 145,
        content:
          "That classification is strong because it leads directly to action. A mistake log is only valuable if each line ends with the next practice decision.",
      },
    ],
  },
  {
    category: "experience",
    title: "Three weeks of listening notes finally changed my accuracy",
    content:
      "I used to listen passively and hope repetition would fix everything. Three weeks ago I started keeping a small notebook only for signposting phrases, cause-effect markers, and summary cues from lecture practice. My raw listening score did not jump immediately, but I stopped losing track of the lecture structure. That change alone made review much faster and my accuracy started rising in the second week.",
    author: "mia",
    views: 118,
    likes: ["you", "tutor", "edison"],
    comments: [
      {
        author: "you",
        minutesAfter: 40,
        content:
          "This is the kind of routine I needed to hear about. The part about review getting faster is especially convincing, because that usually shows the method is actually changing processing, not just motivation.",
      },
      {
        author: "tutor",
        minutesAfter: 155,
        content:
          "Exactly. Improvement often appears first as better control and cleaner review, then later as higher scores. The notebook gave you a sharper listening target.",
      },
    ],
  },
  {
    category: "experience",
    title: "Recording myself for speaking practice was uncomfortable but worth it",
    content:
      "I avoided recording my speaking for months because hearing myself felt awkward. When I finally started, the biggest surprise was not pronunciation but hesitation. I was pausing before simple linking ideas because I had never noticed how much time I wasted planning transitions. After one week of short daily recordings, I became more comfortable giving direct answers and then extending them calmly.",
    author: "you",
    views: 131,
    likes: ["mia", "tutor", "bob"],
    comments: [
      {
        author: "bob",
        minutesAfter: 60,
        content:
          "Same experience here. The silence between ideas sounded much longer on the recording than it felt while speaking.",
      },
      {
        author: "tutor",
        minutesAfter: 135,
        content:
          "That is why self-recording is powerful. It reveals pacing problems that are almost invisible in the moment.",
      },
    ],
  },
  {
    category: "experience",
    title: "A tiny reading habit made dense passages less intimidating",
    content:
      "My reading practice improved after I adopted one tiny habit: after every paragraph, I write a six-word summary in the margin. It sounds too simple, but it forced me to keep the main point active while moving forward. I still meet unknown vocabulary, yet I panic far less because I know what the paragraph is doing even when one sentence feels heavy.",
    author: "edison",
    views: 109,
    likes: ["you", "mia", "tianbo"],
    comments: [
      {
        author: "tianbo",
        minutesAfter: 50,
        content:
          "I started doing something similar last month and it really cuts down rereading. The summary is like a checkpoint for confidence.",
      },
      {
        author: "mia",
        minutesAfter: 120,
        content:
          "Six words is a good limit. If the summary gets longer, it becomes another paragraph instead of a quick comprehension check.",
      },
    ],
  },
  {
    category: "experience",
    title: "Keeping a shared error log with classmates actually worked",
    content:
      "Two classmates and I created a shared spreadsheet for recurring mistakes across grammar, writing, and speaking practice. We only added errors that repeated at least twice, and each line had one short fix strategy. That prevented the sheet from turning into a giant archive of everything. The best part was seeing that other people were struggling with almost the same patterns I thought were uniquely mine.",
    author: "tianbo",
    views: 87,
    likes: ["you", "admin", "tutor"],
    comments: [
      {
        author: "admin",
        minutesAfter: 30,
        content:
          "The rule about repeated mistakes is smart. Most error logs fail because they become too broad to review consistently.",
      },
      {
        author: "you",
        minutesAfter: 145,
        content:
          "I also like the emotional side of this. Shared patterns make practice feel less isolating and more systematic.",
      },
    ],
  },
  {
    category: "experience",
    title: "My biggest mistake was memorizing essay templates too aggressively",
    content:
      "At first I thought better writing meant collecting stronger-looking sentences. I memorized introductions, transitions, and conclusion patterns until my essays sounded polished but inflexible. The problem was that I kept forcing the same structure onto different questions. Once I reduced memorization and spent more time planning argument flow, my essays became less impressive on the surface but much clearer overall.",
    author: "admin",
    views: 95,
    likes: ["you", "edison", "tutor"],
    comments: [
      {
        author: "edison",
        minutesAfter: 75,
        content:
          "This matches my experience. Templates helped me feel safe, but they also hid weak thinking because the language looked organized even when the logic was not.",
      },
      {
        author: "tutor",
        minutesAfter: 160,
        content:
          "Exactly. Templates are only useful when they support thinking. Once they start replacing thinking, clarity suffers.",
      },
    ],
  },
];

function excerptFromContent(content: string) {
  return content.length > 140 ? `${content.slice(0, 140)}...` : content;
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, displayName: true },
    orderBy: { id: "asc" },
  });

  if (users.length < 4) {
    throw new Error("At least 4 users are required before seeding discussion demo data.");
  }

  const fallbackUsers = [...users];
  const resolvedUsers = new Map<UserKey, (typeof users)[number]>();

  const resolveUser = (key: UserKey) => {
    if (resolvedUsers.has(key)) {
      return resolvedUsers.get(key)!;
    }

    const aliases = userAliases[key];
    const found =
      users.find((user) => aliases.includes(user.username)) ??
      fallbackUsers[resolvedUsers.size % fallbackUsers.length];

    resolvedUsers.set(key, found);
    return found;
  };

  await prisma.$transaction([
    prisma.discussionNotification.deleteMany(),
    prisma.discussionPostLike.deleteMany(),
    prisma.discussionComment.deleteMany(),
    prisma.discussionPost.deleteMany(),
  ]);

  const now = Date.now();

  for (const [index, postSeed] of posts.entries()) {
    const author = resolveUser(postSeed.author);
    const createdAt = new Date(now - (posts.length - index) * 6 * 60 * 60 * 1000);

    const createdPost = await prisma.discussionPost.create({
      data: {
        authorId: author.id,
        title: postSeed.title,
        content: postSeed.content,
        excerpt: excerptFromContent(postSeed.content),
        category: postSeed.category,
        pinned: false,
        viewsCount: postSeed.views,
        likesCount: 0,
        commentsCount: 0,
        lastActivityType: "posted",
        lastActivityUserId: author.id,
        lastActivityAt: createdAt,
        createdAt,
      },
    });

    let lastActivityAt = createdAt;
    let lastActivityUserId = author.id;

    for (const commentSeed of postSeed.comments) {
      const commentAuthor = resolveUser(commentSeed.author);
      const commentCreatedAt = new Date(createdAt.getTime() + commentSeed.minutesAfter * 60 * 1000);
      await prisma.discussionComment.create({
        data: {
          postId: createdPost.id,
          authorId: commentAuthor.id,
          content: commentSeed.content,
          createdAt: commentCreatedAt,
        },
      });
      lastActivityAt = commentCreatedAt;
      lastActivityUserId = commentAuthor.id;
    }

    for (const likerKey of [...new Set(postSeed.likes.filter((key) => resolveUser(key).id !== author.id))]) {
      const liker = resolveUser(likerKey);
      await prisma.discussionPostLike.create({
        data: {
          postId: createdPost.id,
          userId: liker.id,
        },
      });
    }

    await prisma.discussionPost.update({
      where: { id: createdPost.id },
      data: {
        commentsCount: postSeed.comments.length,
        likesCount: [...new Set(postSeed.likes.filter((key) => resolveUser(key).id !== author.id))].length,
        lastActivityType: postSeed.comments.length > 0 ? "commented" : "posted",
        lastActivityUserId,
        lastActivityAt,
      },
    });
  }

  const categoryCounts = await prisma.$queryRawUnsafe<
    Array<{ category: string; count: bigint }>
  >(`
    SELECT category, COUNT(*) AS count
    FROM discussion_posts
    GROUP BY category
    ORDER BY category
  `);

  console.log(
    JSON.stringify(
      categoryCounts,
      (_, value) => (typeof value === "bigint" ? value.toString() : value),
      2,
    ),
  );
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
