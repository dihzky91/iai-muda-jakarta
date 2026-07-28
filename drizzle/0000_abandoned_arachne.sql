CREATE TABLE `articles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`date` varchar(20) NOT NULL,
	`author` varchar(255) NOT NULL,
	`image_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_committees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`member_id` int NOT NULL,
	`role` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_committees_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_event_member_role` UNIQUE(`event_id`,`member_id`,`role`)
);
--> statement-breakpoint
CREATE TABLE `event_materials` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`file_type` varchar(50),
	`uploaded_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_rsvps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`member_id` int NOT NULL,
	`status` enum('attending','not_attending','maybe') NOT NULL DEFAULT 'attending',
	`responded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_rsvps_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_event_member_rsvp` UNIQUE(`event_id`,`member_id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`date` varchar(20) NOT NULL,
	`end_date` varchar(20),
	`time` varchar(20),
	`location` varchar(255),
	`image_url` varchar(500),
	`registration_url` varchar(500),
	`status` enum('ongoing','upcoming','completed') NOT NULL DEFAULT 'upcoming',
	`event_type` enum('public','internal') NOT NULL DEFAULT 'public',
	`visible_to_alumni` boolean NOT NULL DEFAULT false,
	`all_day` boolean NOT NULL DEFAULT false,
	`color` varchar(20) NOT NULL DEFAULT 'blue',
	`generation_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `galleries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`image_url` varchar(500),
	`date` varchar(20) NOT NULL,
	`category` varchar(255),
	`photographer` varchar(255),
	`images` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `galleries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT 'blue',
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `gallery_categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `gallery_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`years` varchar(50) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT false,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generations_id` PRIMARY KEY(`id`),
	CONSTRAINT `generations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `intervention_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`member_id` int NOT NULL,
	`stage` enum('h1','h3','h3_h7','h7_zoom','h7_h14','h14_h21','post_h21') NOT NULL,
	`notes` text,
	`action_taken` text,
	`performed_by` int NOT NULL,
	`scheduled_date` varchar(10),
	`completed_date` varchar(10),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intervention_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`member_id` int NOT NULL,
	`start_date` varchar(10) NOT NULL,
	`end_date` varchar(10) NOT NULL,
	`reason` text NOT NULL,
	`leave_type` enum('regular','emergency') NOT NULL DEFAULT 'regular',
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`review_notes` text,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_academic_loads` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`member_id` int NOT NULL,
	`week_start` varchar(10) NOT NULL,
	`load_type` enum('uts','uas','quiz','project','sick','personal','other') NOT NULL,
	`description` text,
	`intensity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `member_academic_loads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_accounts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`member_id` int NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `member_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_accounts_member_id_unique` UNIQUE(`member_id`)
);
--> statement-breakpoint
CREATE TABLE `member_statuses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`member_id` int NOT NULL,
	`status` enum('hijau','kuning','merah','biru') NOT NULL,
	`reason` text,
	`changed_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `member_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`generation_id` int NOT NULL,
	`position_id` int,
	`name` varchar(255) NOT NULL,
	`division` varchar(255),
	`university` varchar(255),
	`email` varchar(255),
	`image_url` varchar(500),
	`linkedin_url` varchar(500),
	`bio` text,
	`phone` varchar(20),
	`whatsapp` varchar(20),
	`is_alumni` boolean NOT NULL DEFAULT false,
	`show_public` boolean NOT NULL DEFAULT true,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_evaluations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`member_id` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`evaluation_notes` text,
	`action_items` text,
	`rating` int,
	`evaluated_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monthly_evaluations_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_monthly_evaluations_member_month` UNIQUE(`member_id`,`month`)
);
--> statement-breakpoint
CREATE TABLE `pillars` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon_name` varchar(50) NOT NULL DEFAULT 'Shield',
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pillars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `positions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_positions_name_category` UNIQUE(`name`,`category`)
);
--> statement-breakpoint
CREATE TABLE `resource_reads` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`resource_id` int NOT NULL,
	`member_id` int NOT NULL,
	`read_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resource_reads_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_resource_member` UNIQUE(`resource_id`,`member_id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`file_url` varchar(500) NOT NULL,
	`file_name` varchar(255),
	`file_type` varchar(50),
	`file_size` int,
	`category` varchar(50) NOT NULL DEFAULT 'onboarding',
	`subcategory` varchar(100),
	`visibility` varchar(20) NOT NULL DEFAULT 'pengurus',
	`sort_order` int DEFAULT 0,
	`download_count` int DEFAULT 0,
	`uploaded_by` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`contact_title` varchar(255) NOT NULL DEFAULT 'Hubungi IAI Wilayah DKI Jakarta',
	`contact_description` text NOT NULL,
	`address` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(100),
	`show_phone` boolean NOT NULL DEFAULT true,
	`instagram_url` varchar(500),
	`linkedin_url` varchar(500),
	`youtube_url` varchar(500),
	`division_photos` text,
	`divisions` text,
	`footer_description` text,
	`logo_url` varchar(500),
	`favicon_url` varchar(500),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('superadmin','admin','editor') NOT NULL DEFAULT 'editor',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE INDEX `idx_event_materials_event` ON `event_materials` (`event_id`);--> statement-breakpoint
CREATE INDEX `idx_events_date` ON `events` (`date`);--> statement-breakpoint
CREATE INDEX `idx_events_type_date` ON `events` (`event_type`,`date`);--> statement-breakpoint
CREATE INDEX `idx_events_type_status` ON `events` (`event_type`,`status`);--> statement-breakpoint
CREATE INDEX `idx_intervention_logs_member` ON `intervention_logs` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_intervention_logs_member_stage` ON `intervention_logs` (`member_id`,`stage`);--> statement-breakpoint
CREATE INDEX `idx_intervention_logs_scheduled_completed` ON `intervention_logs` (`scheduled_date`,`completed_date`);--> statement-breakpoint
CREATE INDEX `idx_intervention_logs_performed_by` ON `intervention_logs` (`performed_by`);--> statement-breakpoint
CREATE INDEX `idx_leave_requests_member` ON `leave_requests` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_leave_requests_status` ON `leave_requests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_leave_requests_member_status` ON `leave_requests` (`member_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_leave_requests_reviewed_by` ON `leave_requests` (`reviewed_by`);--> statement-breakpoint
CREATE INDEX `idx_member_academic_loads_member_week` ON `member_academic_loads` (`member_id`,`week_start`);--> statement-breakpoint
CREATE INDEX `idx_member_academic_loads_week_start` ON `member_academic_loads` (`week_start`);--> statement-breakpoint
CREATE INDEX `idx_member_statuses_member_created` ON `member_statuses` (`member_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_member_statuses_status` ON `member_statuses` (`status`);--> statement-breakpoint
CREATE INDEX `idx_member_statuses_changed_by` ON `member_statuses` (`changed_by`);--> statement-breakpoint
CREATE INDEX `idx_members_generation_id` ON `members` (`generation_id`);--> statement-breakpoint
CREATE INDEX `idx_members_position_id` ON `members` (`position_id`);--> statement-breakpoint
CREATE INDEX `idx_members_email` ON `members` (`email`);--> statement-breakpoint
CREATE INDEX `idx_members_show_public` ON `members` (`show_public`);--> statement-breakpoint
CREATE INDEX `idx_monthly_evaluations_member` ON `monthly_evaluations` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_monthly_evaluations_month` ON `monthly_evaluations` (`month`);--> statement-breakpoint
CREATE INDEX `idx_monthly_evaluations_evaluated_by` ON `monthly_evaluations` (`evaluated_by`);--> statement-breakpoint
CREATE INDEX `idx_positions_name` ON `positions` (`name`);--> statement-breakpoint
CREATE INDEX `idx_resource_reads_member_id` ON `resource_reads` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_resource_reads_resource_id` ON `resource_reads` (`resource_id`);--> statement-breakpoint
CREATE INDEX `idx_resources_category` ON `resources` (`category`);--> statement-breakpoint
CREATE INDEX `idx_resources_visibility` ON `resources` (`visibility`);--> statement-breakpoint
CREATE INDEX `idx_resources_sort_order` ON `resources` (`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_resources_is_active` ON `resources` (`is_active`);