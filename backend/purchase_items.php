<?php
session_start();
require_once 'connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
$itemIds = $payload['item_ids'] ?? [];

if (!is_array($itemIds) || count($itemIds) === 0) {
    echo json_encode([
        'success' => true,
        'deleted' => 0
    ]);
    exit;
}

$cleanIds = [];
foreach ($itemIds as $id) {
    if (is_numeric($id)) {
        $cleanIds[] = (int) $id;
    }
}

$cleanIds = array_values(array_unique($cleanIds));
if (count($cleanIds) === 0) {
    echo json_encode([
        'success' => true,
        'deleted' => 0
    ]);
    exit;
}

$placeholders = implode(',', array_fill(0, count($cleanIds), '?'));
$types = str_repeat('i', count($cleanIds));
// $sql = "DELETE FROM iBayProducts WHERE id IN ($placeholders)";
$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare statement.'
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, $types, ...$cleanIds);
$ok = mysqli_stmt_execute($stmt);

if (!$ok) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to remove purchased items.'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'deleted' => mysqli_stmt_affected_rows($stmt)
]);

?>
