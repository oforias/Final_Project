<?php
session_start();
include 'config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Fetch total income
    $incomeQuery = "SELECT SUM(amount) AS total_income FROM income WHERE user_id = :user_id";
    $stmt = $pdo->prepare($incomeQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $total_income = $stmt->fetch(PDO::FETCH_ASSOC)['total_income'] ?? 0;

    // Fetch total expenses
    $expensesQuery = "SELECT SUM(amount) AS total_expenses FROM expenses WHERE user_id = :user_id";
    $stmt = $pdo->prepare($expensesQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $total_expenses = $stmt->fetch(PDO::FETCH_ASSOC)['total_expenses'] ?? 0;

    // Calculate balance
    $balance = $total_income - $total_expenses;

    // Provide advice based on balance
    $advice = "";
    if ($balance < 0) {
        $advice = "You're spending more than you earn. Consider cutting down on unnecessary expenses.";
    } elseif ($balance < 100) {
        $advice = "Your balance is low. Try to save more.";
    } else {
        $advice = "Great job! Keep saving and investing.";
    }

    echo json_encode([
        'success' => true,
        'total_income' => $total_income,
        'total_expenses' => $total_expenses,
        'balance' => $balance,
        'advice' => $advice
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
    error_log($e->getMessage());
}
?>
