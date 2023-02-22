import { fauna } from "../../../services/faunaDB";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string
) {
  //console.log(subscriptionId, customerId);

  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };

  await fauna.query(
    q.Create(q.Collection("subscription"), { data: subscriptionData })
  );
}

/* 
    Esta função exportada salva uma assinatura. Ela recebe dois parâmetros: subscriptionId e customerId. 
    Primeiro, ela usa a função query do Fauna para procurar um usuário com o customerId fornecido. 
    Em seguida, ela usa a API Stripe para recuperar os detalhes da assinatura com o subscriptionId fornecido. 
    Os detalhes da assinatura são armazenados em uma variável chamada subscriptionData. 
    Por último, ela usa a função query do Fauna novamente para criar um documento na coleção de assinaturas 
    com os dados da assinatura armazenados na variável subscriptionData. 
*/
