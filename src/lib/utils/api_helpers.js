// Enhanced api_helpers.js
export class ApiError extends Error {
	constructor(message, status, response) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.response = response;
	}
}

export async function deleteItem(endpoint, type) {
	// console.log(`Attempting to delete ${type} at: ${endpoint}`);

	try {
		const response = await fetch(endpoint, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new ApiError(
				errorData.message || `Failed to delete ${type}`,
				response.status,
				response
			);
		}

		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(`Network error while deleting ${type}: ${error.message}`, 0, null);
	}
}

// Utility to build API endpoints
export function buildDeleteEndpoint(type, id) {
	const endpointMap = {
		'lost-and-found': `/api/lost-and-found/${id}`,
		'comment': `/api/comments/${id}`,
	};

	// Default pattern for most types
	return endpointMap[type] || `/api/${type}s/${id}`;
}