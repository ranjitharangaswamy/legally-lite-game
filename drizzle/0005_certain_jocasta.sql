CREATE TABLE `api_usage_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`aiQuizzesToday` int NOT NULL DEFAULT 0,
	`aiAssistantMessagesToday` int NOT NULL DEFAULT 0,
	`practiceScenariesToday` int NOT NULL DEFAULT 0,
	`lastResetDate` timestamp NOT NULL,
	CONSTRAINT `api_usage_limits_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_usage_limits_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `cached_legal_info` (
	`id` int AUTO_INCREMENT NOT NULL,
	`state` varchar(2) NOT NULL,
	`topic` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`sources` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `cached_legal_info_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cached_quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`state` varchar(2) NOT NULL,
	`category` varchar(100) NOT NULL,
	`difficulty` varchar(20) NOT NULL,
	`questions` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `cached_quizzes_id` PRIMARY KEY(`id`)
);
