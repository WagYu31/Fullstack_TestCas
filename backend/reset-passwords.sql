-- Reset password untuk semua user menjadi: password123
USE dms_db;

-- Update password untuk user wahyuwutomo31@gmail.com
UPDATE users 
SET password = '$2b$10$auWbs3G/mjWHX8HRg3B48QMuXwaE2GtBmrMLZpmNEl.OIOIPW/Q'
WHERE email = 'wahyuwutomo31@gmail.com';

-- Update password untuk user engiter889@gmail.com (Admin)
UPDATE users 
SET password = '$2b$10$auWbs3G/mjWHX8HRg3B48QMuXwaE2GtBmrMLZpmNEl.OIOIPW/Q'
WHERE email = 'engiter889@gmail.com';

SELECT 'Passwords updated successfully! All users can now login with password: password123' as message;
SELECT id, name, email, role FROM users;
