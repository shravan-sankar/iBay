<?php
session_start();
require_once 'connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(null);
    exit;
}

$stmt = mysqli_prepare($conn, 'SELECT id, email, firstName, lastName, preferredGenres FROM iBayMembers WHERE id = ? LIMIT 1');
$userId = (int) $_SESSION['user_id'];
mysqli_stmt_bind_param($stmt, 'i', $userId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);
mysqli_close($conn);

if (!$user) {
    http_response_code(401);
    echo json_encode(null);
    exit;
}

$genres = [];
if (!empty($user['preferredGenres'])) {
    $genres = array_values(array_filter(array_map('trim', explode(',', $user['preferredGenres']))));
}

echo json_encode([
    'id' => (int) $user['id'],
    'email' => $user['email'],
    'firstName' => $user['firstName'] ?? '',
    'lastName' => $user['lastName'] ?? '',
    'preferredGenres' => $genres,
]);
