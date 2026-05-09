<?php

// Database connection
require_once 'connection.php';

// Start session
session_start();

// Return JSON responses
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User is not logged in.'
    ]);
    exit();
}

// Check if product ID exists
if (!isset($_POST['productId'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No product ID provided.'
    ]);
    exit();
}

// Clean input values
$productId = (int) $_POST['productId'];
$userId = (int) $_SESSION['user_id'];

// Validate product ID
if ($productId <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid product ID.'
    ]);
    exit();
}

// Check if product exists
$productQuery = mysqli_prepare(
    $conn,
    "SELECT id FROM iBayProducts WHERE id = ?"
);

mysqli_stmt_bind_param(
    $productQuery,
    "i",
    $productId
);

mysqli_stmt_execute($productQuery);
$productResult = mysqli_stmt_get_result($productQuery);

// Stop if product does not exist
if (mysqli_num_rows($productResult) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Product does not exist.'
    ]);
    exit();
}

// Get current basket
$basketQuery = mysqli_prepare(
    $conn,
    "SELECT basket FROM iBayMembers WHERE id = ?"
);

mysqli_stmt_bind_param(
    $basketQuery,
    "i",
    $userId
);

mysqli_stmt_execute($basketQuery);

$basketResult = mysqli_stmt_get_result($basketQuery);

$userData = mysqli_fetch_assoc($basketResult);

// Store current basket
$currentBasket = $userData['basket'];

// Convert basket string into array
$basketItems = [];

if (!empty($currentBasket)) {
    $basketItems = explode(',', $currentBasket);
    $basketItems = array_map('trim', $basketItems);
}

// Prevent duplicate products
if (!in_array($productId, $basketItems)) {
    $basketItems[] = $productId;
}

// Convert basket array back into string
$updatedBasket = implode(',', $basketItems);

// Update basket in database
$updateQuery = mysqli_prepare(
    $conn,
    "UPDATE iBayMembers SET basket = ? WHERE id = ?"
);

mysqli_stmt_bind_param(
    $updateQuery,
    "si",
    $updatedBasket,
    $userId
);

$updateSuccess = mysqli_stmt_execute($updateQuery);

// Check update success
if (!$updateSuccess) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update basket.'
    ]);
    exit();
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Product added to basket successfully.',
    'basket' => $basketItems
]);

?>