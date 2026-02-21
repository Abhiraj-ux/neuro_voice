// gen-certs.js — generates self-signed localhost + LAN cert using Node's built-in crypto
// Run once: node gen-certs.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir);

const keyPath = path.join(certsDir, 'key.pem');
const certPath = path.join(certsDir, 'cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('✅ Certs already exist at certs/key.pem and certs/cert.pem');
    process.exit(0);
}

// Use openssl if available (comes with Git for Windows / WSL)
try {
    execSync(
        `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes ` +
        `-subj "/CN=localhost" ` +
        `-addext "subjectAltName=IP:127.0.0.1,IP:10.38.10.7,IP:192.168.1.1,IP:192.168.56.1,DNS:localhost"`,
        { stdio: 'inherit' }
    );
    console.log('\n✅ Certificates generated:');
    console.log('   certs/key.pem');
    console.log('   certs/cert.pem');
} catch (e) {
    // openssl not found — use Node crypto (needs node 15+)
    console.log('openssl not found, using node:crypto fallback...');
    const { generateKeyPairSync, createSign } = require('crypto');
    console.error('Please install openssl (comes with Git for Windows).');
    console.error('Download: https://git-scm.com/download/win');
    process.exit(1);
}
