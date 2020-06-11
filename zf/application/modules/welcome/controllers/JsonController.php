<?php 

/**
 * ZF-Ext Framework
 * Controller for all JSON based AJAX requests.
 * @package    Welcome
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

/** Zend_Controller_Action */
require_once 'Zend/Controller/Action.php';

class Welcome_JsonController extends Zend_Controller_Action
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
	
	}
	
	/**
	 * Here we call error handler if action method not
	 * found and throws to exeption.
	 */
    public function __call($method, $args) {
   
        if ('Action' == substr($method, -6)) {
            // If the action method was not found, render the error
            // template
            return $this->render('error');
        }

        // all other methods throw an exception
        throw new Exception('Invalid method "'
                            . $method
                            . '" called',
                            500);
    }
	
	/**
	 * Index action method does nothing.
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
		/** Object variable. */
        $userRole = Zend_Registry::get('userRole');
        /** Object variable. */
        $acl = Zend_Registry::get('ACL');
        /** Object variable. */
        $id = Zend_Registry::get('userId');

		$success = array('success' => false);
		
		$request = $this->getRequest();
		
		$start = (integer) $request->getPost('start'); 
		$end = (integer) $request->getPost('limit'); 
		$query = (string) strip_tags(stripslashes($request->getPost('query')));
		$dir = (string) strip_tags(stripslashes($request->getPost('dir')));
		$sort = (string) strip_tags(stripslashes($request->getPost('sort')));
				
		$success = array('success' => true);
		
		echo Zend_Json::encode($success);	
		
		exit();   
	   
    }
	
}

