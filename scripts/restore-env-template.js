#!/usr/bin/env node
/**
 * Restore environment template after build for development
 */

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../src/environments/environment.ts");

const templateContent = `// Production environment - values will be replaced during build
// DO NOT commit actual keys to version control
export const environment = {
  production: true,
  supabaseUrl: '\${SUPABASE_URL}',
  supabaseKey: '\${SUPABASE_KEY}',
};`;

// Write the template back
fs.writeFileSync(envPath, templateContent);

console.log("✅ Environment template restored");
