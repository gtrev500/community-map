# Community Map

An interactive web application for mapping and tracking community resources across California, including ice sightings, homeless shelters, and food banks. Users can add locations, view existing markers, and engage through comments.

## Features

- **Interactive Map Interface**: MapLibre GL-based map of California with district boundaries
- **Location Management**: Add and view community resource locations with detailed information
- **Three Resource Types**:
  - Ice sightings (with agent count)
  - Homeless Shelters
  - Food Banks (with operating hours)
- **Comments System**: View location details and add comments to existing locations
- **Spatial Intelligence**: Automatic city detection based on coordinates using PostGIS
- **Visual Legend**: Color-coded pins and legend for easy resource identification
- **Real-time Updates**: Locations and comments update immediately after submission

## Tech Stack

### Frontend
- **SvelteKit** - Full-stack web framework with server-side rendering
- **Svelte 5** - Modern reactive UI framework
- **MapLibre GL** - Open-source mapping library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

### Backend
- **PostgreSQL 18** - Relational database
- **PostGIS 3.6** - Spatial database extension for geographic queries
- **Martin** - High-performance map tile server
- **postgres.js** - PostgreSQL client for Node.js

## Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Python 3** (for boundary data import scripts)

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd community-map
```

### 2. Start Database Services

```bash
docker compose up -d
```

This starts:
- PostgreSQL/PostGIS database on port 5432
- Martin tile server on port 3000

Verify services are running:
```bash
docker compose ps
```

### 3. Import Boundary Data

Import California city and district boundaries:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Import boundaries into PostGIS
python import_boundaries.py
```

### 4. Install Application Dependencies

```bash
cd community-map
npm install
```

### 5. Run Database Migrations

```bash
npm run migrate
```

This creates:
- `user_locations` table for storing map markers
- `location_comments` table for user comments
- SQL functions for data operations

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Usage

### Adding a Location

1. Select a resource type from the toolbar (Ice sighting, Homeless Shelter, or Food Bank)
2. Click anywhere on the California map
3. A preview pin appears and a dialogue opens
4. Fill in the form:
   - **Note**: Optional description
   - **Agents**: Number of agents (ice sightings only)
   - **Hours**: Operating hours (Food banks only)
5. Click "Save" to add the location

### Viewing Location Details

1. Click on any existing location pin
2. View location information:
   - Resource type and nearest city
   - User-submitted notes
   - Additional fields (agents/hours)
   - Creation timestamp
3. Scroll through existing comments

### Adding Comments

1. Click on a location pin to open the details view
2. Type your comment in the "Add Comment" field
3. Click "Add Comment" to submit
4. Your comment appears immediately in the list

## API Reference

### Locations

#### GET /api/locations
Retrieve all locations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tool_type": "Ice sighting",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "note": "Downtown facility",
      "agents": 5,
      "hours": null,
      "city_name": "Los Angeles",
      "created_at": "2025-11-08T..."
    }
  ]
}
```

#### POST /api/locations
Create a new location.

**Request:**
```json
{
  "tool": "Ice sighting",
  "coordinates": [-118.2437, 34.0522],
  "note": "Optional note",
  "agents": 5,
  "hours": null
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tool_type": "Ice sighting",
    "city_name": "Los Angeles",
    ...
  }
}
```

### Comments

#### GET /api/comments?location_id=1
Retrieve comments for a location.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "location_id": 1,
      "comment_text": "Important information here",
      "author_name": null,
      "created_at": "2025-11-08T..."
    }
  ]
}
```

#### POST /api/comments
Add a comment to a location.

**Request:**
```json
{
  "location_id": 1,
  "comment_text": "This is my comment",
  "author_name": null
}
```

**Response:** 201 Created

## Development

### Project Structure

```
community-map/
├── boundaries/              # GeoJSON boundary data
├── community-map/           # SvelteKit application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/  # Svelte components
│   │   │   ├── server/      # Server-side utilities
│   │   │   └── stores/      # Svelte stores
│   │   └── routes/
│   │       ├── api/         # API endpoints
│   │       └── +page.svelte # Main page
│   ├── package.json
│   └── vite.config.ts
├── district_data/           # Additional district data
├── migrations/              # Database migration files
├── scripts/                 # Utility scripts
├── docker-compose.yaml      # Docker services configuration
├── import_boundaries.py     # Boundary import script
└── README.md
```

### Key Components

- **Map.svelte** - Main map interface with MapLibre GL
- **Toolbar.svelte** - Resource type selection buttons
- **ToolDialogue.svelte** - Location creation and viewing modal
- **Legend.svelte** - Map legend with color-coded resource types
- **mapTools.svelte.ts** - State management for map interactions

### Database Schema

**user_locations**
- Stores location markers
- PostGIS geometry column for spatial queries
- Automatic city name detection

**location_comments**
- One-to-many relationship with locations
- Cascade delete when location is removed
- Timestamp tracking with auto-update trigger

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run check      # Run Svelte/TypeScript checks
npm run migrate    # Run database migrations
```

### Testing

#### Manual UI Testing
```bash
npm run dev
# Open http://localhost:5173 and test features
```

#### API Testing
```bash
# Get all locations
curl http://localhost:5173/api/locations

# Add a location
curl -X POST http://localhost:5173/api/locations \
  -H "Content-Type: application/json" \
  -d '{"tool":"Ice sighting","coordinates":[-118.2437,34.0522],"agents":5}'

# Get comments
curl http://localhost:5173/api/comments?location_id=1

# Add a comment
curl -X POST http://localhost:5173/api/comments \
  -H "Content-Type: application/json" \
  -d '{"location_id":1,"comment_text":"Test comment"}'
```

#### Database Inspection
```bash
# Connect to database
docker exec -it postgis psql -U postgres -d gis

# View locations
SELECT id, tool_type, city_name, note FROM user_locations;

# View comments
SELECT lc.*, ul.tool_type
FROM location_comments lc
JOIN user_locations ul ON lc.location_id = ul.id;
```

## Environment Variables

Create `.env` file in `community-map/` directory:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gis
```

## Troubleshooting

### Services won't start
```bash
docker compose down
docker compose up -d
docker compose ps  # Check status
```

### Migration errors
If tables already exist:
```sql
-- Connect to database first
docker exec -it postgis psql -U postgres -d gis

-- Drop and recreate
DROP TABLE IF EXISTS location_comments CASCADE;
DROP TABLE IF EXISTS user_locations CASCADE;
```

Then re-run: `npm run migrate`

### Port conflicts
If port 5432 or 3000 is in use, modify `docker-compose.yaml` to use different ports.

## Known Limitations

- No user authentication (all submissions are anonymous)
- No edit/delete functionality for locations or comments
- No pagination for comments (all load at once)
- No clustering for high-density areas
- No real-time updates (requires manual refresh)
- Limited to California boundaries

## Future Enhancements

- User authentication and authorization
- Edit/delete capabilities for locations and comments
- Comment moderation and flagging system
- Filtering by resource type and date range
- Location clustering for dense areas
- Real-time updates via WebSocket
- Mobile-responsive design improvements
- Export data to CSV/GeoJSON
- Admin dashboard for moderation
- Search and filter functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Acknowledgments

- Built with SvelteKit and MapLibre GL
- Spatial data powered by PostGIS
- Boundary data from official California sources
- Map tiles served by Martin
