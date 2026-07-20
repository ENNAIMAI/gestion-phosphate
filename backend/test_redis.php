<?php
$start = microtime(true);
$redis = new Redis();
$redis->connect('redis', 6379);
echo "Redis with 'redis': " . (microtime(true) - $start) . " seconds\n";
