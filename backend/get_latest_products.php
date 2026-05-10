<?php
include 'connection.php';

header('Content-Type: application/json');

// Fetches the latest products by selecting all products from the iBayProducts table ordered by id in descending order
$result = $conn->query("SELECT p.*, m.firstName AS sellerName 
        FROM iBayProducts p 
        JOIN iBayMembers m ON p.sellerId = m.id 
        WHERE 1=1 ORDER BY id DESC");

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