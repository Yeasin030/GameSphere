@echo off
echo ========================================================
echo Starting GameSphere Local Environment via Docker
echo ========================================================
echo.

echo 1. Bringing up Docker containers (Nginx, PHP, MySQL, Redis, MinIO, Next.js)...
docker-compose up -d

echo.
echo 2. Installing PHP dependencies...
docker exec -it gs_php composer install

echo.
echo 3. Running database migrations...
docker exec -it gs_php php artisan migrate:fresh --seed

echo.
echo 4. Generating Application Key...
docker exec -it gs_php php artisan key:generate

echo.
echo ========================================================
echo DONE! The application is hosted locally.
echo ========================================================
echo Frontend (Next.js):   http://localhost:3000
echo Backend API (PHP):    http://localhost
echo MinIO Console:        http://localhost:9001 (minioadmin / minioadmin123)
echo.
pause
