import { ingest } from "@/ingest/client";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Polar, Webhook } from "@polar-sh/sdk";

const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = headers().get('polar-webhook-signature');
    const secret = process.env.POLAR_WEBHOOK_SECRET;

    if (!sig || !secret) {
        return new NextResponse("Webhook secret not configured", { status: 400 });
    }

    let event: Webhook;
    try {
        event = polar.webhooks.constructEvent(body, sig, secret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Send the verified event to Ingest for reliable processing
    await ingest.send({
        name: "polar/webhook.received",
        data: {
            payload: event,
        },
    });

    return new NextResponse(null, { status: 200 });
}