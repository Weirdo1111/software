CREATE TABLE `seminar_room_call_participants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `roomId` BIGINT NOT NULL,
  `userId` BIGINT NOT NULL,
  `sessionId` VARCHAR(80) NOT NULL,
  `displayName` VARCHAR(100) NOT NULL,
  `audioEnabled` BOOLEAN NOT NULL DEFAULT true,
  `videoEnabled` BOOLEAN NOT NULL DEFAULT true,
  `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `seminar_room_call_participants_roomId_sessionId_key`(`roomId`, `sessionId`),
  INDEX `seminar_room_call_participants_roomId_lastSeenAt_idx`(`roomId`, `lastSeenAt`),
  INDEX `seminar_room_call_participants_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `seminar_room_call_signals` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `roomId` BIGINT NOT NULL,
  `fromParticipantId` BIGINT NOT NULL,
  `toParticipantId` BIGINT NOT NULL,
  `kind` VARCHAR(30) NOT NULL,
  `payload` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `seminar_room_call_signals_roomId_toParticipantId_id_idx`(`roomId`, `toParticipantId`, `id`),
  INDEX `seminar_room_call_signals_roomId_createdAt_idx`(`roomId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `seminar_room_call_participants`
  ADD CONSTRAINT `seminar_room_call_participants_roomId_fkey`
    FOREIGN KEY (`roomId`) REFERENCES `seminar_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seminar_room_call_participants_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `seminar_room_call_signals`
  ADD CONSTRAINT `seminar_room_call_signals_roomId_fkey`
    FOREIGN KEY (`roomId`) REFERENCES `seminar_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seminar_room_call_signals_fromParticipantId_fkey`
    FOREIGN KEY (`fromParticipantId`) REFERENCES `seminar_room_call_participants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seminar_room_call_signals_toParticipantId_fkey`
    FOREIGN KEY (`toParticipantId`) REFERENCES `seminar_room_call_participants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
