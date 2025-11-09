-- Migration 004: Create SQL functions for managing location comments

-- Function to add a comment to a location
CREATE OR REPLACE FUNCTION add_comment_to_location(
    p_location_id INTEGER,
    p_comment_text TEXT,
    p_author_name VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE(
    id INTEGER,
    location_id INTEGER,
    comment_text TEXT,
    author_name VARCHAR(100),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Verify location exists
    IF NOT EXISTS (SELECT 1 FROM user_locations WHERE user_locations.id = p_location_id) THEN
        RAISE EXCEPTION 'Location with id % does not exist', p_location_id;
    END IF;

    -- Validate comment text is not empty
    IF p_comment_text IS NULL OR LENGTH(TRIM(p_comment_text)) = 0 THEN
        RAISE EXCEPTION 'Comment text cannot be empty';
    END IF;

    -- Insert and return the new comment
    RETURN QUERY
    INSERT INTO location_comments (location_id, comment_text, author_name)
    VALUES (p_location_id, TRIM(p_comment_text), p_author_name)
    RETURNING
        location_comments.id,
        location_comments.location_id,
        location_comments.comment_text,
        location_comments.author_name,
        location_comments.created_at,
        location_comments.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to get all comments for a specific location
CREATE OR REPLACE FUNCTION get_location_comments(p_location_id INTEGER)
RETURNS TABLE(
    id INTEGER,
    comment_text TEXT,
    author_name VARCHAR(100),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lc.id,
        lc.comment_text,
        lc.author_name,
        lc.created_at,
        lc.updated_at
    FROM location_comments lc
    WHERE lc.location_id = p_location_id
    ORDER BY lc.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get location details with comment count
CREATE OR REPLACE FUNCTION get_location_with_comment_count(p_location_id INTEGER)
RETURNS TABLE(
    id BIGINT,
    tool_type TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    note TEXT,
    agents INTEGER,
    hours TEXT,
    city_name TEXT,
    created_at TIMESTAMPTZ,
    comment_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ul.id,
        ul.tool_type,
        ul.latitude,
        ul.longitude,
        ul.note,
        ul.agents,
        ul.hours,
        ul.city_name,
        ul.created_at,
        COUNT(lc.id) as comment_count
    FROM user_locations ul
    LEFT JOIN location_comments lc ON ul.id = lc.location_id
    WHERE ul.id = p_location_id
    GROUP BY ul.id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_comment_to_location IS 'Adds a new comment to a location with validation';
COMMENT ON FUNCTION get_location_comments IS 'Retrieves all comments for a specific location ordered by newest first';
COMMENT ON FUNCTION get_location_with_comment_count IS 'Gets location details with total comment count';
