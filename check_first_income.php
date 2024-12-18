<?php
session_start();
include 'config.php'; // Include your database connection file

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['needs_income' => false, 'error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Query to check if the user has any income
    $query = "SELECT COUNT(*) AS income_count FROM income WHERE user_id = :user_id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $hasIncome = intval($result['income_count']) > 0;

    // Respond with whether the user needs to add income
    echo json_encode(['needs_income' => !$hasIncome]);
} catch (PDOException $e) {
    echo json_encode(['needs_income' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
