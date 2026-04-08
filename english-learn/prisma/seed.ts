import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedUser = {
  username: string;
  displayName: string;
  email: string;
};

type SeedComment = {
  author: string;
  content: string;
};

type SeedPost = {
  title: string;
  content: string;
  excerpt: string;
  category: "grammar" | "listening" | "reading" | "writing" | "speaking" | "assessment" | "experience";
  author: string;
  pinned?: boolean;
  views: number;
  likes: string[];
  comments: SeedComment[];
};

const seedUsers: SeedUser[] = [
  { username: "you", displayName: "You", email: "you@example.com" },
  { username: "mia", displayName: "Mia", email: "mia@example.com" },
  { username: "tutor-team", displayName: "Tutor Team", email: "tutor@example.com" },
  { username: "chen-hao", displayName: "Chen Hao", email: "chenhao@example.com" },
  { username: "lina-w", displayName: "Lina Wang", email: "linawang@example.com" },
  { username: "rita-xu", displayName: "Rita Xu", email: "ritaxu@example.com" },
  { username: "ethan-z", displayName: "Ethan Zhou", email: "ethanzhou@example.com" },
  { username: "ivy-luo", displayName: "Ivy Luo", email: "ivy.luo@example.com" },
];

const seededDiscussionPosts: SeedPost[] = [
  {
    title: "Difference between reduced relative clauses and full clauses in reports",
    content:
      "In lab reports, I often hesitate between 'the data collected' and 'the data that was collected'. Is there a simple rule for when reduced clauses sound natural in academic writing?",
    excerpt: "When should we use reduced relative clauses in academic reports?",
    category: "grammar",
    author: "chen-hao",
    views: 126,
    likes: ["mia", "ivy-luo"],
    comments: [
      {
        author: "tutor-team",
        content: "Use reduced clauses when meaning is clear and the noun is already specific in context.",
      },
      {
        author: "lina-w",
        content: "I check if adding 'that was' changes emphasis. If not, I reduce it.",
      },
    ],
  },
  {
    title: "How to avoid article errors in engineering abstracts",
    content:
      "My biggest grammar issue is missing 'a/the' when I write technical abstracts. Do you have a practical checklist before submission?",
    excerpt: "Need a quick article checklist for engineering abstracts.",
    category: "grammar",
    author: "lina-w",
    views: 103,
    likes: ["you"],
    comments: [
      {
        author: "ethan-z",
        content: "I only re-read nouns in the last pass and mark first mention vs known reference.",
      },
    ],
  },
  {
    title: "Strategy for TED talks at 1.25x without losing structure",
    content:
      "I can catch vocabulary at 1.0x, but at 1.25x I lose the argument flow. How do you keep up with structure and not just words?",
    excerpt: "Need a method to keep argument structure at 1.25x TED speed.",
    category: "listening",
    author: "mia",
    pinned: true,
    views: 214,
    likes: ["you", "chen-hao", "ivy-luo"],
    comments: [
      {
        author: "tutor-team",
        content: "Track only three layers: claim, reason, and example. Pause and summarize every two minutes.",
      },
    ],
  },
  {
    title: "How I mark signpost language during lecture listening",
    content:
      "I started writing only signpost phrases like 'however', 'in contrast', and 'to summarize'. It helped me map lecture logic much faster.",
    excerpt: "Signpost-first note-taking improved my lecture listening results.",
    category: "listening",
    author: "ivy-luo",
    views: 131,
    likes: ["rita-xu", "you"],
    comments: [
      {
        author: "chen-hao",
        content: "Same here. I use arrows for transitions and stars for conclusions.",
      },
      {
        author: "tutor-team",
        content: "Great strategy. Pair this with one-line section summaries.",
      },
    ],
  },
  {
    title: "Fast way to read journal introductions before class",
    content:
      "Before seminars, I only have 20 minutes to preview papers. Which parts of the introduction should I prioritize to join discussion confidently?",
    excerpt: "How to extract key points from journal introductions quickly.",
    category: "reading",
    author: "ethan-z",
    views: 118,
    likes: ["mia"],
    comments: [
      {
        author: "tutor-team",
        content: "Focus on problem statement, research gap, and contribution sentence.",
      },
    ],
  },
  {
    title: "How to annotate claim-evidence links in long passages",
    content:
      "I now annotate each paragraph with C/E tags (claim or evidence). It improved my reading speed and answer accuracy in detail questions.",
    excerpt: "C/E annotation made long passages easier to process.",
    category: "reading",
    author: "rita-xu",
    views: 96,
    likes: ["you", "ivy-luo"],
    comments: [
      {
        author: "lina-w",
        content: "This works especially well for science texts with dense examples.",
      },
    ],
  },
  {
    title: "Template for problem-solution paragraphs in coursework",
    content:
      "I need a stable paragraph structure for writing assignments. What sentence pattern do you use to present a problem and propose a clear solution?",
    excerpt: "Looking for a reliable problem-solution writing template.",
    category: "writing",
    author: "you",
    views: 149,
    likes: ["mia", "chen-hao"],
    comments: [
      {
        author: "tutor-team",
        content: "Try: context -> problem -> impact -> solution -> expected outcome. Keep each step to one sentence first.",
      },
    ],
  },
  {
    title: "Peer checklist before submitting weekly writing",
    content:
      "Our group made a 6-point checklist: thesis clarity, paragraph topic sentence, evidence relevance, transitions, grammar, and tone. Sharing in case useful.",
    excerpt: "A short peer checklist for weekly writing submissions.",
    category: "writing",
    author: "chen-hao",
    views: 108,
    likes: ["lina-w", "you", "ethan-z"],
    comments: [
      {
        author: "ivy-luo",
        content: "Adding one more: check whether every paragraph links back to the thesis.",
      },
    ],
  },
  {
    title: "How to answer follow-up questions in seminar discussions",
    content:
      "I can prepare opening statements, but follow-up questions still make me freeze. Any structure for answering under pressure?",
    excerpt: "Need a structure for handling seminar follow-up questions.",
    category: "speaking",
    author: "lina-w",
    views: 172,
    likes: ["you", "mia"],
    comments: [
      {
        author: "tutor-team",
        content: "Use P-R-E: point, reason, example. Keep answers under 40 seconds.",
      },
    ],
  },
  {
    title: "Useful fillers that sound natural in academic speaking",
    content:
      "I replaced casual fillers with phrases like 'from my perspective' and 'to clarify this point'. It sounds more formal during oral tasks.",
    excerpt: "Academic-friendly filler phrases for speaking tasks.",
    category: "speaking",
    author: "ivy-luo",
    views: 121,
    likes: ["rita-xu"],
    comments: [
      {
        author: "ethan-z",
        content: "I also use 'building on that' before adding a new argument.",
      },
      {
        author: "tutor-team",
        content: "Great list. Avoid overusing one filler repeatedly.",
      },
    ],
  },
  {
    title: "What to do in the first 10 minutes of placement retest",
    content:
      "I lost points last time because I rushed. What should we prioritize in the first 10 minutes to stabilize performance?",
    excerpt: "Need a first-10-minute strategy for placement retest.",
    category: "assessment",
    author: "you",
    views: 137,
    likes: ["mia", "chen-hao"],
    comments: [
      {
        author: "tutor-team",
        content: "Set pacing first: quick scan, easy wins, then medium difficulty items.",
      },
    ],
  },
  {
    title: "Score dropped in speaking but improved in reading",
    content:
      "My latest result shows speaking down by one band while reading went up. Has anyone handled this kind of uneven progress effectively?",
    excerpt: "How to respond to uneven progress across skills.",
    category: "assessment",
    author: "rita-xu",
    views: 111,
    likes: ["you"],
    comments: [
      {
        author: "mia",
        content: "I had the same issue. Adding daily 10-minute speaking drills fixed it in two weeks.",
      },
    ],
  },
  {
    title: "Week 3 progress report: from avoiding speaking to daily practice",
    content:
      "I used to skip speaking tasks. This week I did one short speaking prompt every day and finally feel less anxious.",
    excerpt: "Small daily speaking tasks reduced my anxiety significantly.",
    category: "experience",
    author: "mia",
    views: 188,
    likes: ["you", "chen-hao", "rita-xu"],
    comments: [
      {
        author: "tutor-team",
        content: "Excellent momentum. Consistency beats long but irregular sessions.",
      },
    ],
  },
  {
    title: "How buddy reminders helped me finish the weekly plan",
    content:
      "The reminder bubbles were annoying at first, but they kept me on track. I completed all planned tasks for the first time this week.",
    excerpt: "Buddy reminders unexpectedly improved my completion rate.",
    category: "experience",
    author: "ethan-z",
    views: 144,
    likes: ["you", "ivy-luo"],
    comments: [
      {
        author: "lina-w",
        content: "Same here. I now set reminders after each class block.",
      },
    ],
  },
  {
    title: "What actually worked in my first study sprint",
    content:
      "I reduced task switching by grouping listening and speaking together. My focus improved and I finished faster.",
    excerpt: "Grouping related tasks reduced context-switching fatigue.",
    category: "experience",
    author: "chen-hao",
    views: 129,
    likes: ["mia"],
    comments: [
      {
        author: "you",
        content: "Thanks for sharing. I will try a similar block schedule this week.",
      },
    ],
  },
  {
    title: "Balancing major courses and English tasks during midterms",
    content:
      "During midterms, I switched to a lighter English schedule but kept continuity with short review sessions. It prevented backsliding.",
    excerpt: "A lighter but consistent schedule during midterms worked well.",
    category: "experience",
    author: "lina-w",
    views: 116,
    likes: ["you", "rita-xu"],
    comments: [
      {
        author: "tutor-team",
        content: "Great strategy. Keep one core task per day even in peak weeks.",
      },
    ],
  },
  {
    title: "Mistakes I made in my first month and what I changed",
    content:
      "I focused too much on passive input and ignored output. After adding short speaking and writing tasks, my retention improved.",
    excerpt: "Early mistakes and practical adjustments from month one.",
    category: "experience",
    author: "ivy-luo",
    views: 152,
    likes: ["mia", "you", "ethan-z"],
    comments: [
      {
        author: "chen-hao",
        content: "The same happened to me. Output tasks made a huge difference.",
      },
      {
        author: "tutor-team",
        content: "Excellent reflection. Keep this input-output balance.",
      },
    ],
  },
];

function requireUserId(userIds: Map<string, bigint>, username: string) {
  const id = userIds.get(username);
  if (!id) {
    throw new Error(`Missing seeded user: ${username}`);
  }

  return id;
}

async function ensureSeedUsers() {
  const userIds = new Map<string, bigint>();

  for (const seedUser of seedUsers) {
    const user = await prisma.user.upsert({
      where: { username: seedUser.username },
      update: {
        authProvider: "seed",
        authUserId: `seed-${seedUser.username}`,
        email: seedUser.email,
        displayName: seedUser.displayName,
      },
      create: {
        username: seedUser.username,
        authProvider: "seed",
        authUserId: `seed-${seedUser.username}`,
        email: seedUser.email,
        displayName: seedUser.displayName,
      },
    });

    userIds.set(seedUser.username, user.id);
  }

  return userIds;
}

async function removeObviousTestPosts() {
  await prisma.discussionPost.deleteMany({
    where: {
      OR: [
        { title: { contains: "test" } },
        { title: { contains: "Test" } },
        { title: { contains: "TEST" } },
        { title: { contains: "测试" } },
        { title: { contains: "demo" } },
        { title: { contains: "Demo" } },
        { title: { contains: "sample" } },
        { title: { contains: "Sample" } },
      ],
    },
  });
}

async function seedDiscussionPosts(userIds: Map<string, bigint>) {
  for (const seedPost of seededDiscussionPosts) {
    const authorId = requireUserId(userIds, seedPost.author);

    const existing = await prisma.discussionPost.findFirst({
      where: { title: seedPost.title },
      select: { id: true },
    });

    const post =
      existing
        ? await prisma.discussionPost.update({
            where: { id: existing.id },
            data: {
              authorId,
              title: seedPost.title,
              content: seedPost.content,
              excerpt: seedPost.excerpt,
              category: seedPost.category,
              pinned: seedPost.pinned ?? false,
            },
            select: { id: true },
          })
        : await prisma.discussionPost.create({
            data: {
              authorId,
              title: seedPost.title,
              content: seedPost.content,
              excerpt: seedPost.excerpt,
              category: seedPost.category,
              pinned: seedPost.pinned ?? false,
              viewsCount: 0,
              likesCount: 0,
              commentsCount: 0,
              lastActivityType: "posted",
              lastActivityUserId: authorId,
            },
            select: { id: true },
          });

    for (const seedComment of seedPost.comments) {
      const commentAuthorId = requireUserId(userIds, seedComment.author);

      const existingComment = await prisma.discussionComment.findFirst({
        where: {
          postId: post.id,
          authorId: commentAuthorId,
          content: seedComment.content,
        },
        select: { id: true },
      });

      if (!existingComment) {
        await prisma.discussionComment.create({
          data: {
            postId: post.id,
            authorId: commentAuthorId,
            content: seedComment.content,
          },
        });
      }
    }

    for (const likedBy of seedPost.likes) {
      const likeUserId = requireUserId(userIds, likedBy);
      await prisma.discussionPostLike.upsert({
        where: {
          postId_userId: {
            postId: post.id,
            userId: likeUserId,
          },
        },
        update: {},
        create: {
          postId: post.id,
          userId: likeUserId,
        },
      });
    }

    const [commentsCount, likesCount, latestComment] = await Promise.all([
      prisma.discussionComment.count({ where: { postId: post.id } }),
      prisma.discussionPostLike.count({ where: { postId: post.id } }),
      prisma.discussionComment.findFirst({
        where: { postId: post.id },
        orderBy: { createdAt: "desc" },
        select: { authorId: true, createdAt: true },
      }),
    ]);

    await prisma.discussionPost.update({
      where: { id: post.id },
      data: {
        viewsCount: Math.max(seedPost.views, 1),
        likesCount,
        commentsCount,
        lastActivityType: commentsCount > 0 ? "replied" : "posted",
        lastActivityUserId: latestComment?.authorId ?? authorId,
        lastActivityAt: latestComment?.createdAt ?? new Date(),
      },
    });
  }
}

async function main() {
  const userIds = await ensureSeedUsers();
  const tutorId = requireUserId(userIds, "tutor-team");
  const youId = requireUserId(userIds, "you");

  await removeObviousTestPosts();
  await seedDiscussionPosts(userIds);

  const existingSeminar = await prisma.seminarRoom.findFirst({
    where: {
      title: "Weekly Seminar Room: Better Evidence in EMI Presentations",
    },
  });

  if (!existingSeminar) {
    const room = await prisma.seminarRoom.create({
      data: {
        ownerId: tutorId,
        title: "Weekly Seminar Room: Better Evidence in EMI Presentations",
        description:
          "Use this room to rehearse short seminar turns, compare examples, and share supporting materials before Friday's presentation clinic.",
        topicTag: "speaking",
        visibility: "PUBLIC",
        status: "ACTIVE",
        lastActiveAt: new Date(),
        members: {
          create: [
            {
              userId: tutorId,
              role: "OWNER",
            },
            {
              userId: youId,
              role: "MEMBER",
            },
          ],
        },
      },
    });

    await prisma.seminarRoomMessage.create({
      data: {
        roomId: room.id,
        senderId: tutorId,
        content:
          "Start with one claim, one piece of evidence, and one short explanation. If you want feedback on your wording, drop it here before Thursday night.",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
