<?php
session_start();

if (isset($_SESSION["user_email"])) {
    header("Content-Type: text/plain; charset=UTF-8");
    echo $_SESSION["user_email"];
} else {
    http_response_code(401);
    header("Content-Type: text/plain; charset=UTF-8");
    echo "Not logged in";
}
