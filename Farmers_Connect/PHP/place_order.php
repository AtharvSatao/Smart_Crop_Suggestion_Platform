
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1); // Display errors for debugging

// Database connection details
$host = "localhost";
$dbname = "farmers_db";
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    // Return a JSON error response
    echo json_encode(['success' => false, 'message' => "Database connection failed: " . $conn->connect_error]);
    exit(); // Stop execution
}

// Set header for JSON response
header('Content-Type: application/json');

// Read the raw POST data (JSON from JavaScript)
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true); // Decode JSON into an associative array

// Basic validation for JSON data
if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data received or no data.']);
    $conn->close();
    exit();
}

// Extract data from the decoded JSON payload
$username = $data['username'] ?? null;
$name = $data['name'] ?? null;
$phone = $data['phone'] ?? null;
$address = $data['address'] ?? null;
$products_array = $data['products'] ?? []; // This is the array of product objects from JS
$total = $data['total'] ?? null;
$payment_method = $data['payment'] ?? null;

// Validate essential data existence
if (!$username || !$name || !$phone || !$address || empty($products_array) || $total === null || !$payment_method) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Missing required order details.']);
    $conn->close();
    exit();
}

// --- Convert the products array into the desired string format ---
$products_string_for_db = [];
foreach ($products_array as $product) {
    $product_name = $product['name'] ?? 'Unknown Product';
    $quantity = $product['quantity'] ?? 1;
    $price = $product['price'] ?? 0; // Assuming 'price' is unit price
    $item_total = $quantity * $price;
    $products_string_for_db[] = htmlspecialchars($product_name) . " x " . $quantity . " - ₹" . $item_total;
}
$final_products_string = implode(", ", $products_string_for_db);

// SQL to insert the order into your 'orders' table
// Note: Your table has 'username' column, not 'consumer_username', so using 'username'.
// Also, 'id' is AUTO_INCREMENT, 'created_at' uses DEFAULT CURRENT_TIMESTAMP.
$sql = "INSERT INTO orders (username, name, phone, address, products, total, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // "sssssis" -> string, string, string, string, string (for products list), integer (for total), string
    // IMPORTANT: Make sure the column 'total' in your DB is INT or DECIMAL. If DECIMAL, use 'd' instead of 'i'.
    // Given your screenshot shows 'total' with values like '350', '160', '160', '160', 'i' for integer is fine.
    $stmt->bind_param("sssssis", $username, $name, $phone, $address, $final_products_string, $total, $payment_method);
    
    if ($stmt->execute()) {
        $order_id = $conn->insert_id; // Get the ID of the newly inserted order
        echo json_encode(['success' => true, 'message' => "Order placed successfully! Order ID: " . $order_id]);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['success' => false, 'message' => "Failed to save order: " . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => "Prepare failed: " . $conn->error]);
}

$conn->close();
?>