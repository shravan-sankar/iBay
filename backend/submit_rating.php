<?php
 
// Include the database connection
include 'connection.php';
 
// Start session
session_start();
 
// Tell the browser we are sending back JSON
header('Content-Type: application/json');
 
// Check the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}
 
// Get the seller id and rating from the AJAX request
$sellerId = $_POST['sellerId'];
$rating = (int) $_POST['rating'];
 
// Make sure the rating is between 1 and 5
if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating']);
    exit();
}
 
// Add the new rating to rating_total and increment rating_count
// Then recalculate the mean and store it in the rating column
$query = "UPDATE iBayMembers 
          SET rating_total = rating_total + $rating,
              rating_count = rating_count + 1
          WHERE id = '$sellerId'";
 
$result = mysqli_query($conn, $query);
 
if ($result) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Could not save rating']);
}
 
?>