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
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport JWT
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: shadcn/ui + TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Validation**: React Hook Form + Zod

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
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd Fullstack_TestCase
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set your PostgreSQL credentials

# Create database
createdb dms_db

# Start backend server
npm run start:dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Create Admin User

Register a user through the UI, then manually update the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

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
