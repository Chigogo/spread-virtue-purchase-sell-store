<?php
	$servername = "localhost:33060";
	$username = "root";
	$password = "dmdjzqz!";
	$dbname = "gjp_web";
	//$port = 33060;
	$conn = new mysqli($servername, $username, $password, $dbname /*,$port*/);
	if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

	//新建记录，返回新纪录id 的方法
	//如果c_new_i标记存在，则创建新发票，并返回发票id
	if (isset($_GET["c_new_i"])){
		header('Content-Type: text/plain');
		$sql = 
"insert into 
transaction_documents_description(id,doc_type,trading_object,store_house) 
values(null,'".($_GET["doc_type"]?$_GET["doc_type"]:'xs')."',1,1)";

		if($conn->query($sql))
		echo $conn->query("select last_insert_id()")->fetch_assoc()['last_insert_id()'];
		else echo "0 results";
	}

	//如果query_single标记存在，则试图返回查询结果
	if (isset($_GET["query_single"])){

		header('Content-Type: text/plain');
		$sql = "select ".$_GET["q_name"]." from ".$_GET["q_table"]." where ".$_GET["q_condition"];

		//如果有返回结果，则返回，否则报错
		if($result = $conn->query($sql)) {
			$result = $result->fetch_assoc();
			echo $result[$_GET["q_name"]];
		}
		else echo 0;
	}

	//如果query_multiple标记存在，则试图返回查询结果，JSON对象
	if (isset($_GET["query_multiple"])){

		header('Content-Type: application/json');
		$sql = "select ".
		$_GET["q_columns_name"].
		" from ".
		$_GET["q_table"].
		" where ".
		$_GET["q_condition_column"].
		" like '%". 
		$_GET["q_condition_value"]."%'";

		//如果有返回结果，则返回，否则报错
		$result = $conn->query($sql);
		if($result->num_rows>0) {
			// echo var_dump($result["num_rows"]);
			// echo "<br>".$sql;
			for ($result_items; $result_item = $result->fetch_assoc(); $result_items[]=$result_item);
			echo json_encode($result_items, JSON_UNESCAPED_UNICODE);
		}
		else {			
			header('Content-Type: text/html');
			echo 0;
			// echo $sql."<br>0 results or query failed.";
		}
	}


	/*{
		$product_id = 
		$line_number = 
		$admin_define_id = 
		$fullname = 
		$unit = 
		$Specification = 
		$amount = 
		$price_per_unit = 
		$total_sum = 
		$comment = Null;
	}
*/
	//end the connection
	$conn->close();

?>