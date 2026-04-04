CREATE TABLE `buddy_progress` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `userId` BIGINT NOT NULL,
  `totalXp` INTEGER NOT NULL DEFAULT 0,
  `totalCompletedSources` INTEGER NOT NULL DEFAULT 0,
  `listeningCompletions` INTEGER NOT NULL DEFAULT 0,
  `speakingCompletions` INTEGER NOT NULL DEFAULT 0,
  `readingCompletions` INTEGER NOT NULL DEFAULT 0,
  `writingCompletions` INTEGER NOT NULL DEFAULT 0,
  `reviewSessions` INTEGER NOT NULL DEFAULT 0,
  `wordGameClears` INTEGER NOT NULL DEFAULT 0,
  `escapeRoomClears` INTEGER NOT NULL DEFAULT 0,
  `dormLockoutClears` INTEGER NOT NULL DEFAULT 0,
  `lastTrainClears` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `buddy_progress_userId_key`(`userId`),
  INDEX `buddy_progress_totalXp_idx`(`totalXp`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `writing_language_items` (
  `id` CHAR(36) NOT NULL,
  `itemKey` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(20) NOT NULL,
  `discipline` VARCHAR(30) NOT NULL,
  `level` VARCHAR(12) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `detail` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `writing_language_items_itemKey_key`(`itemKey`),
  INDEX `writing_language_items_discipline_level_kind_idx`(`discipline`, `level`, `kind`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `writing_language_masteries` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `itemId` CHAR(36) NOT NULL,
  `masteredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `writing_language_masteries_userId_itemId_key`(`userId`, `itemId`),
  INDEX `writing_language_masteries_userId_masteredAt_idx`(`userId`, `masteredAt`),
  INDEX `writing_language_masteries_itemId_idx`(`itemId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `buddy_progress`
  ADD CONSTRAINT `buddy_progress_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `writing_language_masteries`
  ADD CONSTRAINT `writing_language_masteries_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `writing_language_masteries_itemId_fkey`
    FOREIGN KEY (`itemId`) REFERENCES `writing_language_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
