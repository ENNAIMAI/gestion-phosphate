<?php
$start = microtime(true);
$pdo = new PDO('mysql:host=db;dbname=phosphate_stock', 'root', 'root');
echo "PDO with 'db': " . (microtime(true) - $start) . " seconds\n";

$start2 = microtime(true);
$pdo2 = new PDO('mysql:host=172.18.0.5;dbname=phosphate_stock', 'root', 'root');
echo "PDO with '172.18.0.5': " . (microtime(true) - $start2) . " seconds\n";
