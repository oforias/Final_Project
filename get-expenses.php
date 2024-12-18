<?php
session_start();
include 'config.php'; // Include your database configuration

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(403); // Forbidden
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Query to fetch expenses for the logged-in user
    $query = "SELECT e.expense_id, e.amount, e.expense_date, e.notes, c.category_name, pm.method_name 
              FROM expenses e 
              LEFT JOIN categories c ON e.category_id = c.category_id 
              LEFT JOIN paymentmethods pm ON e.payment_method_id = pm.payment_method_id 
              WHERE e.user_id = :user_id 
              ORDER BY e.expense_date DESC";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'expenses' => $expenses]);
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Failed to fetch expenses']);
}
?>
