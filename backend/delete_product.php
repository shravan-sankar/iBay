<?php
session_start();
require 'connection.php';

// Return JSON responses
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "User not logged in."
    ]);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$id = $_POST['id'] ?? null;

// Ensure a listing ID was provided
if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "Missing listing ID."
    ]);
    exit;
}

// Delete listing only if it belongs to the logged-in seller
$stmt = $conn->prepare("
    DELETE FROM iBayProducts 
    WHERE id = ? AND sellerId = ?
");

$stmt->bind_param("ii", $id, $userId);

// Send success/failure response
if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Listing deleted successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete listing."
    ]);
}
?>