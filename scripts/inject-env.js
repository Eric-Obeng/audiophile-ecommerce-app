#!/usr/bin/env node
/**
 * Build script to inject environment variables during Vercel build
 * This replaces placeholder values in environment.ts with actual environment variables
 */

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../src/environments/environment.ts");

// Check if environment variables are available
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Environment variables not found, using placeholders");
  return;
}

// Read the environment file
let envContent = fs.readFileSync(envPath, "utf8");

// Replace placeholders with actual environment variables
envContent = envContent.replace("${SUPABASE_URL}", supabaseUrl);
envContent = envContent.replace("${SUPABASE_KEY}", supabaseKey);

// Write the file back
fs.writeFileSync(envPath, envContent);

console.log("✅ Environment variables injected into environment.ts");
