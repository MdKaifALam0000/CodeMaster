require('dotenv').config();

console.log('Testing Environment Variables...');
console.log('MAIL_USER is set:', !!process.env.MAIL_USER);
console.log('MAIL_PASS is set:', !!process.env.MAIL_PASS);
console.log('MAIL_HOST is set:', !!process.env.MAIL_HOST);
console.log('Current Directory:', process.cwd());
