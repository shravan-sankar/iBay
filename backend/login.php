<?php
session_start();
require 'connection.php';

function respondWithJson(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}

function isAjaxRequest(): bool
{
    return isset($_SERVER['HTTP_X_REQUESTED_WITH'])
        && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    if (isAjaxRequest()) {
        respondWithJson(405, ['success' => false, 'message' => 'Invalid request method.']);
    }
    header('Location: ../frontend/html/main-G06.html');
    exit;
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($email === '' || $password === '') {
    if (isAjaxRequest()) {
        respondWithJson(422, ['success' => false, 'message' => 'Email and password are required.']);
    }
    die('Email and password are required');
}

$stmt = mysqli_prepare($conn, 'SELECT id, email, password FROM iBayMembers WHERE email = ?');
mysqli_stmt_bind_param($stmt, 's', $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$isAuthenticated = false;

if ($user && password_verify($password, $user['password'])) {
    $isAuthenticated = true;
} elseif ($user && hash_equals((string) $user['password'], (string) $password)) {
    $isAuthenticated = true;

    // Legacy plaintext password support: upgrade to hashed on successful login.
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

if (!$isAuthenticated) {
    if (isAjaxRequest()) {
        respondWithJson(401, ['success' => false, 'message' => 'Invalid email or password.']);
    }
    die('Invalid email or password');
}

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['user_email'] = $user['email'];

if (isAjaxRequest()) {
    respondWithJson(200, ['success' => true, 'redirect' => 'browse.html']);
}

header('Location: ../frontend/html/browse.html');
exit;
