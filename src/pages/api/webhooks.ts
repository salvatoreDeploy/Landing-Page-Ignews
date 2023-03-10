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
  Este c??digo ?? uma fun????o de retorno padr??o para uma API Next.js. 
  Ela ?? chamada quando um cliente faz uma solicita????o POST para a API. 
  A fun????o come??a verificando se a solicita????o ?? do tipo POST. Se for, 
  ela usa o m??todo buffer() para ler os dados da solicita????o e armazen??-los em um buffer. 
  Em seguida, ela obt??m o segredo da header da solicita????o e tenta construir um evento Stripe usando os dados do buffer e a secret.
  Se a constru????o do evento for bem-sucedida, ela verificar?? se o tipo de evento est?? contido no conjunto relevantEvents. 
  Se estiver, ela executar?? um bloco switch com base no tipo de evento para salvar as informa????es relevantes na base de dados. 
  Por fim, ela envia uma resposta JSON com o status recebido com sucesso. 
  Se a solicita????o n??o for do tipo POST, ela definir?? o cabe??alho Allow com o m??todo POST permitido e 
  enviar?? uma resposta 405 (M??todo n??o permitido).
*/
