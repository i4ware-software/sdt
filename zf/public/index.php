<?php

/**
 * ZF-Ext Framework
 * 
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

// Define path to application directory
defined('APPLICATION_PATH')
    || define('APPLICATION_PATH',
              realpath(dirname(__FILE__) . '/../application'));

// Define application environment
defined('APPLICATION_ENV')
    || define('APPLICATION_ENV',
              (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV')
                                         : 'production'));

// Typically, you will also want to add your library/ directory
// to the include_path, particularly if it contains your ZF install
set_include_path(implode(PATH_SEPARATOR, array(
    dirname(dirname(__FILE__)) . '/library',
    get_include_path()
)));

if (version_compare(phpversion(), '5.2.0', '<') === true) {
	die('Sorry PHP 5.2.0 or never is needed. You have a vesion ' .phpversion(). '.' );
}

if(!extension_loaded('pdo_mysql')) {
	die("You need to enable the module pdo_mysql.");
}

require_once(APPLICATION_PATH.'/Bootstrap.php');

Bootstrap::run();

