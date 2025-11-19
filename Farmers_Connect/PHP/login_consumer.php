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
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? ''; 

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo "Please enter username and password.";
        exit;
    }

    $sql = "SELECT username, password FROM consumers WHERE username = ?";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->store_result();
        
        if ($stmt->num_rows === 1) {
            $stmt->bind_result($db_username, $db_password);
            $stmt->fetch();

            if ($password === $db_password) { 
                echo "Login successful!";
            } else {
                http_response_code(401); 
                echo "Invalid password.";
            }
        } else {
            http_response_code(401); 
            echo "Username not found.";
        }
        $stmt->close();
    } else {
        http_response_code(500);
        echo "Prepare failed: " . $conn->error;
    }
}

$conn->close();
?>