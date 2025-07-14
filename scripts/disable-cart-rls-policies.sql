-- ============================================================================
-- Disable Cart Tables RLS Policies
-- ============================================================================
-- This script disables Row Level Security for troubleshooting purposes
-- Use this if you need to debug cart operations without RLS restrictions
-- ============================================================================

-- Drop all cart_items policies
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- Drop all carts policies
DROP POLICY IF EXISTS "Users can view own cart" ON carts;
DROP POLICY IF EXISTS "Users can insert own cart" ON carts;
DROP POLICY IF EXISTS "Users can update own cart" ON carts;
DROP POLICY IF EXISTS "Users can delete own cart" ON carts;

-- Disable RLS on both tables
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;

-- Verification
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('carts', 'cart_items');

-- Should show rowsecurity = false for both tables
