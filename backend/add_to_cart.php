<?php
 
// Include the database connection
include 'connection.php';
 
// Start Session
session_start();
 
// Check the user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
 
// Get the product id from iBayProducts
$productId = $_POST['productId'];
 
// Get the id of the logged in user
$userId = $_SESSION['user_id'];
 
// Confirm the product actually exists in iBayProducts before adding to basket
$productQuery = "SELECT id FROM iBayProducts WHERE id = '$productId'";
$productResult = mysqli_query($conn, $productQuery);
 
// If the product doesn't exist, send the user back to the homepage
if (mysqli_num_rows($productResult) == 0) {
    header("Location: index.php");
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
 
// Send the user back to the product page
header("Location: product.php?id=" . $productId);
exit();
 
?>