import { Polar } from "@polar-sh/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
});

export async function GET(req: NextRequest) {
    const { userId: clerkUserId } = auth();

    if (!clerkUserId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await fetchQuery(api.users.getUserByClerkId, { clerkId: clerkUserId });

    if (!user) {
        return new NextResponse("User not found in Convex", { status: 404 });
    }

    const planId = process.env.NEXT_PUBLIC_POLAR_PLAN_ID;
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`;

    if (!planId) {
        return new NextResponse("Plan ID not configured", { status: 500 });
    }

    try {
        const checkoutSession = await polar.checkouts.create({
            product_id: planId,
            success_url: successUrl,
            customer_email: user.email,
            metadata: {
                userId: user._id, // Pass Convex user ID in metadata
            }
        });

        if (checkoutSession.url) {
            return NextResponse.json({ url: checkoutSession.url });
        } else {
            return new NextResponse("Could not create checkout session", { status: 500 });
        }
    } catch (error) {
        console.error("[CHECKOUT_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}