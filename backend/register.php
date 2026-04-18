<?php
require_once 'connection.php';

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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1. Get & sanitise input
    $email = trim($_POST['email'] ?? '');
    $first_name = trim($_POST['first_name'] ?? '');
    $last_name = trim($_POST['last_name'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $preferred_genres = trim($_POST['preferred_genres'] ?? '');

    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    // 2. Validate
    if (empty($email) || empty($first_name) || empty($last_name) || empty($password) || empty($confirm_password)) {
        if (isAjaxRequest()) {
            respondWithJson(422, ['success' => false, 'message' => 'All fields are required.']);
        }
        die("All fields are required");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        if (isAjaxRequest()) {
            respondWithJson(422, ['success' => false, 'message' => 'Invalid email format.']);
        }
        die("Invalid email format");
    }

    if (strlen($password) < 8 || strlen($confirm_password) < 8 || $password !== $confirm_password) {
        if (isAjaxRequest()) {
            respondWithJson(422, ['success' => false, 'message' => 'Password must be at least 8 characters long and match confirmation.']);
        }
        die("Password must be at least 8 characters long");
    }

    if ($preferred_genres === '') {
        if (isAjaxRequest()) {
            respondWithJson(422, ['success' => false, 'message' => 'Please choose at least one shopping genre.']);
        }
        die("Please choose at least one shopping genre");
    }

    // 3. Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 4. Check if email already exists
    $stmt = mysqli_prepare($conn, "SELECT id FROM iBayMembers WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_close($stmt);
        if (isAjaxRequest()) {
            respondWithJson(409, ['success' => false, 'message' => 'Email already registered.']);
        }
        die("Email already registered");
    }

    mysqli_stmt_close($stmt);

    // 5. Insert user
    $stmt = mysqli_prepare($conn, "INSERT INTO iBayMembers (email, password, firstName, lastName, preferredGenres) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "sssss", $email, $hashedPassword, $first_name, $last_name, $preferred_genres);
    if (mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        if (isAjaxRequest()) {
            respondWithJson(200, ['success' => true, 'redirect' => 'main-G06.html?registered=1']);
        }
        header("Location: ../frontend/html/main-G06.html?registered=1");
        exit;
    } else {
        if (isAjaxRequest()) {
            respondWithJson(500, ['success' => false, 'message' => 'Something went wrong. Please try again.']);
        }
        die("Something went wrong. Please try again.");
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);
} else {
    if (isAjaxRequest()) {
        respondWithJson(405, ['success' => false, 'message' => 'Invalid request method.']);
    }
}
?>