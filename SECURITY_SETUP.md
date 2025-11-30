# 🔒 Security Setup Guide

This guide explains how to enable Row Level Security (RLS) in your Supabase database.

## What is Row Level Security (RLS)?

RLS ensures that users can only access data they are authorized to see. Without RLS, anyone with your Supabase URL and API key could potentially access your data directly.

## How to Enable RLS

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com](https://supabase.com)
   - Navigate to your project

2. **Run the SQL Migration**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the contents of `/supabase/migrations/enable_rls.sql`
   - Paste into the SQL editor
   - Click "Run" button

3. **Verify RLS is Enabled**
   - Go to "Database" → "Tables"
   - Click on each table (customers, packages, user_roles)
   - Check that "RLS enabled" shows a green checkmark ✅

### Method 2: Using Supabase CLI

```bash
# Make sure Supabase CLI is installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

## What the RLS Policies Do

### ✅ Customers Table
- **SELECT**: Only authenticated users can view customers
- **INSERT**: Only authenticated users can add customers
- **UPDATE**: Only authenticated users can edit customers
- **DELETE**: Only authenticated users can delete customers

### ✅ Packages Table
- **SELECT**: Only authenticated users can view packages
- **INSERT**: Only authenticated users can add packages
- **UPDATE**: Only authenticated users can edit packages
- **DELETE**: Only authenticated users can delete packages

### ✅ User Roles Table
- **SELECT**: Users can only view their own role

## Testing RLS

After enabling RLS, test that it works:

1. **Try accessing data while logged out** → Should fail
2. **Log in with authorized email** → Should work
3. **Try using API key directly** → Should be restricted

## Additional Security Measures

Your application now has multiple layers of security:

1. ✅ **Email Whitelist** - Only `darkside404404@gmail.com` can login
2. ✅ **Row Level Security** - Database-level access control
3. ✅ **Authentication Required** - All operations require valid session
4. ✅ **HTTPS Only** - Encrypted connections (automatic on Vercel/Netlify)

## Troubleshooting

If you encounter issues after enabling RLS:

1. Make sure you're logged in when testing
2. Check browser console for errors
3. Verify policies in Supabase Dashboard → Database → Policies
4. Ensure `supabase.auth.getSession()` returns a valid session

## Need Help?

If RLS is too restrictive and blocking legitimate access, you can:
- Adjust policies in the SQL file
- Add more specific conditions
- Contact support for assistance
