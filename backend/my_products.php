<?php
session_start();
require_once 'connection.php';
header('Content-Type: application/json');

// User Logged In Validation
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "User not logged in."
    ]);
    exit;
}

$userId = (int) $_SESSION['user_id'];

// Getting all products belonging to user
$sql = "SELECT * FROM iBayProducts WHERE sellerId = $userId";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(['error' => mysqli_error($conn)]);
    exit;
}

$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    $products[] = $row;
}

echo json_encode($products);