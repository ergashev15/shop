CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`bytes` blob NOT NULL,
	`content_type` text NOT NULL,
	`updated_at` integer NOT NULL
);
