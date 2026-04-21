

<?php
include 'connection.php';

header('Content-Type: application/json');

// 1. Capture the data from the request (assuming POST)
$categories = $_POST['category'] ?? [];
$priceRange = $_POST['price_range'] ?? '[0, 200]';
$postage    = $_POST['postage']  ?? [];
$conditions = $_POST['item_condition']?? [];
$searchTerm = $_POST['search_query'] ?? '';

// 2. Base SQL
$sql = "SELECT * FROM iBayProducts WHERE 1=1";
$params = [];
$types = "";


// --- 4. SEARCH BAR LOGIC ---
if (!empty(trim($searchTerm))) {
    $sql .= " AND (productName LIKE ? OR category LIKE ?)";
    $searchTermWildcard = "%" . $searchTerm . "%";
    $params[] = $searchTermWildcard;
    $params[] = $searchTermWildcard;
    $types .= "ss";
}

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
// 1. Initialize variables to prevent "Undefined Index" errors
$min = 0;
$max = 500;

// 2. Handle the price_range string "[a,b]"
if (isset($_POST['price_range']) && !empty($_POST['price_range'])) {
    $priceRangeRaw = $_POST['price_range']; // e.g., "[10,150]"
    
    // Remove the brackets [ ] and any accidental spaces
    $clean = str_replace(['[', ']', ' '], '', $priceRangeRaw);
    
    // Split the string "10,150" into an array ["10", "150"]
    $parts = explode(',', $clean);
    
    if (count($parts) === 2) {
        $min = (int)$parts[0];
        $max = (int)$parts[1];
    }
}

// 3. Build the SQL based on the integers
// Only add to SQL if the user has actually moved the sliders away from 0-200
if ($min > 0 || $max < 500) {
    if ($max === 500) {
        // If max is 200, it means "200 and everything above"
        $sql .= " AND price >= $min";
    } else {
        // Standard range
        $sql .= " AND price BETWEEN $min AND $max";
    }
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
if (!empty($conditions)) {
    $placeholders = implode(',', array_fill(0, count($conditions), '?'));
    $sql .= " AND item_condition IN ($placeholders)";
    foreach ($conditions as $cond) {
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