<?php

$servername = "sci-project.lboro.ac.uk";
$username = "group06";
$password = "kWCgmK7hcXKFwFH4k7sg";
$dbname = "group06";

$conn = mysqli_connect($servername, $username, $password, $dbname);

if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}