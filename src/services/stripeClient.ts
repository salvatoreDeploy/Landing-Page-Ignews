import { loadStripe } from "@stripe/stripe-js";

export async function getStripeClient() {
  const stripeClient = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY
  );

  return stripeClient;
}
