<?php

// Include the database connection
include 'connection.php';

// Get the product id from the URL
$productId = $_GET['id'];

// Query iBayProducts for the product with that id
$query = "SELECT productName, price, postage, created_at, description, image_url_1, image_url_2, item_condition FROM iBayProducts WHERE id = '$productId'";
$result = mysqli_query($conn, $query);
$product = mysqli_fetch_assoc($result);

// If no product found, stop the page
if (!$product) {
    die("Product not found.");
}

// Return the product details as JSON
echo json_encode($product);
?>

