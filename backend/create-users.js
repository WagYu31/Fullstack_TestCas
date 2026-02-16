const bcrypt = require('bcrypt');

async function createUsers() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    console.log('='.repeat(80));
    console.log('COPY SQL COMMAND INI KE PHPMYADMIN:');
    console.log('='.repeat(80));
    console.log('');
    console.log('USE dms_db;');
    console.log('DELETE FROM users;');
    console.log('');
    console.log(`INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES (UUID(), 'Admin Cybermax', 'admin@cybermax.com', '${hash}', 'ADMIN', NOW(), NOW());`);
    console.log('');
    console.log(`INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES (UUID(), 'Wahyu Wutomo', 'user@cybermax.com', '${hash}', 'USER', NOW(), NOW());`);
    console.log('');
    console.log('='.repeat(80));
    console.log('AKUN LOGIN:');
    console.log('='.repeat(80));
    console.log('Admin: admin@cybermax.com / admin123');
    console.log('User:  user@cybermax.com / admin123');
    console.log('='.repeat(80));
}

createUsers();
