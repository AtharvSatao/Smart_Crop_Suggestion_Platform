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
    // Note: 'username' from the JS form maps to 'farm_name' in the DB.
    $farm_name = $_POST['username'] ?? ''; 
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? ''; // New password (optional)

    if (empty($farm_name) || empty($email)) {
        http_response_code(400);
        echo "Farm Name and email are required.";
        exit;
    }

    // --- Start Building the SQL Query ---
    $sql = "UPDATE farmers SET email = ?";
    $params = "s";
    $values = [$email];

    // Check if a new password was provided and add it to the query (plain text)
    if (!empty($password)) {
        $sql .= ", password = ?";
        $params .= "s";
        $values[] = $password; 
    }

    $sql .= " WHERE farm_name = ?";
    $params .= "s";
    $values[] = $farm_name;

    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param($params, ...$values);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo "Farmer profile updated successfully";
            } else {
                echo "No changes made to farmer profile or Farm Name not found.";
            }
        } else {
            http_response_code(500);
            echo "Error updating farmer profile: " . $stmt->error;
        }
        $stmt->close();
    } else {
        http_response_code(500);
        echo "Prepare failed: " . $conn->error;
    }
}

$conn->close();
?>