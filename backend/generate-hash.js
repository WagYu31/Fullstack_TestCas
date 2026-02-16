const bcrypt = require('bcrypt');

async function generateHash() {
    // Generate hash for password123
    const hash = await bcrypt.hash('password123', 10);

    console.log('='.repeat(80));
    console.log('PASSWORD HASH FOR: password123');
    console.log('='.repeat(80));
    console.log(hash);
    console.log('='.repeat(80));
    console.log('');
    console.log('SQL UPDATE COMMANDS:');
    console.log('='.repeat(80));
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'wahyuwutomo31@gmail.com';`);
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'engiter889@gmail.com';`);
    console.log('='.repeat(80));
}

generateHash();
