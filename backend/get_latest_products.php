<?php
include 'connection.php';

header('Content-Type: application/json');

$result = $conn->query("SELECT * FROM iBayProducts ORDER BY id DESC");

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

$conn->close();

echo json_encode([
    'success'  => true,
    'products' => $products
]);
?>