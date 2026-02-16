-- RESET SEMUA USER DAN BUAT AKUN BARU
-- Hapus semua user lama
USE dms_db;

DELETE FROM users;

-- Buat Admin baru
INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
VALUES (
    UUID(),
    'Admin Cybermax',
    'admin@cybermax.com',
    '$2b$10$vI5kN5xZ5xZ5xZ5xZ5xZ5eMKJ.vI5kN5xZ5xZ5xZ5xZ5xZ5xZ5xZ5xZ5',
    'ADMIN',
    NOW(),
    NOW()
);

-- Buat User biasa
INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
VALUES (
    UUID(),
    'Wahyu Wutomo',
    'user@cybermax.com',
    '$2b$10$vI5kN5xZ5xZ5xZ5xZ5xZ5eMKJ.vI5kN5xZ5xZ5xZ5xZ5xZ5xZ5xZ5xZ5',
    'USER',
    NOW(),
    NOW()
);

SELECT 'Users created successfully!' as Status;
SELECT id, name, email, role FROM users;
