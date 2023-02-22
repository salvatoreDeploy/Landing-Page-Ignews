import { fauna } from "../../../services/faunaDB";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
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

  if (createAction) {
    await fauna.query(
      q.Create(q.Collection("subscription"), { data: subscriptionData })
    );
  } else {
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(q.Match(q.Index("subscription_by_id"), subscriptionId))
        ),
        { data: subscriptionData }
      )
    );
  }
}

/* 
  Esta função salva uma assinatura. 
  Ela recebe três parâmetros: subscriptionId, customerId e createAction (opcional). 
  Primeiro, ela usa o customerId para obter a referência do usuário. 
  Em seguida, ela recupera os detalhes da assinatura do Stripe usando o subscriptionId. 
  Os dados da assinatura são armazenados em uma variável chamada subscriptionData.
  Se o parâmetro createAction for verdadeiro, a função criará um novo documento na coleção de assinaturas com os dados da assinatura. 
  Caso contrário, ela substituirá o documento existente com os novos dados.
*/
