import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const input = searchParams.get("input");
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "API key is not configured." },
            { status: 500 }
        );
    }

    if (!input) {
        return NextResponse.json(
            { error: "Input query parameter is required." },
            { status: 400 }
        );
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
    )}&key=${apiKey}&types=address`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            // Google often sends error details in the body even with a non-200 status
            const errorMessage = data.error_message || data.status || "Failed to fetch from Google Places API.";
            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        // Define the type for a prediction object
        type Prediction = {
            description: string;
            place_id: string;
            // Add other fields if needed
        };

        // We only need the address description from the response
        const suggestions = data.predictions.map((p: Prediction) => ({
            description: p.description,
            place_id: p.place_id,
        }));

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error("Places API proxy error:", error);
        return NextResponse.json(
            { error: "An internal error occurred." },
            { status: 500 }
        );
    }
}
