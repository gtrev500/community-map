/**
 * API endpoint for managing location comments
 * GET /api/comments?location_id=X - Retrieve comments for a location
 * POST /api/comments - Add a new comment to a location
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';

interface CommentRequest {
	location_id: number;
	comment_text: string;
	author_name?: string;
}

interface CommentRecord {
	id: number;
	comment_text: string;
	author_name: string | null;
	created_at: string;
	updated_at: string;
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const locationId = url.searchParams.get('location_id');

		if (!locationId) {
			return error(400, 'location_id parameter is required');
		}

		const locationIdNum = parseInt(locationId, 10);
		if (isNaN(locationIdNum)) {
			return error(400, 'location_id must be a valid number');
		}

		const comments = await sql<CommentRecord[]>`
			SELECT * FROM get_location_comments(${locationIdNum})
		`;

		return json({
			success: true,
			data: comments
		});
	} catch (err) {
		console.error('Error fetching comments:', err);
		return error(500, 'Failed to fetch comments');
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data: CommentRequest = await request.json();

		// Validate required fields
		if (!data.location_id || !data.comment_text) {
			return error(400, 'Missing required fields: location_id and comment_text');
		}

		// Validate comment text is not empty after trimming
		if (data.comment_text.trim().length === 0) {
			return error(400, 'Comment text cannot be empty');
		}

		// Call the SQL function to add the comment
		const [result] = await sql`
			SELECT * FROM add_comment_to_location(
				${data.location_id},
				${data.comment_text},
				${data.author_name || null}
			)
		`;

		return json(
			{
				success: true,
				data: result
			},
			{ status: 201 }
		);
	} catch (err: any) {
		console.error('Error creating comment:', err);

		// Handle specific database errors
		if (err.message?.includes('does not exist')) {
			return error(404, 'Location not found');
		}

		return error(500, 'Failed to create comment');
	}
};
