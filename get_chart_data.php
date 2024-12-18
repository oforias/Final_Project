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
    // Expenses by Category
    $expenseQuery = "
        SELECT c.category_name AS category, SUM(e.amount) AS total
        FROM expenses e
        JOIN categories c ON e.category_id = c.category_id
        WHERE e.user_id = :user_id
        AND c.type = 'expense'
        AND (c.user_id = :user_id OR c.is_default = 1)
        GROUP BY c.category_name
    ";
    $stmt = $pdo->prepare($expenseQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Income by Category
    $incomeQuery = "
        SELECT c.category_name AS source, SUM(i.amount) AS total
        FROM income i
        JOIN categories c ON i.category_id = c.category_id
        WHERE i.user_id = :user_id
        AND c.type = 'income'
        AND (c.user_id = :user_id OR c.is_default = 1)
        GROUP BY c.category_name
    ";
    $stmt = $pdo->prepare($incomeQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $income = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Overall Financial Overview (last 6 months)
    $overviewQuery = "
        SELECT 
            COALESCE((SELECT SUM(amount) FROM income WHERE user_id = :user_id), 0) AS total_income,
            COALESCE((SELECT SUM(amount) FROM expenses WHERE user_id = :user_id), 0) AS total_expenses,
            DATE_FORMAT(CURDATE(), '%Y-%m') as current_month
    ";
    $stmt = $pdo->prepare($overviewQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $overview = $stmt->fetch(PDO::FETCH_ASSOC);

    // Monthly breakdown (last 6 months)
    $monthlyQuery = "
        SELECT 
            DATE_FORMAT(date, '%Y-%m') as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM (
            SELECT income_date as date, amount, 'income' as type FROM income WHERE user_id = :user_id
            UNION ALL
            SELECT expense_date as date, amount, 'expense' as type FROM expenses WHERE user_id = :user_id
        ) combined
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month DESC
    ";
    $stmt = $pdo->prepare($monthlyQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        'success' => true,
        'expenses' => $expenses,
        'income' => $income,
        'overview' => [
            'total_income' => floatval($overview['total_income']),
            'total_expenses' => floatval($overview['total_expenses']),
            'balance' => floatval($overview['total_income']) - floatval($overview['total_expenses'])
        ],
        'monthly' => $monthly
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
?>
