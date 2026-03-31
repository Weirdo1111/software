ALTER TABLE `users`
  MODIFY `authProvider` VARCHAR(30) NOT NULL DEFAULT 'database';

ALTER TABLE `users`
  ADD COLUMN `passwordHash` VARCHAR(255) NULL,
  ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
  ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);

CREATE TABLE `auth_sessions` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userAgent` VARCHAR(255) NULL,
  `ipAddress` VARCHAR(64) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `auth_sessions_tokenHash_key`(`tokenHash`),
  INDEX `auth_sessions_userId_expiresAt_idx`(`userId`, `expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `profiles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `userId` BIGINT NOT NULL,
  `nativeLanguage` VARCHAR(8) NOT NULL DEFAULT 'zh',
  `uiLanguage` VARCHAR(8) NOT NULL DEFAULT 'zh',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `profiles_userId_key`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `learning_goals` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `userId` BIGINT NOT NULL,
  `goal` VARCHAR(30) NOT NULL,
  `dailyMinutes` INTEGER NOT NULL DEFAULT 25,
  `scheduleMode` VARCHAR(20) NOT NULL DEFAULT 'standard',
  `studyWindow` VARCHAR(20) NOT NULL DEFAULT 'evening',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `learning_goals_userId_key`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `placement_sessions` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `cefrLevel` VARCHAR(12) NULL,
  `score` INTEGER NULL,
  `skillBreakdown` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `placement_sessions_userId_createdAt_idx`(`userId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `placement_answers` (
  `id` CHAR(36) NOT NULL,
  `placementSessionId` CHAR(36) NOT NULL,
  `questionId` VARCHAR(100) NOT NULL,
  `answer` INTEGER NOT NULL,
  `isCorrect` BOOLEAN NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `placement_answers_placementSessionId_createdAt_idx`(`placementSessionId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_attempts` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `exerciseId` VARCHAR(191) NOT NULL,
  `answerPayload` JSON NOT NULL,
  `durationSec` INTEGER NOT NULL,
  `correctness` BOOLEAN NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `user_attempts_userId_createdAt_idx`(`userId`, `createdAt`),
  INDEX `user_attempts_exerciseId_idx`(`exerciseId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `review_cards` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `front` VARCHAR(255) NOT NULL,
  `back` TEXT NOT NULL,
  `tag` VARCHAR(50) NOT NULL DEFAULT 'general',
  `stability` DOUBLE NOT NULL DEFAULT 2,
  `difficulty` DOUBLE NOT NULL DEFAULT 5,
  `dueAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastReviewedAt` DATETIME(3) NULL,
  `lapses` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `review_cards_userId_dueAt_idx`(`userId`, `dueAt`),
  INDEX `review_cards_userId_tag_idx`(`userId`, `tag`),
  INDEX `review_cards_userId_front_idx`(`userId`, `front`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `review_logs` (
  `id` CHAR(36) NOT NULL,
  `cardId` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `rating` INTEGER NOT NULL,
  `nextDueAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `review_logs_userId_createdAt_idx`(`userId`, `createdAt`),
  INDEX `review_logs_cardId_createdAt_idx`(`cardId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_feedback_records` (
  `id` CHAR(36) NOT NULL,
  `userAttemptId` CHAR(36) NULL,
  `userId` BIGINT NOT NULL,
  `feedbackType` VARCHAR(50) NOT NULL,
  `inputPayload` JSON NOT NULL,
  `outputPayload` JSON NOT NULL,
  `tokenCost` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `ai_feedback_records_userId_createdAt_idx`(`userId`, `createdAt`),
  INDEX `ai_feedback_records_userAttemptId_idx`(`userAttemptId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `daily_plans` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `date` DATE NOT NULL,
  `tasks` JSON NOT NULL,
  `estimatedMinutes` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `daily_plans_userId_date_key`(`userId`, `date`),
  INDEX `daily_plans_userId_date_idx`(`userId`, `date`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `schedule_profiles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `userId` BIGINT NOT NULL,
  `classes` JSON NULL,
  `deadlines` JSON NULL,
  `planWeekStart` DATE NULL,
  `planOverrides` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `schedule_profiles_userId_key`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `context_comment_threads` (
  `id` CHAR(36) NOT NULL,
  `module` VARCHAR(30) NOT NULL,
  `targetId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `subtitle` VARCHAR(191) NULL,
  `plazaTag` VARCHAR(50) NOT NULL DEFAULT 'Discussion',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `context_comment_threads_module_targetId_key`(`module`, `targetId`),
  INDEX `context_comment_threads_module_targetId_idx`(`module`, `targetId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `context_comments` (
  `id` CHAR(36) NOT NULL,
  `threadId` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `author` VARCHAR(120) NOT NULL,
  `content` TEXT NOT NULL,
  `topic` VARCHAR(80) NULL,
  `likesCount` INTEGER NOT NULL DEFAULT 0,
  `anchorLabel` VARCHAR(120) NULL,
  `anchorText` TEXT NULL,
  `promotedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `context_comments_threadId_createdAt_idx`(`threadId`, `createdAt`),
  INDEX `context_comments_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `context_comment_likes` (
  `id` CHAR(36) NOT NULL,
  `commentId` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `context_comment_likes_commentId_userId_key`(`commentId`, `userId`),
  INDEX `context_comment_likes_userId_commentId_idx`(`userId`, `commentId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `subscriptions` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NULL,
  `stripeCustomerId` VARCHAR(191) NULL,
  `stripeSubscriptionId` VARCHAR(191) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'inactive',
  `currentPeriodEnd` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `subscriptions_stripeSubscriptionId_key`(`stripeSubscriptionId`),
  INDEX `subscriptions_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `event_logs` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NULL,
  `eventName` VARCHAR(100) NOT NULL,
  `payload` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `event_logs_userId_createdAt_idx`(`userId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `auth_sessions`
  ADD CONSTRAINT `auth_sessions_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `learning_goals`
  ADD CONSTRAINT `learning_goals_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `placement_sessions`
  ADD CONSTRAINT `placement_sessions_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `placement_answers`
  ADD CONSTRAINT `placement_answers_placementSessionId_fkey`
    FOREIGN KEY (`placementSessionId`) REFERENCES `placement_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `user_attempts`
  ADD CONSTRAINT `user_attempts_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `review_cards`
  ADD CONSTRAINT `review_cards_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `review_logs`
  ADD CONSTRAINT `review_logs_cardId_fkey`
    FOREIGN KEY (`cardId`) REFERENCES `review_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `review_logs_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ai_feedback_records`
  ADD CONSTRAINT `ai_feedback_records_userAttemptId_fkey`
    FOREIGN KEY (`userAttemptId`) REFERENCES `user_attempts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ai_feedback_records_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `daily_plans`
  ADD CONSTRAINT `daily_plans_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `schedule_profiles`
  ADD CONSTRAINT `schedule_profiles_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `context_comments`
  ADD CONSTRAINT `context_comments_threadId_fkey`
    FOREIGN KEY (`threadId`) REFERENCES `context_comment_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `context_comments_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `context_comment_likes`
  ADD CONSTRAINT `context_comment_likes_commentId_fkey`
    FOREIGN KEY (`commentId`) REFERENCES `context_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `context_comment_likes_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `event_logs`
  ADD CONSTRAINT `event_logs_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
