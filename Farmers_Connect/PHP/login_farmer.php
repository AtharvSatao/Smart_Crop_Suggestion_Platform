<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Embedded Database Connection
$host = "localhost";
$dbname = "farmers_db";
$user = "root";
$pass = ""; // Your database password

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die("Connection failed: " . $conn->connect_error);
}
if (!$conn->set_charset("utf8")) {
    error_log("Error loading character set utf8: " . $conn->error);
}
// End Embedded Database Connection

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $farmName = $_POST['farmname'] ?? ''; // Using farmname as username for farmers
    $password = $_POST['password'] ?? '';

    if (empty($farmName) || empty($password)) {
        http_response_code(400);
        echo "Farm Name and password are required.";
        exit;
    }

    // Check for farm_name and plain text password
    $stmt = $conn->prepare("SELECT id FROM farmers WHERE farm_name = ? AND password = ?"); 
    if ($stmt) {
        $stmt->bind_param("ss", $farmName, $password);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows === 1) {
            echo "Farmer login successful!";
        } else {
            http_response_code(401); // Unauthorized
            echo "Invalid Farm Name or password.";
        }
        $stmt->close();
    } else {
        http_response_code(500);
        echo "Prepare failed: " . $conn->error;
    }
}

$conn->close();
?>