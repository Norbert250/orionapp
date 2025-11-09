-- Quick setup for form progress tracking
CREATE TABLE IF NOT EXISTS form_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 4,
  step_name TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  time_spent INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  abandoned_at_step TEXT,
  phone_number TEXT
);

-- Add unique constraint to prevent duplicate active sessions
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_form_progress 
ON form_progress (user_id, form_type) 
WHERE status = 'in_progress';

-- Simple RLS policy for testing
ALTER TABLE form_progress ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to do everything (for testing)
CREATE POLICY "Allow all for testing" ON form_progress
  FOR ALL USING (auth.role() = 'authenticated');

-- Clean up existing duplicates first
DELETE FROM form_progress 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, form_type) id 
  FROM form_progress 
  WHERE status = 'in_progress'
  ORDER BY user_id, form_type, created_at DESC
);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Table is ready for use