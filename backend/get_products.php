<?php
include 'connection.php';

header('Content-Type: application/json');

// run query
$sql = "SELECT * FROM iBayProducts";
$result = mysqli_query($conn, $sql);
if (!$result) {
    // query failed — send error as JSON
    echo json_encode(['error' => mysqli_error($conn)]);
    exit;
}

$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    $products[] = $row;
}

echo json_encode($products);