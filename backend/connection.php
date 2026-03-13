<?php

$servername = "sci-project.lboro.ac.uk";
$username = 'group06';
$password = 'kWCgmK7hcXKFwFH4k7sg';
$dbname = "group06";

$conn = mysqli_connect($servername, $username, $password, $dbname);

if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
    exit();
}

echo "Connected successfully";

mysqli_close($conn);

?>