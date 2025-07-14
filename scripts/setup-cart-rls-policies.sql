-- ============================================================================
-- Cart Tables RLS Policies Setup
-- ============================================================================
-- This script sets up Row Level Security (RLS) policies for the cart system
-- Ensures users can only access their own cart data
-- ============================================================================

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own cart" ON carts;
DROP POLICY IF EXISTS "Users can insert own cart" ON carts;
DROP POLICY IF EXISTS "Users can update own cart" ON carts;
DROP POLICY IF EXISTS "Users can delete own cart" ON carts;

DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- Enable RLS on both tables
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CARTS TABLE POLICIES
-- ============================================================================

-- Policy: Users can only view their own cart
CREATE POLICY "Users can view own cart" ON carts
    FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

-- Policy: Users can insert their own cart
CREATE POLICY "Users can insert own cart" ON carts
    FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Users can update their own cart
CREATE POLICY "Users can update own cart" ON carts
    FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Policy: Users can delete their own cart
CREATE POLICY "Users can delete own cart" ON carts
    FOR DELETE
    USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- CART_ITEMS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view items in their own cart
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = (SELECT auth.uid())
        )
    );

-- Policy: Users can insert items into their own cart
CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = (SELECT auth.uid())
        )
    );

-- Policy: Users can update items in their own cart
CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = (SELECT auth.uid())
        )
    );

-- Policy: Users can delete items from their own cart
CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = (SELECT auth.uid())
        )
    );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after applying the policies to verify they're working

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('carts', 'cart_items');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('carts', 'cart_items')
ORDER BY tablename, policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. These policies ensure that users can only access their own cart data
-- 2. The cart_items policies use EXISTS queries to check cart ownership
-- 3. Both SELECT and modification operations are properly secured
-- 4. The policies work with your upsert operations in the CartService
-- 5. Remember to test thoroughly after enabling RLS
-- ============================================================================
