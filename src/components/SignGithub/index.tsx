/* eslint-disable @next/next/no-img-element */
import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import styles from "./styles.module.scss";
import { signIn, signOut, useSession } from "next-auth/react";

export function SignGithub() {
  const { data: session } = useSession();

  //console.log(session);

  return session ? (
    <button
      type="button"
      onClick={() => signOut()}
      className={styles.signButton}
    >
      <img src={session.user.image} alt="" />
      {session.user.name}
      <FiX color="#737380" className={styles.closedIcon} />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => signIn("github")}
      className={styles.signButton}
    >
      <FaGithub color="#eba407" />
      Sign in width Github
    </button>
  );
}
