# 👕 ReWear - Sustainable Clothing Exchange Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**ReWear** is a modern, full-stack marketplace designed to promote sustainable fashion through clothing exchange. Users can list their pre-loved items, browse for new styles, and swap directly with others in a secure, community-driven environment.

---

## 🚀 Key Features

- **✨ Smart Marketplace**: Curated listing of clothing items with detailed descriptions and high-quality images.
- **💬 Real-time Messaging**: Instant communication between traders via Socket.io for seamless negotiation.
- **🔐 Secure Auth**: Robust authentication system supporting local accounts and OAuth integration (Google & GitHub).
- **🛡️ Admin Suite**: Specialized dashboard for platform administrators to manage users, items, and reports.
- **⚡ Premium UI**: High-performance, responsive interface built with Tailwind CSS 4 and fluid Framer Motion animations.
- **⭐ Trust & Safety**: Integrated review system to build a reliable community of traders.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State/API**: [Axios](https://axios-http.com/), [React Context API]
- **Icons**: [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Auth**: [Passport.js](https://www.passportjs.org/), [JWT](https://jwt.io/)
- **Media**: [Cloudinary](https://cloudinary.com/) for image hosting

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local instance)
- Cloudinary account for media storage

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ReWear.git
cd ReWear
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   # OAuth Credentials...
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
ReWear/
├── backend/            # Express server & API
│   ├── config/         # DB & Passport config
│   ├── controllers/    # Route handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── sockets/        # Socket.io logic
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # View components
│   │   └── context/    # Global state management
└── README.md           # Project documentation
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


