# Backend Integration Setup

This document explains the backend architecture and how to set up and test the database integration.

## Architecture Overview

### Database Schema

**Table: `user_locations`**
- Stores user-submitted map markers (Ice facilities, Homeless Shelters, Food Banks)
- Uses PostGIS for spatial data (geometry column with SRID 4326)
- Auto-determines nearest city via spatial query
- Columns:
  - `id` - Primary key
  - `tool_type` - Type of facility
  - `latitude`, `longitude` - Coordinates
  - `geometry` - PostGIS point geometry
  - `note` - Optional text note
  - `agents` - Number of agents (Ice only)
  - `hours` - Operating hours (Food banks only)
  - `city_name` - Nearest city (auto-populated)
  - `created_at` - Timestamp

### SQL Function

**`insert_location()`**
- Handles all location insertions
- Creates PostGIS geometry from lat/lng
- Determines nearest city via spatial query against `ca_cities`
- Returns inserted row with all computed fields

### API Endpoint

**`POST /api/locations`**
- Accepts JSON: `{ tool, coordinates: [lng, lat], note?, agents?, hours? }`
- Validates input (coordinates, tool type)
- Calls `insert_location()` SQL function
- Returns inserted record with ID and city name

### Frontend Integration

**`ToolDialogue.svelte`**
- Handles form submission from map clicks
- POSTs to `/api/locations` with proper error handling
- Shows loading state and error messages
- Resets form on success

## Setup Instructions

### 1. Ensure Docker Services are Running

```bash
cd /home/gabe/Desktop/community-map
docker compose up -d
```

Verify services:
```bash
docker compose ps
# Should show postgres and martin running
```

### 2. Run Database Migrations

From the `community-map` webapp directory:

```bash
cd community-map
npm run migrate
```

Expected output:
```
🚀 Starting database migrations...

📄 Running migration: 001_create_user_locations_table.sql
✅ 001_create_user_locations_table.sql completed successfully

📄 Running migration: 002_create_insert_location_function.sql
✅ 002_create_insert_location_function.sql completed successfully

✨ All migrations completed successfully!
```

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

## Testing the Integration

### Manual Testing via UI

1. Open http://localhost:5173 in your browser
2. Click one of the tool buttons (Ice, Homeless Shelter, Food bank)
3. Click anywhere on the California map
4. Fill in the form fields in the dialogue
5. Click "Save"
6. Check browser console for success message
7. Verify data in database (see below)

### Verify Data in Database

Connect to PostgreSQL:
```bash
docker exec -it postgis psql -U postgres -d gis
```

Query the data:
```sql
-- View all locations
SELECT id, tool_type, latitude, longitude, city_name, note, created_at
FROM user_locations
ORDER BY created_at DESC;

-- Count by tool type
SELECT tool_type, COUNT(*)
FROM user_locations
GROUP BY tool_type;

-- View locations with city names
SELECT tool_type, city_name, note,
       ST_AsText(geometry) as location
FROM user_locations
WHERE city_name IS NOT NULL;
```

### Testing via curl

```bash
# Create an Ice facility in Los Angeles area
curl -X POST http://localhost:5173/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "Ice",
    "coordinates": [-118.2437, 34.0522],
    "note": "Test ICE facility",
    "agents": 5
  }'

# Create a Food Bank in San Francisco area
curl -X POST http://localhost:5173/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "Food bank",
    "coordinates": [-122.4194, 37.7749],
    "note": "Downtown food bank",
    "hours": "2024-01-15T09:00"
  }'

# Create a Homeless Shelter in San Diego area
curl -X POST http://localhost:5173/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "Homeless Shelter",
    "coordinates": [-117.1611, 32.7157],
    "note": "Emergency shelter"
  }'
```

Expected response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tool_type": "Ice",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "note": "Test ICE facility",
    "agents": 5,
    "hours": null,
    "city_name": "Los Angeles",
    "created_at": "2025-11-08T..."
  }
}
```

## File Structure

```
/home/gabe/Desktop/community-map/
├── migrations/
│   ├── 001_create_user_locations_table.sql
│   └── 002_create_insert_location_function.sql
├── scripts/
│   └── migrate.ts
└── community-map/
    ├── .env (DATABASE_URL)
    ├── src/
    │   ├── lib/
    │   │   ├── server/
    │   │   │   └── db.ts (database connection)
    │   │   └── components/
    │   │       └── ToolDialogue.svelte (updated)
    │   └── routes/
    │       └── api/
    │           └── locations/
    │               └── +server.ts (POST endpoint)
    └── package.json (added postgres, tsx)
```

## Environment Variables

The app uses `.env` file in the `community-map/` directory:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gis
```

This matches the credentials in `docker-compose.yaml`.

## Troubleshooting

### Migration fails with "relation already exists"

The migrations use `IF NOT EXISTS` so they're safe to re-run. If you need to start fresh:

```sql
DROP TABLE IF EXISTS user_locations CASCADE;
DROP FUNCTION IF EXISTS insert_location CASCADE;
```

Then re-run migrations.

### API returns 500 error

Check:
1. Docker services are running: `docker compose ps`
2. Database connection in `.env` is correct
3. Migrations completed successfully
4. Check SvelteKit dev server logs for error details

### "Cannot find module 'postgres'"

Make sure you installed dependencies:
```bash
cd community-map
npm install
```

## Next Steps

Potential enhancements:
- Add GET endpoint to retrieve locations for map display
- Add UPDATE and DELETE endpoints
- Filter locations by tool type, date range, or area
- Add pagination for large datasets
- Implement user authentication
- Add data validation and sanitization
- Create admin interface for managing submissions
