const bcrypt = require('bcrypt');

async function testHash() {
    const password = 'password123';

    // Hash dari database untuk wahyuwutomo31@gmail.com
    const hash1 = '$2b$10$k8OuXwaE2GtBmrMLZpmNEl.OIOIPW/Q';

    // Generate fresh hash
    const freshHash = await bcrypt.hash(password, 10);

    console.log('Testing password: password123');
    console.log('');
    console.log('Hash from DB:', hash1);
    console.log('Hash length:', hash1.length);
    console.log('');
    console.log('Fresh hash:', freshHash);
    console.log('Fresh hash length:', freshHash.length);
    console.log('');
    console.log('Valid bcrypt hash should be 60 characters');
    console.log('');
    console.log('='.repeat(80));
    console.log('COPY THIS COMPLETE HASH:');
    console.log('='.repeat(80));
    console.log(freshHash);
    console.log('='.repeat(80));
}

testHash();
