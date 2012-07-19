# ************************************************************
# Sequel Pro SQL dump
# Version 3408
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: localhost (MySQL 5.5.20)
# Database: tasktracker
# Generation Time: 2012-07-19 13:12:01 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table tt_items
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tt_items`;

CREATE TABLE `tt_items` (
  `i_id` int(11) NOT NULL AUTO_INCREMENT,
  `i_title` varchar(200) NOT NULL,
  `i_cost` float DEFAULT NULL,
  `i_hours` int(11) DEFAULT NULL,
  `i_linkid` int(11) DEFAULT NULL COMMENT 'if no link id, then is in root of project',
  `i_projectid` int(11) NOT NULL,
  `i_complete` tinyint(4) DEFAULT NULL,
  `i_preferredduration` enum('months','weeks','days','hours') DEFAULT NULL,
  PRIMARY KEY (`i_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table tt_project_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tt_project_users`;

CREATE TABLE `tt_project_users` (
  `tt_projectid` int(11) NOT NULL,
  `tt_userid` int(11) NOT NULL,
  `tt_role` enum('administrator','user') NOT NULL DEFAULT 'administrator',
  KEY `tt_projectid` (`tt_projectid`,`tt_userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table tt_projects
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tt_projects`;

CREATE TABLE `tt_projects` (
  `p_id` int(11) NOT NULL AUTO_INCREMENT,
  `p_title` varchar(100) NOT NULL,
  `p_duedate` date DEFAULT NULL,
  `p_totalmoney` float DEFAULT NULL,
  `p_achievedmoney` float DEFAULT NULL,
  `p_totaltime` int(11) NOT NULL DEFAULT '0',
  `p_achievedtime` int(11) NOT NULL DEFAULT '0',
  `p_hue` smallint(7) NOT NULL DEFAULT '0',
  `p_notes` text,
  PRIMARY KEY (`p_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table tt_tags
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tt_tags`;

CREATE TABLE `tt_tags` (
  `tag_string` varchar(30) NOT NULL,
  `tag_projectid` int(11) NOT NULL,
  KEY `tag_string` (`tag_string`,`tag_projectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table tt_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tt_users`;

CREATE TABLE `tt_users` (
  `u_id` int(11) NOT NULL AUTO_INCREMENT,
  `u_tag` varchar(30) NOT NULL,
  `u_firstname` varchar(30) NOT NULL,
  `u_lastname` varchar(30) NOT NULL,
  `u_email` varchar(50) NOT NULL,
  `u_username` varchar(16) DEFAULT NULL,
  `u_password` char(32) DEFAULT NULL,
  `u_temppass` char(32) DEFAULT NULL,
  `u_timestamp` int(20) DEFAULT NULL,
  PRIMARY KEY (`u_id`),
  UNIQUE KEY `u_email` (`u_email`),
  UNIQUE KEY `u_username` (`u_username`),
  KEY `u_tag` (`u_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
