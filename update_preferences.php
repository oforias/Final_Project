<?php
session_start();
include 'config.php'; // Include database connection

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(403); // Forbidden
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Add error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Decode JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Check for JSON decoding errors
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
if (!isset($input['notification'], $input['budget_limit'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$notification = $input['notification'];
$budget_limit = $input['budget_limit'];

if (!is_numeric($budget_limit) || $budget_limit <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid budget limit value']);
    exit;
}

try {
    // Update or insert notification preference
    $query = "
        INSERT INTO preferences (user_id, preference_key, preference_value)
        VALUES (:user_id, 'notification', :preference_value)
        ON DUPLICATE KEY UPDATE preference_value = :preference_value
    ";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':preference_value', $notification, PDO::PARAM_STR);
    $stmt->execute();

    // Update or insert budget limit preference
    $query = "
        INSERT INTO preferences (user_id, preference_key, preference_value)
        VALUES (:user_id, 'budget_limit', :preference_value)
        ON DUPLICATE KEY UPDATE preference_value = :preference_value
    ";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':preference_value', $budget_limit, PDO::PARAM_STR);
    $stmt->execute();

    // Respond with success
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
