-- ============================================
-- FIX RLS SECURITY - Remove insecure public policies
-- ============================================
-- This script removes all insecure 'public' policies and keeps only 
-- authenticated user policies to ensure data security

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Drop customers policies
DROP POLICY IF EXISTS "Users can delete customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can view customers" ON customers;
DROP POLICY IF EXISTS "Admins can delete all customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can create customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can delete their own customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;

-- Drop packages policies
DROP POLICY IF EXISTS "Users can delete packages" ON packages;
DROP POLICY IF EXISTS "Users can insert packages" ON packages;
DROP POLICY IF EXISTS "Users can update packages" ON packages;
DROP POLICY IF EXISTS "Users can view packages" ON packages;
DROP POLICY IF EXISTS "Authenticated users can create packages" ON packages;
DROP POLICY IF EXISTS "Authenticated users can delete packages" ON packages;
DROP POLICY IF EXISTS "Authenticated users can update packages" ON packages;
DROP POLICY IF EXISTS "Authenticated users can view packages" ON packages;

-- Drop user_roles policies
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- ============================================
-- STEP 2: ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE SECURE POLICIES (AUTHENTICATED ONLY)
-- ============================================

-- CUSTOMERS TABLE - Only authenticated users
CREATE POLICY "Authenticated users can view customers"
ON customers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create customers"
ON customers
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
ON customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
ON customers
FOR DELETE
TO authenticated
USING (true);

-- PACKAGES TABLE - Only authenticated users
CREATE POLICY "Authenticated users can view packages"
ON packages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create packages"
ON packages
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update packages"
ON packages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete packages"
ON packages
FOR DELETE
TO authenticated
USING (true);

-- USER_ROLES TABLE - Users can only view their own role
CREATE POLICY "Users can view their own role"
ON user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- STEP 4: REVOKE ALL PUBLIC ACCESS
-- ============================================

REVOKE ALL ON customers FROM anon;
REVOKE ALL ON packages FROM anon;
REVOKE ALL ON user_roles FROM anon;

-- Only allow authenticated users
GRANT ALL ON customers TO authenticated;
GRANT ALL ON packages TO authenticated;
GRANT SELECT ON user_roles TO authenticated;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify RLS is enabled:
-- 
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     roles,
--     cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
