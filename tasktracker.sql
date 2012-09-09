-- phpMyAdmin SQL Dump
-- version 3.3.9
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Sep 09, 2012 at 11:29 AM
-- Server version: 5.5.20
-- PHP Version: 5.3.5

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `tasktracker`
--

-- --------------------------------------------------------

--
-- Table structure for table `tt_items`
--

CREATE TABLE IF NOT EXISTS `tt_items` (
  `i_id` int(11) NOT NULL AUTO_INCREMENT,
  `i_title` varchar(200) NOT NULL,
  `i_cost` float DEFAULT '0',
  `i_hours` int(11) DEFAULT NULL,
  `i_linkid` int(11) DEFAULT NULL COMMENT 'if no link id, then is in root of project',
  `i_projectid` int(11) NOT NULL,
  `i_complete` tinyint(4) DEFAULT NULL,
  `i_preferredduration` enum('months','weeks','days','hours') DEFAULT NULL,
  PRIMARY KEY (`i_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=185 ;

--
-- Dumping data for table `tt_items`
--

INSERT INTO `tt_items` (`i_id`, `i_title`, `i_cost`, `i_hours`, `i_linkid`, `i_projectid`, `i_complete`, `i_preferredduration`) VALUES
(9, 'This is a', 0, NULL, NULL, 9, NULL, 'hours'),
(59, 'demo title this title', 23.5, 132, 9, 9, 1, 'weeks'),
(60, 'demo title', 11, 10, 9, 9, 1, 'hours'),
(64, 'resolve you', 8.25, 210, 9, 9, 1, 'days'),
(65, 'in the water', 22, 20, 9, 9, 0, 'hours'),
(68, 'Starting edi', 0, 0, NULL, 10, 1, 'hours'),
(70, 'extra edit', 0, 0, NULL, 10, 0, 'hours'),
(72, 'sub 1', 0, 3, 70, 10, 1, 'hours'),
(73, 'A demo title', 0, 42, NULL, 11, 1, 'days'),
(75, 'demo', 7.5, 0, 9, 9, 1, 'hours'),
(76, 'this is a demo part', 0, 0, 9, 9, 1, 'hours'),
(77, 'here is the new ti', 8.75, 1554, NULL, 9, 1, 'days'),
(78, 'The final title', 0, 216, 9, 9, 1, 'days'),
(81, 'New Title', 0, 3420, 77, 9, 1, 'months'),
(97, 'The new title', 0, 798, NULL, 9, 0, 'weeks'),
(98, '', 12.25, 1554, NULL, 9, 1, 'weeks'),
(99, 'New Title', 4, 1218, NULL, 9, 0, 'weeks'),
(100, '', 0, 0, NULL, 11, 0, 'hours'),
(101, 'Edit this title', 0, 120, NULL, 11, 0, 'days'),
(102, '', 0, 0, NULL, 11, 0, 'hours'),
(103, '', 0, 0, NULL, 11, 0, 'hours'),
(108, 'and one more', 5.75, 1, NULL, 12, 0, 'hours'),
(126, 'edit that title', 5.75, 2, 108, 12, 0, 'hours'),
(127, 'A new title', 0, 0, NULL, 15, 0, 'hours'),
(128, 'new title', 0, 3, NULL, 14, 1, 'hours'),
(129, 'this is the new title', 0, 96, 128, 14, 1, 'days'),
(130, 'New element well', 2.25, 3, NULL, 13, 1, 'hours'),
(138, 'a new item', 1.25, 1, NULL, 16, 1, 'hours'),
(142, 'A new title', 2.5, 2, NULL, 16, 0, 'hours'),
(144, 'a new item', 0, 0, NULL, 17, 0, 'hours'),
(148, 'And what is this?', 1.5, 2, 108, 12, 1, 'hours'),
(165, 'and how', 1.5, 2, 148, 12, 1, 'hours'),
(166, '', 0, 0, NULL, 36, 0, 'hours'),
(167, '', 0, 0, NULL, 36, 0, 'hours'),
(168, 'The demo', 0, 0, NULL, 37, 0, 'hours'),
(169, 'A dummy', 0, 2, NULL, 41, 1, 'hours'),
(170, 'another one', 0, 2, NULL, 42, 1, 'days'),
(171, 'And the extra', 2.5, 4, NULL, 42, 0, 'hours'),
(172, 'and extra title', 0, 3, NULL, 43, 1, 'hours'),
(173, 'jhgkjhlkj', 3.5, 3, NULL, 13, 1, 'hours'),
(179, 'kjijhihj', 2.25, 3, 130, 13, 0, 'hours'),
(180, 'kjhiojgoig', 0, 1, 130, 13, 1, 'hours'),
(181, 'afaweawes', 3.5, 3, 173, 13, 1, 'hours'),
(182, 'joasoejfasoe', 0, 0, NULL, 44, 0, 'hours'),
(183, 'asrfasrsdgrs', 0, 0, NULL, 44, 0, 'hours'),
(184, 'And the new title', 2.25, 3, NULL, 45, 0, 'hours');

-- --------------------------------------------------------

--
-- Table structure for table `tt_projects`
--

CREATE TABLE IF NOT EXISTS `tt_projects` (
  `p_id` int(11) NOT NULL AUTO_INCREMENT,
  `p_title` varchar(100) NOT NULL,
  `p_duedate` varchar(9) DEFAULT NULL,
  `p_totalmoney` float DEFAULT NULL,
  `p_achievedmoney` float DEFAULT NULL,
  `p_totaltime` int(11) NOT NULL DEFAULT '0',
  `p_achievedtime` int(11) NOT NULL DEFAULT '0',
  `p_hue` smallint(7) NOT NULL DEFAULT '0',
  `p_notes` text,
  PRIMARY KEY (`p_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=46 ;

--
-- Dumping data for table `tt_projects`
--

INSERT INTO `tt_projects` (`p_id`, `p_title`, `p_duedate`, `p_totalmoney`, `p_achievedmoney`, `p_totaltime`, `p_achievedtime`, `p_hue`, `p_notes`) VALUES
(12, 'This is the proejct what what and what and', '12-9-15', 7.25, 1.5, 4, 2, 114, 'this is a note if you know what I mean'),
(13, 'What is all this then?', '14-11-20', 5.75, 3.5, 7, 4, 209, 'And the notes go....'),
(41, 'and how and what', '12-4-0', 0, 0, 2, 2, 189, ''),
(42, 'no title asfse ', 'NULL', 2.5, 0, 6, 2, 16, '');

-- --------------------------------------------------------

--
-- Table structure for table `tt_project_users`
--

CREATE TABLE IF NOT EXISTS `tt_project_users` (
  `tt_projectid` int(11) NOT NULL,
  `tt_userid` int(11) NOT NULL,
  `tt_role` enum('administrator','user') NOT NULL DEFAULT 'administrator',
  KEY `tt_projectid` (`tt_projectid`,`tt_userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tt_project_users`
--

INSERT INTO `tt_project_users` (`tt_projectid`, `tt_userid`, `tt_role`) VALUES
(1, 1, 'administrator'),
(3, 2, 'administrator'),
(3, 1, 'administrator');

-- --------------------------------------------------------

--
-- Table structure for table `tt_tags`
--

CREATE TABLE IF NOT EXISTS `tt_tags` (
  `tag_string` varchar(30) NOT NULL,
  `tag_projectid` int(11) NOT NULL,
  KEY `tag_string` (`tag_string`,`tag_projectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tt_tags`
--

INSERT INTO `tt_tags` (`tag_string`, `tag_projectid`) VALUES
('bruno', 12),
('bruno', 13),
('delete', 12),
('rhys', 12),
('subject', 11),
('test', 11);

-- --------------------------------------------------------

--
-- Table structure for table `tt_users`
--

CREATE TABLE IF NOT EXISTS `tt_users` (
  `u_id` int(11) NOT NULL AUTO_INCREMENT,
  `u_username` varchar(30) NOT NULL,
  `u_password` varchar(64) NOT NULL,
  `u_firstname` varchar(30) NOT NULL,
  `u_lastname` varchar(30) NOT NULL,
  `u_email` varchar(50) NOT NULL,
  PRIMARY KEY (`u_id`),
  KEY `u_tag` (`u_username`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `tt_users`
--

INSERT INTO `tt_users` (`u_id`, `u_username`, `u_password`, `u_firstname`, `u_lastname`, `u_email`) VALUES
(1, 'rhys', '5f4dcc3b5aa765d61d8327deb882cf99', 'Rhys', 'Sullivan', 'rhys_sullivan@yahoo.com'),
(2, 'bruno', '', 'Bruno', 'Herfst', 'bruno@t.oolbox.com'),
(3, 'jsmith', '5f4dcc3b5aa765d61d8327deb882cf99', 'John', 'Smith', 'john@smith.com');
