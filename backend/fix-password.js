const bcrypt = require('bcrypt');

async function main() {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);

    console.log('Generated hash for password: password123');
    console.log('');
    console.log('Hash:');
    console.log(hash);
    console.log('');
    console.log('SQL Commands:');
    console.log('');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'wahyuwutomo31@gmail.com';`);
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'engiter889@gmail.com';`);
    console.log('');
    console.log('After running SQL, login with password: password123');
}

main();
