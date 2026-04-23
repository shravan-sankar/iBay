<?php
include 'connection.php';

header('Content-Type: application/json');

// 1. Capture the data from the request (assuming POST)
$userId = $_POST['user_id'] ?? null;

// 1. Get preferred genres for the user
$genres = [];


if ($userId) {
    $genreStmt = $conn->prepare("SELECT preferredGenres FROM iBayMembers WHERE id = ?");
    $genreStmt->bind_param("i", $userId);
    $genreStmt->execute();
    $genreResult = $genreStmt->get_result();

    if ($row = $genreResult->fetch_assoc()) {

        $raw = $row['preferredGenres']; // plain string e.g. "Electronics"
        $genres = array_map('trim', explode(',', $raw));
        
    }
    $genreStmt->close();
    
    
    
}


// 2. Base SQL
$sql = "SELECT * FROM iBayProducts WHERE 1=1";
$params = [];
$types = "";

// Genre Filter (from user's preferred genres)
if (!empty($genres)) {
    $placeholders = implode(',', array_fill(0, count($genres), '?'));
    $sql .= " AND category IN ($placeholders)";
    foreach ($genres as $g) {
        $params[] = $g;
        $types .= "s";
    }
}


if (!empty($params)) {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close(); // close inside the if, where $stmt is guaranteed to exist
} else {
    $result = $conn->query($sql);
}

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

$conn->close();

header('Content-Type: application/json');
echo json_encode([
    'success'  => true,
    'products' => $products
]);



