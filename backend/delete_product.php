<?php
session_start();
require 'connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$id = $_POST['id'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "Missing listing ID."]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM iBayProducts WHERE id = ? AND sellerId = ?");
$stmt->bind_param("ii", $id, $userId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Listing deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete listing."]);
}
?>