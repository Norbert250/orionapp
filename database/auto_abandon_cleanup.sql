-- Create a function to automatically mark old sessions as abandoned
CREATE OR REPLACE FUNCTION mark_old_sessions_abandoned()
RETURNS void AS $$
BEGIN
  UPDATE form_progress 
  SET status = 'abandoned'
  WHERE status = 'in_progress' 
    AND last_activity < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger or use pg_cron to run this function periodically
-- For now, you can run this manually or set up a cron job