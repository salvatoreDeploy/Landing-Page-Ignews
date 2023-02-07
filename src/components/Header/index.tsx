/* eslint-disable @next/next/no-img-element */
import { SignGithub } from "../SignGithub";
import styles from "./styles.module.scss";
export function Header() {
  return (
    <>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <img src="/images/logoimg.svg" alt="ig.news" />
          <nav>
            <a className={styles.active} href="#">
              Home
            </a>
            <a href="#">Post</a>
          </nav>
          <SignGithub />
        </div>
      </header>
    </>
  );
}
