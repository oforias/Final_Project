<?php
include 'config.php'; // Include database connection

header('Content-Type: application/json');

try {
    // Fetch payment methods
    $query = "SELECT payment_method_id, name FROM paymentmethods";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $paymentmethods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'payment_methods' => $paymentmethods
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch payment methods: ' . $e->getMessage()
    ]);
}
?>