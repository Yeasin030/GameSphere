@echo off
echo ========================================================
echo Starting GameSphere PHP Backend Locally (XAMPP PHP)
echo ========================================================
echo.

set PHP_BIN=C:\xampp\php\php.exe

if not exist "%PHP_BIN%" (
    echo [ERROR] PHP executable not found at %PHP_BIN%
    echo Please make sure XAMPP is installed at C:\xampp
    pause
    exit /b 1
)

cd /d "%~dp0backend"

echo Checking MySQL connection...
echo Running Laravel server on http://127.0.0.1:8000 ...
echo Press Ctrl+C to stop the server.
echo.

"%PHP_BIN%" artisan serve --host=127.0.0.1 --port=8000

pause
