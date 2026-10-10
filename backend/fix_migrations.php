<?php
$dir = 'database/migrations';
$files = glob($dir . '/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    if (strpos($content, '->fullText') !== false) {
        $content = preg_replace('/(\$table->fullText.*?;)/', '// $1', $content);
        file_put_contents($file, $content);
        echo "Updated $file\n";
    }
}
