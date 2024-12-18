<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
    error_log($e->getMessage());
});

session_start();
include 'config.php'; // Database connection

// After successfully saving the income
$_SESSION['success_message'] = 'Income added successfully!';
header('Location: dashboard.php');
exit;
header('Content-Type: application/json');

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'User not logged in']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!isset($input['amount'], $input['date'], $input['category_id'], $input['payment_method_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $amount = floatval($input['amount']);
    $date = $input['date'];
    $category_id = intval($input['category_id']);
    $payment_method_id = intval($input['payment_method_id']);
    $notes = $input['name'] ?? null;

    // Validate date format
    if (!DateTime::createFromFormat('Y-m-d', $date)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid date format. Use Y-m-d.']);
        exit;
    }
    // check if category exists
    $incomeCategoryCheckQuery = "SELECT COUNT(*) FROM categories WHERE category_id = :category_id";
    $stmt = $pdo ->prepare($incomeCategoryCheckQuery);
    $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        http_response_code(400);
        echo json_encode(['success'=> false,'error'=> 'Invalid category ID']);
        exit;
    }

    // Check if payment method exists
    $paymentMethodCheckQuery = "SELECT COUNT(*) FROM paymentmethods WHERE payment_method_id = :payment_method_id";
    $stmt = $pdo->prepare($paymentMethodCheckQuery);
    $stmt->bindParam(':payment_method_id', $payment_method_id, PDO::PARAM_INT);
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid payment method ID']);
        exit;
    }

    $query = "
        INSERT INTO income (user_id, category_id, amount, income_date, notes, created_at)
        VALUES (:user_id, :category_id, :amount, :income_date, :notes, NOW())
    ";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':amount', $amount);
    $stmt->bindParam(':income_date', $date);
    $stmt->bindParam(':notes', $notes);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Income saved successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>