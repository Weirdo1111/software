ALTER TABLE `discussion_posts`
  ADD COLUMN `moderationStatus` VARCHAR(20) NOT NULL DEFAULT 'APPROVED';

CREATE INDEX `discussion_posts_moderationStatus_idx`
  ON `discussion_posts`(`moderationStatus`);
