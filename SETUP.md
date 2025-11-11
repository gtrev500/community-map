# Setup Guide

Complete setup instructions for the Community Map application.

## Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Python 3** (for boundary data import scripts)

## Installation Steps

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

## Environment Variables

Create `.env` file in `community-map/` directory:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gis
```
