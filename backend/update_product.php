<?php
session_start();
require 'connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// User Logged In Validation
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "User not logged in."
    ]);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$id = $_POST['id'] ?? null;
$itemName = $_POST['itemName'] ?? '';
$category = $_POST['category'] ?? '';
$condition = $_POST['condition'] ?? '';
$desc = $_POST['desc'] ?? '';
$price = $_POST['price'] ?? 0;
$postage = $_POST['postage'] ?? 0;

if (!$id) {
    echo json_encode(["success" => false, "message" => "Missing listing ID."]);
    exit;
}

$uploadDir = "../product_images/";

$image1Name = null;
$image2Name = null;

if (isset($_FILES['imgUpload1']) && $_FILES['imgUpload1']['error'] === UPLOAD_ERR_OK) {
    $image1Name = time() . "_1_" . basename($_FILES['imgUpload1']['name']);
    move_uploaded_file($_FILES['imgUpload1']['tmp_name'], $uploadDir . $image1Name);
}

if (isset($_FILES['imgUpload2']) && $_FILES['imgUpload2']['error'] === UPLOAD_ERR_OK) {
    $image2Name = time() . "_2_" . basename($_FILES['imgUpload2']['name']);
    move_uploaded_file($_FILES['imgUpload2']['tmp_name'], $uploadDir . $image2Name);
}

$sql = "UPDATE iBayProducts
        SET productName = ?, category = ?, item_condition = ?, description = ?, price = ?, postage = ?";

$params = [$itemName, $category, $condition, $desc, $price, $postage];
$types = "ssssdd";

if ($image1Name !== null) {
    $sql .= ", image_url_1 = ?";
    $params[] = $image1Name;
    $types .= "s";
}

if ($image2Name !== null) {
    $sql .= ", image_url_2 = ?";
    $params[] = $image2Name;
    $types .= "s";
}

$sql .= " WHERE id = ? AND sellerId = ?";
$params[] = $id;
$params[] = $userId;
$types .= "ii";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product updated successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Database update failed."]);
}