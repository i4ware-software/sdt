<?php

/**
 * ZF-Ext Framework
 * @package    Default
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

$module[] = array(
     'index' => array(
        'name' => 'Default_Default',
		'location' => 'hidden',
		'regex' => 'default/index/index',
        'defaults' => array(
            'module' => 'default',
            'controller' => 'index',
            'action'     => 'index'
        ),
        'map' => array(),
        'reverse' => 'default/index/index'
    ),
	 'default_javascript' => array(
		'regex' => 'default.jsa',
        'defaults' => array(
            'module' => 'default',
            'controller' => 'javascript',
            'action'     => 'index'
        ),
        'map' => array(
            1 => 'month',
            2 => 'year'
        ),
        'reverse' => 'default.jsa'
    ),
	 'default_javascript_login' => array(
		'regex' => 'js/login.jsa',
        'defaults' => array(
            'module' => 'default',
            'controller' => 'javascript',
            'action'     => 'login'
        ),
        'map' => array(
        ),
        'reverse' => 'js/login.jsa'
    ),
	 'default_javascript_signup' => array(
		'regex' => 'js/signup.jsa',
        'defaults' => array(
            'module' => 'default',
            'controller' => 'javascript',
            'action'     => 'signup'
        ),
        'map' => array(
        ),
        'reverse' => 'js/signup.jsa'
    )
);

$resources[] = array('index'
               , 'signup'
               , 'javascript'
			   ,'json'
			   ,'error');
			   
$actions[] = array(
            'json' => array('modules')
			);