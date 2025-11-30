-- Enable Row Level Security on all tables
-- This ensures that users can only access data they are authorized to see

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================

DROP POLICY IF EXISTS "Users can view customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;

DROP POLICY IF EXISTS "Users can view packages" ON packages;
DROP POLICY IF EXISTS "Users can insert packages" ON packages;
DROP POLICY IF EXISTS "Users can update packages" ON packages;
DROP POLICY IF EXISTS "Users can delete packages" ON packages;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- ============================================
-- CUSTOMERS TABLE POLICIES
-- ============================================

-- Only authenticated users can view customers
CREATE POLICY "Users can view customers"
ON customers
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can insert customers
CREATE POLICY "Users can insert customers"
ON customers
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update customers
CREATE POLICY "Users can update customers"
ON customers
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can delete customers
CREATE POLICY "Users can delete customers"
ON customers
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- PACKAGES TABLE POLICIES
-- ============================================

-- Only authenticated users can view packages
CREATE POLICY "Users can view packages"
ON packages
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can insert packages
CREATE POLICY "Users can insert packages"
ON packages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update packages
CREATE POLICY "Users can update packages"
ON packages
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can delete packages
CREATE POLICY "Users can delete packages"
ON packages
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- USER_ROLES TABLE POLICIES
-- ============================================

-- Users can view their own role
CREATE POLICY "Users can view their own role"
ON user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables for authenticated users
GRANT ALL ON customers TO authenticated;
GRANT ALL ON packages TO authenticated;
GRANT SELECT ON user_roles TO authenticated;

-- Grant limited access for anonymous users (none, since we require login)
REVOKE ALL ON customers FROM anon;
REVOKE ALL ON packages FROM anon;
REVOKE ALL ON user_roles FROM anon;
