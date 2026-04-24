<?php
session_start();
require_once 'connection.php';
header('Content-Type: application/json');

// Testing purposes 
// $_SESSION['user_id'] = 1; <------ Revert it from comment to code if testing without full logging process

// User Logged In Validation
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "User not logged in."
    ]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $sellerID = (int) 1; // NEED TO CHANGE

    $listingTitle = htmlspecialchars(trim($_POST["itemName"] ?? ''));
    $listingCategory = trim($_POST["category"] ?? '');
    $listingDesc = htmlspecialchars(trim($_POST["desc"] ?? ''));
    $listingPrice = trim($_POST["price"] ?? '');
    $listingPostage = trim($_POST["postage"] ?? '');
    $listingCondition = trim($_POST["condition"] ?? '');

    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    $listingImage1 = null;
    $listingImage2 = null;

    // Need to add better validation - This is temp
    if ($listingTitle === '' || $listingCategory === '' || $listingDesc === '' || $listingPrice === '' || $listingPostage === '') {

        echo json_encode([
            "success" => false,
            "message" => "Please fill in all fields."
        ]);

        exit;
    }

    /// Listing Image 1 Upload
    if (isset($_FILES['imgUpload1']) && $_FILES['imgUpload1']['error'] === 0) {
        $tmpName = $_FILES['imgUpload1']['tmp_name'];
        $listingImage1 = uniqid() . "_1_" . basename($_FILES['imgUpload1']['name']);
        $uploadPath = "../product_images/" . $listingImage1;

        // File Type Validation
        if (!in_array($_FILES['imgUpload1']['type'], $allowedTypes)) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid file type."
            ]);
            exit;
        }

        // Upload Image
        if (!move_uploaded_file($tmpName, $uploadPath)) {
            echo json_encode([
                "success" => false,
                "message" => "Failed to upload image.",
            ]);
            exit;
        }
    }
    ///

    /// Listing Image 2 Upload
    if (isset($_FILES['imgUpload2']) && $_FILES['imgUpload2']['error'] === 0) {

        $tmpName = $_FILES['imgUpload2']['tmp_name'];
        $listingImage2 = uniqid() . "_2_" . basename($_FILES['imgUpload2']['name']);
        $uploadPath = "../product_images/" . $listingImage2;
        
        // File Type Validation
        if (!in_array($_FILES['imgUpload2']['type'], $allowedTypes)) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid file type."
            ]);
            exit;
        }
        
        // Upload Image
        if (!move_uploaded_file($tmpName, $uploadPath)) {
            echo json_encode([
                "success" => false,
                "message" => "Failed to upload image."
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
    $listingImage1,
    $listingImage2,
    $listingCondition);
    ///

    // Insert into database
    if (!mysqli_stmt_execute($stmt)) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to insert listing into database."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Listing uploaded successfully",

    ]);
    exit;

}

// Incorrect request method handling
else {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
        ]);
    exit;
}

?>