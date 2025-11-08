-- Simple policy for testing - allows all authenticated users to see all progress
DROP POLICY IF EXISTS "Admins can view all progress" ON form_progress;

CREATE POLICY "Allow all authenticated users to view progress" ON form_progress
  FOR SELECT USING (auth.role() = 'authenticated');

-- Test insert some sample data
INSERT INTO form_progress (user_id, form_type, current_step, total_steps, step_name, progress_percentage, status)
VALUES 
  (auth.uid(), 'informal', 1, 4, 'Assets Upload', 25, 'in_progress'),
  (auth.uid(), 'formal', 2, 4, 'Documents Upload', 50, 'in_progress')
ON CONFLICT DO NOTHING;