-- Migration 001: Create user_locations table for storing user-submitted map markers

CREATE TABLE IF NOT EXISTS user_locations (
    id BIGSERIAL PRIMARY KEY,
    tool_type TEXT NOT NULL CHECK (tool_type IN ('Ice', 'Homeless Shelter', 'Food bank')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geometry geometry(Point, 4326) NOT NULL,
    note TEXT,
    agents INTEGER CHECK (agents IS NULL OR agents >= 0),
    hours TEXT,
    city_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create spatial index on geometry column for efficient spatial queries
CREATE INDEX IF NOT EXISTS idx_user_locations_geometry
    ON user_locations USING GIST (geometry);

-- Create index on tool_type for filtering by tool
CREATE INDEX IF NOT EXISTS idx_user_locations_tool_type
    ON user_locations (tool_type);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_user_locations_created_at
    ON user_locations (created_at DESC);

COMMENT ON TABLE user_locations IS 'Stores user-submitted locations for Ice facilities, homeless shelters, and food banks';
COMMENT ON COLUMN user_locations.tool_type IS 'Type of facility: Ice, Homeless Shelter, or Food bank';
COMMENT ON COLUMN user_locations.geometry IS 'PostGIS point geometry (SRID 4326)';
COMMENT ON COLUMN user_locations.agents IS 'Number of agents (Ice facilities only)';
COMMENT ON COLUMN user_locations.hours IS 'Operating hours (Food banks only)';
COMMENT ON COLUMN user_locations.city_name IS 'City name determined via spatial query against ca_cities';
