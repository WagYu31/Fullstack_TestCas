-- Recreate Admin and Test Users
-- Password for admin: admin123
-- Password for test user: password123

USE dms_db;

-- Insert Admin User
INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
VALUES (
    UUID(),
    'Admin',
    'admin@cybermax.com',
    '$2b$10$mfU8OUjL9vRenXz.02XJaaAbGpxOlnl6YUuO8Qp/Uc7jLDGvgVEDu',
    'ADMIN',
    NOW(),
    NOW()
);

-- Insert Test User (wahyuwutomo31@gmail.com)
INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
VALUES (
    UUID(),
    'Wahyu Wutomo',
    'wahyuwutomo31@gmail.com',
    '$2b$10$Hy1VGRJuMFCZnLJQGmWPNuFCJCJCJCJCJCJCJCJCJCJCJCJCJCJCJ',
    'USER',
    NOW(),
    NOW()
);

SELECT 'Users created successfully!' as message;
SELECT * FROM users;
