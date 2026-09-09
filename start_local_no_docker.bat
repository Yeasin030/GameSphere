@echo off
echo ========================================================
echo Starting GameSphere Full Local Stack (Without Docker)
echo ========================================================
echo.

set PHP_BIN=C:\xampp\php\php.exe

if not exist "%PHP_BIN%" (
    echo [ERROR] PHP executable not found at %PHP_BIN%
    pause
    exit /b 1
)

echo Starting PHP Backend on http://127.0.0.1:8000 ...
start "GameSphere PHP Backend" cmd /k "cd /d "%~dp0backend" && "%PHP_BIN%" artisan serve --host=127.0.0.1 --port=8000"

echo Starting Next.js Frontend on http://localhost:3000 ...
start "GameSphere Next.js Frontend" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo ========================================================
echo Servers started in background windows!
echo Backend API:  http://127.0.0.1:8000
echo API Base URL: http://127.0.0.1:8000/api/v1
echo Frontend:     http://localhost:3000
echo ========================================================
echo.
pause
