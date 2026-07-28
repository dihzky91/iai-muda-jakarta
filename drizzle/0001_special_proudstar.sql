ALTER TABLE `events` MODIFY COLUMN `event_type` varchar(20) NOT NULL DEFAULT 'public';--> statement-breakpoint
ALTER TABLE `gallery_categories` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;