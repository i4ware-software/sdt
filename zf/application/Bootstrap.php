<?php

/**
 * ZF-Ext Framework
 * 
 * @package    Bootstrap
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */
 
 // Define path to application directory
defined('APPLICATION_PATH')
    || define('APPLICATION_PATH',
              realpath(dirname(__FILE__) ));

// Define application environment
defined('APPLICATION_ENV')
    || define('APPLICATION_ENV',
              (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV')
                                         : 'production'));

require_once ('Zend/Loader.php');

Zend_Loader::loadClass('Zend_Loader_Autoloader');

$autoloader = Zend_Loader_Autoloader::getInstance();

//Zend_Loader::registerAutoload();
/** PHPPowerPoint */
include 'PHPPowerPoint.php';

/** PHPPowerPoint_IOFactory */
include 'PHPPowerPoint/IOFactory.php';

/** PHPExcel */
require_once 'PHPExcel.php';

/** PHPExcel_IOFactory */
require_once 'PHPExcel/IOFactory.php';

Zend_Loader::loadFile('Core/Core.php', $dirs=null, $once=true);
Zend_Loader::loadFile('simple_html_dom.php', $dirs=null, $once=true);
Zend_Loader::loadFile('tcpdf/tcpdf.php', $dirs=null, $once=true);

$config = new Zend_Config_Xml( APPLICATION_PATH . '/configs/config.xml', APPLICATION_ENV);

$ini = new Zend_Config_Ini( APPLICATION_PATH .'/configs/session.ini', APPLICATION_ENV);

Zend_Session::setOptions($ini->toArray());

Zend_Session::start();

date_default_timezone_set($config->timezone);

$locale = new Zend_Locale($config->locale);

$date = new Zend_Date($locale);

Zend_Registry::set('locale', $locale);
Zend_Registry::set('date', $date);

$logger = new Zend_Log();
try {
$writer = new Zend_Log_Writer_Stream( APPLICATION_PATH .'/log/zf_'.$date->get('MM-dd-yyyy').'.log');
} catch (Exception $e) {
    // File not found, no adapter class...
    // General failure
	echo APPLICATION_PATH .'/log is not writable!';
}
$logger->addWriter($writer);
$logger->setEventItem('pid', getmypid());
$logger->setEventItem('useragent', $_SERVER['HTTP_USER_AGENT']);

/*
 * Here we register all important variables for further usage.
 */
Zend_Registry::set('LOGGER', $logger);
Zend_Registry::set('config', $config);
Zend_Registry::set('date', $date);

     try {
        $db = Zend_Db::factory($config->database);
        $db->getConnection();
		// we register database variable for further use
		Zend_Registry::set('dbAdapter', $db);
        } catch (Zend_Db_Adapter_Exception $e) {
        // perhaps a failed login credential, or perhaps the RDBMS is not running
        $logger->err("IP: ".$_SERVER['REMOTE_ADDR']." USER AGENT: ". $_SERVER['HTTP_USER_AGENT'] .", Databese: "
		. $config->database->adapter .": perhaps a failed login credential, or perhaps the RDBMS is not running!");
        } catch (Zend_Exception $e) {
        // perhaps factory() failed to load the specified Adapter class
        $logger->err("IP: ".$_SERVER['REMOTE_ADDR']." USER AGENT: ". $_SERVER['HTTP_USER_AGENT'] .", Databese: "
		. $config->database->adapter .": perhaps factory() failed to load the specified Adapter class!");
        } 
		
try {
    $translate = new Zend_Translate('csv', APPLICATION_PATH.'/locale/'.$config->locale.'/translation.csv', $config->language);
} catch (Exception $e) {
    // File not found, no adapter class...
    // General failure
	$logger->err("IP: ".$_SERVER['REMOTE_ADDR']." USER AGENT: "
	. $_SERVER['HTTP_USER_AGENT'] .", translation.csv file not found!");
}

$dirContent = Core::rscandir(APPLICATION_PATH . '/modules/');
		
		foreach($dirContent as $row)
		{
		
			try {
			$translate->addTranslation(APPLICATION_PATH.'/locale/'.$config->locale.'/'.$row.'.csv', $config->language);	
				} catch (Exception $e) {
				// File not found, no adapter class...
				// General failure
				$logger->err("IP: ".$_SERVER['REMOTE_ADDR']." USER AGENT: "
				. $_SERVER['HTTP_USER_AGENT'] .", ".$row.".csv file not found!");
			}
				
		}
		
$translate->setLocale($config->language);

Zend_Registry::set('translate', $translate);
Zend_Registry::set('staticSalt', $config->salt);

/**
 * Bootstrap is main file for whole MVC model 
 * of this software framework. It runs Conrollers
 * Models, View Scripts, ALC (user roles and access 
 * control) and Authentication for login and/or logout. 
 * Also this loads all needed class libraries and 
 * making database connection to MySQL with PDO_MYSQL.
 * @package Bootstrap
 */
final class Bootstrap {
	
	/** 
	 * Public static function for Bootstrap. This is only 
	 * function in this class and runs all that belongs
	 * this software MVC model.
	 */
	public static function run()
	{
	
		/** Object variable. Example use: $logger->err("Some error"); */
		$logger = Zend_Registry::get('LOGGER');
		/** Object variable. Example use: $something = $config->database; */
		$config = Zend_Registry::get('config');
		/** Object variable. Example use: print $date->get(); */
		$date = Zend_Registry::get('date');
		/** Object variable. Example use: $stmt = $db->query($sql); */
		$db = Zend_Registry::get('dbAdapter');
	
		Zend_Loader::loadFile('Zend/Controller/Front.php',
		$dirs=null, $once=true);
		
		Zend_Loader::loadFile('Zend/Controller/Router/Rewrite.php',
		$dirs=null, $once=true);

		Zend_Loader::loadFile('Zend/Controller/Router/Route/Regex.php',
		$dirs=null, $once=true);		

		Zend_Loader::loadClass('Zend_Controller_Plugin_Abstract');
		Zend_Loader::loadFile('Auth/My_Auth_Adapter.php', $dirs=null, $once=true);
		
		$acl = new Zend_Acl();
		
		//$acl->addRole(new Zend_Acl_Role('defaultRole'))
		//    ->addRole(new Zend_Acl_Role('adminRole'), 'defaultRole');
			
		$sql = 'SELECT * FROM roles';
		$stmt = $db->query($sql);
		
		while($row = $stmt->fetch())
		{				
			if ($row['role_inherit']=='') {
				$acl->addRole(new Zend_Acl_Role($row['role_name']));
			} else {
				$acl->addRole(new Zend_Acl_Role($row['role_name']), $row['role_inherit']);
			}			
		}	
		
		$dirContent = Core::rscandir(APPLICATION_PATH . '/modules/');
			
		foreach($dirContent as $row)
		{
			include( APPLICATION_PATH . '/modules/'.$row.'/module.conf.php' ); 			
			
		}
		
		foreach ($resources as $key => $value) {
			foreach ($value as $key => $value) {
			$acl->add(new Zend_Acl_Resource($value, $row));
			}
		}
			
		$sql = "SELECT * FROM access RIGHT JOIN roles ON access.role_id = roles.role_id WHERE access.access = 'true';";
		$stmt = $db->query($sql);
		
		/**
		 * Example of manual hardcoding way to set
		 * ACL rules for some user by its role 
		 * (defaultRole). defaultRole is made for
		 * non-logged user so be carreful when edit
		 * defaultRole ACL. With mistage you are able
		 * to allow all to non-loged user without login.
		 *
		 
		$acl->allow('defaultRole', 'index')
		 	->deny('defaultRole', 'javascript')
			->allow('defaultRole', 'error')
			->deny('defaultRole', 'json')
		    ->deny('defaultRole', 'timesheet:index')
			->deny('defaultRole', 'timesheet:javascript')
			->deny('defaultRole', 'timesheet:json')
			->deny('defaultRole', 'timesheet:json', 'edit')
			->deny('defaultRole', 'home:index'); 			
		 *
		 */
		
		while($row = $stmt->fetch()) {
		
			if ($row['action']=='') {
			$acl->allow($row['role_name'], $row['module_controller']);
			} else {
			$acl->allow($row['role_name'], $row['module_controller'], $row['action']);
			}
		
		}
		
		$sql = "SELECT * FROM access RIGHT JOIN roles ON access.role_id = roles.role_id WHERE access.access = 'false';";
		$stmt = $db->query($sql);
		
		while($row = $stmt->fetch()) {
		
			if ($row['action']=='') {
			$acl->deny($row['role_name'], $row['module_controller']);
			} else {
			$acl->deny($row['role_name'], $row['module_controller'], $row['action']);
			}
		
		}			
			
			$router     = new Zend_Controller_Router_Rewrite();
			$controller = Zend_Controller_Front::getInstance();
			$controller->setModuleControllerDirectoryName( 'controllers' )
			->setRouter($router);
			$controller->addModuleDirectory( APPLICATION_PATH . '/modules' );
			//$controller->setParam('useDefaultControllerAlways', true);	
			
			require_once 'Auth/Zion/Controller/Plugin/Acl.php';
            
			if (!Zend_Session::namespaceIsset('Zend_Auth')) {
			$controller->registerPlugin(new Zion_Controller_Plugin_Acl($acl, 'defaultRole'));
			Zend_Registry::set('userRole', 'defaultRole');
			} else {
			
			$stmt = $db->query("SELECT users.user_id, users.role_id, roles.role_name"
			." FROM users RIGHT JOIN roles ON users.role_id = roles.role_id WHERE username = '"
			.$_SESSION['Zend_Auth']['user']."';");			
		
			 while ($row = $stmt->fetch()) {
             $controller->registerPlugin(new Zion_Controller_Plugin_Acl($acl, $row['role_name']));
			 Zend_Registry::set('userRole', $row['role_name']);
			 Zend_Registry::set('userId', $row['user_id']);
             }			
			
			}	
			
			require_once 'Auth/Zion/Controller/Action/Helper/Acl.php';
			require_once 'Zend/Controller/Action/HelperBroker.php';
			Zend_Controller_Action_HelperBroker::addHelper(new Zion_Controller_Action_Helper_Acl());	
			
			foreach ( $dirContent as $row) {
				 include( APPLICATION_PATH . '/modules/'.$row.'/module.conf.php' );  				 
			}
			
			foreach ($module as $key => $value) {			
				
				foreach ($value as $key => $value) {
				
				$route = new Zend_Controller_Router_Route_Regex(
				$value['regex'],
				$value['defaults'],
				$value['map'],
				$value['reverse']
				);
				
				$router->addRoute($key, $route);
				
				}
			
			}
			
		Zend_Registry::set('ACL', $acl);
			
	    $response   = $controller->dispatch();
		
		Zend_Layout::startMvc();

	}

}

