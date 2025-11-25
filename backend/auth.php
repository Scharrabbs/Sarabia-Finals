<?php
session_start();


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");


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


$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'register':
        handleRegister($conn);
        break;
    
    case 'login':
        handleLogin($conn);
        break;
    
    case 'logout':
        handleLogout();
        break;
    
    case 'check':
        handleCheckAuth();
        break;
    
    default:
        echo json_encode([
            "success" => false,
            "message" => "Invalid action"
        ]);
        break;
}

$conn->close();


function handleRegister($conn) {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';
    
    
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode([
            "success" => false,
            "message" => "All fields are required"
        ]);
        return;
    }
    
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email format"
        ]);
        return;
    }
    
    
    if (strlen($username) < 3 || strlen($username) > 50) {
        echo json_encode([
            "success" => false,
            "message" => "Username must be between 3 and 50 characters"
        ]);
        return;
    }
    
    
    if (strlen($password) < 6) {
        echo json_encode([
            "success" => false,
            "message" => "Password must be at least 6 characters"
        ]);
        return;
    }
    
    
    $sql = "SELECT id FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "Username already exists"
        ]);
        $stmt->close();
        return;
    }
    $stmt->close();
    
    
    $sql = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "Email already exists"
        ]);
        $stmt->close();
        return;
    }
    $stmt->close();
    
    
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    
    $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $username, $email, $hashed_password);
    
    if ($stmt->execute()) {
        $user_id = $conn->insert_id;
        
       
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;
        
        echo json_encode([
            "success" => true,
            "message" => "Registration successful!",
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
    $stmt->close();
}


function handleLogin($conn) {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';
    
    if (empty($username) || empty($password)) {
        echo json_encode([
            "success" => false,
            "message" => "Username and password are required"
        ]);
        return;
    }
    

    $sql = "SELECT id, username, email, password FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid username or password"
        ]);
        $stmt->close();
        return;
    }
    
    $user = $result->fetch_assoc();
    $stmt->close();
    
    if (password_verify($password, $user['password'])) {
        // Set session
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
        echo json_encode([
            "success" => false,
            "message" => "Invalid username or password"
        ]);
    }
}


function handleLogout() {
    session_destroy();
    echo json_encode([
        "success" => true,
        "message" => "Logged out successfully"
    ]);
}


function handleCheckAuth() {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            "success" => true,
            "authenticated" => true,
            "user" => [
                "id" => $_SESSION['user_id'],
                "username" => $_SESSION['username']
            ]
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "authenticated" => false
        ]);
    }
}
?>