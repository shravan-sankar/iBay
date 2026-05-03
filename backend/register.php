<?php
require_once 'connection.php';

// Sends a JSON response and exits immediately
function respondWithJson(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1) Read and sanitise incoming form values from user
    $email = trim($_POST['email'] ?? '');
    $first_name = trim($_POST['first_name'] ?? '');
    $last_name = trim($_POST['last_name'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $preferred_genres = trim($_POST['preferred_genres'] ?? '');

    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    // 2) Validate required fields and data format
    if (empty($email) || empty($first_name) || empty($last_name) || empty($password) || empty($confirm_password)) {
        respondWithJson(422, ['success' => false, 'message' => 'All fields are required.']);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respondWithJson(422, ['success' => false, 'message' => 'Invalid email format.']);
    }

    if (strlen($password) < 8 || strlen($confirm_password) < 8 || $password !== $confirm_password) {
        respondWithJson(422, ['success' => false, 'message' => 'Password must be at least 8 characters long and match confirmation.']);
    }

    if ($preferred_genres === '') {
        respondWithJson(422, ['success' => false, 'message' => 'Please choose at least one shopping genre.']);
    }

    // 3) Hash password before storing it in the database
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 4) Check if user email is already registered in database
    $stmt = mysqli_prepare($conn, "SELECT id FROM iBayMembers WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_close($stmt);
        respondWithJson(409, ['success' => false, 'message' => 'Email already registered.']);
    }

    mysqli_stmt_close($stmt);

    // 5) Insert the new member record into the database
    $stmt = mysqli_prepare($conn, "INSERT INTO iBayMembers (email, password, firstName, lastName, preferredGenres) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "sssss", $email, $hashedPassword, $first_name, $last_name, $preferred_genres);
    if (mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        respondWithJson(200, ['success' => true, 'redirect' => 'main-G06.html?registered=1']);
    } else {
        respondWithJson(500, ['success' => false, 'message' => 'Something went wrong. Please try again.']);
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);
} else {
    respondWithJson(405, ['success' => false, 'message' => 'Invalid request method.']);
}
?>