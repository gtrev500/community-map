-- Migration 006: Rename 'Ice' to 'Ice sighting' in existing data and constraints

-- Drop the old check constraint first
ALTER TABLE user_locations
DROP CONSTRAINT IF EXISTS user_locations_tool_type_check;

-- Update existing records
UPDATE user_locations
SET tool_type = 'Ice sighting'
WHERE tool_type = 'Ice';

-- Add new check constraint with updated value
ALTER TABLE user_locations
ADD CONSTRAINT user_locations_tool_type_check
CHECK (tool_type IN ('Ice sighting', 'Homeless Shelter', 'Food bank'));

-- Update comments
COMMENT ON TABLE user_locations IS 'Stores user-submitted locations for ice sightings, homeless shelters, and food banks';
COMMENT ON COLUMN user_locations.tool_type IS 'Type of facility: Ice sighting, Homeless Shelter, or Food bank';
COMMENT ON COLUMN user_locations.agents IS 'Number of agents (ice sightings only)';
