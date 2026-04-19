#!/usr/bin/env node
/**
 * Test GAD Upload Endpoint
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const testFile = fs.readFileSync(path.join(__dirname, 'test-db.js'));

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const body = [];

// Add form fields
body.push(`--${boundary}`);
body.push('Content-Disposition: form-data; name="document"; filename="test.pdf"');
body.push('Content-Type: application/pdf');
body.push('');
body.push(testFile.toString('binary'));
body.push(`--${boundary}--`);

const bodyStr = body.join('\r\n');

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/gad/proposals/1/upload-document',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer test_token_for_testing',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(bodyStr)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('\n=== RESPONSE ===');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`Body:`, data);
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

console.log('🧪 Testing upload endpoint...');
console.log(`POST /api/v1/gad/proposals/1/upload-document`);
console.log(`Authorization: Bearer test_token_for_testing`);
console.log(`File: test.pdf (${testFile.length} bytes)`);

req.write(bodyStr, 'binary');
req.end();
