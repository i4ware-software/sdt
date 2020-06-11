<?php 

/**
 * ZF-Ext Framework
 * This Zend_Controller_Action makes main JavaScript 
 * dynamically from its index action view script.
 * @package    Users
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */
 
/** Zend_Controller_Action */
require_once 'Zend/Controller/Action.php';
 
class Users_JavascriptController extends Zend_Controller_Action
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
		
		$this->view->deselect = $translate->_("Users_De_Select");
		$this->view->deselect_tooltip = $translate->_("Users_De_Select_Tooltip");
		$this->view->username = $translate->_("Users_Username");
		$this->view->email = $translate->_("Users_Email");
		$this->view->company = $translate->_("Users_Company");
		$this->view->refresh = $translate->_("Users_Refresh");
		$this->view->refresh_tooltip = $translate->_("Users_Refresh_Tooltip");	
		$this->view->date_of_birth = $translate->_("Users_Date_of_Birth");
		$this->view->action = $translate->_("Users_Action");
		$this->view->access = $translate->_("Users_Access");
		$this->view->allow = $translate->_("Users_Allow");
		$this->view->deny = $translate->_("Users_Deny");
		$this->view->update = $translate->_("Users_Update");
		$this->view->cancel = $translate->_("Users_Cancel");
		$this->view->items = $translate->_("Users_Items");		
		$this->view->item = $translate->_("Users_Item");
		$this->view->new_user = $translate->_("Users_New_User");
		$this->view->new_user_tooltip = $translate->_("Users_New_User_Tooltip");
		$this->view->firstname = $translate->_("Users_Firstname");
		$this->view->lastname = $translate->_("Users_Lastname");
		$this->view->password = $translate->_("Users_Password");
		$this->view->verify = $translate->_("Users_Verify");
		$this->view->generate = $translate->_("Users_Generate");
		$this->view->generatepassword = $translate->_("Users_Generate_Password");
		$this->view->loading = $translate->_("Users_Loading");
		$this->view->copypaste = $translate->_("Users_Copy_Paste");
		$this->view->warning = $translate->_("Users_Warning");
		$this->view->close = $translate->_("Users_Close");
		$this->view->submit = $translate->_("Users_Submit");
		$this->view->error = $translate->_("Users_Error");
		$this->view->sending = $translate->_("Users_Sending");
		$this->view->userrole = $translate->_("Users_Userrole");
		$this->view->success = $translate->_("Users_Success");
		$this->view->fullname = $translate->_("Users_Fullname");
		$this->view->role = $translate->_("Users_Role");
		$this->view->change_password = $translate->_("Users_Change_Password");
		$this->view->change_password_tooltip = $translate->_("Users_Change_Password_Tooltip");
		$this->view->edit_user = $translate->_("Users_Edit_User");
		$this->view->edit_user_tooltip = $translate->_("Users_Edit_User_Tooltip");
		$this->view->ext_date_format = $translate->_("Ext_Date_Format");
		$this->view->edituser = $translate->_("Users_Edit_User");
		$this->view->delete = $translate->_("Users_Delete");
		$this->view->delete_tooltip = $translate->_("Users_Delete_Tooltip");
		$this->view->areyousuretitle = $translate->_("Users_Are_You_Sure_Title");
		$this->view->areyousuretext = $translate->_("Users_Are_You_Sure_Text");
		
        if($acl->isAllowed($userRole, 'users:javascript', 'addsuperadmin')) {
		$this->view->addsuperadmin = true;
		} else {
		$this->view->addsuperadmin = false;
		}
		
    }
	
}

