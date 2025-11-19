
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json'); 

$host = "127.0.0.1";

$dbname = "farmers_db";
$user = "root";
$pass = ""; 

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Connection failed: " . $conn->connect_error]);
    die();
}
if (!$conn->set_charset("utf8")) {
    error_log("Error loading character set utf8: " . $conn->error);
}

$role = $_GET['role'] ?? '';
$username = $_GET['username'] ?? ''; 

if (empty($role) || empty($username)) {
    echo json_encode(['success' => false, 'message' => 'Role and username are required.']);
    exit;
}

$stmt = null;
if ($role === 'consumer') {
    $stmt = $conn->prepare("SELECT email FROM consumers WHERE username = ?");
    $stmt->bind_param("s", $username);
} elseif ($role === 'farmer') {
    $stmt = $conn->prepare("SELECT email FROM farmers WHERE farm_name = ?");
    $stmt->bind_param("s", $username);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid role specified.']);
    exit;
}

if ($stmt) {
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode(['success' => true, 'email' => $row['email']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found.']);
    }
    
    $stmt->close();
}

$conn->close();
?>