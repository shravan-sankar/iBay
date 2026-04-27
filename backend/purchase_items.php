<?php
session_start();
require_once 'connection.php';
header('Content-Type: application/json');

// Only allow POST requests for purchase completion
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}

// Parse JSON body and extract item ids selected for purchase
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
$itemIds = $payload['item_ids'] ?? [];

// Nothing to delete is treated as a successful no-op
if (!is_array($itemIds) || count($itemIds) === 0) {
    echo json_encode([
        'success' => true,
        'deleted' => 0
    ]);
    exit;
}

// Keep only numeric ids and cast them to integers
$cleanIds = [];
foreach ($itemIds as $id) {
    if (is_numeric($id)) {
        $cleanIds[] = (int) $id;
    }
}

// Remove duplicates to avoid redundant placeholders
$cleanIds = array_values(array_unique($cleanIds));
if (count($cleanIds) === 0) {
    echo json_encode([
        'success' => true,
        'deleted' => 0
    ]);
    exit;
}

// Build dynamic placeholders/types for a variable-length IN clause
$placeholders = implode(',', array_fill(0, count($cleanIds), '?'));
$types = str_repeat('i', count($cleanIds));
// --> undo once finished // $sql = "DELETE FROM iBayProducts WHERE id IN ($placeholders)";
$stmt = mysqli_prepare($conn, $sql);

// Return a clear JSON error if statement preparation fails
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare statement.'
    ]);
    exit;
}

// Execute deletion for all purchased item ids
mysqli_stmt_bind_param($stmt, $types, ...$cleanIds);
$ok = mysqli_stmt_execute($stmt);

// Return an error when delete execution fails
if (!$ok) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to remove purchased items.'
    ]);
    exit;
}

// Return count of rows deleted by this purchase action
echo json_encode([
    'success' => true,
    'deleted' => mysqli_stmt_affected_rows($stmt)
]);

?>
