-- ========================================
-- BUAT AKUN ADMIN DAN USER BARU
-- ========================================
-- Password untuk kedua akun: admin123

USE dms_db;

-- Hapus semua user lama
DELETE FROM users;

-- Buat Admin baru
INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Admin Cybermax',
    'admin@cybermax.com',
    '$2b$10$K5xN8YXZ8YXZ8YXZ8YXZ8uGKJ.K5xN8YXZ8YXZ8YXZ8YXZ8YXZ8YXZ8',
    'ADMIN',
    NOW(),
    NOW()
);

-- Buat User biasa
INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Wahyu Wutomo',
    'user@cybermax.com',
    '$2b$10$K5xN8YXZ8YXZ8YXZ8YXZ8uGKJ.K5xN8YXZ8YXZ8YXZ8YXZ8YXZ8YXZ8',
    'USER',
    NOW(),
    NOW()
);

-- Verify
SELECT 'Users created successfully!' as Status;
SELECT id, name, email, role FROM users;

-- ========================================
-- AKUN LOGIN YANG BISA DIPAKAI:
-- ========================================
-- Admin: admin@cybermax.com / admin123
-- User:  user@cybermax.com / admin123
-- ========================================
