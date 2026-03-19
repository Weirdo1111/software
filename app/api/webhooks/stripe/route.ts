import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

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

  const supabase = createSupabaseServiceClient();

  if (supabase) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await supabase.from("subscriptions").upsert(
        {
          user_id: session.client_reference_id,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
          status: "active",
        },
        { onConflict: "stripe_subscription_id" },
      );
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
    }
  }

  return NextResponse.json({ received: true });
}
