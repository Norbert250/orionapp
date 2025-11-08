-- Create form_progress table for tracking user form completion
CREATE TABLE IF NOT EXISTS form_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN ('informal', 'formal')),
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 4,
  step_name TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  time_spent INTEGER DEFAULT 0, -- in minutes
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_progress_user_id ON form_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_form_progress_status ON form_progress(status);
CREATE INDEX IF NOT EXISTS idx_form_progress_form_type ON form_progress(form_type);
CREATE INDEX IF NOT EXISTS idx_form_progress_last_activity ON form_progress(last_activity);

-- Enable RLS (Row Level Security)
ALTER TABLE form_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own progress" ON form_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON form_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON form_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policy to view all progress (optional - for company dashboard)
CREATE POLICY "Admins can view all progress" ON form_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_form_progress_updated_at 
  BEFORE UPDATE ON form_progress 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON form_progress TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;