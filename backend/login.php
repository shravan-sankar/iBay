<?php
session_start();
require 'connection.php';

// Sends a JSON response and stops script execution
function respondWithJson(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondWithJson(405, ['success' => false, 'message' => 'Invalid request method.']);
}

// Read submitted credentials
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Reject incomplete login attempts with no input
if ($email === '' || $password === '') {
    respondWithJson(422, ['success' => false, 'message' => 'Email and password are required.']);
}

// Look up user record by email using a prepared statement
$stmt = mysqli_prepare($conn, 'SELECT id, email, password FROM iBayMembers WHERE email = ?');
mysqli_stmt_bind_param($stmt, 's', $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$isAuthenticated = false;

// Prefer secure hash verification for modern password records
if ($user && password_verify($password, $user['password'])) {
    $isAuthenticated = true;
} elseif ($user && hash_equals((string) $user['password'], (string) $password)) {
    $isAuthenticated = true;

    // hash password to secure login authentication
    $newHashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $updateStmt = mysqli_prepare($conn, 'UPDATE iBayMembers SET password = ? WHERE id = ?');
    if ($updateStmt) {
        $userId = (int) $user['id'];
        mysqli_stmt_bind_param($updateStmt, 'si', $newHashedPassword, $userId);
        mysqli_stmt_execute($updateStmt);
        mysqli_stmt_close($updateStmt);
    }
}

mysqli_close($conn);

// Fail with unauthorised when credentials are invalid
if (!$isAuthenticated) {
    respondWithJson(401, ['success' => false, 'message' => 'Invalid email or password.']);
}

// Persist authenticated user details in the session
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['user_email'] = $user['email'];

$userId = (int) $user['id'];
// Return success payload with target browse page of iBay
respondWithJson(200, [
    'success' => true,
    'id' => $userId,
    'redirect' => 'browse.html?id=' . $userId,
]);
