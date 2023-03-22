/* eslint-disable @next/next/no-img-element */
import { SignGithub } from "../SignGithub";
import Link from "next/link";
import styles from "./styles.module.scss";
import { useRouter } from "next/router";
import { ActiveLink } from "../ActiveLInk";
export function Header() {
  const {} = useRouter();

  return (
    <>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <img src="/images/logoimg.svg" alt="ig.news" />
          <nav>
            <ActiveLink activeClassName={styles.active} href="/">
              <a>Home</a>
            </ActiveLink>
            <ActiveLink activeClassName={styles.active} href="/posts" prefetch>
              <a>Post</a>
            </ActiveLink>
          </nav>
          <SignGithub />
        </div>
      </header>
    </>
  );
}
