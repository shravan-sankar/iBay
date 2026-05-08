<?php
session_start();
require_once 'connection.php';
header('Content-Type: application/json');

// User Logged In Validation
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "User not logged in."
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

function validateImageUpload($file, $fieldname) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

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

$sellerID = (int) $_SESSION['user_id'];

$listingTitle = trim($_POST["itemName"] ?? '');
$listingCategory = trim($_POST["category"] ?? '');
$listingDesc = trim($_POST["desc"] ?? '');
$listingPrice = trim($_POST["price"] ?? '');
$listingPostage = trim($_POST["postage"] ?? '');
$listingCondition = trim($_POST["condition"] ?? '');

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

/// Listing Image 1 Upload
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
///

/// Listing Image 2 Upload
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
///

/// Preparing Database Insert
$sql_code = "INSERT INTO iBayProducts (productName, price, category, sellerId, description, postage, image_url_1, image_url_2, item_condition)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = mysqli_prepare($conn, $sql_code);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare SQL statement."
    ]);
    exit;
}

mysqli_stmt_bind_param(
$stmt,
"sdsisdsss",
$listingTitle,
$listingPrice,
$listingCategory,
$sellerID,
$listingDesc,
$listingPostage,
$image1Name,
$image2Name,
$listingCondition);
///

/// Insert into database
if (!mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "success" => false,
        "message" => "Listing upload failed."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Listing uploaded successfully!",

]);
exit;
///

?>