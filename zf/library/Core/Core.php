<?php

/**
 * ZF-Ext Framework
 * 
 * @package    Core
 * @license    http://www.gnu.org/copyleft/gpl.html     GNU GPL
 */

class Core {

    function __construct() {

    }
	
	function advanced_xml2array($__url)
	{
		$xml_values = array();
		$contents = file_get_contents($__url);
		$parser = xml_parser_create('');
		if(!$parser)
			return false;
	
		xml_parser_set_option($parser, XML_OPTION_TARGET_ENCODING, 'UTF-8');
		xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
		xml_parser_set_option($parser, XML_OPTION_SKIP_WHITE, 1);
		xml_parse_into_struct($parser, trim($contents), $xml_values);
		xml_parser_free($parser);
		if (!$xml_values)
			return array();
	   
		$xml_array = array();
		$last_tag_ar =& $xml_array;
		$parents = array();
		$last_counter_in_tag = array(1=>0);
		foreach ($xml_values as $data)
		{
			switch($data['type'])
			{
				case 'open':
					$last_counter_in_tag[$data['level']+1] = 0;
					$new_tag = array('name' => $data['tag']);
					if(isset($data['attributes']))
						$new_tag['attributes'] = $data['attributes'];
					if(isset($data['value']) && trim($data['value']))
						$new_tag['value'] = trim($data['value']);
					$last_tag_ar[$last_counter_in_tag[$data['level']]] = $new_tag;
					$parents[$data['level']] =& $last_tag_ar;
					$last_tag_ar =& $last_tag_ar[$last_counter_in_tag[$data['level']]++];
					break;
				case 'complete':
					$new_tag = array('name' => $data['tag']);
					if(isset($data['attributes']))
						$new_tag['attributes'] = $data['attributes'];
					if(isset($data['value']) && trim($data['value']))
						$new_tag['value'] = trim($data['value']);
	
					$last_count = count($last_tag_ar)-1;
					$last_tag_ar[$last_counter_in_tag[$data['level']]++] = $new_tag;
					break;
				case 'close':
					$last_tag_ar =& $parents[$data['level']];
					break;
				default:
					break;
			};
		}
		return $xml_array;
	}
	
	//
	// use this to get node of tree by path with '/' terminator
	//
	function get_value_by_path($__xml_tree, $__tag_path)
	{
		$tmp_arr =& $__xml_tree;
		$tag_path = explode('/', $__tag_path);
		foreach($tag_path as $tag_name)
		{
			$res = false;
			foreach($tmp_arr as $key => $node)
			{
				if(is_int($key) && $node['name'] == $tag_name)
				{
					$tmp_arr = $node;
					$res = true;
					break;
				}
			}
			if(!$res)
				return false;
		}
		return $tmp_arr;
	}
	
	function rscandir($base='', &$data=array()) {
	 
	  $array = array_diff(scandir($base), array('.', '..')); # remove ' and .. from the array */
	  
	  foreach($array as $value) : /* loop through the array at the level of the supplied $base */
	 
		if (is_dir($base.$value)) : /* if this is a directory */
		  //$data[] = $base.$value.'/'; /* add it to the $data array */
		  $data[] = $value; /* then make a recursive call with the
		  current $value as the $base supplying the $data array to carry into the recursion */
		 
		elseif (is_file($base.$value)) : /* else if the current $value is a file */
		  /* just do nothing */
		 
		endif;
	   
	  endforeach;
	 
	  return $data; // return the $data array
	 
	}
	
	function version() {
	$version = '1.0.1';
	return $version;
	}

}
