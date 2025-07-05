-- Add new columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'personal';

-- Update existing tasks to have default values
UPDATE tasks 
SET priority = 'medium' 
WHERE priority IS NULL;

UPDATE tasks 
SET category = 'personal' 
WHERE category IS NULL;

-- Add check constraint for priority
ALTER TABLE tasks 
ADD CONSTRAINT check_priority 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
