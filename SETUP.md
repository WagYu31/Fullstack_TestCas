# 🚀 Quick Start Guide - Document Management System

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+

## Setup (5 Minutes)

### 1. Start PostgreSQL
Make sure PostgreSQL is running on your system.

### 2. Create Database
```bash
createdb dms_db
```

Or using psql:
```sql
CREATE DATABASE dms_db;
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies (if not done)
npm install

# Configure database in .env file
# DB_PASSWORD should match your PostgreSQL password

# Start backend
npm run start:dev
```

✅ Backend running on `http://localhost:3001`

### 4. Frontend Setup
```bash
# Open new terminal
cd frontend

# Start frontend
npm run dev
```

✅ Frontend running on `http://localhost:3000`

## First Use

### 1. Register Account
- Open `http://localhost:3000`
- Click "Sign up"
- Fill in your details
- Click "Create Account"

### 2. Login
- Enter your email and password
- Click "Sign In"

### 3. Upload Document
- Click "Upload Document" button
- Fill in title, description, type
- Select a file
- Click "Upload"

### 4. Create Admin User (Optional)
To test admin features:

```sql
-- Connect to PostgreSQL
psql dms_db

-- Make your user an admin
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Then logout and login again to see Admin Panel.

## Testing Features

### As Regular User:
1. ✅ Upload documents
2. ✅ Search documents
3. ✅ Download documents
4. ✅ Request document deletion
5. ✅ View notifications

### As Admin:
1. ✅ View all pending requests
2. ✅ Approve/reject requests
3. ✅ See notifications

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database exists: `psql -l | grep dms_db`
- Check `.env` file has correct DB credentials

### Frontend won't start
- Run `npm install` in frontend folder
- Check port 3000 is not in use

### Can't login
- Check backend is running on port 3001
- Open browser console for error messages

### Database connection error
- Update `DB_PASSWORD` in `backend/.env`
- Ensure PostgreSQL is running

## API Testing (Optional)

Test backend directly:

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Project Structure

```
Fullstack_TestCase/
├── backend/          # NestJS API
│   ├── src/
│   ├── uploads/      # Uploaded files
│   └── .env          # Configuration
├── frontend/         # Next.js UI
│   └── app/
└── README.md         # Full documentation
```

## Next Steps

- Read `README.md` for complete API documentation
- Read `walkthrough.md` for implementation details
- Read `implementation_plan.md` for system design answers

---

**Need Help?** Check the comprehensive README.md file for detailed documentation.
