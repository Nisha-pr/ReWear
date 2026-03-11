# 🚀 ReWear Frontend — Deployment Guide

This guide covers how to deploy the ReWear React (Vite) frontend to **Vercel** (recommended) or **Netlify**.

---

## 📋 Prerequisites

- Node.js v18+
- Backend API deployed and running (get the URL ready)
- A [Vercel](https://vercel.com) or [Netlify](https://netlify.com) account

---

## ⚙️ Environment Variables

Before deploying, set the following environment variable in your hosting platform:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of your deployed backend API | `https://rewear-api.onrender.com/api` |
| `VITE_SOCKET_URL` | Base URL of your deployed backend for Socket.io | `https://rewear-api.onrender.com` |

> **Note:** All frontend env variables must be prefixed with `VITE_` to be accessible in Vite.

---

## 🟢 Option 1: Deploy to Vercel (Recommended)

### Method A — Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Set environment variables:**
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_SOCKET_URL
   ```

6. **Redeploy with env vars applied:**
   ```bash
   vercel --prod
   ```

### Method B — Vercel Dashboard (GUI)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`dhruv2311-dot/ReWear`)
3. Set **Root Directory** to `frontend`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables under **Settings → Environment Variables**
6. Click **Deploy**

---

## 🔵 Option 2: Deploy to Netlify

### Method A — Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Navigate to frontend and build:**
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Method B — Netlify Dashboard (GUI)

1. Go to [netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
2. Connect your GitHub repository
3. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Add environment variables under **Site Settings → Environment variables**
5. Click **Deploy site**

### ⚠️ Fix React Router on Netlify

Create a `_redirects` file inside `frontend/public/`:

```
/*    /index.html   200
```

This ensures client-side routing works correctly on page refresh.

---

## 🔧 Build Configuration Summary

| Setting | Value |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | `18.x` or higher |
| Package Manager | `npm` |

---

## ✅ Post-Deployment Checklist

- [ ] App loads correctly at the deployment URL
- [ ] Login / Register works (API calls reaching backend)
- [ ] Image uploads work (Cloudinary connected through backend)
- [ ] Real-time chat works (Socket.io connecting to backend)
- [ ] Protected routes redirect unauthenticated users correctly
- [ ] Admin panel accessible only to admin users

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| Blank page after deploy | Ensure `VITE_API_URL` is set correctly |
| API calls failing (CORS) | Add frontend URL to backend `FRONTEND_URL` env var |
| 404 on page refresh | Add `_redirects` file (Netlify) or configure Vercel rewrites |
| Socket.io not connecting | Ensure `VITE_SOCKET_URL` points to the backend, not `/api` |

---

*Part of the [ReWear Project](../README.md)*
