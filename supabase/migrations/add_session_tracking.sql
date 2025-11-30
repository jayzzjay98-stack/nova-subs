-- Add is_active column to track active sessions
ALTER TABLE authorized_devices 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Create index for faster active session lookups
CREATE INDEX IF NOT EXISTS idx_authorized_devices_active 
ON authorized_devices(user_id, is_active) 
WHERE is_active = true;

-- Add session_id to track Supabase session
ALTER TABLE authorized_devices 
ADD COLUMN IF NOT EXISTS session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_authorized_devices_session 
ON authorized_devices(session_id) 
WHERE session_id IS NOT NULL;
