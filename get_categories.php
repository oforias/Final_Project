<?php
session_start();
include 'config.php'; // Include database connection

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(403); // Forbidden
    echo json_encode(['success' => false, 'error' => 'User not logged in']);
    exit;
}

try {
    // Fetch categories
    $query = "SELECT category_id AS id, category_name AS name FROM categories";
    $stmt = $pdo->query($query);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return as JSON
    header('Content-Type: application/json');
    echo json_encode($categories);
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Failed to fetch categories']);
}
?>
