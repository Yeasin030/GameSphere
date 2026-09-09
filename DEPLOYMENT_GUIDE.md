# GameSphere Production Deployment Guide

This guide explains how to deploy GameSphere (Next.js 14 Frontend, Laravel 11 Backend, and MySQL Database) to production hosting.

---

## 🚀 Recommended Cloud Deployment (Free / Low Cost)

### Step 1: Deploy Database & Backend on Railway or Render

1. Go to [Railway.app](https://railway.app) (or [Render.com](https://render.com)) and log in with your GitHub account.
2. Click **New Project** -> **Provision MySQL**.
   - Copy the database connection parameters (`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`).
3. In the same project, click **New Service** -> **GitHub Repo** -> select `Yeasin030/Gamesphere`.
4. Configure the service:
   - **Root Directory**: `backend`
   - **Build**: Uses the included `backend/Dockerfile` automatically.
5. Set Environment Variables in Railway for the Backend:
   ```env
   APP_NAME=GameSphere
   APP_ENV=production
   APP_KEY=base64:aQ+Z7DqDzWVH6ZH163GAN9Q8e89M9KXaNTdcf5gyFbc=
   APP_DEBUG=false
   APP_URL=https://<your-railway-backend-url>.up.railway.app
   FRONTEND_URL=https://<your-vercel-frontend-url>.vercel.app

   DB_CONNECTION=mysql
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_DATABASE=${{MySQL.MYSQLDATABASE}}
   DB_USERNAME=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

   SESSION_DRIVER=file
   CACHE_DRIVER=file
   QUEUE_CONNECTION=database
   MAIL_MAILER=log
   SANCTUM_STATEFUL_DOMAINS=<your-vercel-frontend-url>.vercel.app
   ```
6. Deploy! Railway will run `php artisan migrate --force` automatically to create all 69 tables and roles.

---

### Step 2: Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) and log in.
2. Click **Add New Project** -> import `Yeasin030/Gamesphere`.
3. Configure the project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://<your-railway-backend-url>.up.railway.app/api/v1`
   - `NEXT_PUBLIC_APP_URL`: `https://<your-vercel-domain>.vercel.app`
5. Click **Deploy**.
   - Your frontend will be live worldwide with SSL, Edge CDN, and automatic Git updates!

---

## 🐳 Alternative: Single VPS (DigitalOcean / Hetzner / AWS EC2)

If you have an Ubuntu VPS ($5-10/month):

1. SSH into your VPS:
   ```bash
   git clone https://github.com/Yeasin030/Gamesphere.git
   cd Gamesphere
   ```
2. Run Docker Compose:
   ```bash
   docker compose up -d --build
   ```
3. Run migrations and seed data:
   ```bash
   docker compose exec php php artisan migrate --force
   ```
4. Point your domain DNS A-records to your VPS IP address.

---

## 🌐 Alternative: Instant Public Access via Cloudflare Tunnel (Free & Immediate)

If you want to instantly share your locally running app with anyone on the internet without paying for servers:

1. Download [Cloudflare Tunnel (`cloudflared`)](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/).
2. Run in PowerShell:
   ```powershell
   cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare will give you a public `https://xxx.trycloudflare.com` URL accessible from anywhere on mobile or desktop!
