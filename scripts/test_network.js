// scripts/test_network.js
// Run with: node scripts/test_network.js
// Tests if your phone can reach the backend

const axios = require('axios');

const API_URL = 'http://10.0.0.229:8001';

async function testConnection() {
    console.log('Testing network connection...');
    console.log('========================================');
    console.log('Testing: ' + API_URL);
    console.log('');

    try {
        console.log('Testing /health endpoint...');
        const response = await axios.get(API_URL + '/health', { timeout: 5000 });
        console.log('SUCCESS! Connection working!');
        console.log('   Status: ' + response.data.status);
        console.log('   OCR: ' + response.data.ocr);
        console.log('');
        console.log('Your app can now connect to:');
        console.log('   ' + API_URL);
        console.log('');
        console.log('Now test with a real receipt!');
    } catch (error) {
        console.error('FAILED to connect!');
        console.error('   Error: ' + error.message);
        console.log('');
        console.log('Troubleshooting:');
        console.log('  1. Make sure the backend is running:');
        console.log('     cd C:\\ReadReceipts');
        console.log('     python main.py');
        console.log('');
        console.log('  2. Check Windows Firewall:');
        console.log('     - Open Windows Security');
        console.log('     - Go to Firewall & Network Protection');
        console.log('     - Click "Allow an app through firewall"');
        console.log('     - Add Python (python.exe)');
        console.log('');
        console.log('  3. Make sure your phone and computer are on the same WiFi');
        console.log('');
        console.log('  4. Try this IP in your browser: ' + API_URL + '/health');
    }
}

testConnection();

