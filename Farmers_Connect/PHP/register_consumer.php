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
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? ''; 

    if (empty($username) || empty($email) || empty($password)) {
        http_response_code(400);
        echo "All fields are required.";
        exit;
    }

    $stmt = $conn->prepare("SELECT id FROM consumers WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        http_response_code(409); 
        echo "Username already exists. Please choose another.";
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    $stmt = $conn->prepare("SELECT id FROM consumers WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        http_response_code(409); 
        echo "Email already registered. Please use another.";
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    $sql = "INSERT INTO consumers (username, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("sss", $username, $email, $password); 
        try {
            $stmt->execute();
            echo "Consumer registration successful!";
        } catch (mysqli_sql_exception $e) {
            http_response_code(500);
            echo "Error during registration: " . $e->getMessage();
        }
        $stmt->close();
    } else {
        http_response_code(500);
        echo "Prepare failed: " . $conn->error;
    }
}

$conn->close();
?>