<?php
include 'connection.php';

header('Content-Type: application/json');

// 1. Capture the data from the request (assuming POST)
$categories = $_POST['category'] ?? [];
$prices     = $_POST['price']    ?? [];
$postage    = $_POST['postage']  ?? [];
$conditions = $_POST['item_condition']?? [];

// 2. Base SQL
$sql = "SELECT * FROM iBayProducts WHERE 1=1";
$params = [];
$types = "";

// 3. Dynamic Filtering Logic
// Category Filter
if (!empty($categories)) {
    $placeholders = implode(',', array_fill(0, count($categories), '?'));
    $sql .= " AND category IN ($placeholders)";
    foreach ($categories as $cat) {
        $params[] = $cat;
        $types .= "s";
    }
}

// Price Filter (Example: "0-50" becomes BETWEEN 0 AND 50)
if (!empty($prices)) {
    $sql .= " AND (";
    $priceQueries = [];
    foreach ($prices as $range) {
        if ($range == '0-50')   $priceQueries[] = "price BETWEEN 0 AND 50";
        if ($range == '50-100') $priceQueries[] = "price BETWEEN 50 AND 100";
        if ($range == '100+')   $priceQueries[] = "price > 100";
    }
    $sql .= implode(" OR ", $priceQueries) . ")";
}

// Postage Filter
if (!empty($postage)) {
    $placeholders = implode(',', array_fill(0, count($postage), '?'));
    $sql .= " AND postage IN ($placeholders)";
    foreach ($postage as $p) {
        $params[] = $p;
        $types .= "s";
    }
}

// Condition Filter
if (!empty($item_conditions)) {
    $placeholders = implode(',', array_fill(0, count($item_conditions), '?'));
    $sql .= " AND item_condition IN ($placeholders)";
    foreach ($item_conditions as $cond) {
        $params[] = $cond;
        $types .= "s";
    }
}

// 4. Prepare and Execute
$stmt = mysqli_prepare($conn, $sql);

if ($params) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    $products[] = $row;
}

echo json_encode($products);