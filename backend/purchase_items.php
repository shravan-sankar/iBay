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

// Step 1: Fetch the user's basket before clearing it
$getBasket = mysqli_prepare($conn, "SELECT basket FROM iBayMembers WHERE id = ?");

// Stop if query preparation fails
if (!$getBasket) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare basket fetch query.'
    ]);
    exit();
}

// Bind user ID and execute
mysqli_stmt_bind_param($getBasket, "i", $userId);
mysqli_stmt_execute($getBasket);

// Get result and fetch the basket value
$result = mysqli_stmt_get_result($getBasket);
$row = mysqli_fetch_assoc($result);

$basketItems = !empty($row['basket']) ? explode(',', $row['basket']) : [];

// If basket is empty, no point continuing
if (empty($basketItems)) {
    echo json_encode([
        'success' => false,
        'message' => 'Basket is empty.'
    ]);
    exit();
}

// Step 2: Delete each purchased product from listings
foreach ($basketItems as $productId) {
    $productId = (int) $productId;

    $deleteProduct = mysqli_prepare($conn, "DELETE FROM iBayProducts WHERE id = ?");

    // Stop if query preparation fails
    if (!$deleteProduct) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to prepare delete product query.'
        ]);
        exit();
    }

    // Bind product ID and execute
    mysqli_stmt_bind_param($deleteProduct, "i", $productId);
    $deleted = mysqli_stmt_execute($deleteProduct);

    // Stop if delete fails
    if (!$deleted) {
        echo json_encode([
            'success' => false,
            'message' => "Failed to delete product ID: $productId."
        ]);
        exit();
    }
}

// Step 3: Clear the basket now that items are purchased
$clearBasket = mysqli_prepare($conn, "UPDATE iBayMembers SET basket = '' WHERE id = ?");

// Stop if query preparation fails
if (!$clearBasket) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare basket clear query.'
    ]);
    exit();
}

// Bind user ID and execute
mysqli_stmt_bind_param($clearBasket, "i", $userId);
$success = mysqli_stmt_execute($clearBasket);

// Check execution success
if (!$success) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to clear basket.'
    ]);
    exit();
}

// All steps complete — return success
echo json_encode([
    'success' => true,
    'message' => 'Purchase successful. Items removed from listings.'
]);

?>