-- CreateTable
CREATE TABLE `class_profiles` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `class_name` VARCHAR(80) NOT NULL,
    `tagline` VARCHAR(120) NULL,
    `description` TEXT NULL,
    `photo_path` VARCHAR(2048) NULL,
    `tiktok_url` VARCHAR(2048) NULL,
    `instagram_url` VARCHAR(2048) NULL,
    `github_url` VARCHAR(2048) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_profiles` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `role` VARCHAR(80) NULL,
    `bio` TEXT NULL,
    `photo_path` VARCHAR(2048) NOT NULL,
    `tiktok_url` VARCHAR(2048) NULL,
    `instagram_url` VARCHAR(2048) NULL,
    `github_url` VARCHAR(2048) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `student_profiles_is_visible_sort_order_idx`(`is_visible`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
