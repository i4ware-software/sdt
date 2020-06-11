<?php 

/**
 * ZF-Ext Framework
 * @package    Users
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

require_once 'Zend/Controller/Action.php';
/** Zend_Controller_Action */

class Users_IndexController extends Zend_Controller_Action
{
    
	/** protected variable for ALC */
	protected $_acl;
	
	/*
	 * Here we initialice ACL helper from Zion Framework.
	 * Zion Framework is located in /zf/library/Auth/Zion
	 * folder that root is in this software include path.
	 */	
	public function __init() {
	
	$this->_acl = $this->_helper->getHelper('acl');
	
	}
	/*
	 * Index action for home module on Home_IndexController.
	 * Currently does nothing just blank HTML page.
	 */
    public function indexAction()
    {
	    /** Object variable. Example use: $logger->err("Some error"); */
		$logger = Zend_Registry::get('LOGGER');
		/** Object variable. Example use: $something = $config->database; */
		$config = Zend_Registry::get('config');
		/** Object variable. Example use: print $date->get(); */
		$date = Zend_Registry::get('date');
		/** Object variable. Example use: $stmt = $db->query($sql); */
		$db = Zend_Registry::get('dbAdapter');
		$this->view->layout = $config->layout;
	    $request = $this->getRequest();
	
	}
}

