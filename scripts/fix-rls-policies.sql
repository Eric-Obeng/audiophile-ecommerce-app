-- Update Row Level Security to bypass RLS for the service role
-- This is the Supabase-recommended approach that doesn't require table ownership

-- First, disable RLS on all tables
-- The service role can always bypass RLS, so we can re-enable it after migration
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_includes DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE related_products DISABLE ROW LEVEL SECURITY;

-- After running the migration script, you can re-enable RLS with appropriate policies using the script below
-- Comment out the section above and uncomment this section after migration is complete

/*
-- Re-enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_includes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;
*/

/*
-- After migration, create policies for proper access control
-- Uncomment and run this section after migration

-- Products policies
CREATE POLICY "Allow public read access to products" 
ON products FOR SELECT USING (true);

-- Product images policies
CREATE POLICY "Allow public read access to product_images" 
ON product_images FOR SELECT USING (true);

-- Product includes policies
CREATE POLICY "Allow public read access to product_includes" 
ON product_includes FOR SELECT USING (true);

-- Product gallery policies
CREATE POLICY "Allow public read access to product_gallery" 
ON product_gallery FOR SELECT USING (true);

-- Related products policies
CREATE POLICY "Allow public read access to related_products" 
ON related_products FOR SELECT USING (true);

-- For authenticated users (like admins) - customize as needed
CREATE POLICY "Allow authenticated users to modify products" 
ON products FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to modify product_images" 
ON product_images FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to modify product_includes" 
ON product_includes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to modify product_gallery" 
ON product_gallery FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to modify related_products" 
ON related_products FOR ALL USING (auth.role() = 'authenticated');
*/
