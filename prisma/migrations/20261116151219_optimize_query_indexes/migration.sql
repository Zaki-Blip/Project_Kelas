-- DropIndex
DROP INDEX `pkl_submissions_created_at_idx` ON `pkl_submissions`;

-- DropIndex
DROP INDEX `pkl_submissions_status_created_at_idx` ON `pkl_submissions`;

-- DropIndex
DROP INDEX `projects_published_at_idx` ON `projects`;

-- DropIndex
DROP INDEX `projects_status_category_id_idx` ON `projects`;

-- DropIndex
DROP INDEX `projects_status_idx` ON `projects`;

-- DropIndex
DROP INDEX `projects_status_published_at_idx` ON `projects`;

-- DropIndex
DROP INDEX `student_profiles_is_visible_sort_order_idx` ON `student_profiles`;

-- DropIndex
DROP INDEX `users_full_name_idx` ON `users`;

-- CreateIndex
CREATE INDEX `pkl_submissions_updated_at_id_idx` ON `pkl_submissions`(`updated_at`, `id`);

-- CreateIndex
CREATE INDEX `projects_status_published_at_id_idx` ON `projects`(`status`, `published_at`, `id`);

-- CreateIndex
CREATE INDEX `projects_status_category_id_published_at_id_idx` ON `projects`(`status`, `category_id`, `published_at`, `id`);

-- CreateIndex
CREATE INDEX `projects_updated_at_id_idx` ON `projects`(`updated_at`, `id`);

-- CreateIndex
CREATE INDEX `student_profiles_is_visible_sort_order_name_idx` ON `student_profiles`(`is_visible`, `sort_order`, `name`);

-- CreateIndex
CREATE INDEX `student_profiles_sort_order_name_idx` ON `student_profiles`(`sort_order`, `name`);

-- CreateIndex
CREATE INDEX `users_full_name_username_idx` ON `users`(`full_name`, `username`);
