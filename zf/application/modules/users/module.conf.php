<?php

/**
 * ZF-Ext Framework
 * @package    Users
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

$module[] = array(
     'index' => array(
        'name' => 'Users_Users',
		'location' => 'admin',
		'regex' => 'users/index/index',
        'defaults' => array(
            'module' => 'users',
            'controller' => 'index',
            'action'     => 'index'
        ),
        'map' => array(),
        'reverse' => 'users/index/index'
    ),
     'users_javascript' => array(
		'regex' => 'users/manager.jsa',
        'defaults' => array(
            'module' => 'users',
            'controller' => 'javascript',
            'action'     => 'index'
        ),
        'map' => array(),
        'reverse' => 'users/manager.jsa'
    )
);

$resources[] = array('users:index'
               , 'users:javascript'
			   ,'users:json');
			   
$actions[] = array(
            'users:json' => array('createnewuser'),
            'users:json' => array('edituser'),
			'users:json' => array('changepassword')
			);