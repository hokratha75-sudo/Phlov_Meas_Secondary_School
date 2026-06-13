#!/usr/bin/env node
// Run: node scripts/generate-secrets.js

const crypto = require('crypto');

const generateSecret = () => crypto.randomBytes(32).toString('hex');

console.log(`
========================================
GENERATE SECURE SECRETS FOR PRODUCTION
========================================

Copy these values to your .env file:

JWT_SECRET=${generateSecret()}
JWT_REFRESH_SECRET=${generateSecret()}
CSRF_SECRET=${generateSecret()}

⚠️  Keep these secrets safe! Never commit them to git.
`);
