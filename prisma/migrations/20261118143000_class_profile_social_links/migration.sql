-- CreateTable
CREATE TABLE `class_profile_social_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_profile_id` INTEGER NOT NULL,
    `platform` VARCHAR(60) NOT NULL,
    `url` VARCHAR(2048) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `class_profile_social_links_class_profile_id_sort_order_idx`(`class_profile_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Copy the existing fixed class links into the new flexible table.
INSERT INTO `class_profile_social_links` (`class_profile_id`, `platform`, `url`, `sort_order`, `updated_at`)
SELECT `id`, 'TikTok', `tiktok_url`, 0, CURRENT_TIMESTAMP(3)
FROM `class_profiles`
WHERE `tiktok_url` IS NOT NULL AND `tiktok_url` <> '';

INSERT INTO `class_profile_social_links` (`class_profile_id`, `platform`, `url`, `sort_order`, `updated_at`)
SELECT `id`, 'Instagram', `instagram_url`, 1, CURRENT_TIMESTAMP(3)
FROM `class_profiles`
WHERE `instagram_url` IS NOT NULL AND `instagram_url` <> '';

INSERT INTO `class_profile_social_links` (`class_profile_id`, `platform`, `url`, `sort_order`, `updated_at`)
SELECT `id`, 'GitHub', `github_url`, 2, CURRENT_TIMESTAMP(3)
FROM `class_profiles`
WHERE `github_url` IS NOT NULL AND `github_url` <> '';

-- AddForeignKey
ALTER TABLE `class_profile_social_links` ADD CONSTRAINT `class_profile_social_links_class_profile_id_fkey` FOREIGN KEY (`class_profile_id`) REFERENCES `class_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old fixed columns after their values have been migrated.
ALTER TABLE `class_profiles`
    DROP COLUMN `tiktok_url`,
    DROP COLUMN `instagram_url`,
    DROP COLUMN `github_url`;
