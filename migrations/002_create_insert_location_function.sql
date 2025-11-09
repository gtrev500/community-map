-- Migration 002: Create SQL function for inserting locations

CREATE OR REPLACE FUNCTION insert_location(
    p_tool_type TEXT,
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_note TEXT DEFAULT NULL,
    p_agents INTEGER DEFAULT NULL,
    p_hours TEXT DEFAULT NULL
)
RETURNS TABLE(
    id BIGINT,
    tool_type TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    note TEXT,
    agents INTEGER,
    hours TEXT,
    city_name TEXT,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    v_geometry geometry(Point, 4326);
    v_city_name TEXT;
BEGIN
    -- Create PostGIS point from latitude and longitude
    v_geometry := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326);

    -- Try to determine city name via spatial query against ca_cities
    -- Note: ca_cities has points, not polygons, so we'll find the nearest city
    SELECT c."NAME" INTO v_city_name
    FROM ca_cities c
    ORDER BY c.geometry <-> v_geometry
    LIMIT 1;

    -- Insert the location record
    RETURN QUERY
    INSERT INTO user_locations (
        tool_type,
        latitude,
        longitude,
        geometry,
        note,
        agents,
        hours,
        city_name
    ) VALUES (
        p_tool_type,
        p_latitude,
        p_longitude,
        v_geometry,
        p_note,
        p_agents,
        p_hours,
        v_city_name
    )
    RETURNING
        user_locations.id,
        user_locations.tool_type,
        user_locations.latitude,
        user_locations.longitude,
        user_locations.note,
        user_locations.agents,
        user_locations.hours,
        user_locations.city_name,
        user_locations.created_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION insert_location IS 'Inserts a new user location, auto-generates geometry, and determines nearest city';
