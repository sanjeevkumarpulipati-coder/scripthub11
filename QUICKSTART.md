# 🚀 ScriptHub - Quick Start Guide

## ✅ What's Been Built

### Version Control System (GitHub-like)
Your ScriptHub now includes a complete version control feature:
- **Automatic Version Tracking** - Every code edit creates a new version
- **Version History Modal** - View all versions with commit messages
- **One-Click Revert** - Restore any previous version instantly
- **Audit Trail** - See who changed what and when
- **Commit Messages** - Add descriptions to each edit

### Complete Architecture
- ✅ **Backend API** (Node.js + Express) on port 5000
- ✅ **Frontend UI** (HTML/CSS/JS) on port 3000
- ✅ **Database Models** (User, Script, ScriptVersion)
- ✅ **Authentication** (JWT tokens)
- ✅ **Version Control Endpoints** (4 new routes)

---

## 🔧 Running ScriptHub

### Option 1: With Real MongoDB (Recommended)

#### Step 1: Install MongoDB Community Edition
- Download from: https://www.mongodb.com/try/download/community
- Run installer (choose default installation path)
- Ensure `mongod` is in your PATH

#### Step 2: Start MongoDB
```powershell
mongod --dbpath C:\data\db
```

#### Step 3: Start ScriptHub Services
In **Terminal 1** - Start Backend:
```powershell
cd C:\Users\sanje\OneDrive\Desktop\Scripthub
npm start
```

In **Terminal 2** - Start Frontend:
```powershell
cd C:\Users\sanje\OneDrive\Desktop\Scripthub
npx http-server -p 3000 -c-1
```

#### Step 4: Open in Browser
```
http://localhost:3000
```

---

### Option 2: Without MongoDB (Demo Mode)

The application will run in **DEMO MODE** if MongoDB is unavailable:

```powershell
cd C:\Users\sanje\OneDrive\Desktop\Scripthub
npm start
```

Backend output will show:
```
⚠️  Could not connect to MongoDB. Running in DEMO MODE.
🚀 ScriptHub API running on http://localhost:5000 [⚠️ DEMO MODE]
```

⚠️ **Note:** In Demo Mode, user registration/login won't persist (in-memory only).

---

## 📝 Using Version Control

### Creating a Script
1. Click **"+ New Script"**
2. Enter title, code, language, description
3. Add tags (optional)
4. Click **"Save Script"** → **Version 1 created** ✅

### Editing with Versions
1. Click a script to view it
2. Click **"Edit"** button
3. Modify the code
4. Add optional **"Commit Message"** (e.g., "Fixed bug", "Added feature")
5. Click **"Update Script"** → **New Version created** ✅

### Viewing History
1. Click a script you own
2. Click **"History"** button
3. See all versions with:
   - Version number
   - Commit message
   - Author name
   - Timestamp
4. Click any version to preview its code

### Reverting to Previous Version
1. Open **History** modal
2. Click the version to restore
3. Click **"Revert to This Version"**
4. Current version is automatically saved
5. Script is restored! ✅

---

## 📂 Project Structure

```
Scripthub/
├── server.js                 # Main backend server
├── package.json              # Dependencies
├── public/
│   └── index.html           # Complete frontend app
├── models/
│   ├── User.js              # User schema
│   ├── Script.js            # Script schema
│   └── ScriptVersion.js     # Version tracking ⭐ NEW
├── routes/
│   ├── auth.js              # Authentication endpoints
│   └── scripts.js           # Script CRUD + Versions ⭐ UPDATED
├── middleware/
│   └── auth.js              # JWT authentication
└── VERSION_CONTROL_FEATURE.md  # Full documentation
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update bio
- `PUT /api/auth/change-password` - Change password

### Scripts (CRUD)
- `GET /api/scripts` - My scripts
- `GET /api/scripts/public` - Public scripts
- `GET /api/scripts/stats` - User statistics
- `GET /api/scripts/:id` - View script
- `POST /api/scripts` - Create script
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script

### Version Control ⭐ NEW
- `GET /api/scripts/:id/versions` - Get all versions
- `GET /api/scripts/:id/versions/:versionNumber` - View specific version
- `POST /api/scripts/:id/revert/:versionNumber` - Restore version

---

## 🎯 Testing the Version Control

### Quick Test Flow
1. **Register** → New account
2. **Create** → New script with code
3. **Edit** → Change code, add commit message
4. **Edit Again** → Make more changes
5. **Open History** → See all versions
6. **Click Version 1** → Preview original code
7. **Revert** → Go back to version 1
8. **Confirm** → Version 4 created tracking the revert

---

## ⚡ Key Features

| Feature | Status | Details |
|---------|--------|---------|
| User Authentication | ✅ Working | JWT tokens, password hashing |
| Script CRUD | ✅ Working | Create, read, update, delete |
| Version Tracking | ✅ Working | Auto-save on every code change |
| Version History | ✅ Working | View all versions with timestamps |
| Revert Capability | ✅ Working | One-click restoration |
| Commit Messages | ✅ Working | Describe each change |
| Public/Private | ✅ Working | Share scripts or keep private |
| Search & Filter | ✅ Working | Find scripts by name/language |
| Syntax Highlighting | ✅ Working | 12 supported languages |

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB connection error: connect ECONNREFUSED
```
**Solution:**
1. Install MongoDB Community Edition
2. Create data directory: `C:\data\db`
3. Start MongoDB: `mongod --dbpath C:\data\db`
4. Restart the backend server

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```powershell
# Kill existing Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
# Restart backend
npm start
```

### Frontend Not Loading
```
GET http://localhost:3000/ - net::ERR_CONNECTION_REFUSED
```
**Solution:**
```powershell
# Frontend server not running, start it:
npx http-server -p 3000 -c-1
```

---

## 📚 Files Modified/Created

### New Files
- ✅ `models/ScriptVersion.js` - Version storage model
- ✅ `VERSION_CONTROL_FEATURE.md` - Feature documentation

### Modified Files
- ✅ `server.js` - Added retry logic and demo mode
- ✅ `routes/scripts.js` - Added 4 version control endpoints
- ✅ `public/index.html` - Added version history UI

---

## 💡 Next Steps (Optional Enhancements)

1. **Diff View** - Side-by-side version comparison
2. **Version Labels** - Mark versions as "stable", "beta", etc.
3. **Branching** - Create alternate code branches
4. **Collaborative Editing** - Multiple users editing together
5. **Time Travel** - View code at any point in time
6. **Export Versions** - Download as ZIP/archive

---

## 🎓 How Version Control Works

```
User edits code
       ↓
Code changed? ─── NO ──→ Update metadata only
       │
      YES
       ↓
Save current code as Version N
       ↓
Increment version number
       ↓
Update main script with new code
       ↓
✅ New version created!

User clicks History
       ↓
See all versions with timestamps
       ↓
Click to preview any version
       ↓
Click "Revert" to restore
       ↓
Current code saved as new version
       ↓
Old version restored
       ↓
✅ Revert complete!
```

---

## 📞 Support

For issues or questions:
1. Check the `VERSION_CONTROL_FEATURE.md` documentation
2. Review the terminal output for error messages
3. Ensure MongoDB is running (if not in demo mode)
4. Restart both frontend and backend servers

---

**ScriptHub is now ready to run! 🎉**

Start with: `npm start` in the backend directory
Then open: `http://localhost:3000` in your browser
