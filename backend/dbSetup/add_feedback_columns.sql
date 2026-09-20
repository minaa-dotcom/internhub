-- Add feedback columns to student_assignments table
-- Run this migration to add feedback functionality

ALTER TABLE public.student_assignments 
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS feedback_date TIMESTAMP;

-- Add comment to explain the columns
COMMENT ON COLUMN public.student_assignments.feedback IS 'Advisor feedback on student university work';
COMMENT ON COLUMN public.student_assignments.feedback_date IS 'Date when feedback was last updated';
