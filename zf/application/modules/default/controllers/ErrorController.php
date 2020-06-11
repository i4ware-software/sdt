<?php

/**
 * ZF-Ext Framework
 * This is error controller that handles HTTP 404 errors and 
 * ACL access denied action method.
 * @package    Default
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

/** Zend_Controller_Action */
require_once 'Zend/Controller/Action.php';
 
class ErrorController extends Zend_Controller_Action
{
    
	public function preDispatch()
    {
        // change view encoding
        $this->view->setEncoding('UTF-8');
    }
	/**
	 * Error action method prints JSON script 
	 * {'success':false,'msg':'Error message!'}
	 * and writes error message line to log files
	 * in /zf/application/log folder.
	 */
    public function errorAction()
    {
		/** Object variable. Example use: $logger->err("Some error"); */
		
		$request = $this->getRequest();
		
		$logger = Zend_Registry::get('LOGGER');
		$errors = $this->_getParam('error_handler');		
		$logger->err("IP: ".$_SERVER['REMOTE_ADDR']." USER AGENT: "
		. $_SERVER['HTTP_USER_AGENT'] . ", ERROR: "
		.ereg_replace("[\r\t\n\v]","",$errors->exception));	
		$json = ereg_replace("[\r\t\n\v]","",$errors->exception);
		$success = array('success' => false
		, 'msg' => $json);
		
              if ($request->isXmlHttpRequest()) {
		
		$this->view->success = Zend_Json::encode($success);
		
		} else {
		
		$this->view->success = $errors->exception;
		
		}
		
	}
	
	/**
	 * When access is denied for some application fuctions like
	 * module Timesheet's JsonController's action method index etc. 
	 */
	public function deniedAction()
    {
	    /** Object variable. Example use: echo $translate->_("my_text"); */
	   $translate = Zend_Registry::get('translate');
		
		$request = $this->getRequest();
		
		$logger = Zend_Registry::get('LOGGER');
		$success = array('success' => false
		, 'msg' => $translate->_("Default_Denied"));
		
		if ($request->isXmlHttpRequest()) {
		
		$this->view->success = Zend_Json::encode($success);
		
		} else {
		
		$this->view->success = $translate->_("Default_Denied");
		
		}
    }
}

