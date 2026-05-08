<?php
session_start();
require 'connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// Image File Validation Function
function validateImageUpload($file, $fieldname) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return null; // User did not change image - Hence, keep old
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return "$fieldname failed to upload.";
    }

    if (!in_array($file['type'], $allowedTypes)) {
        return "$fieldname must be a JPG, PNG, WEBP, or GIF image.";
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        return "$fieldname must be less than 5MB.";
    }

    return null;
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

// Call Image File Validation Function
$image1Error = validateImageUpload($_FILES['imgUpload1'] ?? null, 'Image 1');
$image2Error = validateImageUpload($_FILES['imgUpload2'] ?? null, 'Image 2');

if ($image1Error !== null || $image2Error !== null) {
    echo json_encode([
        'success' => false,
        'message' => $image1Error ?? $image2Error
    ]);
    exit;
}

$image1Name = null;
$image2Name = null;

if (isset($_FILES['imgUpload1']) && $_FILES['imgUpload1']['error'] === UPLOAD_ERR_OK) {
    $image1Name = uniqid("product_", true) . "_" . basename($_FILES['imgUpload1']['name']);
    
    // Checks image 1 saved successfully
    if (!move_uploaded_file($_FILES['imgUpload1']['tmp_name'], "../product_images/" . $image1Name)) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to save image 1."
        ]);
        exit;
    }
}

if (isset($_FILES['imgUpload2']) && $_FILES['imgUpload2']['error'] === UPLOAD_ERR_OK) {
    $image2Name = uniqid("product_", true) . "_" . basename($_FILES['imgUpload2']['name']);

    // Checks image 2 saved successfully
    if (!move_uploaded_file($_FILES['imgUpload2']['tmp_name'], "../product_images/" . $image2Name)) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to save image 2."
        ]);
        exit;
    }
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