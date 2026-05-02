<?php
 
// Include the database connection
include 'connection.php';
 
// Start Session
session_start();
 
// Tell the browser we are sending back JSON
header('Content-Type: application/json');
 
// Check the user is logged in, return error as JSON if not
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}
 
// Get the product id from the AJAX request
$productId = $_POST['productId'];
 
// Get the id of the logged in user from the session
$userId = $_SESSION['user_id'];
 
// Confirm the product actually exists in iBayProducts before adding to basket
$productQuery = "SELECT id FROM iBayProducts WHERE id = '$productId'";
$productResult = mysqli_query($conn, $productQuery);
 
// If the product doesn't exist return an error
if (mysqli_num_rows($productResult) == 0) {
    echo json_encode(['success' => false, 'message' => 'Product not found']);
    exit();
}
 
// Get the user's current basket from the database
$query = "SELECT basket FROM iBayMembers WHERE id = '$userId'";
$result = mysqli_query($conn, $query);
$row = mysqli_fetch_assoc($result);
$currentBasket = $row['basket'];
 
// Check if the basket is empty or not
if (empty($currentBasket)) {
    $newBasket = $productId;
} else {
    $newBasket = $currentBasket . ', ' . $productId;
}
 
// Update the user's basket in the database
$updateQuery = "UPDATE iBayMembers SET basket = '$newBasket' WHERE id = '$userId'";
mysqli_query($conn, $updateQuery);
 
// Return success so the JS can redirect to the basket page
echo json_encode(['success' => true]);
 
?>
 