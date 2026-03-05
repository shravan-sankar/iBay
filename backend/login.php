<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = isset($_POST["email"]) ? trim($_POST["email"]) : "";
    $password = isset($_POST["password"]) ? $_POST["password"] : "";

    if ($email === "") {
        header("Location: ../frontend/html/index.html");
        exit();
    }

    $_SESSION["user_email"] = htmlspecialchars($email);

    // you would verify the password against the database here.

    header("Location: ../frontend/html/browse.html");
    exit();
}
?>
