
-- Create admin_managed_students table to track students managed by admins
CREATE TABLE public.admin_managed_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT DEFAULT 'admin'
);

-- Enable Row Level Security
ALTER TABLE public.admin_managed_students ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all managed students" 
  ON public.admin_managed_students 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert managed students" 
  ON public.admin_managed_students 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update managed students" 
  ON public.admin_managed_students 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Admins can delete managed students" 
  ON public.admin_managed_students 
  FOR DELETE 
  USING (true);

-- Create index for better performance
CREATE INDEX idx_admin_managed_students_roll_number ON public.admin_managed_students(roll_number);
CREATE INDEX idx_admin_managed_students_department ON public.admin_managed_students(department);
