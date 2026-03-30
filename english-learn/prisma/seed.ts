import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const you = await prisma.user.upsert({
    where: { username: "you" },
    update: {
      authProvider: "seed",
      authUserId: "seed-you",
      email: "you@example.com",
      displayName: "You",
    },
    create: {
      username: "you",
      authProvider: "seed",
      authUserId: "seed-you",
      email: "you@example.com",
      displayName: "You",
    },
  });

  const mia = await prisma.user.upsert({
    where: { username: "mia" },
    update: {
      authProvider: "seed",
      authUserId: "seed-mia",
      email: "mia@example.com",
      displayName: "Mia",
    },
    create: {
      username: "mia",
      authProvider: "seed",
      authUserId: "seed-mia",
      email: "mia@example.com",
      displayName: "Mia",
    },
  });

  const tutor = await prisma.user.upsert({
    where: { username: "tutor-team" },
    update: {
      authProvider: "seed",
      authUserId: "seed-tutor-team",
      email: "tutor@example.com",
      displayName: "Tutor Team",
    },
    create: {
      username: "tutor-team",
      authProvider: "seed",
      authUserId: "seed-tutor-team",
      email: "tutor@example.com",
      displayName: "Tutor Team",
    },
  });

  const existing = await prisma.discussionPost.findFirst({
    where: {
      title: "How should I improve academic listening under timed note-taking conditions?",
    },
  });

  if (!existing) {
    const post = await prisma.discussionPost.create({
      data: {
        authorId: you.id,
        title: "How should I improve academic listening under timed note-taking conditions?",
        content:
          "I often miss transitions and supporting details when lectures become denser. My current method is to write almost everything, which causes overload. I want to know how advanced learners balance selective note-taking, keyword capture, and main-idea tracking during listening exercises.",
        excerpt:
          "I often miss transitions and supporting details when lectures become denser. My current method is to write almost everything, which causes overload.",
        category: "listening",
        pinned: true,
        viewsCount: 142,
        likesCount: 1,
        commentsCount: 1,
        lastActivityType: "replied",
        lastActivityUserId: tutor.id,
      },
    });

    const comment = await prisma.discussionComment.create({
      data: {
        postId: post.id,
        authorId: tutor.id,
        content:
          "Start by separating signal phrases, claims, and evidence. Do not attempt full-sentence notes during timed listening.",
      },
    });

    await prisma.discussionPostLike.upsert({
      where: {
        postId_userId: {
          postId: post.id,
          userId: mia.id,
        },
      },
      update: {},
      create: {
        postId: post.id,
        userId: mia.id,
      },
    });

    await prisma.discussionNotification.createMany({
      data: [
        {
          userId: you.id,
          actorId: mia.id,
          postId: post.id,
          type: "like",
        },
        {
          userId: you.id,
          actorId: tutor.id,
          postId: post.id,
          commentId: comment.id,
          type: "comment",
        },
      ],
    });
  }

  const existingSeminar = await prisma.seminarRoom.findFirst({
    where: {
      title: "Weekly Seminar Room: Better Evidence in EMI Presentations",
    },
  });

  if (!existingSeminar) {
    const room = await prisma.seminarRoom.create({
      data: {
        ownerId: tutor.id,
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
              userId: tutor.id,
              role: "OWNER",
            },
            {
              userId: you.id,
              role: "MEMBER",
            },
          ],
        },
      },
    });

    await prisma.seminarRoomMessage.create({
      data: {
        roomId: room.id,
        senderId: tutor.id,
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
