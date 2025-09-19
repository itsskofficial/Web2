// src/frontend/app/api/[...slug]/route.ts
import { NextRequest, NextResponse } from "next/server";

// This is the base URL of our FastAPI backend, running in another Docker container.
const BACKEND_URL = process.env.BACKEND_API_URL;

/**
 * A generic API proxy handler that forwards requests from the Next.js frontend
 * to the FastAPI backend. This avoids CORS issues and hides the backend URL
 * from the client.
 */
async function handler(req: NextRequest) {
	// 1. Construct the full URL to the FastAPI endpoint.
	// req.nextUrl.pathname will be something like '/api/v1/population-growth'
	const backendUrl = `${BACKEND_URL}${req.nextUrl.pathname}${req.nextUrl.search}`;

	// 2. Check if the backend URL is configured.
	if (!BACKEND_URL) {
		return NextResponse.json(
			{ detail: "Backend service is not configured on the server." },
			{ status: 503 }
		);
	}

	try {
		// 3. Forward the request to the FastAPI backend.
		const apiResponse = await fetch(backendUrl, {
			method: req.method,
			headers: {
				// Forward the Authorization header from the client if it exists
				...(req.headers.get("Authorization") && { Authorization: req.headers.get("Authorization")! }),
				"Content-Type": "application/json",
			},
			// Include body only for relevant methods
			body:
				req.method !== "GET" && req.method !== "HEAD"
					? await req.text()
					: undefined,
			// Do not cache API requests. This is crucial for data mutations.
			cache: "no-store",
		});

		// --- FIX ---
		// If the response is 204 No Content, there is no body to parse.
		// Return a new response with the same status but a null body.
		if (apiResponse.status === 204) {
			return new NextResponse(null, { status: 204 });
		}

		// For all other responses, we expect a JSON body.
		const responseBody = await apiResponse.json();
		return NextResponse.json(responseBody, {
			status: apiResponse.status,
		});
	} catch (error) {
		console.error("API proxy error:", error);
		return NextResponse.json(
			{ detail: "An internal error occurred in the API proxy." },
			{ status: 500 }
		);
	}
}

// Export the handler for all common HTTP methods.
export {
	handler as GET,
	handler as POST,
	handler as PUT,
	handler as DELETE,
	handler as PATCH,
};
