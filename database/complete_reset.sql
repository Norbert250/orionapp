-- Complete reset of form progress system

-- Drop everything and start fresh
DROP TABLE IF EXISTS form_progress CASCADE;

-- Recreate table with minimal structure
CREATE TABLE form_progress (
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
  phone_number TEXT
);

-- Simple RLS policy
ALTER TABLE form_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for testing" ON form_progress FOR ALL USING (auth.role() = 'authenticated');

-- No unique constraints for now to avoid conflicts