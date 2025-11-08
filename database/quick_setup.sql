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
  abandoned_at TIMESTAMP WITH TIME ZONE,
  phone_number TEXT
);

-- Allow multiple sessions per user (removed unique constraint)

-- Simple RLS policy for testing
ALTER TABLE form_progress ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to do everything (for testing)
CREATE POLICY "Allow all for testing" ON form_progress
  FOR ALL USING (auth.role() = 'authenticated');

-- Test the setup
INSERT INTO form_progress (user_id, form_type, current_step, step_name, progress_percentage, status)
VALUES (auth.uid(), 'informal', 1, 'Assets Upload', 25, 'in_progress');