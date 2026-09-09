# GameSphere

GameSphere is a modern, full-stack gaming social network and community platform built with **Next.js 14** (App Router) and **Laravel 11** with MySQL and Sanctum Bearer token authentication.

---

## 🌟 Key Features

- **Authentication & User Gate**: Secure login and registration with automated name-to-username generation and redirect to profile.
- **Unified Identity**: Seamless synchronization between profile details, sidebar, header, bottom nav, and feed across all sessions.
- **Feed & Posts**: Create gaming updates, like, comment, bookmark, and share posts with rich media.
- **Gaming Hub**: Explore games, browse upcoming releases, and view game details.
- **Communities & Groups**: Join and create gaming clans and groups.
- **Esports & Tournaments**: Browse tournaments, register teams, and check standings.
- **Gaming News & Updates**: Real-time gaming industry news feed.
- **Direct Messaging**: Chat with friends and clan members.
- **Settings & Account Management**: Customize profile info, notifications, privacy, and preferences.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18, TypeScript)
- **Styling**: Tailwind CSS & Lucide React Icons
- **State Management**: Zustand
- **HTTP Client**: Axios with centralized Bearer token interceptor

### Backend
- **Framework**: Laravel 11 (PHP 8.2+)
- **Authentication**: Laravel Sanctum (Bearer Token)
- **Database**: MySQL
- **Permissions**: Spatie Laravel-Permission
- **API Documentation**: OpenAPI / Swagger

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- PHP 8.2+ with PDO MySQL, OpenSSL, Mbstring
- MySQL 8.0+
- Node.js 18+ and npm
- Composer

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

For production deployment instructions on Vercel, Railway, Render, or Docker VPS, refer to [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md).

---

## 📄 License
This project is open-source under the MIT License.
