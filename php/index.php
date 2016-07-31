<?php 
	if(isset($_GET["sort"])){
		$sort = $_GET["sort"];
	}else{
		$sort = 1;
	}
	$conn = mysql_connect("localhost","root","123456");
	mysql_select_db("localhostsql",$conn);
	mysql_query("SET NAMES UTF8");
	if($sort == 0){
		$querymes = "SELECT * FROM gametetris";
	}else if($sort == 1){
		$querymes = "SELECT * FROM gametetris ORDER BY score DESC LIMIT 10";
	}
	$result = mysql_query($querymes);

	$testArr = array("res" => array());
	while ($testJSON = mysql_fetch_array($result)) {
    	array_push($testArr["res"],json_encode($testJSON));
	}
	
	$row = json_encode($testArr);
	print_r($row);

	mysql_close($conn);
 ?>