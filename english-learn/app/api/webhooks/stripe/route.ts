import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!env.server.STRIPE_SECRET_KEY || !env.server.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true, mock: true });
  }

  const stripe = new Stripe(env.server.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.server.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const rawUserId = typeof session.client_reference_id === "string" ? session.client_reference_id : null;
    const userId = rawUserId && /^\d+$/.test(rawUserId) ? BigInt(rawUserId) : null;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

    if (subscriptionId) {
      await prisma.subscription.upsert({
        where: {
          stripeSubscriptionId: subscriptionId,
        },
        update: {
          userId,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          status: "active",
        },
        create: {
          userId,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId: subscriptionId,
          status: "active",
        },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: "canceled",
      },
    });
  }

  return NextResponse.json({ received: true });
}
