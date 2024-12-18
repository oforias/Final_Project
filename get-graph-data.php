<?php
session_start();
include 'config.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Get monthly expenses for graph
    $monthly_expenses = "SELECT 
        DATE_FORMAT(expense_date, '%b %Y') as month, 
        DATE_FORMAT(expense_date, '%Y-%m') as month_sort,
        SUM(amount) as total 
    FROM expenses 
    WHERE user_id = ? 
    GROUP BY DATE_FORMAT(expense_date, '%Y-%m'), DATE_FORMAT(expense_date, '%b %Y')
    ORDER BY month_sort ASC";
    $stmt = $pdo->prepare($monthly_expenses);
    $stmt->execute([$user_id]);
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get monthly income for graph
    $monthly_income = "SELECT 
        DATE_FORMAT(income_date, '%b %Y') as month,
        DATE_FORMAT(income_date, '%Y-%m') as month_sort,
        SUM(amount) as total 
    FROM income 
    WHERE user_id = ? 
    GROUP BY DATE_FORMAT(income_date, '%Y-%m'), DATE_FORMAT(income_date, '%b %Y')
    ORDER BY month_sort ASC";
    $stmt = $pdo->prepare($monthly_income);
    $stmt->execute([$user_id]);
    $income = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get expense categories distribution
    $expense_categories = "SELECT 
        c.category_name as category,
        SUM(e.amount) as total
    FROM expenses e
    JOIN categories c ON e.category_id = c.category_id
    WHERE e.user_id = ? AND c.type = 'expense'
    GROUP BY c.category_id, c.category_name
    ORDER BY total DESC";
    $stmt = $pdo->prepare($expense_categories);
    $stmt->execute([$user_id]);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total income
    $income_query = "SELECT SUM(amount) as total FROM income WHERE user_id = ?";
    $stmt = $pdo->prepare($income_query);
    $stmt->execute([$user_id]);
    $total_income = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Get total expenses
    $expense_query = "SELECT SUM(amount) as total FROM expenses WHERE user_id = ?";
    $stmt = $pdo->prepare($expense_query);
    $stmt->execute([$user_id]);
    $total_expenses = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Calculate balance
    $balance = $total_income - $total_expenses;

    // Prepare advice
    if ($balance > 0) {
        $advice = "Great job! You're saving money. Consider investing the surplus.";
    } elseif ($balance == 0) {
        $advice = "You're breaking even. Try to reduce expenses to start saving.";
    } else {
        $advice = "Warning: You're spending more than you earn. Consider budgeting.";
    }

    // Return data as JSON
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'total_income' => floatval($total_income),
        'total_expenses' => floatval($total_expenses),
        'balance' => floatval($balance),
        'advice' => $advice,
        'monthly_expenses' => $expenses,
        'monthly_income' => $income,
        'expense_categories' => $categories
    ]);

} catch(PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>