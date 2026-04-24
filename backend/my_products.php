<?php
session_start();
require_once 'connection.php';
header('Content-Type: application/json');

// Testing purposes 
// $_SESSION['user_id'] = 1; <------ Revert it from comment to code if testing without full logging process

// User Logged In Validation
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "User not logged in."
    ]);
    exit;
}

$userId = (int) $_SESSION['user_id'];

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