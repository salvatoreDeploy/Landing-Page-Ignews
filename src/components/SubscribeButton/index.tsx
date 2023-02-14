import { signIn, useSession } from "next-auth/react";
import { api } from "../../services/api";
import { getStripeClient } from "../../services/stripeClient";
import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session } = useSession();
  async function handlerSubscribe() {
    if (!session) {
      signIn("github");
      return;
    }

    try {
      const response = await api.post("/subscribe");

      const { sessionId } = response.data;

      const stripe = await getStripeClient();

      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err.message);
    }
  }
  return (
    <button
      type="button"
      onClick={handlerSubscribe}
      className={styles.subscribeButton}
    >
      Subscribe Now
    </button>
  );
}
