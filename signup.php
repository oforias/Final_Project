<?php
// Include database configuration
include 'config.php';

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
    $full_name = trim($_POST['full_name']);
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    
    // Validate required fields
    if (empty($full_name) || empty($email) || empty($password)) {
        sendResponse(false, "Please fill all required fields.");
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, "Invalid email format.");
    }

    // Validate password strength
    if (strlen($password) < 8 || 
        !preg_match("/[A-Z]/", $password) || 
        !preg_match("/[a-z]/", $password) || 
        !preg_match("/[0-9]/", $password) || 
        !preg_match("/[^A-Za-z0-9]/", $password)) {
        sendResponse(false, "Password does not meet requirements.");
    }

    try {
        // Check if email already exists
        $check_query = "SELECT email FROM users WHERE email = :email";
        $check_stmt = $pdo->prepare($check_query);
        $check_stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            sendResponse(false, "Email already registered.");
        }

        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Handle profile photo if uploaded
        $profile_path = null;
        if (isset($_FILES['profile_photo']) && $_FILES['profile_photo']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = 'uploads/';
            $file_extension = strtolower(pathinfo($_FILES['profile_photo']['name'], PATHINFO_EXTENSION));
            $allowed_extensions = ['jpg', 'jpeg', 'png'];
            
            if (!in_array($file_extension, $allowed_extensions)) {
                sendResponse(false, "Invalid file type. Only JPG, JPEG, and PNG allowed.");
            }
            
            $profile_path = $upload_dir . uniqid() . '.' . $file_extension;
            if (!move_uploaded_file($_FILES['profile_photo']['tmp_name'], $profile_path)) {
                $profile_path = null; // Reset if upload fails
            }
        }

        // Insert user data
        $query = "INSERT INTO users (full_name, email, password, profile_photo, created_at) 
                  VALUES (:full_name, :email, :password, :profile_photo, NOW())";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':full_name', $full_name, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':password', $password, PDO::PARAM_STR);
        $stmt->bindParam(':profile_photo', $profile_path, PDO::PARAM_STR);

        if ($stmt->execute()) {
            // Start session and set user data
            session_start();
            $_SESSION['user_id'] = $pdo->lastInsertId();
            $_SESSION['email'] = $email;
            $_SESSION['full_name'] = $full_name;
            
            // Auto-login the user and redirect to onboarding
            sendResponse(true, "Account created successfully", [
                'redirect' => 'onboarding.html',
                'user' => [
                    'email' => $email,
                    'full_name' => $full_name
                ]
            ]);
        } else {
            sendResponse(false, "Error creating account. Please try again.");
        }
    } catch (PDOException $e) {
        sendResponse(false, "Database error. Please try again later.");
    }
} else {
    sendResponse(false, "Invalid request method.");
}
?>