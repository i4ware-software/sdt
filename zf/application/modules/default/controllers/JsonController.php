<?php
  /**
   * ZF-Ext Framework
   * Controller for all JSON based AJAX requests.
   * @package    Default
   * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
   */
  /** Zend_Controller_Action Controller for JSON */
  require_once 'Zend/Controller/Action.php';
  class JsonController extends Zend_Controller_Action
  {
      /** protected variable for ALC */
      protected $_acl;
      /**
       * Here we initialice ACL helper from Zion Framework.
       * Zion Framework is located in /zf/library/Auth/Zion
       * folder that root is in this software include path.
       */
      public function __init()
      {
          $this->_acl = $this->_helper->getHelper('acl');
      } //public function __init()
      /**
       * Here we call error handler if action method not
       * found and throws to exeption.
	   * @param $method
	   * @param $args
       */
      public function __call($method, $args)
      {
          if ('Action' == substr($method, -6)) {
              // If the action method was not found, render the error
              // template
              return $this->render('error');
          } //if ('Action' == substr($method, -6))
          // all other methods throw an exception
          throw new Exception('Invalid method "' . $method . '" called', 500);
      } //public function __call($method, $args)
      /**
       * preDispatch set encoding to UTF-8 and no view render
       */
      public function preDispatch()
      {
          // change view encoding
          $this->view->setEncoding('UTF-8');
          // Never auto render this controller's actions
          $this->_helper->viewRenderer->setNoRender();
      } //public function preDispatch()
      /**
       * Index action method does nothing.
       */
      public function indexAction()
      {
      } //public function indexAction()
      /**
       * Generates the random password.
       */
      public function genAction()
      {
          $random = array('A', 'B', 'C', 'D', '.', 'a', 'b', 'c', 'd', 
						  'E', 'F', 'G', 'H', ';', 'm', 'n', 'o', 'k', 
						  'l', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 
						  'Q', 'Z', 'Y', '0', '9', '8', '7', '6', '5', 
						  '4', '1', '2', '3', ':', ',', 'e', 'f', 'g', 
						  'X', 'R', 'T', 'S', 'U', 'V', 'W', 'x', 'y', 
						  'z', 'h', 'i', 'j', 'r', 's', 't', 'u', 'v', 
						  'w');
          shuffle($random);
          $i = rand(8, 12);
          $ii = 1;
          $password = "";
          //while ($i>=$ii) {
          foreach ($random as $key => $value) {
              $password .= $random[$key];
              if ($ii == $i) {
                  break;
              } //if ($ii == $i)
              $ii++;
          } //foreach ($random as $key => $value)
          //}     
          $row['gen'] = $password;
          $my['success'] = true;
          $my['results'] = 1;
          $my['myaccount'] = array($row);
          echo Zend_Json::encode($my);
          //print_r($row);
          exit();
      } //public function genAction()
      /**
       * Changes user own password.
       */
      public function changeAction()
      {
          $request = $this->getRequest();
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
          $stmp = $db->query('SELECT password_salt FROM users ' . 'WHERE user_id =' . $id . ' LIMIT 1;');
          $result = $stmp->fetchAll();
          $dynamicSalt = $result[0]['password_salt'];
          $old = $request->getPost('old');
          $pwd = sha1($config->salt . $old . $dynamicSalt);
          $stmp = $db->query('SELECT user_id FROM users ' . 'WHERE username = \'' 
							 . $_SESSION['Zend_Auth']['user'] . '\' ' . 'AND password = \'' 
							 . $pwd . '\' LIMIT 1;');
          $result = $stmp->fetchAll();
          $new = $request->getPost('new');
          $ver = $request->getPost('ver');
          if (count($result) == 1 && $new == $ver) {
              $dynamicSalt = '';
              for ($i = 0; $i < 20; $i++) {
                  $dynamicSalt .= chr(rand(33, 126));
              } //for ($i = 0; $i < 20; $i++)
			  $dynamicSalt = sha1($dynamicSalt);
              $db->query('UPDATE users SET users.password_salt = \'' . $dynamicSalt . '\' WHERE user_id = ' . $id . ';');
              $password = sha1($config->salt . $new . $dynamicSalt);
              $db->query('UPDATE users SET users.password = \'' . $password . '\' WHERE user_id = ' . $id . ';');
              $success = array('success' => true);
          } //if (count($result) == 1 && $new == $ver)
          else {
              $success = array('success' => false, 'msg' => $translate->_("Default_Change_Warning"));
          } //else
          echo Zend_Json::encode($success);
          exit();
      } //public function changeAction()
      /**
       * Saves account contact information
       */
      public function accountsaveAction()
      {
          $request = $this->getRequest();
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
          $fn = $request->getPost('firstname');
          $ln = $request->getPost('lastname');
          $em = $request->getPost('email');
          $cp = $request->getPost('company');
          $dob = date('Y-m-d', strtotime($request->getPost('date_of_birth')));
          //print($dob);
          $db->query('UPDATE users SET users.firstname = \'' . $fn . '\' WHERE user_id = ' . $id . ';');
          $db->query('UPDATE users SET users.lastname = \'' . $ln . '\' WHERE user_id = ' . $id . ';');
          $db->query('UPDATE users SET users.email = \'' . $em . '\' WHERE user_id = ' . $id . ';');
          $db->query('UPDATE users SET users.company = \'' . $cp . '\' WHERE user_id = ' . $id . ';');
          $success = array('success' => true);
          echo Zend_Json::encode($success);
          exit();
      } //public function accountsaveAction()
      /**
       * Loads My Acount details
       */
      public function myaccountAction()
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
          $stmp = $db->query('SELECT user_id, firstname, lastname, email, ' 
							 . 'company FROM users WHERE user_id = ' 
							 . $id . ' LIMIT 1;');
          $row = $stmp->fetchAll();
          $my['success'] = true;
          $my['results'] = 1;
          $my['myaccount'] = array($row[0]);
          echo Zend_Json::encode($my);
          //print_r($row);
          exit();
      } //public function myaccountAction()
      /**
       * Modules action method prints JSON script for
       * navication module tree in left container of
       * main application's ViewPort.
       */
      public function modulesAction()
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
          $dirContent = Core::rscandir(APPLICATION_PATH . '/modules/');
          $i = 0;
          $ii = 0;
          foreach ($dirContent as $row) {
              if ($row != 'default' && $row != 'home') {
                  include(APPLICATION_PATH . '/modules/' . $row . '/module.conf.php');
                  if ($module[$i]['index']['location'] == 'modules' && $acl->isAllowed($userRole, $row . ':index', '')) {
                      $items[$ii]['text'] = $translate->_($module[$i]['index']['name']);
                      $items[$ii]['id'] = '/zf/public/' . $row . '/index/index';
                      $items[$ii]['url'] = '/zf/public/' . $row . '/index/index';
                      $items[$ii]['cls'] = 'leaf-app';
                      $items[$ii]['leaf'] = true;
                      $ii++;
                  } //if ($module[$i]['index']['location'] == 'modules' && $acl->isAllowed($userRole, $row . ':index', ''))
                  $i++;
              } //if ($row != 'default' && $row != 'home')
          } //foreach ($dirContent as $row)
          if ($userRole == 'adminRole' || $userRole == 'superadminRole') {
              $i = 0;
              $ii = 0;
              foreach ($dirContent as $row) {
                  if ($row != 'default' && $row != 'home') {
                      include(APPLICATION_PATH . '/modules/' . $row . '/module.conf.php');
                      if ($module[$i]['index']['location'] == 'admin' && $acl->isAllowed($userRole, $row . ':index', '')) {
                          $items_admin[$ii]['text'] = $translate->_($module[$i]['index']['name']);
                          $items_admin[$ii]['id'] = '/zf/public/' . $row . '/index/index';
                          $items_admin[$ii]['url'] = '/zf/public/' . $row . '/index/index';
                          $items[$ii]['cls'] = 'leaf-app';
                          $items_admin[$ii]['leaf'] = true;
                          $ii++;
                      } //if ($module[$i]['index']['location'] == 'admin' && $acl->isAllowed($userRole, $row . ':index', ''))
                      $i++;
                  } //if ($row != 'default' && $row != 'home')
              } //foreach ($dirContent as $row)
          } //if ($userRole == 'adminRole' || $userRole == 'superadminRole')
          $item[0]['text'] = $translate->_('Home_Home');
          $item[0]['id'] = '/zf/public/home/index/index';
          $item[0]['url'] = '/zf/public/home/index/index';
          $item[0]['cls'] = 'leaf-app';
          $item[0]['leaf'] = true;
          $home = array('text' => $translate->_('Home'), 'expanded' => true, 'children' => $item);
          $success = array('text' => $translate->_('Modules'), 'expanded' => true, 'children' => $items);
          if ($userRole == 'adminRole' || $userRole == 'superadminRole') {
              $admin = array('text' => $translate->_('Admin'), 'expanded' => true, 'children' => $items_admin);
              echo '[' . Zend_Json::encode($home) . ',' . Zend_Json::encode($success) . ',' . Zend_Json::encode($admin) . ']';
          } //if ($userRole == 'adminRole' || $userRole == 'superadminRole')
          else {
              echo '[' . Zend_Json::encode($home) . ',' . Zend_Json::encode($success) . ']';
          } //else
          exit();
      } //public function modulesAction()
  } //class JsonController extends Zend_Controller_Action
  