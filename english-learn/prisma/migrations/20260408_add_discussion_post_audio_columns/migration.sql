ALTER TABLE `discussion_posts`
  ADD COLUMN `audioData` LONGTEXT NULL,
  ADD COLUMN `audioMimeType` VARCHAR(100) NULL,
  ADD COLUMN `audioDurationSec` INTEGER NULL;
