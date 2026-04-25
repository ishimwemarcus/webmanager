<?php
// BizTrack - Hybrid PHP/React Startup Engine
// This file bridges the gap between Apache (XAMPP) and Vite (Dev Server) automatically.

session_start();

/**
 * Automatically detect if the Vite development server is running.
 */
function isViteRunning($port = 5173) {
    $connection = @fsockopen('localhost', $port, $errno, $errstr, 0.05); // Very fast timeout
    if ($connection) {
        fclose($connection);
        return true;
    }
    return false;
}

$vite_server = 'http://localhost:5173';
$is_development = isViteRunning(5173);

// If in development and accessed via Apache, we need to inject the Vite client
if ($is_development) {
    if (file_exists(__DIR__ . '/index.html')) {
        $html = file_get_contents(__DIR__ . '/index.html');
        
        // Inject Vite Client for HMR and replace the relative script with the Vite Server URL
        $vite_injection = "
        <script type=\"module\">
            import \"$vite_server/@vite/client\";
        </script>
        <script type=\"module\" src=\"$vite_server/src/main.jsx\"></script>";
        
        // Remove the original script tag and replace it with our injection
        $html = preg_replace('/<script type="module" src=".\/src\/main.jsx"><\/script>/', $vite_injection, $html);
        
        echo $html;
    } else {
        echo "<h1>BizTrack Engine Error</h1><p>index.html not found. Please run <code>npm run build</code> or check your project structure.</p>";
    }
} else {
    // In production, just serve the index.html (which should have been built by vite)
    if (file_exists(__DIR__ . '/index.html')) {
        require_once __DIR__ . '/index.html';
    } else {
        echo "<h1>BizTrack Engine Error</h1><p>Production index.html not found. Please run <code>npm run build</code>.</p>";
    }
}
?>
