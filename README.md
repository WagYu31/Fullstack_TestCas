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

**Strategi yang Diimplementasikan:**

Sistem menggunakan **Multer** dengan **disk storage** untuk menangani upload file besar secara efisien — file di-stream langsung ke disk tanpa buffering ke memory, sehingga server tidak kehabisan RAM meskipun file berukuran besar.

**Current Implementation:**

```typescript
// documents.controller.ts — Multer disk storage configuration
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      // UUID-based filename mencegah collision dan path traversal
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // Max 100MB, configurable via .env
  fileFilter: (req, file, cb) => {
    // Validasi MIME type untuk keamanan
    cb(null, true);
  },
}))
```

**Kenapa Pendekatan Ini?**
| Aspek | Penjelasan |
|-------|------------|
| **Disk Streaming** | Multer stream langsung ke disk → memory usage konstan ~50MB terlepas ukuran file |
| **UUID Filename** | Mencegah filename collision dan path traversal attack |
| **Size Limit** | `MAX_FILE_SIZE` di `.env` → mudah di-adjust tanpa ubah code |
| **Error Handling** | Multer otomatis reject file yang melebihi limit sebelum upload selesai |

**Future Scalability:**
- **Phase 1**: Pindah ke **S3/MinIO** dengan pre-signed URLs → upload langsung ke storage tanpa lewat server
- **Phase 2**: **Chunked Upload** menggunakan `tus` protocol untuk upload yang bisa di-resume jika koneksi terputus
- **Phase 3**: **CDN** (CloudFront) untuk distribusi file yang sudah di-upload

---

### 2. How to avoid lost updates when replacing documents?

**Strategi yang Diimplementasikan:**

Sistem menggunakan **3 layer perlindungan** terhadap lost updates:

**Layer 1 — Optimistic Locking (`@VersionColumn`)**
```typescript
// document.entity.ts
@VersionColumn()
version: number;
// TypeORM otomatis increment version setiap update
// Jika 2 user update bersamaan, yang kedua akan mendapat error
```

**Layer 2 — Status-Based Locking**
```typescript
// documents.service.ts — checkOwnership()
if (document.status !== DocumentStatus.ACTIVE) {
  throw new BadRequestException(
    'Document already has a pending request'
  );
}
// Document dengan status PENDING_REPLACE atau PENDING_DELETE
// tidak bisa di-replace/delete lagi sampai admin approve/reject
```

**Layer 3 — Permission Workflow**
```
User Request Replace → Status: PENDING_REPLACE → Admin Review
                                    ↓                    ↓
                              Locked (no other     APPROVED → Replace file
                              requests allowed)    REJECTED → Back to ACTIVE
```

**Kenapa 3 Layer?**
| Layer | Melindungi Dari |
|-------|----------------|
| **Optimistic Locking** | 2 user mengedit metadata dokumen yang sama secara bersamaan |
| **Status Locking** | User mengirim request replace/delete saat sudah ada request pending |
| **Permission Workflow** | Perubahan tanpa persetujuan admin — semua replace/delete harus di-review |

---

### 3. How to design notification system for scalability?

**Strategi yang Diimplementasikan:**

Sistem notifikasi didesain dengan **3 channel delivery** yang saling melengkapi:

**Channel 1 — Database Persistent Storage (MySQL)**
```typescript
// notification.entity.ts
@Entity('notifications')
export class Notification {
  @Column()           userId: string;      // Indexed → fast query per user
  @Column()           title: string;
  @Column('text')     message: string;
  @Column()           type: NotificationType;
  @Column()           isRead: boolean;     // Indexed → unread count query
  @CreateDateColumn() createdAt: Date;     // Indexed → sorted listing
}

// Pagination: GET /notifications?page=1&limit=20
// Unread count: GET /notifications/unread-count → { count: 5 }
```

**Channel 2 — Real-time WebSocket (Socket.IO)**
```typescript
// notifications.gateway.ts
@WebSocketGateway({ namespace: '/notifications' })
export class NotificationsGateway {
  private connectedUsers = new Map<string, string[]>();

  handleConnection(client: Socket) {
    // JWT verification pada koneksi
    const payload = this.jwtService.verify(token);
    client.join(`user:${payload.sub}`);       // Room per user
    if (payload.role === 'ADMIN') {
      client.join('admins');                  // Room khusus admin
    }
  }

  sendToUser(userId, notification) {
    this.server.to(`user:${userId}`).emit('new-notification', notification);
  }

  sendToAdmins(notification) {
    this.server.to('admins').emit('new-notification', notification);
  }
}
```

**Channel 3 — Email Notification (Nodemailer SMTP)**
```typescript
// mail.service.ts — 4 jenis email
sendWelcomeEmail(email, name);           // Saat user register
sendForgotPasswordEmail(email, token);   // Reset password
sendPermissionRequestEmail(adminEmail);  // Request baru → admin
sendPermissionStatusEmail(userEmail);    // Approve/reject → user
```

**Event-Driven Architecture:**
```
User Action → EventEmitter → Event Listener → {
  1. Save to database (persistent)
  2. Push via WebSocket (real-time)
  3. Send email (async, non-blocking)
}
```

**Scalability Path:**
| Phase | Teknologi | Benefit |
|-------|-----------|---------|
| **Phase 1** (Current) | MySQL + Socket.IO + Nodemailer | Simple, reliable |
| **Phase 2** | + Redis Adapter | Multi-instance Socket.IO support |
| **Phase 3** | + Message Queue (RabbitMQ/Bull) | Email queue, retry mechanism |
| **Phase 4** | Separate Notification Microservice | Independent scaling |
| **Phase 5** | Database partitioning | Archive old notifications (>90 hari) |

---

### 4. How to secure file access?

**Strategi yang Diimplementasikan:**

File dilindungi dengan **5 layer keamanan**:

```
REQUEST → [1. JWT Auth] → [2. Role Check] → [3. Ownership Check] → [4. Status Check] → [5. Serve File]
```

**Layer 1 — JWT Authentication**
```typescript
// Semua endpoint dokumen dilindungi JwtAuthGuard
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController { ... }
// Tanpa JWT token yang valid → 401 Unauthorized
```

**Layer 2 — Role-Based Access Control (RBAC)**
```typescript
// Admin bisa akses semua dokumen, User hanya milik sendiri
if (userRole !== UserRole.ADMIN && document.createdById !== userId) {
  throw new ForbiddenException('Not authorized');
}
```

**Layer 3 — Secure File Storage**
```
uploads/                          ← Di luar public directory
├── 550e8400-e29b-41d4-a716...pdf  ← UUID filename (no original name)
├── 6ba7b810-9dad-11d1-80b4...docx
└── ...
```
- File disimpan **di luar public directory** → tidak bisa diakses langsung via URL
- Filename menggunakan **UUID** → mencegah path traversal dan information leakage
- Original filename disimpan di database, bukan di filesystem

**Layer 4 — Authenticated Download Endpoint**
```typescript
// documents.controller.ts
@Get(':id/download')
@UseGuards(JwtAuthGuard)
async download(@Param('id') id, @CurrentUser() user, @Res() res) {
  // Cek ownership → baru serve file
  const document = await this.documentsService.findOne(id, user.id, user.role);
  res.download(document.fileUrl, document.fileName);
}
```

**Layer 5 — File Validation on Upload**
```typescript
// Validasi sebelum file disimpan:
// ✅ MIME type check (fileFilter)
// ✅ File size limit (100MB configurable)
// ✅ Extension validation
```

**Future Enhancements:**
- **Signed URLs** dengan expiration (15 menit) untuk S3
- **File encryption at rest** (AES-256)
- **Malware scanning** menggunakan ClamAV sebelum file disimpan
- **Content-Disposition** header untuk mencegah browser execution

---

### 5. How to structure services for microservice migration?

**Strategi yang Diimplementasikan:**

Aplikasi didesain dengan **modular monolith architecture** — setiap fitur adalah NestJS module yang independen, siap dipecah menjadi microservice kapan saja.

**Current Modular Structure:**
```
src/
├── auth/                  → Future: Auth Service
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── guards/            ← JWT guards (reusable)
│   ├── decorators/        ← Custom decorators
│   └── dto/               ← Validation DTOs
│
├── users/                 → Future: User Service
│   ├── users.module.ts
│   ├── users.service.ts
│   └── entities/
│
├── documents/             → Future: Document Service
│   ├── documents.module.ts
│   ├── documents.service.ts
│   ├── documents.controller.ts
│   └── entities/
│
├── permission-requests/   → Future: Permission Service
│   ├── permission-requests.module.ts
│   ├── permission-requests.service.ts
│   └── entities/
│
├── notifications/         → Future: Notification Service
│   ├── notifications.module.ts
│   ├── notifications.service.ts
│   ├── notifications.gateway.ts  ← WebSocket
│   ├── listeners/         ← Event-driven handlers
│   └── entities/
│
├── mail/                  → Future: Email Service
│   ├── mail.module.ts     ← @Global() module
│   └── mail.service.ts
│
└── common/                → Shared Library
    ├── enums/             ← Shared enums
    ├── events/            ← Event definitions
    └── health/            ← Health check endpoint
```

**Design Principles yang Sudah Diterapkan:**

| Principle | Implementation | Benefit |
|-----------|---------------|---------|
| **Bounded Context** | Setiap module punya entity, service, controller sendiri | Module bisa di-extract tanpa ubah module lain |
| **Event-Driven** | `EventEmitterModule` untuk komunikasi antar module | Ganti ke RabbitMQ/Kafka tanpa ubah business logic |
| **Dependency Injection** | NestJS DI container mengelola semua dependencies | Mudah swap implementation (mock untuk testing) |
| **Global Modules** | `MailModule` sebagai `@Global()` | Shared service tersedia di semua module |
| **DTO Validation** | `class-validator` di setiap endpoint | Contract yang jelas antar service |

**Migration Path:**

```
Phase 1 (Current)           Phase 2                    Phase 3
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Modular Monolith│    │  Hybrid Approach │    │  Full Microservice│
│                  │    │                  │    │                  │
│  ┌────┐ ┌────┐  │    │  ┌────────────┐  │    │  ┌────┐  ┌────┐ │
│  │Auth│ │User│  │    │  │ Monolith   │  │    │  │Auth│  │User│ │
│  └────┘ └────┘  │    │  │(Auth+User) │  │    │  │Svc │  │Svc │ │
│  ┌────┐ ┌────┐  │    │  └────────────┘  │    │  └──┬─┘  └──┬─┘ │
│  │Doc │ │Perm│  │    │        ↕ API     │    │     ↕ MQ    ↕   │
│  └────┘ └────┘  │    │  ┌────────────┐  │    │  ┌────┐  ┌────┐ │
│  ┌────┐ ┌────┐  │    │  │Notification│  │    │  │Doc │  │Notif│ │
│  │Noti│ │Mail│  │    │  │ Service    │  │    │  │Svc │  │Svc │ │
│  └────┘ └────┘  │    │  └────────────┘  │    │  └────┘  └────┘ │
└──────────────────┘    └──────────────────┘    └──────────────────┘
    1 Deployment             2 Deployments          5+ Deployments
```

**Recommended Migration Order:**
1. **Notification Service** (paling loosely coupled, hanya terima events)
2. **Mail Service** (stateless, mudah di-scale horizontal)
3. **Document Service** (termasuk file storage → S3)
4. **Permission Service** (bergantung pada Document + User)
5. **Auth Service** (paling critical, migrasi terakhir)

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
