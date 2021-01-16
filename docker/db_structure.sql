
CREATE TABLE IF NOT EXISTS `cutout_download` (
    `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `settings` text NOT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `created_at` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `participation` (
    `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `choice` enum('YES','NO') NOT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `created_at` (`created_at`),
    KEY `choice` (`choice`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
