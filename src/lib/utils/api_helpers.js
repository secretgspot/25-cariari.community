/**
 * Generic delete function for API endpoints
 * @param {string} endpoint - The API endpoint to call
 * @param {string} type - The type of item being deleted (for error messages)
 * @throws {Error} If the delete operation fails
 */
export async function deleteItem(endpoint, type) {
	console.log(`Attempting to delete ${type} at: ${endpoint}`);

	const response = await fetch(endpoint, {
		method: 'DELETE',
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || `Failed to delete ${type}`);
	}

	return response;
}

