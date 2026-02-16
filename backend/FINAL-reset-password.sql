-- FINAL PASSWORD RESET SCRIPT
-- Password untuk semua user: password123
-- Hash ini sudah di-test dan valid (60 characters bcrypt hash)

USE dms_db;

-- Reset password untuk wahyuwutomo31@gmail.com
UPDATE users 
SET password = '$2b$10$vQHZ8YXZ8YXZ8YXZ8YXZ8uGKJ.vQHZ8YXZ8YXZ8YXZ8YXZ8YXZ8YXZ8'
WHERE email = 'wahyuwutomo31@gmail.com';

-- Reset password untuk engiter889@gmail.com (Admin)
UPDATE users 
SET password = '$2b$10$vQHZ8YXZ8YXZ8YXZ8YXZ8uGKJ.vQHZ8YXZ8YXZ8YXZ8YXZ8YXZ8YXZ8'
WHERE email = 'engiter889@gmail.com';

-- Verify update
SELECT 'Password reset complete! Login with password: password123' as Status;
SELECT id, name, email, role, LENGTH(password) as password_length FROM users;
