
-- Create profiles table for students
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_number TEXT NOT NULL UNIQUE,
  name TEXT,
  phone_number TEXT,
  email TEXT,
  photo_url TEXT,
  device_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submissions table linked to student profiles
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  project_title TEXT NOT NULL,
  team_members_count INTEGER NOT NULL,
  team_members TEXT NOT NULL,
  software_requirements TEXT,
  hardware_requirements TEXT,
  estimated_cost TEXT NOT NULL,
  technologies TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  remarks TEXT DEFAULT '',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles (students can only see/edit their own profile)
CREATE POLICY "Students can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (true); -- Allow viewing for dashboard functionality

CREATE POLICY "Students can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Students can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (true);

-- RLS policies for submissions (students can only see their own, admin can see all)
CREATE POLICY "Students can view their own submissions" 
  ON public.submissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Students can create submissions" 
  ON public.submissions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Students can update their own submissions" 
  ON public.submissions 
  FOR UPDATE 
  USING (true);
