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

try {
    // Fetch user preferences
    $query = "
        SELECT 
            MAX(CASE WHEN preference_key = 'notification' THEN preference_value END) AS notification,
            MAX(CASE WHEN preference_key = 'budget_limit' THEN preference_value END) AS budget_limit
        FROM preferences
        WHERE user_id = :user_id
    ";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $preferences = $stmt->fetch(PDO::FETCH_ASSOC);

    // Return as JSON
    header('Content-Type: application/json');
    echo json_encode([
        'notification' => $preferences['notification'] ?? 'disabled',
        'budget_limit' => $preferences['budget_limit'] ?? '0'
    ]);
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Failed to fetch preferences']);
}
?>
