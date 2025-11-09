/**
 * API endpoint for managing user-submitted locations
 * GET /api/locations - Retrieve all location markers
 * POST /api/locations - Create a new location marker
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';

interface LocationRequest {
	tool: string;
	coordinates: [number, number]; // [lng, lat]
	note?: string;
	agents?: number;
	hours?: string;
}

interface LocationRecord {
	id: number;
	tool_type: string;
	latitude: number;
	longitude: number;
	note: string | null;
	agents: number | null;
	hours: string | null;
	city_name: string | null;
	created_at: string;
}

export const GET: RequestHandler = async () => {
	try {
		const locations = await sql<LocationRecord[]>`
			SELECT
				id,
				tool_type,
				latitude,
				longitude,
				note,
				agents,
				hours,
				city_name,
				created_at
			FROM user_locations
			ORDER BY created_at DESC
		`;

		return json({
			success: true,
			data: locations
		});
	} catch (err) {
		console.error('Error fetching locations:', err);
		return error(500, 'Failed to fetch locations');
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data: LocationRequest = await request.json();

		// Validate required fields
		if (!data.tool || !data.coordinates || data.coordinates.length !== 2) {
			return error(400, 'Missing required fields: tool and coordinates');
		}

		const [longitude, latitude] = data.coordinates;

		// Validate coordinates
		if (
			typeof latitude !== 'number' ||
			typeof longitude !== 'number' ||
			latitude < -90 ||
			latitude > 90 ||
			longitude < -180 ||
			longitude > 180
		) {
			return error(400, 'Invalid coordinates');
		}

		// Validate tool type
		const validTools = ['Ice sighting', 'Homeless Shelter', 'Food bank'];
		if (!validTools.includes(data.tool)) {
			return error(400, `Invalid tool type. Must be one of: ${validTools.join(', ')}`);
		}

		// Call the SQL function to insert the location
		const [result] = await sql`
			SELECT * FROM insert_location(
				${data.tool},
				${latitude},
				${longitude},
				${data.note || null},
				${data.agents || null},
				${data.hours || null}
			)
		`;

		return json(
			{
				success: true,
				data: result
			},
			{ status: 201 }
		);
	} catch (err) {
		console.error('Error creating location:', err);
		return error(500, 'Failed to create location');
	}
};
