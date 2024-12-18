-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 18, 2024 at 07:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `expenseflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

use `webtech_fall2024_alan_ofori`;


CREATE TABLE `categories` (
  `category_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `is_default` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `user_id`, `category_name`, `type`, `is_default`) VALUES
(1, 1, 'Salary', 'income', 1),
(2, 1, 'Freelance', 'income', 1),
(3, 1, 'Groceries', 'expense', 1),
(4, 1, 'Rent', 'expense', 1),
(5, 2, 'Investments', 'income', 1),
(6, 2, 'Utilities', 'expense', 1),
(7, 1, 'Dining Out', 'expense', 1);

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `expense_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `payment_method_id` int(10) UNSIGNED DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`expense_id`, `user_id`, `category_id`, `payment_method_id`, `amount`, `expense_date`, `notes`, `created_at`) VALUES
(1, 1, 3, 1, 150.00, '2024-12-15', 'Weekly groceries', '2024-12-16 16:22:32'),
(2, 1, 4, 2, 1200.00, '2024-12-10', 'Monthly rent', '2024-12-16 16:22:32'),
(3, 2, 6, 3, 200.00, '2024-12-12', 'Utilities bill', '2024-12-16 16:22:32'),
(4, 11, 7, 3, 550.00, '2024-03-23', 'went out with bae', '2024-12-16 19:55:23'),
(5, 12, 7, 3, 500.00, '2024-12-09', 'went out with bae', '2024-12-17 16:12:52'),
(6, 13, 4, 1, 5400.00, '2024-12-09', '', '2024-12-17 19:18:44'),
(7, 14, 7, 3, 550.00, '2024-12-01', 'RA money', '2024-12-17 20:04:37'),
(8, 15, 7, 3, 550.00, '2024-12-09', 'went out with bae', '2024-12-17 21:03:52'),
(9, 2, 1, 1, 450.00, '2024-12-16', '', '2024-12-17 23:10:53');

-- --------------------------------------------------------

--
-- Table structure for table `income`
--

CREATE TABLE `income` (
  `income_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `payment_method_id` int(10) UNSIGNED DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `income_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `income`
--

INSERT INTO `income` (`income_id`, `user_id`, `category_id`, `payment_method_id`, `amount`, `income_date`, `notes`, `created_at`) VALUES
(1, 1, 1, 3, 2500.00, '2024-12-01', 'Monthly salary', '2024-12-16 16:22:32'),
(2, 1, 2, 4, 500.00, '2024-12-05', 'Freelance project', '2024-12-16 16:22:32'),
(3, 2, 5, 2, 1500.00, '2024-12-10', 'Investment returns', '2024-12-16 16:22:32'),
(4, 12, 1, NULL, 400.00, '2024-12-08', NULL, '2024-12-17 16:31:30'),
(5, 15, 1, NULL, 687.00, '2024-12-05', NULL, '2024-12-17 21:25:34');

-- --------------------------------------------------------

--
-- Table structure for table `paymentmethods`
--

CREATE TABLE `paymentmethods` (
  `payment_method_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paymentmethods`
--

INSERT INTO `paymentmethods` (`payment_method_id`, `name`) VALUES
(3, 'Bank Transfer'),
(1, 'Cash'),
(2, 'Credit Card'),
(4, 'Mobile Money');

-- --------------------------------------------------------

--
-- Table structure for table `preferences`
--

CREATE TABLE `preferences` (
  `preference_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `preference_key` varchar(255) NOT NULL,
  `preference_value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `preferences`
--

INSERT INTO `preferences` (`preference_id`, `user_id`, `preference_key`, `preference_value`) VALUES
(1, 11, 'notification', 'enabled'),
(2, 11, 'budget_limit', '4000'),
(3, 12, 'notification', 'enabled'),
(4, 12, 'budget_limit', '50000'),
(5, 13, 'notification', 'enabled'),
(6, 13, 'budget_limit', '60000'),
(7, 14, 'notification', 'enabled'),
(8, 14, 'budget_limit', '50000'),
(9, 15, 'notification', 'enabled'),
(10, 15, 'budget_limit', '45000'),
(11, 2, 'notification', 'disabled'),
(12, 2, 'budget_limit', '5000');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `profile_photo`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Mmalebna', 'mmalebna@gmail.com', 'securepassword1', NULL, 'user', '2024-12-16 16:22:32', '2024-12-16 16:22:32'),
(2, 'Alan', 'alan@gmail.com', 'securepassword2', NULL, 'user', '2024-12-16 16:22:32', '2024-12-16 16:22:32'),
(3, 'M-EpressFlow', 'admin@expenseflow.com', 'securepasswordadmin', NULL, 'admin', '2024-12-16 16:22:32', '2024-12-16 16:22:32'),
(11, 'Kevin Ofori', 'kevin@gmail.com', 'Cityzen@3', NULL, 'user', '2024-12-16 19:43:11', '2024-12-16 19:43:11'),
(12, 'Nathanial Songtar', 'nathaniel@gmail.com', 'Songtar@123', NULL, 'user', '2024-12-17 16:06:14', '2024-12-17 16:06:14'),
(13, 'Kevin Ofori', 'alan.k.ofori@gmail.com', '$2y$10$O0Jvwzwb/oESpbO3TrKEc.avGctbmGIKtSDKpiygyts1Ux2At9p0u', NULL, 'user', '2024-12-17 19:18:22', '2024-12-17 19:18:22'),
(14, 'Andre Ayiku', 'andre@gmail.com', '$2y$10$uParrXWXZFcpnt7yxEAMBuRJhqUrcPvkFNIYylLYG0ixg194Iy7s2', NULL, 'user', '2024-12-17 20:03:52', '2024-12-17 20:03:52'),
(15, 'Kevin Ofori', 'kwaboat048@gmail.com', '$2y$10$PwaCvPQImDr5ban.CdZk9.DYT8sOD8ZxZTfC6CLjYlWLKx6H58kkS', NULL, 'user', '2024-12-17 21:03:22', '2024-12-17 21:03:22'),
(16, 'Ali Baba', 'ali.k.baba@gmail.com', '$2y$10$qVJa7eKDlnZQ1UzQkOq8xO8DWFNapl0w5lS1ybx.t8C0A8ZVNs1P2', NULL, 'user', '2024-12-17 23:05:42', '2024-12-17 23:05:42');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`category_name`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`expense_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `payment_method_id` (`payment_method_id`);

--
-- Indexes for table `income`
--
ALTER TABLE `income`
  ADD PRIMARY KEY (`income_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `payment_method_id` (`payment_method_id`);

--
-- Indexes for table `paymentmethods`
--
ALTER TABLE `paymentmethods`
  ADD PRIMARY KEY (`payment_method_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `preferences`
--
ALTER TABLE `preferences`
  ADD PRIMARY KEY (`preference_id`),
  ADD UNIQUE KEY `user_preference` (`user_id`,`preference_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `expense_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `income`
--
ALTER TABLE `income`
  MODIFY `income_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `paymentmethods`
--
ALTER TABLE `paymentmethods`
  MODIFY `payment_method_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `preferences`
--
ALTER TABLE `preferences`
  MODIFY `preference_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `expenses_ibfk_3` FOREIGN KEY (`payment_method_id`) REFERENCES `paymentmethods` (`payment_method_id`) ON DELETE SET NULL;

--
-- Constraints for table `income`
--
ALTER TABLE `income`
  ADD CONSTRAINT `income_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `income_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `income_ibfk_3` FOREIGN KEY (`payment_method_id`) REFERENCES `paymentmethods` (`payment_method_id`) ON DELETE SET NULL;

--
-- Constraints for table `preferences`
--
ALTER TABLE `preferences`
  ADD CONSTRAINT `preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
