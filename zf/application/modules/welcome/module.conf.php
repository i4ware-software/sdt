<?php

/**
 * ZF-Ext Framework
 * @package    Users
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

$module[] = array(
     'index' => array(
        'name' => 'Welcome_Welcome',
		'location' => 'modules',
		'regex' => 'welcome/index/index',
        'defaults' => array(
            'module' => 'welcome',
            'controller' => 'index',
            'action'     => 'index'
        ),
        'map' => array(),
        'reverse' => 'welcome/index/index'
    )
);

$resources[] = array('welcome:index'
               , 'welcome:javascript'
			   ,'welcome:json');
			   
$actions[] = array(
            'users:json' => array('createnewuser'),
            'users:json' => array('edituser'),
			'users:json' => array('changepassword')
			);