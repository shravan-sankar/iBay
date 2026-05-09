<?php

require_once 'connection.php';
session_start();

// Return JSON responses
header('Content-Type: application/json');

// Check user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false
    ]);
    exit();
}

// Check product ID exists
if (!isset($_POST['productId'])) {
    echo json_encode([
        'success' => false
    ]);
    exit();
}

// Store user and product IDs
$userId = (int) $_SESSION['user_id'];
$productId = (int) $_POST['productId'];

// Get current basket from database
$query = mysqli_prepare(
    $conn,
    "SELECT basket FROM iBayMembers WHERE id = ?"
);

mysqli_stmt_bind_param(
    $query,
    "i",
    $userId
);

mysqli_stmt_execute($query);
$result = mysqli_stmt_get_result($query);
$user = mysqli_fetch_assoc($result);
$basket = [];

// Convert basket string into array
if (!empty($user['basket'])) {
    $basket = explode(',', $user['basket']);
    $basket = array_map('trim', $basket);
}

// Remove selected product ID
$basket = array_filter(
    $basket,
    function ($id) use ($productId) {
        return (int) $id !== $productId;
    }
);

// Convert basket back into string
$newBasket = implode(',', $basket);

// Update basket in database
$update = mysqli_prepare(
    $conn,
    "UPDATE iBayMembers SET basket = ? WHERE id = ?"
);

mysqli_stmt_bind_param(
    $update,
    "si",
    $newBasket,
    $userId
);

mysqli_stmt_execute($update);

// Return success response
echo json_encode([
    'success' => true
]);

?>