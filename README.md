# ScriptHub 🚀

A full-stack web application to **store, manage, and share code scripts** — with user authentication, syntax highlighting, tagging, and public/private visibility controls.

---

## 📁 Project Structure

```
scripthub/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (bcrypt password hashing)
│   │   └── Script.js        # Script schema
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile, change password
│   │   └── scripts.js       # CRUD + public explore + stats
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── server.js            # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    └── index.html           # Complete SPA (vanilla HTML/CSS/JS)
```

---

## ⚙️ Backend Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/scripthub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
```

> ⚠️ Change `JWT_SECRET` to a long, random string in production!

### Run the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## 🌐 Frontend Setup

The frontend is a **single HTML file** — no build tools required.

1. Open `frontend/index.html` in a browser, **OR**
2. Serve it with any static server:

```bash
# Using Python
cd frontend
python3 -m http.server 3000

# Using Node (npx)
npx serve frontend -p 3000
```

Make sure the `API` constant in `index.html` points to your backend:

```js
const API = 'http://localhost:5000/api'; // ← update if deploying
```

---

## 🔌 API Reference

### Auth Endpoints

| Method | Endpoint                    | Auth | Description          |
|--------|-----------------------------|------|----------------------|
| POST   | `/api/auth/register`        | ❌   | Create account       |
| POST   | `/api/auth/login`           | ❌   | Login, get JWT token |
| GET    | `/api/auth/me`              | ✅   | Get current user     |
| PUT    | `/api/auth/profile`         | ✅   | Update bio           |
| PUT    | `/api/auth/change-password` | ✅   | Change password      |

### Script Endpoints

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | `/api/scripts`        | ✅   | Get my scripts (filtered)|
| GET    | `/api/scripts/stats`  | ✅   | Dashboard statistics     |
| GET    | `/api/scripts/public` | ✅   | Explore public scripts   |
| GET    | `/api/scripts/:id`    | ✅   | Get single script        |
| POST   | `/api/scripts`        | ✅   | Create a script          |
| PUT    | `/api/scripts/:id`    | ✅   | Update a script          |
| DELETE | `/api/scripts/:id`    | ✅   | Delete a script          |

---

## ✨ Features

- **Authentication**: Secure JWT-based login/register with bcrypt password hashing
- **Script Management**: Create, edit, delete scripts with title, description, code, language & tags
- **Syntax Highlighting**: Powered by Highlight.js — 12 languages supported
- **Search & Filter**: Search by title/description/tags, filter by language, sort by date/title
- **Public/Private**: Toggle scripts between public (community visible) and private
- **Explore**: Browse public scripts from the whole community
- **Dashboard**: Stats overview with recent activity
- **Profile**: Update bio, change password
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security**: Helmet.js headers, CORS, input validation

---

## 🚀 Deployment Tips

### Backend (e.g., Railway, Render, Fly.io)
1. Push `backend/` to your platform
2. Set environment variables in the dashboard
3. Use MongoDB Atlas for the database (`MONGO_URI`)

### Frontend (e.g., Vercel, Netlify, GitHub Pages)
1. Update `const API = 'https://your-backend-url.com/api'` in `index.html`
2. Deploy the `frontend/` folder as a static site

---

## 🛠️ Tech Stack

| Layer    | Technology                           |
|----------|--------------------------------------|
| Frontend | Vanilla HTML/CSS/JS, Highlight.js    |
| Backend  | Node.js, Express.js                  |
| Database | MongoDB + Mongoose                   |
| Auth     | JWT (jsonwebtoken) + bcryptjs        |
| Security | Helmet.js, express-rate-limit, CORS  |
