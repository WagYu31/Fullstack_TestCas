const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixLogin() {
    console.log('Connecting to MySQL...');

    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'dms_db',
    });

    console.log('Connected! Generating password hashes...');

    // Generate REAL bcrypt hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('password123', 10);

    console.log('Admin hash:', adminHash);
    console.log('Admin hash length:', adminHash.length);
    console.log('User hash:', userHash);
    console.log('User hash length:', userHash.length);

    // Verify hashes work BEFORE inserting
    const adminVerify = await bcrypt.compare('admin123', adminHash);
    const userVerify = await bcrypt.compare('password123', userHash);
    console.log('Admin hash verification:', adminVerify);
    console.log('User hash verification:', userVerify);

    if (!adminVerify || !userVerify) {
        console.error('HASH VERIFICATION FAILED! Aborting.');
        await connection.end();
        return;
    }

    // Delete old users
    console.log('\nDeleting old users...');
    await connection.execute('DELETE FROM edit_permission_requests');
    await connection.execute('DELETE FROM permission_requests');
    await connection.execute('DELETE FROM notifications');
    await connection.execute('DELETE FROM documents');
    await connection.execute('DELETE FROM users');
    console.log('Old data deleted.');

    // Insert admin
    console.log('Creating admin user...');
    await connection.execute(
        `INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) 
         VALUES (UUID(), ?, ?, ?, 'ADMIN', NOW(), NOW())`,
        ['Admin Cybermax', 'admin@cybermax.com', adminHash]
    );

    // Insert user
    console.log('Creating regular user...');
    await connection.execute(
        `INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) 
         VALUES (UUID(), ?, ?, ?, 'USER', NOW(), NOW())`,
        ['Wahyu Wutomo', 'user@cybermax.com', userHash]
    );

    // Verify users were created
    const [rows] = await connection.execute('SELECT id, name, email, role, LENGTH(password) as pwd_len FROM users');
    console.log('\n=== USERS CREATED ===');
    rows.forEach(row => {
        console.log(`${row.role}: ${row.email} (password length: ${row.pwd_len})`);
    });

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: admin@cybermax.com / admin123');
    console.log('User:  user@cybermax.com / password123');
    console.log('========================\n');

    await connection.end();
    console.log('Done! You can now login.');
}

fixLogin().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
