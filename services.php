<?php

	//Start session
	session_start();
	
	//Include database connection details
	require_once('access/config.php');

	$db = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die("Database error");
	mysql_select_db(DB_DATABASE, $db);

	$cmd = $_REQUEST["cmd"];
	if ($cmd == null) exit();
	switch ($cmd){
		case "mnp": // make new project;
			$query = "INSERT INTO tt_projects (p_title) VALUES ('blank title')";
			//	echo $query;
			mysql_query($query);
			$newid = mysql_insert_id();
				
			echo json_encode(array("id"=>$newid));
			break;
		case "gp": // get projects
			$returnObj = array();
			
//			SELECT t1.* FROM tt_projects AS t1
//WHERE EXISTS (SELECT * FROM tt_tags AS t2 WHERE t1.p_id = t2.tag_projectid AND t2.tag_string = 'john')
//AND EXISTS (SELECT * FROM tt_tags AS t2 WHERE t1.p_id = t2.tag_projectid AND t2.tag_string = 'bruno')
			
			$result = mysql_query("SELECT NOW()");
			$row = mysql_fetch_array($result);
			$returnObj["currdate"] = substr($row[0], 2, 8);
			
			$query = "SELECT t1.* FROM tt_projects AS t1";
			if (isset($_REQUEST['tags'])){
				$tags = $_REQUEST["tags"];
					
				$tagArray = explode(",", $tags);
				//$query .= " LEFT JOIN tt_tags AS t2 ON t1.p_id = t2.tag_projectid WHERE";
				$query .= " WHERE";
				for ($i = 0; $i < sizeof($tagArray); $i++){
					if ($i > 0) {
						$query .= " AND";
					}
					$query .= " EXISTS";
					$query .= " (SELECT * FROM tt_tags WHERE t1.p_id = tt_tags.tag_projectid AND tt_tags.tag_string='".$tagArray[$i]."')";
				} 
			}
			//echo $query;
			$result = mysql_query($query);
			$returnObj["projects"] = array();
			if (mysql_num_rows($result) > 0 ){
				while ($row = mysql_fetch_assoc($result)){
					$row["tags"] = array();
					$query = "SELECT tag_string FROM tt_tags WHERE tag_projectid = ".$row["p_id"];
					$tag_result = mysql_query($query);
					while ($tag_row = mysql_fetch_array($tag_result)){
						$row["tags"][] = $tag_row[0];
					}
					$returnObj["projects"][] = array_slice($row, 0);
				}
			}
			echo json_encode($returnObj);
			break;
			
		case "gt": // get tags
			$query = "SELECT tag_string FROM tt_tags GROUP BY tag_string";
			$result = mysql_query($query);
			
			$array = array();
			
			while($row = mysql_fetch_assoc($result)){
				array_push($array, $row["tag_string"]);
			}
			echo implode(",", $array);
			break;
		case "sp": //save project
			$pid = $_REQUEST["id"];
			if ($pid == "new"){ // if temporary id
				$duedate = $_REQUEST["duedate"];
				$query = "INSERT INTO tt_projects (p_title, p_duedate, p_hue, p_notes) VALUES ('".$_REQUEST["title"]."', ".(($duedate=="null")? "NULL":"'".$duedate."'").", ".$_REQUEST["hue"].", '".mysql_real_escape_string($_REQUEST["notes"])."')";
				
				//echo $query;
				mysql_query($query);
				$newid = mysql_insert_id();
				
				echo json_encode(array("id"=>$newid));
				$str = "";
				if ($_REQUEST["tags"] != ""){
					$tags = explode(",", $_REQUEST["tags"]);
					for ($i = 0; $i < sizeof($tags); $i++){
						if ($i > 0) $str .= ",";
						$str .= "(".$newid.", '".$tags[$i]."')";
					}
					$query = "INSERT INTO tt_tags (tag_projectid, tag_string) VALUES ".$str;
					mysql_query($query);
				}
			} else {
				$duedate = $_REQUEST["duedate"];
				$query = "UPDATE tt_projects SET p_title = '".$_REQUEST["title"]."', p_duedate = ".(($duedate=="null")? "NULL":"'".$duedate."'").", p_hue = ".$_REQUEST["hue"].", p_notes = '".mysql_real_escape_string($_REQUEST["notes"])."' WHERE p_id = ".$pid;
				mysql_query($query);
				
				$tag_query = "SELECT tag_string FROM tt_tags WHERE tag_projectid = ".$pid;
				$tag_result = mysql_query($tag_query);
				
				$saved_tags = array();
				while ($tag_row = mysql_fetch_array($tag_result)){
					array_push($saved_tags, $tag_row[0]);
				}
				
				if ($_REQUEST["tags"] != null && $_REQUEST["tags"] != ""){
					$tags = explode(",", $_REQUEST["tags"]);
					for ($i = 0; $i < sizeof($tags); $i++){
						for ($j = 0; $j < sizeof($saved_tags); $j++){
							if ($saved_tags[$j] == $tags[$i]){
								array_splice($saved_tags, $j, 1);
								array_splice($tags, $i, 1);
								$i--;
								$j--;
								break;
							}
						}
					}
					if (sizeof($saved_tags > 0)){ // remove these tags, no longer in project description
						$delete_query = "DELETE FROM tt_tags WHERE tag_projectid = ".$pid." AND (";
						for ($i = 0; $i < sizeof($saved_tags); $i++){
							if ($i > 0) $delete_query .= " OR ";
							$delete_query .= "tag_string = '".$saved_tags[$i]."'";
						}
						$delete_query .=")";
						mysql_query($delete_query);
						//echo $delete_query;
					}
					if (sizeof($tags > 0)){
						$insert_query = "INSERT INTO tt_tags (tag_projectid, tag_string) VALUES ";
						for ($i = 0; $i < sizeof($tags); $i++){
							if ($i > 0) $insert_query .= ",";
							$insert_query .= "(".$pid.", '".$tags[$i]."')";
						}
						mysql_query($insert_query);
						//echo $insert_query;
					}
				}
				echo json_encode(array("id"=>$pid));
			}
			break;
		case "sb": // save bars
			$pid 				= $_REQUEST["id"];
			$totalmoney 		= $_REQUEST["totalmoney"];
			$achievedmoney 		= $_REQUEST["achievedmoney"];
			$totaltime 			= $_REQUEST["totaltime"];
			$achievedtime 		= $_REQUEST["achievedtime"];
			
			$query = "UPDATE tt_projects SET p_totalmoney = $totalmoney, p_achievedmoney = $achievedmoney, p_totaltime = $totaltime, p_achievedtime = $achievedtime WHERE p_id = '$pid'";
			
			mysql_query($query);
			
			break;
		case "dp": // delete project
			$pid = $_REQUEST["id"];
			$query = "DELETE FROM tt_projects WHERE p_id = ".$pid;
			mysql_query($query);
			$query = "DELETE FROM tt_tags WHERE tag_projectid = ".$pid;
			mysql_query($query);
			break;
		case "gi": // get items
			$pid = $_REQUEST["id"];
			$query = "SELECT * FROM tt_items WHERE i_projectid = ".$pid;
			$result = mysql_query($query);
			$returnObj = array();
			if (mysql_num_rows($result) > 0){
				while ($row = mysql_fetch_assoc($result)){
					$returnObj[] = array_slice($row, 0);
				}
			}
			echo json_encode($returnObj);
			break;
		case "si": // save item
			$iid = $_REQUEST["id"];
			if ($iid == "new"){ // if temporary id
				$query = "INSERT INTO tt_items (i_title, i_hours, i_cost, i_linkid, i_preferredduration, i_complete, i_projectid) "; 
				$query .= 			  "VALUES ('".((isset($_REQUEST["title"]))? $_REQUEST["title"]:"")."', ";
				$query .=						((isset($_REQUEST["hours"]))? $_REQUEST["hours"]:"NULL").", ";
				$query .= 						((isset($_REQUEST["cost"]))?$_REQUEST["cost"]:"NULL").", ";
				$query .=						((isset($_REQUEST["linkid"]))?$_REQUEST["linkid"]:"NULL").", ";
				$query .=						((isset($_REQUEST["preferredduration"]))?"'".$_REQUEST["preferredduration"]."'":"NULL").", ";
				$query .=						((isset($_REQUEST["complete"]))?$_REQUEST["complete"]:"NULL").", ";
				$query .=						$_REQUEST["projectid"].")";
			
				mysql_query($query);
				$iid = mysql_insert_id();
				
				if (isset($_REQUEST["linkid"])){
					$linkid = $_REQUEST["linkid"];
					$link_query = "UPDATE tt_items SET i_hours = NULL, i_cost = NULL i_preferredduration = NULL WHERE i_id = ".$linkid;
					mysql_query($link_query);
				}
			} else {
				$query = "UPDATE tt_items SET ";
				$query .= "i_hours = ".((isset($_REQUEST["hours"]))? $_REQUEST["hours"]:"NULL").", ";
				$query .= "i_cost = ".((isset($_REQUEST["cost"]))?$_REQUEST["cost"]:"NULL").", ";
				$query .= "i_linkid = ".((isset($_REQUEST["linkid"]))?$_REQUEST["linkid"]:"NULL").", ";
				$query .= "i_title = ".((isset($_REQUEST["title"]))?"'".$_REQUEST["title"]."'":"").", ";
				$query .= "i_complete = ".((isset($_REQUEST["complete"]))?$_REQUEST["complete"]:"NULL").", ";
				$query .= "i_preferredduration = ".((isset($_REQUEST["preferredduration"]))?"'".$_REQUEST["preferredduration"]."'":"NULL")." ";
				$query .= "WHERE i_id = ".$iid;
				//echo $query;
				mysql_query($query);
				//echo "id=".$iid;
			}
			echo json_encode(array("id"=>$iid));
			break;
		case "di": // delete item
			$iid = $_REQUEST["id"];
			if (substr($iid, 0, 1) == "t"){ // item not saved yet, return;
				return;
			} else {
				$query = "DELETE FROM tt_items WHERE i_id = ".$iid;
				mysql_query($query);
			}
			
	}

?>