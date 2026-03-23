<?php
require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1. Get & sanitise input
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    // 2. Validate
    if (empty($email) || empty($password) || empty($confirmPassword)) {
        die("All fields are required");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email format");
    }

    if ($password !== $confirmPassword) {
        die("Passwords do not match");
    }

    if (strlen($password) < 8) {
        die("Password must be at least 8 characters long");
    }

    // 3. Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 4. Check if email already exists
    $stmt = mysqli_prepare($conn, "SELECT id FROM authentication WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_close($stmt);
        die("Email already registered");
    }

    mysqli_stmt_close($stmt);

    // 5. Insert user
    $stmt = mysqli_prepare($conn, "INSERT INTO authentication (email, password) VALUES (?, ?)");
    mysqli_stmt_bind_param($stmt, "ss", $email, $hashedPassword);

    if (mysqli_stmt_execute($stmt)) {
        header("Location: ../frontend/login.html");
        exit;
    } else {
        die("Something went wrong. Please try again.");
    }

    mysqli_stmt_close($stmt);
}
?>