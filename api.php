<?php
// Guardian XAMPP Local Database API
// Handles concurrent JSON saves across network phones
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Bypass-Tunnel-Reminder");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = __DIR__ . '/server_data';
if (!is_dir($dataDir)) mkdir($dataDir, 0777, true);

$action = $_GET['action'] ?? '';
$key = $_GET['key'] ?? '';

if (!$key) { echo json_encode(["error"=>"No key provided"]); exit; }
$file = $dataDir . '/' . preg_replace('/[^a-z0-9_]/i', '', $key) . '.json';

$lockFile = $file . '.lock';
$lock = fopen($lockFile, 'w+');
flock($lock, LOCK_EX); // Get exclusive lock for race conditions

$currentData = [];
if (file_exists($file)) {
    $content = file_get_contents($file);
    if ($content) $currentData = json_decode($content, true) ?: [];
}

if ($action === 'get') {
    echo json_encode($currentData);
} elseif ($action === 'push') {
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input) {
        $currentData[] = $input;
        file_put_contents($file, json_encode($currentData));
    }
    echo json_encode(["status"=>"success", "added"=>$input]);
} elseif ($action === 'update') {
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input && isset($input['id'])) {
        foreach ($currentData as $i => $row) {
            if (($row['id'] ?? '') === $input['id']) {
                $currentData[$i] = array_merge($currentData[$i], $input);
            }
        }
        file_put_contents($file, json_encode($currentData));
    }
    echo json_encode(["status"=>"success"]);
} elseif ($action === 'delete') {
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input && isset($input['id'])) {
        $currentData = array_values(array_filter($currentData, function($r) use ($input) {
            return ($r['id'] ?? '') !== $input['id'];
        }));
        file_put_contents($file, json_encode($currentData));
    }
    echo json_encode(["status"=>"success"]);
} elseif ($action === 'overwrite') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (is_array($input)) {
        file_put_contents($file, json_encode($input));
    }
    echo json_encode(["status"=>"success"]);
}

flock($lock, LOCK_UN);
fclose($lock);
?>
