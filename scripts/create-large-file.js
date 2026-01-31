const fs = require('fs');
// Create a 51MB file (just over the 50MB limit)
const size = 51 * 1024 * 1024;
const buffer = Buffer.alloc(size, 0);
// Add PDF header to make it look like a PDF
buffer.write('%PDF-1.4', 0);
fs.writeFileSync('C:/Users/bitpk/Desktop/New-TP-Opp/large-test.pdf', buffer);
console.log('Created large-test.pdf (51MB)');
