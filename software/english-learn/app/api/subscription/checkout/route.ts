import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { env } from "@/lib/env";

const schema = z.object({
  price_id: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    if (!env.server.STRIPE_SECRET_KEY) {
      return NextResponse.json({ checkout_url: `/pricing?mockCheckout=1&price=${payload.price_id}` });
    }

    const stripe = new Stripe(env.server.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });

    const appUrl = env.server.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price:
            payload.price_id === "yearly"
              ? env.server.STRIPE_PRICE_YEARLY || payload.price_id
              : env.server.STRIPE_PRICE_MONTHLY || payload.price_id,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/pricing?success=1`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to create checkout session", 500);
  }
}
