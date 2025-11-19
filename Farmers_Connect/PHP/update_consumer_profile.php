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
    $username = $_POST['username'] ?? ''; // Consumer's username
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? ''; // New password (optional)
    
    // NOTE: We ignore the 'role' parameter here since this file is explicitly for consumers.

    if (empty($username) || empty($email)) {
        http_response_code(400);
        echo "Username and email are required.";
        exit;
    }

    // --- Start Building the SQL Query ---
    $sql = "UPDATE consumers SET email = ?";
    $params = "s";
    $values = [$email];

    // Check if a new password was provided and add it to the query (plain text)
    if (!empty($password)) {
        $sql .= ", password = ?";
        $params .= "s";
        $values[] = $password; 
    }

    $sql .= " WHERE username = ?";
    $params .= "s";
    $values[] = $username;

    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param($params, ...$values);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo "Consumer profile updated successfully";
            } else {
                echo "No changes made to consumer profile or username not found.";
            }
        } else {
            http_response_code(500);
            echo "Error updating consumer profile: " . $stmt->error;
        }
        $stmt->close();
    } else {
        http_response_code(500);
        echo "Prepare failed: " . $conn->error;
    }
}

$conn->close();
?>