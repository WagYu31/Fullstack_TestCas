# Document Management System (DMS)

> **Senior Fullstack Developer Technical Test Case**  
> A comprehensive fullstack platform for document management with authentication, permission workflows, and notifications.

## 🚀 Features

### Core Functionality
- ✅ **User Authentication** - JWT-based registration and login with role-based access control (USER, ADMIN)
- ✅ **Document Management** - Upload, view, search, filter, and download documents
- ✅ **Permission Workflow** - Request-based system for document replacement and deletion
- ✅ **Notification System** - Real-time notifications for permission requests and approvals
- ✅ **Pagination & Search** - Efficient document listing with search and filtering
- ✅ **File Security** - Ownership-based access control and secure file storage

### Technical Highlights
- 🔐 **JWT Authentication** with bcrypt password hashing
- 🔒 **Role-Based Access Control** (RBAC) with guards and decorators
- 📝 **Optimistic Locking** using version field to prevent concurrent updates
- 🔄 **Transaction Safety** for permission approval/rejection workflows
- 📊 **Indexed Database** queries for optimal performance
- 🎨 **Modern UI** with shadcn/ui components and TailwindCSS
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

---

## 📋 System Architecture

### Backend Stack
- **Framework**: NestJS (TypeScript)
- **Database**: MySQL dengan TypeORM
- **Authentication**: Passport JWT
- **Real-time**: Socket.IO (WebSocket)
- **Email**: Nodemailer (SMTP)
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Joy UI (MUI)
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

### Database Schema

```
users
├── id (UUID, PK)
├── email (unique, indexed)
├── password (hashed)
├── name
├── role (USER | ADMIN)
├── createdAt
└── updatedAt

documents
├── id (UUID, PK)
├── title (indexed)
├── description
├── documentType (indexed)
├── fileUrl
├── fileName
├── fileSize
├── mimeType
├── version (for optimistic locking)
├── status (ACTIVE | PENDING_DELETE | PENDING_REPLACE)
├── createdById (FK → users)
├── createdAt
└── updatedAt

permission_requests
├── id (UUID, PK)
├── documentId (FK → documents)
├── requestedById (FK → users)
├── requestType (REPLACE | DELETE)
├── reason
├── status (PENDING | APPROVED | REJECTED)
├── reviewedById (FK → users, nullable)
├── reviewedAt (nullable)
├── newFileUrl (for replace requests)
├── newFileName
├── newFileSize
├── newMimeType
├── createdAt
└── updatedAt

notifications
├── id (UUID, PK)
├── userId (FK → users, indexed)
├── title
├── message
├── type (PERMISSION_REQUEST | PERMISSION_APPROVED | PERMISSION_REJECTED)
├── relatedEntityId (UUID, nullable)
├── isRead (boolean, indexed)
└── createdAt (indexed)
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 18+ dan npm ([download](https://nodejs.org/))
- **MySQL** 5.7+ (bisa pakai [Laragon](https://laragon.org/), XAMPP, atau MySQL standalone)
- **Git** ([download](https://git-scm.com/))

### 1. Clone Repository

```bash
git clone https://github.com/WagYu31/Fullstack_TestCas.git
cd Fullstack_TestCas
```

### 2. Setup Database MySQL

Buat database baru di MySQL:

```sql
CREATE DATABASE dms_db;
```

Lalu import file SQL untuk membuat akun demo:

```bash
# Dari folder project
mysql -u root -p dms_db < backend/FINAL-create-users.sql
```

Atau buka file `backend/FINAL-create-users.sql` di **phpMyAdmin** / **HeidiSQL** / **MySQL Workbench** dan jalankan.

**Akun demo yang dibuat:**

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@cybermax.com | admin123 |
| **User** | user@cybermax.com | admin123 |

> 📝 **Catatan**: Jika ingin reset password semua user, jalankan file `backend/FINAL-reset-password.sql`.

### 3. Konfigurasi Environment (`.env`)

File `.env` sudah disediakan di `backend/.env`. Sesuaikan jika perlu:

```env
# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root        # sesuaikan dengan user MySQL kamu
DB_PASSWORD=            # kosong jika pakai Laragon/XAMPP default
DB_DATABASE=dms_db

# JWT Configuration
JWT_SECRET=dms-secret-key-2026-fullstack-test-case-super-secure
JWT_EXPIRES_IN=7d

# Application
PORT=3001
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=104857600   # 100MB
UPLOAD_DEST=./uploads

# CORS
FRONTEND_URL=http://localhost:3000

# SMTP Email (opsional, untuk fitur email notification)
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
SMTP_FROM="Cybermax DMS" <noreply@yourdomain.com>
```

| Variable | Deskripsi | Wajib? |
|----------|-----------|--------|
| `DB_HOST` | Host MySQL (biasanya `localhost`) | ✅ Ya |
| `DB_PORT` | Port MySQL (default `3306`) | ✅ Ya |
| `DB_USERNAME` | Username MySQL | ✅ Ya |
| `DB_PASSWORD` | Password MySQL (kosong = tanpa password) | ✅ Ya |
| `DB_DATABASE` | Nama database (`dms_db`) | ✅ Ya |
| `JWT_SECRET` | Secret key untuk JWT token | ✅ Ya |
| `SMTP_HOST` | Host email server | ❌ Opsional |
| `SMTP_USER` | Email pengirim | ❌ Opsional |
| `SMTP_PASS` | Password email | ❌ Opsional |

> ⚠️ **SMTP bersifat opsional** — aplikasi tetap berjalan tanpa konfigurasi email. Fitur forgot password dan email notifikasi hanya aktif jika SMTP dikonfigurasi.

### 4. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start backend server (development mode)
npm run start:dev
```

Backend akan berjalan di **http://localhost:3001**

> Tabel database akan otomatis dibuat oleh TypeORM (`synchronize: true`).

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend akan berjalan di **http://localhost:3000**

### 6. Login ke Aplikasi

Buka **http://localhost:3000/login** dan gunakan akun demo:

- **Admin**: `admin@cybermax.com` / `admin123`
- **User**: `user@cybermax.com` / `admin123`

Atau register akun baru di **http://localhost:3000/register** (user pertama otomatis menjadi Admin).

### 📁 Daftar File SQL

| File | Fungsi |
|------|--------|
| `backend/FINAL-create-users.sql` | Buat akun Admin + User demo |
| `backend/FINAL-reset-password.sql` | Reset semua password ke default |
| `backend/create-new-users.sql` | Script alternatif buat user |
| `backend/recreate-users.sql` | Hapus dan buat ulang semua user |
| `backend/reset-passwords.sql` | Script alternatif reset password |

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Document Endpoints

#### Upload Document
```http
POST /documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
title: "Project Proposal"
description: "Q1 2026 Project Proposal"
documentType: "PDF"
```

#### List Documents
```http
GET /documents?page=1&limit=10&search=proposal&documentType=PDF&status=ACTIVE
Authorization: Bearer <token>

Response:
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Get Document Detail
```http
GET /documents/:id
Authorization: Bearer <token>
```

#### Download Document
```http
GET /documents/:id/download
Authorization: Bearer <token>
```

#### Request Document Replacement
```http
POST /documents/:id/replace
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
reason: "Updated version with corrections"
```

#### Request Document Deletion
```http
DELETE /documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "No longer needed"
}
```

### Permission Endpoints (Admin Only)

#### List Permission Requests
```http
GET /permissions
Authorization: Bearer <admin-token>
```

#### Approve Permission
```http
POST /permissions/:id/approve
Authorization: Bearer <admin-token>
```

#### Reject Permission
```http
POST /permissions/:id/reject
Authorization: Bearer <admin-token>
```

### Notification Endpoints

#### List Notifications
```http
GET /notifications?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>

Response:
{
  "count": 5
}
```

#### Mark as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

---

## 🎯 System Design Answers

### 1. How to handle large file uploads?

**Implementation:**
- **Chunked Upload**: Frontend slices files into 5MB chunks
- **Streaming**: Multer streams directly to disk (no memory buffering)
- **Progress Tracking**: Real-time upload progress via WebSocket
- **Resumable**: Using `tus` protocol for interrupted uploads
- **Limits**: Max 100MB per file, configurable in `.env`
- **Storage**: Local filesystem for development, S3/MinIO for production

**Code Example:**
```typescript
// Backend - multer configuration
FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
})
```

### 2. How to avoid lost updates when replacing documents?

**Implementation:**
- **Optimistic Locking**: `@VersionColumn()` in Document entity
- **Status-Based Locking**: Documents in `PENDING_*` status reject concurrent requests
- **Transaction Safety**: TypeORM transactions for atomic operations
- **Ownership Check**: Only document owner can request changes

**Code Example:**
```typescript
// Document entity with version control
@VersionColumn()
version: number;

// Check before allowing replace/delete
if (document.status !== DocumentStatus.ACTIVE) {
  throw new BadRequestException('Document already has a pending request');
}
```

### 3. How to design notification system for scalability?

**Current Implementation:**
- PostgreSQL storage with indexed queries
- Efficient pagination (limit 20 per page)
- Indexed fields: `userId`, `isRead`, `createdAt`

**Scalability Path:**
- **Phase 1** (Current): Database-based with polling
- **Phase 2**: Redis Pub/Sub for real-time delivery
- **Phase 3**: WebSocket server (Socket.IO) for push notifications
- **Phase 4**: Separate microservice with message queue (RabbitMQ)
- **Phase 5**: Database partitioning and archival (>90 days)

### 4. How to secure file access?

**Implementation:**
- **Authentication**: JWT required for all file operations
- **Authorization**: Ownership check - only owner or ADMIN can access
- **Secure Storage**: Files stored outside public directory
- **Download Endpoint**: Authenticated endpoint serves files
- **File Validation**: MIME type and size validation on upload
- **Path Sanitization**: UUID-based filenames prevent path traversal

**Future Enhancements:**
- Signed URLs with expiration (15 minutes)
- S3 pre-signed URLs for production
- File encryption at rest
- Malware scanning (ClamAV)

### 5. How to structure services for microservice migration?

**Current Structure:**
```
src/
├── auth/          → Future: Auth Service
├── users/         → Future: User Service  
├── documents/     → Future: Document Service
├── permissions/   → Future: Permission Service
├── notifications/ → Future: Notification Service
└── common/        → Shared library
```

**Migration Principles:**
1. **Bounded Contexts**: Each module owns its data
2. **No Direct DB Access**: Services communicate via APIs/events
3. **Event-Driven**: Event emitters now → Message queue later
4. **API Versioning**: All endpoints versioned (`/api/v1/...`)
5. **Database Per Service**: Each module has separate entities
6. **Shared Libraries**: Common code extracted to npm packages

**Migration Order:**
1. Extract Notification Service (least coupled)
2. Extract Document Service (with file storage)
3. Extract Permission Service
4. Extract Auth Service (most critical, do last)

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Document upload (various file types)
- [ ] Document list with pagination
- [ ] Search and filter documents
- [ ] Document download
- [ ] Replace request workflow
- [ ] Delete request workflow
- [ ] Admin approval/rejection
- [ ] Notification creation and display
- [ ] Mark notification as read
- [ ] Role-based access control
- [ ] Concurrent update prevention
- [ ] Responsive design on mobile

---

## 📦 Deployment

### Production Checklist

**Backend:**
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Set `synchronize: false` in TypeORM
- [ ] Run migrations instead of auto-sync
- [ ] Configure PostgreSQL connection pooling
- [ ] Set up file storage (S3/MinIO)
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up logging (Winston)
- [ ] Configure monitoring (PM2, New Relic)

**Frontend:**
- [ ] Build production bundle: `npm run build`
- [ ] Configure environment variables
- [ ] Enable CDN for static assets
- [ ] Configure image optimization
- [ ] Set up error tracking (Sentry)

**Database:**
- [ ] Create production database
- [ ] Run migrations
- [ ] Set up backups
- [ ] Configure replication (if needed)

---

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with shadcn/ui
- **Responsive Layout**: Mobile-first design, works on all devices
- **Loading States**: Skeleton loaders for better UX
- **Empty States**: Helpful messages when no data
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation with helpful hints
- **Confirmation Modals**: Prevent accidental actions
- **Notification Bell**: Unread count badge
- **Status Badges**: Color-coded document status indicators

---

## 📝 License

This project is created for technical assessment purposes.

---

## 👨‍💻 Developer

**Technical Test Case - Senior Fullstack Developer Position**

For questions or issues, please contact the development team.
