<?php

/**
 * ZF-Ext Framework
 * 
 * @package    My_Auth_Adapter
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

class MyAuthAdapter implements Zend_Auth_Adapter_Interface
{
    protected $_username;
    protected $_password;
	/**
     * Sets username and password for authentication
     *
     * @return void
     */
    public function __construct($username, $password)
    {
        // ...
		
		$this->_username=$username;
        $this->_password=$password;	
			
    }

    /**
     * Performs an authentication attempt
     *
     * @throws Zend_Auth_Adapter_Exception If authentication cannot
     *                                     be performed
     * @return Zend_Auth_Result
     */
    public function authenticate()
    {
		
		$db = Zend_Registry::get('dbAdapter');
		
		Zend_Db_Table::setDefaultAdapter($db);
		
		/* 
		for ($i = 0; $i < 50; $i++) {
		$dynamicSalt .= chr(rand(33, 126));
		} 
		*/
		
		$adapter = new Zend_Auth_Adapter_DbTable(
			$db,
			'users',
			'username',
			'password',
			"SHA1(CONCAT('"
            . Zend_Registry::get('staticSalt')
            . "', ?, password_salt))"
		);
		
		$adapter->setIdentity($this->_username)->setCredential($this->_password);	
		
		// get select object (by reference)
		$select = $adapter->getDbSelect();
		$select->where('active = "TRUE"');
		
		// authenticate, this ensures that users.active = TRUE
		$adapter->authenticate();	
		
		//$result = $this->authenticate($adapter);
		
		if ($adapter->authenticate()->isValid()) {
		$authNamespace = new Zend_Session_Namespace('Zend_Auth');
		$authNamespace->user = $this->_username;
		return new Zend_Auth_Result(Zend_Auth_Result::SUCCESS);		
		} else {
		return new Zend_Auth_Result(Zend_Auth_Result::FAILURE);
		}	
		return new Zend_Auth_Result(Zend_Auth_Result::FAILURE);
				
    }
}