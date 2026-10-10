@echo off
echo =======================================
echo Deploying GameSphere Backend...
echo =======================================
cd backend
call D:\APP\gamesphere\bin\wasmer.exe deploy
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend deployment failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =======================================
echo Building GameSphere Frontend...
echo =======================================
cd ..\frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =======================================
echo Deploying GameSphere Frontend...
echo =======================================
call D:\APP\gamesphere\bin\wasmer.exe deploy
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend deployment failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =======================================
echo Deployment Complete!
echo Backend: https://gamesphere-backend.wasmer.app
echo Frontend: https://gamesphere-frontend.wasmer.app
echo =======================================
pause
