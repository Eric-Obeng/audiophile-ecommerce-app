-- Add these policies after you have re-enabled RLS
-- Run this script to create cart and checkout RLS policies

-- Cart RLS Policies: Only authenticated users can access their own carts
CREATE POLICY "Users can create their own cart"
ON carts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own cart"
ON carts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
ON carts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart"
ON carts FOR DELETE USING (auth.uid() = user_id);

-- Cart Items RLS Policies
CREATE POLICY "Users can add items to their own cart"
ON cart_items FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id));

CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id));

CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id));

CREATE POLICY "Users can delete their own cart items"
ON cart_items FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id));

-- Orders RLS Policies
CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE USING (auth.uid() = user_id);

-- Order Items RLS Policies
CREATE POLICY "Users can add items to their own orders"
ON order_items FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM orders WHERE id = order_id));

CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM orders WHERE id = order_id));
