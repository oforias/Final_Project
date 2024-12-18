<?php
// // Database connection settings
// $host = 'localhost';  // Database host
// $dbname = 'expenseflow';  // Database name
// $username = 'root';  // Database username
// $password = '';  // Database password (adjust for your setup)


$host = 'localhost';  // Database host
$dbname = 'webtech_fall2024_alan_ofori';  // Database name
$username = 'alan.ofori';  // Database username
$password = '23032024'; 

try {
    // Create a PDO instance
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Optional: Set character encoding to avoid issues with special characters
    $pdo->exec("SET NAMES 'utf8'");

} catch (PDOException $e) {
    // Handle error if connection fails
    echo "Connection failed: " . $e->getMessage();
    exit;
}
?>
