import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripe } from "../../services/stripe";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const session = await getSession({ req });

    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    });

    const stripeCheckouSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: "price_1LrP8cCVspEyOmdx9u14p3oJ", quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: "http://localhost:3000/posts",
      cancel_url: "http://localhost:3000",
    });

    return res.status(200).json({ sessionId: stripeCheckouSession.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
