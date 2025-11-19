<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set header for JSON response
header('Content-Type: application/json');

// Embedded Database Connection
$host = "localhost";
$dbname = "farmers_db";
$user = "root";
$pass = ""; // Your database password

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Database connection failed: " . $conn->connect_error]);
    exit();
}
if (!$conn->set_charset("utf8")) {
    error_log("Error loading character set utf8: " . $conn->error);
}
// End Embedded Database Connection

// Get the POST data sent from JavaScript
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Basic validation
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    $conn->close();
    exit();
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    $conn->close();
    exit();
}

// Prepare the INSERT statement
// Assumes table columns are: name, email, message
$stmt = $conn->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");

if ($stmt) {
    // Bind parameters (sss = three strings)
    $stmt->bind_param("sss", $name, $email, $message);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Your message has been sent successfully!']);
    } else {
        http_response_code(500); // Internal Server Error
        error_log("SQL Error: " . $stmt->error); // Log the specific SQL error
        echo json_encode(['success' => false, 'message' => "Failed to save message due to a server error. SQL Error: " . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500); // Internal Server Error
    error_log("Prepare statement failed: " . $conn->error); // Log the prepare error
    echo json_encode(['success' => false, 'message' => "Internal server error: Prepare failed."]);
}

$conn->close();
?>