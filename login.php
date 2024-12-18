<?php
// Include database configuration
include 'config.php';

// Start session to manage user login
session_start();

header('Content-Type: application/json');

function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Collect form data
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];

    // Validate required fields
    if (empty($email) || empty($password)) {
        sendResponse(false, "Please fill in all fields.");
    }

    try {
        // Query to fetch the user by email
        $query = "SELECT * FROM users WHERE email = :email";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verify password using password_verify for hashed passwords
        if ($user && $password == $user['password']) {
            // Set session variables for logged-in user
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['email'] = $user['email'];
            
            // Check if user needs onboarding
            $needs_onboarding = !isset($user['onboarding_completed']) || !$user['onboarding_completed'];
            
            sendResponse(true, "Login successful", [
                'redirect' => $needs_onboarding ? 'onboarding.html' : 'dashboard.php',
                'user' => [
                    'email' => $user['email'],
                    'full_name' => $user['full_name']
                ]
            ]);
            if ($needs_onboarding) {
                header('location: onboarding.html');
            }
            else 
            {
                header('location: dashboard.php');
            }
        } else {
            sendResponse(false, "Invalid email or password.");
        }
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        sendResponse(false, "An error occurred. Please try again later.");
    }
} else {
    sendResponse(false, "Invalid request method.");
}