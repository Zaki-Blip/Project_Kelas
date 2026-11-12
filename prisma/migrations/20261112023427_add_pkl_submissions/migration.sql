-- CreateTable
CREATE TABLE `pkl_submissions` (
    `id` VARCHAR(30) NOT NULL,
    `user_id` VARCHAR(30) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `company` VARCHAR(120) NOT NULL,
    `summary` TEXT NOT NULL,
    `report_url` VARCHAR(2048) NOT NULL,
    `status` ENUM('SUBMITTED', 'REVIEWED', 'REVISION') NOT NULL DEFAULT 'SUBMITTED',
    `review_note` TEXT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pkl_submissions_user_id_key`(`user_id`),
    INDEX `pkl_submissions_status_created_at_idx`(`status`, `created_at`),
    INDEX `pkl_submissions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pkl_submissions` ADD CONSTRAINT `pkl_submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
