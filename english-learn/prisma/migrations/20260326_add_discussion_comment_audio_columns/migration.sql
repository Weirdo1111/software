ALTER TABLE `discussion_comments`
  ADD COLUMN `audioData` LONGTEXT NULL,
  ADD COLUMN `audioMimeType` VARCHAR(100) NULL,
  ADD COLUMN `audioDurationSec` INTEGER NULL;
