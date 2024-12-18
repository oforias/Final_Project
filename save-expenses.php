<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL | E_STRICT);

session_start();
include 'config.php'; // Include database connection

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Decode the JSON payload
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['amount'], $input['date'], $input['category'], $input['payment_method'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$amount = floatval($input['amount']);
$date = $input['date'];
$category_id = intval($input['category']);
$payment_method_id = intval($input['payment_method']);
$notes = $input['description'] ?? null;

// Additional validation
if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Amount must be greater than 0']);
    exit;
}

// Validate date format
if (!DateTime::createFromFormat('Y-m-d', $date)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid date format. Use YYYY-MM-DD.']);
    exit;
}

try {
    // Check if category exists
    $categoryCheckQuery = "SELECT COUNT(*) FROM categories WHERE category_id = :category_id";
    $stmt = $pdo->prepare($categoryCheckQuery);
    $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid category ID']);
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

    // Insert the expense into the database
    $query = "
        INSERT INTO expenses (user_id, category_id, amount, expense_date, notes, payment_method_id)
        VALUES (:user_id, :category_id, :amount, :expense_date, :notes, :payment_method_id)
    ";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
    $stmt->bindParam(':amount', $amount, PDO::PARAM_STR);
    $stmt->bindParam(':expense_date', $date, PDO::PARAM_STR);
    $stmt->bindParam(':notes', $notes, PDO::PARAM_STR);
    $stmt->bindParam(':payment_method_id', $payment_method_id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Expense saved successfully']);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An unexpected error occurred. Please try again later.']);
}
?>
