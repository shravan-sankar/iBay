<?php

session_start();
require_once 'connection.php';
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit();
}

// Check user is logged in
if (empty($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in.'
    ]);
    exit();
}

// Get logged in user ID
$userId = (int) $_SESSION['user_id'];

// Clear basket field in database
$clearBasket = mysqli_prepare(
    $conn,
    "UPDATE iBayMembers SET basket = '' WHERE id = ?"
);

// Stop if query preparation fails
if (!$clearBasket) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare basket clear query.'
    ]);
    exit();
}

// Bind user ID
mysqli_stmt_bind_param(
    $clearBasket,
    "i",
    $userId
);

// Execute query
$success = mysqli_stmt_execute($clearBasket);

// Check execution success
if (!$success) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to clear basket.'
    ]);
    exit();
}

// Return success response
echo json_encode([
    'success' => true
]);

?>