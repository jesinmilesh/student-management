# 🎓 Project 2 — Student Management System

A full-stack Student Management System with student CRUD, search, department filtering, and role-based admin controls.

## 📁 Folder Structure
```text
2-student-management/
├── backend/
│   ├── config/db.js
│   ├── models/User.js
│   ├── models/Student.js
│   ├── controllers/authController.js
│   ├── controllers/studentController.js
│   ├── routes/authRoutes.js
│   ├── routes/studentRoutes.js
│   ├── middleware/auth.js
│   ├── seed.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── index.html
    ├── styles.css
    └── app.js
```

## 🚀 How to Run
1. Navigate into `backend/`:
   ```bash
   cd backend
   node seed.js    # Seed sample students & accounts
   node server.js  # Starts server on http://localhost:5000
   ```
2. Open **`http://localhost:5000`** in your browser!

## 🔑 Login Accounts
- **Admin**: `admin@example.com` / `admin123` (Full Add, Edit, Delete access)
- **User**: `user@example.com` / `user123` (Read-only search & filter)
