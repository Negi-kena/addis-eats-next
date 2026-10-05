import "./globals.css";
import Link from "next/link";
import Providers from "@/components/Providers";
import CartBadge from "@/components/CartBadge";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import styles from "./layout.module.css";

export const metadata = {
  title: "Addis Eats",
  description: "Ethiopian food ordering — Next.js foundations",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <Link href="/" className={styles.brand}>
                <Logo size={34} />
                <span>Addis Eats</span>
              </Link>
              <nav className={styles.nav}>
                <Link href="/menu">Menu</Link>
                <Link href="/cart" className={styles.cartLink}>
                  Cart
                  <CartBadge />
                </Link>
                <Link href="/checkout">Checkout</Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="container">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}