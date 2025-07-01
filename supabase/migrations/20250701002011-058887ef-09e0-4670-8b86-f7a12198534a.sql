
-- Add project_description column to submissions table
ALTER TABLE public.submissions 
ADD COLUMN project_description text;
