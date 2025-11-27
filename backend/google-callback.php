<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


$host = "localhost";
$username = "root";
$password = "";
$database = "color_picker_db";


$conn = new mysqli($host, $username, $password, $database);


if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['credential'])) {
    echo json_encode([
        "success" => false,
        "message" => "No credential provided"
    ]);
    exit();
}

$credential = $data['credential'];


$parts = explode('.', $credential);
if (count($parts) !== 3) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid token format"
    ]);
    exit();
}

$payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);

if (!$payload) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to decode token"
    ]);
    exit();
}

$google_id = isset($payload['sub']) ? $payload['sub'] : '';
$email = isset($payload['email']) ? $payload['email'] : '';
$name = isset($payload['name']) ? $payload['name'] : '';

if (empty($google_id) || empty($email)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user data from Google"
    ]);
    exit();
}


$sql = "SELECT id, username, email FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {

    $user = $result->fetch_assoc();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    
    echo json_encode([
        "success" => true,
        "message" => "Login successful!",
        "user" => [
            "id" => $user['id'],
            "username" => $user['username'],
            "email" => $user['email']
        ]
    ]);
} else {
    $username = explode('@', $email)[0];
    
    $original_username = $username;
    $counter = 1;
    
    while (true) {
        $check_sql = "SELECT id FROM users WHERE username = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("s", $username);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            break;
        }
        
        $username = $original_username . $counter;
        $counter++;
        $check_stmt->close();
    }
    
    // Create random password (user won't need it for Google login)
    $random_password = password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT);
    
    // Insert new user
    $insert_sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);
    $insert_stmt->bind_param("sss", $username, $email, $random_password);
    
    if ($insert_stmt->execute()) {
        $user_id = $conn->insert_id;
        
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;
        
        echo json_encode([
            "success" => true,
            "message" => "Account created successfully!",
            "user" => [
                "id" => $user_id,
                "username" => $username,
                "email" => $email
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error creating account: " . $conn->error
        ]);
    }
    $insert_stmt->close();
}

$stmt->close();
$conn->close();
?>