-- Create table to store authorized devices
CREATE TABLE IF NOT EXISTS authorized_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  browser TEXT,
  os TEXT,
  platform TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

-- Enable RLS
ALTER TABLE authorized_devices ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own devices
CREATE POLICY "Users can view their own devices"
ON authorized_devices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for users to insert their own devices  
CREATE POLICY "Users can insert their own devices"
ON authorized_devices
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own devices
CREATE POLICY "Users can update their own devices"
ON authorized_devices
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own devices
CREATE POLICY "Users can delete their own devices"
ON authorized_devices
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_authorized_devices_user_id ON authorized_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_authorized_devices_fingerprint ON authorized_devices(device_fingerprint);
