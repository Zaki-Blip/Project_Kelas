-- Add a simple newline-separated social links field to student profiles.
ALTER TABLE `student_profiles` ADD COLUMN `social_links` TEXT NULL;

-- Preserve existing fixed social links by copying them into the new field.
UPDATE `student_profiles`
SET `social_links` = NULLIF(
  CONCAT_WS(
    CHAR(10),
    NULLIF(`tiktok_url`, ''),
    NULLIF(`instagram_url`, ''),
    NULLIF(`github_url`, '')
  ),
  ''
);

ALTER TABLE `student_profiles`
  DROP COLUMN `tiktok_url`,
  DROP COLUMN `instagram_url`,
  DROP COLUMN `github_url`;

-- Class profiles no longer have social links.
DROP TABLE IF EXISTS `class_profile_social_links`;
