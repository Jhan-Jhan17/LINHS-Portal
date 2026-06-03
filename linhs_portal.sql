-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 02, 2026 at 06:33 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `linhs_portal`
--

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `sp_enroll_student`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_enroll_student` (IN `p_id` VARCHAR(36), IN `p_lrn` VARCHAR(20), IN `p_first_name` VARCHAR(100), IN `p_middle_name` VARCHAR(100), IN `p_last_name` VARCHAR(100), IN `p_class_id` VARCHAR(36), IN `p_enrolled_by` VARCHAR(36))   BEGIN
    DECLARE v_class_grade INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction Failed: Could not enroll student.';
    END;

    START TRANSACTION;
        -- Step 1: Securely determine the grade level directly from the target class setting via a quick lookup
        SELECT grade_level INTO v_class_grade 
        FROM classes 
        WHERE id = p_class_id;

        IF v_class_grade IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: The assigned class ID does not exist.';
        END IF;

        -- Step 2: Main Insert statement mapping the updated column
        INSERT INTO students (id, lrn, first_name, middle_name, last_name, grade_level, class_id, enrolled_by)
        VALUES (p_id, p_lrn, p_first_name, p_middle_name, p_last_name, v_class_grade, p_class_id, p_enrolled_by);
    COMMIT;
END$$

DROP PROCEDURE IF EXISTS `sp_get_roster_by_adviser`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_roster_by_adviser` (IN `p_adviser_id` VARCHAR(36))   BEGIN
    SELECT 
        s.lrn,
        s.last_name,
        s.first_name,
        s.grade_level,
        c.name AS class_name,
        c.section AS class_section,
        c.school_year
    FROM students s
    INNER JOIN classes c ON s.class_id = c.id
    WHERE c.adviser_id = p_adviser_id
    ORDER BY s.last_name ASC, s.first_name ASC;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('general','academic','event','important') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `author_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_is_published` (`is_published`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_lrn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `time_in` time NOT NULL,
  `status` enum('present','absent','late') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'present',
  `recorded_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_lrn`,`class_id`,`date`),
  KEY `idx_student_lrn` (`student_lrn`),
  KEY `idx_class_date` (`class_id`,`date`),
  KEY `idx_date` (`date`),
  KEY `recorded_by` (`recorded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_level` int NOT NULL,
  `strand` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ICT, STEM, HUMSS, ABM, etc.',
  `adviser_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `school_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format: 2025-2026',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_adviser_id` (`adviser_id`),
  KEY `idx_school_year` (`school_year`),
  KEY `idx_grade_level` (`grade_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `section`, `grade_level`, `strand`, `adviser_id`, `school_year`, `created_at`, `updated_at`) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Grade 11', 'ICT-A', 11, 'ICT', '550e8400-e29b-41d4-a716-446655440001', '2025-2026', '2026-03-27 02:59:51', '2026-03-27 02:59:51');

-- --------------------------------------------------------

--
-- Table structure for table `document_requests`
--

DROP TABLE IF EXISTS `document_requests`;
CREATE TABLE IF NOT EXISTS `document_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_lrn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','processing','ready','completed','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `processed_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_date` timestamp NOT NULL,
  `processed_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_lrn` (`student_lrn`),
  KEY `idx_status` (`status`),
  KEY `idx_processed_by` (`processed_by`),
  KEY `idx_request_date` (`request_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipment_records`
--

DROP TABLE IF EXISTS `equipment_records`;
CREATE TABLE IF NOT EXISTS `equipment_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_lrn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('lab','sports','library','tle','comp') COLLATE utf8mb4_unicode_ci NOT NULL,
  `equipment_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `borrow_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('borrowed','returned','overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrowed',
  `recorded_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_lrn` (`student_lrn`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_recorded_by` (`recorded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facility_records`
--

DROP TABLE IF EXISTS `facility_records`;
CREATE TABLE IF NOT EXISTS `facility_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_lrn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facility_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `damage_date` date NOT NULL,
  `amount_due` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','paid','resolved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `recorded_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_lrn` (`student_lrn`),
  KEY `idx_status` (`status`),
  KEY `idx_recorded_by` (`recorded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_date` date DEFAULT NULL,
  `uploaded_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
CREATE TABLE IF NOT EXISTS `grades` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_lrn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quarter` tinyint NOT NULL,
  `grade` decimal(5,2) NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `recorded_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade` (`student_lrn`,`class_id`,`subject`,`quarter`),
  KEY `idx_student_lrn` (`student_lrn`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_recorded_by` (`recorded_by`)
) ;

-- --------------------------------------------------------

--
-- Table structure for table `guidance_records`
--

DROP TABLE IF EXISTS `guidance_records`;
CREATE TABLE IF NOT EXISTS `guidance_records` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_lrn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','resolved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `recorded_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_lrn` (`student_lrn`),
  KEY `idx_status` (`status`),
  KEY `idx_recorded_by` (`recorded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
CREATE TABLE IF NOT EXISTS `resources` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `file_url` text COLLATE utf8mb4_unicode_ci,
  `link_url` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lrn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Learner Reference Number',
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_level` int NOT NULL,
  `class_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enrolled_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Adviser user ID',
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lrn` (`lrn`),
  KEY `idx_lrn` (`lrn`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_enrolled_by` (`enrolled_by`),
  KEY `idx_name` (`last_name`,`first_name`),
  KEY `idx_student_grade_level` (`grade_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `lrn`, `first_name`, `middle_name`, `last_name`, `grade_level`, `class_id`, `enrolled_by`, `enrolled_at`, `created_at`, `updated_at`) VALUES
('bc7e14c4-5e48-11f1-94c8-e32922318c2e', 'LRN123456789', 'John Denver', 'F.', 'Robles', 11, '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2026-06-02 06:03:11', '2026-06-02 06:03:11', '2026-06-02 06:03:11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('super_admin','teacher','adviser','guidance_counselor','lab_admin','sports_admin','library_admin','tle_admin','comp_admin','facilities_admin','registrar') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('lab','sports','library','tle','comp') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Only for equipment admins',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `category`, `created_at`, `updated_at`) VALUES
('', 'admin@linhs.edu.ph', '$2y$10$94/kzU9mYRa54bslFmpBMuK51mbsePfvi9jcwOQ/kuuI8JopgdMPC', 'System Admin', 'super_admin', NULL, '2026-03-28 16:18:05', '2026-03-28 17:22:12'),
('550e8400-e29b-41d4-a716-446655440001', 'teacher@linhs.edu.ph', '$2y$10$94/kzU9mYRa54bslFmpBMuK51mbsePfvi9jcwOQ/kuuI8JopgdMPC', 'Juan Dela Cruz', 'adviser', NULL, '2026-03-27 02:59:51', '2026-03-28 17:24:15'),
('550e8400-e29b-41d4-a716-446655440002', 'guidance@linhs.edu.ph', '$2y$10$P2oA2.t.BwG7T9dJ/g.E.uD.g/uH1X7n9/3Y5y/y5/G.y.G.y.G.', 'Maria Santos', 'guidance_counselor', NULL, '2026-03-27 02:59:51', '2026-03-28 15:58:23'),
('550e8400-e29b-41d4-a716-446655440003', 'registrar@linhs.edu.ph', '$2y$10$P2oA2.t.BwG7T9dJ/g.E.uD.g/uH1X7n9/3Y5y/y5/G.y.G.y.G.', 'Pedro Garcia', 'registrar', NULL, '2026-03-27 02:59:51', '2026-03-28 15:58:23'),
('550e8400-e29b-41d4-a716-446655440004', 'lab@linhs.edu.ph', '$2y$10$P2oA2.t.BwG7T9dJ/g.E.uD.g/uH1X7n9/3Y5y/y5/G.y.G.y.G.', 'Anna Reyes', 'lab_admin', NULL, '2026-03-27 02:59:51', '2026-03-28 15:58:23');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_attendance_master_log`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `vw_attendance_master_log`;
CREATE TABLE IF NOT EXISTS `vw_attendance_master_log` (
`academic_strand` varchar(50)
,`attendance_id` varchar(36)
,`class_section` varchar(50)
,`date` date
,`grade_level` int
,`lrn` varchar(20)
,`status` enum('present','absent','late')
,`student_name` varchar(202)
,`time_in` time
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_student_profiles`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `vw_student_profiles`;
CREATE TABLE IF NOT EXISTS `vw_student_profiles` (
`academic_strand` varchar(50)
,`adviser_name` varchar(255)
,`class_name` varchar(100)
,`class_section` varchar(50)
,`current_grade_level` int
,`full_name` varchar(205)
,`lrn` varchar(20)
,`school_year` varchar(20)
,`student_id` varchar(36)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_attendance_master_log`
--
DROP TABLE IF EXISTS `vw_attendance_master_log`;

DROP VIEW IF EXISTS `vw_attendance_master_log`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_attendance_master_log`  AS SELECT `a`.`id` AS `attendance_id`, `a`.`date` AS `date`, `a`.`time_in` AS `time_in`, `a`.`status` AS `status`, `s`.`lrn` AS `lrn`, concat(`s`.`last_name`,', ',`s`.`first_name`) AS `student_name`, `s`.`grade_level` AS `grade_level`, `c`.`section` AS `class_section`, `c`.`strand` AS `academic_strand` FROM ((`attendance` `a` join `students` `s` on((`a`.`student_lrn` = `s`.`lrn`))) join `classes` `c` on((`a`.`class_id` = `c`.`id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_student_profiles`
--
DROP TABLE IF EXISTS `vw_student_profiles`;

DROP VIEW IF EXISTS `vw_student_profiles`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_student_profiles`  AS SELECT `s`.`id` AS `student_id`, `s`.`lrn` AS `lrn`, concat(`s`.`last_name`,', ',`s`.`first_name`,if((`s`.`middle_name` is not null),concat(' ',substr(`s`.`middle_name`,1,1),'.'),'')) AS `full_name`, `s`.`grade_level` AS `current_grade_level`, `c`.`name` AS `class_name`, `c`.`section` AS `class_section`, `c`.`strand` AS `academic_strand`, `u`.`name` AS `adviser_name`, `c`.`school_year` AS `school_year` FROM ((`students` `s` join `classes` `c` on((`s`.`class_id` = `c`.`id`))) join `users` `u` on((`c`.`adviser_id` = `u`.`id`))) ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_lrn`) REFERENCES `students` (`lrn`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`adviser_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `document_requests`
--
ALTER TABLE `document_requests`
  ADD CONSTRAINT `document_requests_ibfk_1` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `equipment_records`
--
ALTER TABLE `equipment_records`
  ADD CONSTRAINT `equipment_records_ibfk_1` FOREIGN KEY (`student_lrn`) REFERENCES `students` (`lrn`) ON DELETE CASCADE,
  ADD CONSTRAINT `equipment_records_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `facility_records`
--
ALTER TABLE `facility_records`
  ADD CONSTRAINT `facility_records_ibfk_1` FOREIGN KEY (`student_lrn`) REFERENCES `students` (`lrn`) ON DELETE CASCADE,
  ADD CONSTRAINT `facility_records_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `gallery`
--
ALTER TABLE `gallery`
  ADD CONSTRAINT `gallery_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_lrn`) REFERENCES `students` (`lrn`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `guidance_records`
--
ALTER TABLE `guidance_records`
  ADD CONSTRAINT `guidance_records_ibfk_1` FOREIGN KEY (`student_lrn`) REFERENCES `students` (`lrn`) ON DELETE CASCADE,
  ADD CONSTRAINT `guidance_records_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
