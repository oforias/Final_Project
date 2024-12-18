<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
header('Content-Type: application/json');

// Check if user is logged in
$logged_in = isset($_SESSION['user_id']);

echo json_encode([
    'logged_in' => $logged_in
]);
