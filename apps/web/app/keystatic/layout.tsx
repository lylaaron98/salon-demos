import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cmsEnabled } from "@/lib/cms";
import KeystaticApp from "./keystatic";
import styles from "./keystatic.module.css";

export const metadata: Metadata = {
  title: "Content editor",
  robots: { index: false, follow: false },
};

export default function KeystaticLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (!cmsEnabled) {
    return (
      <main id="main" className={styles.notice}>
        <h1>Content editor</h1>
        <p>
          The content editor isn&apos;t connected on this deployment yet. Once the site&apos;s
          GitHub app is set up, editors sign in here with GitHub and every save publishes through a
          commit.
        </p>
        <p>
          <Link href="/">Back to the site</Link>
        </p>
      </main>
    );
  }
  return (
    <>
      <KeystaticApp />
      {children}
    </>
  );
}
