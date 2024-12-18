<?php
// Start the session
session_start();

// Store a logout message in the session to display on login page
$_SESSION['logout_message'] = "You have been successfully logged out.";

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Delete the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Redirect to the login page
header("Location: login.html");
exit();
?>