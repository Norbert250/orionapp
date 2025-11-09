-- Clean up old test data
DELETE FROM form_progress WHERE user_name = 'Test User' OR user_name = 'Unknown User';
DELETE FROM form_progress WHERE user_email = 'test@example.com' OR user_email = 'Unknown';
DELETE FROM form_progress WHERE step_name = 'Assets Upload' AND progress_percentage = 25;

-- Remove the test insert from setup
-- DELETE FROM form_progress WHERE created_at < NOW() - INTERVAL '1 hour';