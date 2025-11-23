CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user` text NOT NULL,
	`metadataPieceCID` text,
	`tgLastLangCode` text,
	`tgChatId` text,
	`walletAddress` text,
	`created` integer DEFAULT (UNIXEPOCH() * 1000) NOT NULL,
	`updated` integer,
	`deleted` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_idx` ON `users` (`user`);