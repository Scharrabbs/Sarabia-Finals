<?php
session_start();


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");


if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Not authenticated"
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];


$host = "sql113.infinityfree.com"; // Your database host
$username = "if0_40515800"; // Your database username
$password = "EWEN202210750"; // Your database password
$database = "if0_40515800_XXX"; // Your database name


$conn = new mysqli($host, $username, $password, $database);


if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}


$method = $_SERVER['REQUEST_METHOD'];


switch ($method) {
    case 'GET':
        
        handleGet($conn, $user_id);
        break;
    
    case 'POST':
        
        handlePost($conn, $user_id);
        break;
    
    case 'DELETE':
        
        handleDelete($conn, $user_id);
        break;
    
    default:
        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);
        break;
}


$conn->close();


function handleGet($conn, $user_id) {
    $sql = "SELECT * FROM colors WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $colors = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $colors[] = $row;
        }
    }
    
    echo json_encode([
        "success" => true,
        "data" => $colors
    ]);
    $stmt->close();
}


function handlePost($conn, $user_id) {
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $hex_code = isset($_POST['hex_code']) ? trim($_POST['hex_code']) : '';
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    
    
    if (empty($name) || empty($hex_code)) {
        echo json_encode([
            "success" => false,
            "message" => "Name and color code are required"
        ]);
        return;
    }
    
    
    if (!preg_match('/^#[a-f0-9]{6}$/i', $hex_code)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid color code format"
        ]);
        return;
    }
    
    if ($id > 0) {
        
        $sql = "UPDATE colors SET name = ?, hex_code = ? WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssii", $name, $hex_code, $id, $user_id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    "success" => true,
                    "message" => "Color updated successfully!"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Color not found or you don't have permission to update it"
                ]);
            }
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Error updating color: " . $conn->error
            ]);
        }
        $stmt->close();
    } else {
        
        $sql = "INSERT INTO colors (name, hex_code, user_id) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssi", $name, $hex_code, $user_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Color added successfully!",
                "id" => $conn->insert_id
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Error adding color: " . $conn->error
            ]);
        }
        $stmt->close();
    }
}


function handleDelete($conn, $user_id) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid color ID"
        ]);
        return;
    }
    
    
    $sql = "DELETE FROM colors WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $id, $user_id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Color deleted successfully!"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Color not found or you don't have permission to delete it"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error deleting color: " . $conn->error
        ]);
    }
    $stmt->close();
}
?>