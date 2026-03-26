CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `authProvider` VARCHAR(30) NOT NULL DEFAULT 'local-file',
  `authUserId` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `displayName` VARCHAR(100) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `users_username_key`(`username`),
  UNIQUE INDEX `users_authProvider_authUserId_key`(`authProvider`, `authUserId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `discussion_posts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `authorId` BIGINT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `excerpt` VARCHAR(300) NULL,
  `category` VARCHAR(50) NOT NULL,
  `pinned` BOOLEAN NOT NULL DEFAULT false,
  `viewsCount` INTEGER NOT NULL DEFAULT 0,
  `likesCount` INTEGER NOT NULL DEFAULT 0,
  `commentsCount` INTEGER NOT NULL DEFAULT 0,
  `lastActivityType` VARCHAR(20) NOT NULL DEFAULT 'posted',
  `lastActivityUserId` BIGINT NULL,
  `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `discussion_posts_authorId_idx`(`authorId`),
  INDEX `discussion_posts_category_idx`(`category`),
  INDEX `discussion_posts_lastActivityAt_idx`(`lastActivityAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `discussion_comments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `postId` BIGINT NOT NULL,
  `authorId` BIGINT NOT NULL,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `discussion_comments_postId_idx`(`postId`),
  INDEX `discussion_comments_authorId_idx`(`authorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `discussion_post_likes` (
  `postId` BIGINT NOT NULL,
  `userId` BIGINT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `discussion_post_likes_userId_idx`(`userId`),
  PRIMARY KEY (`postId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `discussion_notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `userId` BIGINT NOT NULL,
  `actorId` BIGINT NULL,
  `postId` BIGINT NULL,
  `commentId` BIGINT NULL,
  `type` VARCHAR(20) NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `discussion_notifications_userId_isRead_idx`(`userId`, `isRead`),
  INDEX `discussion_notifications_postId_idx`(`postId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `discussion_posts`
  ADD CONSTRAINT `discussion_posts_authorId_fkey`
    FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_posts_lastActivityUserId_fkey`
    FOREIGN KEY (`lastActivityUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `discussion_comments`
  ADD CONSTRAINT `discussion_comments_postId_fkey`
    FOREIGN KEY (`postId`) REFERENCES `discussion_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_comments_authorId_fkey`
    FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `discussion_post_likes`
  ADD CONSTRAINT `discussion_post_likes_postId_fkey`
    FOREIGN KEY (`postId`) REFERENCES `discussion_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_post_likes_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `discussion_notifications`
  ADD CONSTRAINT `discussion_notifications_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_notifications_actorId_fkey`
    FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_notifications_postId_fkey`
    FOREIGN KEY (`postId`) REFERENCES `discussion_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_notifications_commentId_fkey`
    FOREIGN KEY (`commentId`) REFERENCES `discussion_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
