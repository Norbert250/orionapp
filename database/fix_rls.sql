-- Drop existing policies and create simple ones
DROP POLICY IF EXISTS "Allow all for testing" ON form_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON form_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON form_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON form_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON form_progress;

-- Disable RLS temporarily for testing
ALTER TABLE form_progress DISABLE ROW LEVEL SECURITY;

-- Or use this simple policy that works
ALTER TABLE form_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_authenticated" ON form_progress FOR ALL TO authenticated USING (true);