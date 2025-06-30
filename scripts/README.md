# Supabase Scripts

This directory contains scripts for setting up and managing your Supabase database for the Audiophile E-commerce app.

## Scripts Overview

### 1. `migrate-to-supabase.js`

Migrates product data from your local JSON file to Supabase.

### 2. `fix-rls-policies.sql`

Temporarily disables Row Level Security (RLS) to allow data migration.

### 3. `cart-checkout-policies.sql`

Sets up RLS policies for cart and checkout functionality.

## Prerequisites

1. Create Supabase tables using the SQL script provided
2. Run `fix-rls-policies.sql` to disable RLS temporarily
3. Get your Supabase URL and service key from your project settings

## Setup

1. Install dependencies:

   ```bash
   cd scripts
   npm install
   ```

2. Copy the `.env.template` file from the root directory to create a `.env` file:

   ```bash
   cp .env.template .env
   ```

3. Update the `.env` file with your Supabase credentials:

   ````env
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   ```   > **Important**:
   > - Use the **service key** (not the anon key) from Project Settings > API
   > - The `.env` file is gitignored and should not be committed to GitHub
   > - Only the `.env.template` file should be pushed to GitHub
   ````

## Running the Migration

1. First, disable RLS to allow data insertion:

   - Go to your Supabase dashboard
   - Open SQL Editor
   - Run the `fix-rls-policies.sql` script

## Pushing to GitHub

When pushing this project to GitHub, follow these guidelines:

1. **Environment Files**:

   - The actual environment files are excluded from Git (environment.ts, environment.development.ts, .env)
   - Only push the template files (environment.template.ts, environment.development.template.ts, .env.template)
   - Make sure sensitive keys are not included in any files pushed to GitHub

2. **SQL Scripts**:

   - All SQL scripts in this directory should be pushed to GitHub
   - They're valuable documentation of your database schema and security policies

3. **Migration Script**:

   - The migrate-to-supabase.js script should be pushed to GitHub
   - Make sure it doesn't contain hardcoded credentials

4. Then run the migration script from the project root:

   ```bash
   npm run migrate
   ```

## What the Script Does

1. Reads product data from `../public/data.json`
2. For each product:
   - Creates the base product entry
   - Adds product images (main and category)
   - Adds included items
   - Adds gallery images
3. Then in a second pass, for each product:
   - Adds related product relationships

## After Migration

After successful migration:

1. Verify in the Supabase dashboard that all data was properly inserted
2. Re-enable RLS with appropriate policies:
   - Go to your Supabase dashboard
   - Open SQL Editor
   - Edit and run the commented sections in `fix-rls-policies.sql`
3. For cart/checkout functionality, run `cart-checkout-policies.sql` after setting up authentication
4. Update your Angular services to fetch data from Supabase instead of the local JSON file

## Troubleshooting

- If you encounter errors about unique constraints, make sure you haven't run the migration twice
- If related products aren't properly linked, check that the slugs in your data match exactly
- For permission errors, ensure you're using the service key, not the anon key
