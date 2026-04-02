CREATE TABLE `escape_room_stage_progresses` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `stageSlug` VARCHAR(30) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'idle',
  `scene` VARCHAR(20) NOT NULL DEFAULT 'briefing',
  `started` BOOLEAN NOT NULL DEFAULT false,
  `escaped` BOOLEAN NOT NULL DEFAULT false,
  `bestSeconds` INTEGER NULL,
  `lastElapsedSeconds` INTEGER NULL,
  `lastRemainingSeconds` INTEGER NULL,
  `keypadAttempts` INTEGER NOT NULL DEFAULT 0,
  `clearCount` INTEGER NOT NULL DEFAULT 0,
  `latestRunStartedAt` DATETIME(3) NULL,
  `latestClearedAt` DATETIME(3) NULL,
  `progressPayload` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `escape_room_stage_progresses_userId_stageSlug_key`(`userId`, `stageSlug`),
  INDEX `escape_room_stage_progresses_stageSlug_escaped_bestSeconds_idx`(`stageSlug`, `escaped`, `bestSeconds`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `escape_room_stage_progresses`
  ADD CONSTRAINT `escape_room_stage_progresses_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `escape_room_runs` (
  `id` CHAR(36) NOT NULL,
  `userId` BIGINT NOT NULL,
  `stageSlug` VARCHAR(30) NOT NULL,
  `result` VARCHAR(20) NOT NULL,
  `startedAt` DATETIME(3) NULL,
  `endedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `elapsedSeconds` INTEGER NULL,
  `remainingSeconds` INTEGER NULL,
  `keypadAttempts` INTEGER NOT NULL DEFAULT 0,
  `rewardXp` INTEGER NOT NULL DEFAULT 0,
  `progressPayload` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `escape_room_runs_userId_endedAt_idx`(`userId`, `endedAt`),
  INDEX `escape_room_runs_stageSlug_result_elapsedSeconds_idx`(`stageSlug`, `result`, `elapsedSeconds`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `escape_room_runs`
  ADD CONSTRAINT `escape_room_runs_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
