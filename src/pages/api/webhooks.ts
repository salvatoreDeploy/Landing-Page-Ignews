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

const relevantEvents = new Set(["checkout.session.completed"]);

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
          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString()
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
  Função de retorno padrão para uma API do Next.js. A função aceita um pedido e uma resposta da API como parâmetros. 
  Se o método for "POST", a função começa a executar o código. 
  Primeiro, ela usa a função buffer() para ler os dados do pedido e armazená-los em um buffer. 
  Em seguida, ela obtém o segredo do cabeçalho "stripe-signature" e usa a função stripe.webhooks.constructEvent() 
  para construir um evento Stripe com os dados lidos e o segredo recebido.
  A variável relevantEvents é um conjunto contendo o evento "checkout.session.completed". 
  Se o tipo de evento coincidir com esse evento, a função executará a lógica necessária para salvar a assinatura e o cliente na base de dados. 
  Por fim, ela retornará uma resposta JSON indicando que o pedido foi recebido com sucesso. Se nenhum dos eventos relevantes for encontrado, 
  será lançada uma exceção informando que nenhum manipulador foi encontrado para esse tipo de evento. 
  Se o método não for "POST", será enviada uma resposta HTTP 405 indicando que esse método não é permitido na rota da API atualmente em execução.

*/
