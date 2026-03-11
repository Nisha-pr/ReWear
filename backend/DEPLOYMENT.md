# 🚀 ReWear Backend — Deployment Guide

This guide covers how to deploy the ReWear Node.js/Express backend to **Render** (recommended), **Railway**, or any **VPS/Cloud** environment.

---

## 📋 Prerequisites

- Node.js v18+
- MongoDB Atlas cluster (connection string ready)
- Cloudinary account (API keys ready)
- Google & GitHub OAuth apps configured
- A [Render](https://render.com) or [Railway](https://railway.app) account

---

## ⚙️ Environment Variables

Set the following variables in your hosting platform's environment settings:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `5000` |
| `NODE_ENV` | Runtime environment | `production` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_random_secret` |
| `JWT_EXPIRE` | JWT token expiry duration | `7d` |
| `SESSION_SECRET` | Secret for express-session | `your_random_secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth app Client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app Client Secret | From Google Console |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect URI | `https://your-api.com/api/auth/google/callback` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app Client ID | From GitHub Settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app Client Secret | From GitHub Settings |
| `GITHUB_CALLBACK_URL` | GitHub OAuth redirect URI | `https://your-api.com/api/auth/github/callback` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary Dashboard |
| `FRONTEND_URL` | Deployed frontend URL (for CORS) | `https://rewear.vercel.app` |

> ⚠️ **Never commit your real `.env` file.** Use `.env.example` as a reference template only.

---

## 🟢 Option 1: Deploy to Render (Recommended)

### Steps

1. Go to [render.com](https://render.com) and create a **New Web Service**
2. Connect your GitHub repository (`dhruv2311-dot/ReWear`)
3. Configure the service:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: `18`
4. Add all environment variables from the table above under **Environment**
5. Click **Create Web Service**

### Update OAuth Callback URLs

After deploying, update your OAuth apps with the Render URL:
- Google: `https://your-service.onrender.com/api/auth/google/callback`
- GitHub: `https://your-service.onrender.com/api/auth/github/callback`

> **Note:** Free Render services spin down after inactivity. Upgrade to a paid plan for production use.

---

## 🔵 Option 2: Deploy to Railway

### Steps

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
2. Select your repository
3. Railway auto-detects Node.js. Set:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
4. Go to **Variables** tab and add all environment variables
5. Railway assigns a public URL automatically

### Generate Secrets via Railway CLI (optional)

```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

---

## 🔴 Option 3: Deploy to VPS (Ubuntu/Debian)

### 1. Connect & Setup

```bash
ssh user@your-server-ip
sudo apt update && sudo apt install -y nodejs npm git
```

### 2. Clone & Install

```bash
git clone https://github.com/dhruv2311-dot/ReWear.git
cd ReWear/backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env   # Fill in all real values
```

### 4. Run with PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start server.js --name rewear-backend
pm2 save
pm2 startup   # Auto-start on server reboot
```

### 5. Setup Nginx Reverse Proxy (optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl reload nginx
```

---

## 🔧 Build Configuration Summary

| Setting | Value |
|---|---|
| Start Command | `npm start` |
| Build Command | `npm install` |
| Node.js Version | `18.x` or higher |
| Main Entry | `server.js` |

---

## 🌱 Seed the Database (Optional)

After deployment, you can seed sample data by running:

```bash
npm run seed
```

> Only run this once on a fresh database to avoid duplicate entries.

---

## ✅ Post-Deployment Checklist

- [ ] Health check endpoint responds: `GET /api/health` → `{ status: "ok" }`
- [ ] User registration and login work
- [ ] Google & GitHub OAuth flows complete successfully
- [ ] Image upload to Cloudinary works
- [ ] MongoDB Atlas connection is stable
- [ ] CORS allows requests from the deployed frontend URL
- [ ] Socket.io connects successfully from the frontend

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `MongooseServerSelectionError` | Check `MONGO_URI` and whitelist server IP in MongoDB Atlas Network Access |
| CORS errors from frontend | Set `FRONTEND_URL` to exact deployed frontend URL (no trailing slash) |
| OAuth redirect mismatch | Update callback URLs in Google/GitHub developer console |
| Socket.io not working | Ensure the hosting platform supports WebSockets |
| `JWT_SECRET` errors | Ensure `JWT_SECRET` is set and matches across restarts |

---

*Part of the [ReWear Project](../README.md)*
