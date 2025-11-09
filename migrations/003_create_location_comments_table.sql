-- Migration 003: Create location_comments table for user comments on locations

CREATE TABLE IF NOT EXISTS location_comments (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES user_locations(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL CHECK (LENGTH(comment_text) > 0),
    author_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on location_id for efficient comment lookups
CREATE INDEX IF NOT EXISTS idx_location_comments_location_id
    ON location_comments (location_id);

-- Create index on created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_location_comments_created_at
    ON location_comments (created_at DESC);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_location_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_location_comment_timestamp ON location_comments;
CREATE TRIGGER trigger_update_location_comment_timestamp
    BEFORE UPDATE ON location_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_location_comment_timestamp();

COMMENT ON TABLE location_comments IS 'User-submitted comments for locations (ice sightings, homeless shelters, food banks)';
COMMENT ON COLUMN location_comments.location_id IS 'Foreign key to user_locations table';
COMMENT ON COLUMN location_comments.comment_text IS 'The comment content (required, non-empty)';
COMMENT ON COLUMN location_comments.author_name IS 'Optional author name for future user attribution';
