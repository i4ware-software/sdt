<?php 

/**
 * ZF-Ext Framework
 * This Zend_Controller_Action makes main JavaScript 
 * dynamically from its index action view script.
 * @package    Welcome
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */
 
/** Zend_Controller_Action */
require_once 'Zend/Controller/Action.php';
 
class Welcome_JavascriptController extends Zend_Controller_Action
{
    
	/** protected variable for ALC */
	protected $_acl;
	
	/**
	 * Here we initialice ACL helper from Zion Framework.
	 * Zion Framework is located in /zf/library/Auth/Zion
	 * folder that root is in this software include path.
	 */
	public function __init() {
	
		$this->_acl = $this->_helper->getHelper('acl');
		
		$viewRenderer =
			Zend_Controller_Action_HelperBroker::getStaticHelper('viewRenderer');
		$viewRenderer->setView($view)
					 ->setViewSuffix('js');	
	}
	
	public function preDispatch()
    {
        // change view encoding
        $this->view->setEncoding('UTF-8');
		$this->_helper->viewRenderer->setViewSuffix('js');
    }
	
	/**
	 * Index action method prints main aplication's
	 * ExtJS ViewPort with navication bar in left 
	 * and Managed Iframe on right for modules. Also
	 * this redirects to login page and destroys a 
	 * session if user is not loged in. 
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
		/** Object variable. Example use: echo $translate->_("my_text"); */
		$translate = Zend_Registry::get('translate');
		/** Object variable. */
        $userRole = Zend_Registry::get('userRole');
        /** Object variable. */
        $acl = Zend_Registry::get('ACL');
        /** Object variable. */
        $id = Zend_Registry::get('userId');
		
		$this->view->welcome = $translate->_("Welcome_Welcome");
		
    }
	
}

