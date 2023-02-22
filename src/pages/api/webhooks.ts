/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);

    const secret = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );

            break;
          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );

            break;
          default:
            throw new Error("Unhandled event");
        }
      } catch (err) {
        return res.json({ error: "Webhook handler failed" });
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};

/* 
  Este código é uma função de retorno padrão para uma API Next.js. 
  Ela é chamada quando um cliente faz uma solicitação POST para a API. 
  A função começa verificando se a solicitação é do tipo POST. Se for, 
  ela usa o método buffer() para ler os dados da solicitação e armazená-los em um buffer. 
  Em seguida, ela obtém o segredo da header da solicitação e tenta construir um evento Stripe usando os dados do buffer e a secret.
  Se a construção do evento for bem-sucedida, ela verificará se o tipo de evento está contido no conjunto relevantEvents. 
  Se estiver, ela executará um bloco switch com base no tipo de evento para salvar as informações relevantes na base de dados. 
  Por fim, ela envia uma resposta JSON com o status recebido com sucesso. 
  Se a solicitação não for do tipo POST, ela definirá o cabeçalho Allow com o método POST permitido e 
  enviará uma resposta 405 (Método não permitido).
*/
