#!/usr/bin/env python3
"""
Import congressional district boundaries into PostGIS database.
"""
import argparse
from pathlib import Path
import geopandas as gpd
from sqlalchemy import create_engine


def import_shapefile(shapefile_path: str, table_name: str, db_url: str, state_filter: str = None):
    """
    Import a shapefile into PostGIS database.

    Args:
        shapefile_path: Path to the .shp file
        table_name: Name of the table to create in PostGIS
        db_url: PostgreSQL connection URL
        state_filter: Optional two-letter state code to filter features (e.g., 'CA')
    """
    print(f"Reading shapefile: {shapefile_path}")
    gdf = gpd.read_file(shapefile_path)

    print(f"Loaded {len(gdf)} features")
    print(f"Columns: {list(gdf.columns)}")
    print(f"CRS: {gdf.crs}")

    # Filter by state if specified
    if state_filter:
        original_count = len(gdf)

        # Determine which column to use for state filtering
        if 'STATE' in gdf.columns:
            gdf = gdf[gdf['STATE'] == state_filter]
        elif 'ADM1NAME' in gdf.columns:
            # For Natural Earth data, use full state name
            state_names = {
                'CA': 'California',
                'NY': 'New York',
                'TX': 'Texas',
                # Add more as needed
            }
            state_name = state_names.get(state_filter, state_filter)
            gdf = gdf[gdf['ADM1NAME'] == state_name]
        else:
            print(f"Warning: Cannot filter by state - no STATE or ADM1NAME column found")
            print(f"Available columns: {list(gdf.columns)}")
            return

        print(f"Filtered to {len(gdf)} features for state '{state_filter}' (from {original_count} total)")

        if len(gdf) == 0:
            print(f"Warning: No features found for state '{state_filter}'")
            return

    # Create database engine
    engine = create_engine(db_url)

    # Import to PostGIS
    print(f"Importing to table '{table_name}'...")
    gdf.to_postgis(
        name=table_name,
        con=engine,
        if_exists='replace',
        index=False,
        chunksize=100
    )

    print(f"Successfully imported {len(gdf)} features to '{table_name}'")
    print(f"Martin should now serve tiles at: http://localhost:3000/{table_name}/{{z}}/{{x}}/{{y}}.pbf")


def main():
    parser = argparse.ArgumentParser(description="Import congressional boundaries and cities to PostGIS")
    parser.add_argument(
        '--boundary-type',
        choices=['standard', 'carto'],
        default='carto',
        help='Which boundary set to use (standard=full precision, carto=cartographic)'
    )
    parser.add_argument(
        '--table-name',
        default='ca_congress_districts_119',
        help='Name for the PostGIS table'
    )
    parser.add_argument(
        '--db-url',
        default='postgresql://postgres:postgres@localhost:5432/gis',
        help='PostgreSQL connection URL'
    )
    parser.add_argument(
        '--state',
        default='CA',
        help='Two-letter state code to filter (e.g., CA for California)'
    )
    parser.add_argument(
        '--import-cities',
        action='store_true',
        help='Also import cities data'
    )
    parser.add_argument(
        '--cities-shapefile',
        help='Path to cities shapefile'
    )
    parser.add_argument(
        '--cities-table',
        default='ca_cities',
        help='Name for the cities PostGIS table'
    )

    args = parser.parse_args()

    # Determine shapefile path
    base_dir = Path(__file__).parent / 'boundaries'
    if args.boundary_type == 'carto':
        shapefile = base_dir / 'national_cong119_carto_boundary' / 'national_cong119_carto_boundary.shp'
    else:
        shapefile = base_dir / 'national_cong119_boundary' / 'national_cong119_boundary.shp'

    if not shapefile.exists():
        print(f"Error: Shapefile not found at {shapefile}")
        return 1

    # Import congressional districts
    import_shapefile(str(shapefile), args.table_name, args.db_url, args.state)

    # Import cities if requested
    if args.import_cities:
        if not args.cities_shapefile:
            print("\nError: --cities-shapefile required when using --import-cities")
            return 1

        cities_path = Path(args.cities_shapefile)
        if not cities_path.exists():
            print(f"Error: Cities shapefile not found at {cities_path}")
            return 1

        print("\n" + "="*50)
        print("Importing cities...")
        print("="*50)
        import_shapefile(str(cities_path), args.cities_table, args.db_url, args.state)

    return 0


if __name__ == '__main__':
    exit(main())
