-- Fix RLS policy to allow authenticated users to insert
DROP POLICY IF EXISTS "Allow all for testing" ON form_progress;

-- Create a proper policy that allows authenticated users
CREATE POLICY "Allow authenticated users" ON form_progress
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Test the policy by inserting a record
INSERT INTO form_progress (user_id, form_type, step_name, current_step, total_steps, progress_percentage, phone_number) 
VALUES (auth.uid(), 'informal', 'Test Step', 0, 4, 0, '123456789');

-- Check if it worked
SELECT * FROM form_progress WHERE user_id = auth.uid();