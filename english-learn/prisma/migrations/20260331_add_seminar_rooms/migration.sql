CREATE TABLE `seminar_rooms` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(140) NOT NULL,
  `description` TEXT NULL,
  `topicTag` VARCHAR(50) NULL,
  `visibility` VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
  `passwordHash` VARCHAR(255) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  `ownerId` BIGINT NOT NULL,
  `lastActiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `seminar_rooms_ownerId_idx`(`ownerId`),
  INDEX `seminar_rooms_status_lastActiveAt_idx`(`status`, `lastActiveAt`),
  INDEX `seminar_rooms_visibility_status_idx`(`visibility`, `status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `seminar_room_members` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `roomId` BIGINT NOT NULL,
  `userId` BIGINT NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
  `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `seminar_room_members_roomId_userId_key`(`roomId`, `userId`),
  INDEX `seminar_room_members_userId_idx`(`userId`),
  INDEX `seminar_room_members_roomId_role_idx`(`roomId`, `role`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `seminar_room_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `roomId` BIGINT NOT NULL,
  `senderId` BIGINT NOT NULL,
  `content` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `seminar_room_messages_roomId_createdAt_idx`(`roomId`, `createdAt`),
  INDEX `seminar_room_messages_senderId_idx`(`senderId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `seminar_room_attachments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `messageId` BIGINT NOT NULL,
  `roomId` BIGINT NOT NULL,
  `uploadedById` BIGINT NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `fileKind` VARCHAR(20) NOT NULL,
  `mimeType` VARCHAR(120) NOT NULL,
  `fileSize` INT NOT NULL,
  `storageDriver` VARCHAR(30) NOT NULL,
  `storagePath` VARCHAR(500) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `seminar_room_attachments_messageId_idx`(`messageId`),
  INDEX `seminar_room_attachments_roomId_idx`(`roomId`),
  INDEX `seminar_room_attachments_uploadedById_idx`(`uploadedById`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `seminar_rooms`
  ADD CONSTRAINT `seminar_rooms_ownerId_fkey`
    FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `seminar_room_members`
  ADD CONSTRAINT `seminar_room_members_roomId_fkey`
    FOREIGN KEY (`roomId`) REFERENCES `seminar_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seminar_room_members_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `seminar_room_messages`
  ADD CONSTRAINT `seminar_room_messages_roomId_fkey`
    FOREIGN KEY (`roomId`) REFERENCES `seminar_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seminar_room_messages_senderId_fkey`
    FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `seminar_room_attachments`
  ADD CONSTRAINT `seminar_room_attachments_messageId_fkey`
    FOREIGN KEY (`messageId`) REFERENCES `seminar_room_messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seminar_room_attachments_roomId_fkey`
    FOREIGN KEY (`roomId`) REFERENCES `seminar_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seminar_room_attachments_uploadedById_fkey`
    FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
