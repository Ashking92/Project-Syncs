
-- Create notices table for admin-to-student notifications
CREATE TABLE public.notices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  target_type text NOT NULL DEFAULT 'all', -- 'all' or 'individual'
  target_roll_number text, -- specific roll number if individual
  created_by text NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false
);

-- Enable RLS for notices
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Policy for students to view notices meant for them
CREATE POLICY "Students can view their notices" 
  ON public.notices 
  FOR SELECT 
  USING (
    target_type = 'all' OR 
    target_roll_number = (
      SELECT roll_number FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy for admin to insert notices
CREATE POLICY "Admin can create notices" 
  ON public.notices 
  FOR INSERT 
  WITH CHECK (true);

-- Policy for admin to view all notices
CREATE POLICY "Admin can view all notices" 
  ON public.notices 
  FOR SELECT 
  USING (true);

-- Add notices to realtime publication
ALTER TABLE public.notices REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.notices;
