import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import styles from "./styles.module.scss";
export function SignGithub() {
  const isUserLoggedIn = true;

  return isUserLoggedIn ? (
    <button type="button" className={styles.signButton}>
      <FaGithub color="#04D361" />
      Henrique Araujo
      <FiX color="#737380" className={styles.closedIcon} />
    </button>
  ) : (
    <button type="button" className={styles.signButton}>
      <FaGithub color="#eba407" />
      Sign in width Github
    </button>
  );
}
