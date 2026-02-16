const mysql = require('mysql2/promise');

async function fixOwnership() {
    const c = await mysql.createConnection({
        host: 'localhost', port: 3306, user: 'root', password: '', database: 'dms_db'
    });

    // Get admin user ID
    const [users] = await c.execute('SELECT id, email, role FROM users');
    console.log('Users:');
    users.forEach(u => console.log(`  ${u.role}: ${u.email} (${u.id})`));

    const adminUser = users.find(u => u.role === 'ADMIN');
    if (!adminUser) {
        console.log('No admin user found!');
        await c.end();
        return;
    }

    console.log('\nAdmin ID:', adminUser.id);

    // Get documents
    const [cols] = await c.execute('SHOW COLUMNS FROM documents');
    const userCol = cols.find(c => c.Field.toLowerCase().includes('upload') || c.Field.toLowerCase().includes('user'));
    console.log('User column in documents:', userCol ? userCol.Field : 'NOT FOUND');
    console.log('All columns:', cols.map(c => c.Field).join(', '));

    // Update all documents to belong to admin
    if (userCol) {
        const result = await c.execute(`UPDATE documents SET ${userCol.Field} = ? WHERE 1=1`, [adminUser.id]);
        console.log('\nUpdated documents ownership to admin:', result[0].affectedRows, 'rows');
    }

    // Verify
    const [docs] = await c.execute('SELECT id, title FROM documents');
    console.log('\nDocuments:');
    docs.forEach(d => console.log(`  ${d.title} (${d.id})`));

    await c.end();
    console.log('\nDone! Documents now belong to admin user.');
}

fixOwnership().catch(err => console.error('Error:', err.message));
