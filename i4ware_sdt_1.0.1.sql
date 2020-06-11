-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Palvelin: localhost
-- Luontiaika: 17.02.2017 klo 11:17
-- Palvelimen versio: 5.5.46-0ubuntu0.14.04.2
-- PHP:n versio: 5.5.9-1ubuntu4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Tietokanta: `i4ware_sdt`
--

-- --------------------------------------------------------

--
-- Rakenne taululle `access`
--

CREATE TABLE IF NOT EXISTS `access` (
  `access_id` int(12) NOT NULL AUTO_INCREMENT,
  `module` varchar(60) NOT NULL DEFAULT 'default',
  `module_controller` varchar(40) NOT NULL DEFAULT 'index',
  `action` varchar(40) NOT NULL DEFAULT '',
  `access` enum('true','false') NOT NULL DEFAULT 'false',
  `role_id` int(12) NOT NULL DEFAULT '1',
  PRIMARY KEY (`access_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=155 ;

--
-- Vedos taulusta `access`
--

INSERT INTO `access` (`access_id`, `module`, `module_controller`, `action`, `access`, `role_id`) VALUES
(133, 'default', 'json', 'userislogedin', 'true', 2),
(132, 'default', 'json', 'userislogedin', 'false', 1),
(1, 'default', 'index', '', 'true', 1),
(46, 'default', 'index', 'logout', 'true', 1),
(4, 'default', 'error', '', 'true', 1),
(23, 'default', 'javascript', 'login', 'true', 1),
(45, 'default', 'index', 'secure', 'false', 1),
(11, 'default', 'index', '', 'true', 2),
(12, 'default', 'javascript', '', 'true', 2),
(13, 'default', 'json', '', 'true', 2),
(14, 'default', 'error', '', 'true', 2),
(15, 'default', 'index', 'secure', 'true', 2),
(95, 'default', 'json', 'gen', 'true', 2),
(96, 'default', 'json', 'accountsave', 'true', 2),
(97, 'default', 'json', 'change', 'true', 2),
(102, 'default', 'index', '', 'true', 3),
(103, 'default', 'javascript', '', 'true', 3),
(104, 'default', 'json', '', 'true', 3),
(105, 'default', 'error', '', 'true', 3),
(106, 'default', 'index', 'secure', 'true', 3),
(107, 'default', 'json', 'gen', 'true', 3),
(108, 'default', 'json', 'accountsave', 'true', 3),
(109, 'default', 'json', 'change', 'true', 3),
(68, 'default', 'index', '', 'true', 5),
(69, 'default', 'javascript', '', 'true', 5),
(70, 'default', 'json', '', 'true', 5),
(71, 'default', 'index', 'logout', 'true', 5),
(72, 'default', 'index', 'login', 'true', 5),
(73, 'default', 'index', 'secure', 'true', 5),
(94, 'users', 'users:json', 'edit', 'true', 7),
(93, 'users', 'users:json', '', 'true', 7),
(92, 'users', 'users:index', '', 'true', 7),
(91, 'users', 'users:javascript', '', 'true', 7),
(154, 'welcome', 'welcome:javascript', '', 'true', 2),
(153, 'welcome', 'welcome:json', '', 'true', 2),
(152, 'welcome', 'welcome:index', '', 'true', 2);

-- --------------------------------------------------------

--
-- Rakenne taululle `roles`
--

CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` int(12) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(60) NOT NULL,
  `role_inherit` varchar(60) NOT NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=9 ;

--
-- Vedos taulusta `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `role_inherit`, `order`) VALUES
(1, 'defaultRole', '', 1),
(2, 'careerRole', 'defaultRole', 2),
(3, 'employeeRole', 'careerRole', 3),
(4, 'employerRole', 'employeeRole', 4),
(5, 'customerRole', 'employerRole', 5),
(6, 'adminRole', 'customerRole', 6),
(7, 'superadminRole', 'adminRole', 7);

-- --------------------------------------------------------

--
-- Rakenne taululle `userredirection`
--

CREATE TABLE IF NOT EXISTS `userredirection` (
  `ID` int(12) NOT NULL AUTO_INCREMENT,
  `role_id` int(12) NOT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7 ;

--
-- Vedos taulusta `userredirection`
--

INSERT INTO `userredirection` (`ID`, `role_id`, `url`) VALUES
(1, 2, '/welcome/index/index'),
(2, 3, '/welcome/index/index'),
(3, 4, '/welcome/index/index'),
(4, 5, '/welcome/index/index'),
(5, 6, '/welcome/index/index'),
(6, 7, '/welcome/index/index');

-- --------------------------------------------------------

--
-- Rakenne taululle `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(12) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(20) DEFAULT NULL,
  `lastname` varchar(20) DEFAULT NULL,
  `username` varchar(40) NOT NULL,
  `password` varchar(64) NOT NULL,
  `password_salt` varchar(80) NOT NULL,
  `active` enum('true','false') NOT NULL DEFAULT 'true',
  `role_id` int(12) NOT NULL DEFAULT '1',
  `email` varchar(60) NOT NULL,
  `company` varchar(255) NOT NULL DEFAULT 'i4ware Software',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- Vedos taulusta `users`
--

INSERT INTO `users` (`user_id`, `firstname`, `lastname`, `username`, `password`, `password_salt`, `active`, `role_id`, `email`, `company`) VALUES
(1, 'Matti', 'Kiviharju', 'admin', 'ef224aafee22df6209ad1708c17ed607718416f0', '17708b0312cdbc2e8e28a14773be7a856222e4fe', 'true', 7, 'matti.kiviharju@i4ware.fi', 'i4ware Software'),
(2, 'Matti', 'Kiviharju', 'matti', '8ff03f248112cf6981c9c544d3012896a6bb8a0f', '09fb551ef81fd86aea00acd0548995991643e1a1', 'true', 3, 'matti.kiviharju@i4ware.fi', 'i4ware Software'),
(3, 'Logan', 'Miller', 'logan', '156f5cd82d46ee71f3c64e2f5661d760cbed75a5', 'b46615146d133e44ec36f2d579986c13a4618f5b', 'true', 6, 'logan.miller@i4ware.fi', 'i4ware Software');
