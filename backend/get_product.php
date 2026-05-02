<?php

// Include the database connection
include 'connection.php';

// Tell the browser we are sending back JSON
header("Content-Type: application/json");

// Get the product id from the URL e.g. get_product.php?id=1
$productId = $_GET['id'];

// Query iBayProducts and JOIN iBayMembers to get seller details at the same time
// We use p. for product columns and m. for member columns to avoid name clashes
$query = "SELECT 
            p.productName, 
            p.price, 
            p.postage, 
            p.created_at, 
            p.description, 
            p.image_url_1, 
            p.image_url_2, 
            p.item_condition,
            m.email AS seller_email,
            m.created_at AS seller_since
          FROM iBayProducts p
          LEFT JOIN iBayMembers m ON p.sellerId = m.id
          WHERE p.id = '$productId'";

$result = mysqli_query($conn, $query);
$product = mysqli_fetch_assoc($result);

// If no product found return an error
if (!$product) {
    echo json_encode(["error" => "Product not found"]);
    exit();
}

// Format the seller member since date to be more readable e.g. April 2026
$product['seller_since'] = date("F Y", strtotime($product['seller_since']));

// Send the product and seller data back as JSON
echo json_encode($product);

?>