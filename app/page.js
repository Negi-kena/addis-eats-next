import Link from "next/link";
import { getSpecials } from "@/lib/dishes";
import DishList from "@/components/DishList";
import styles from "./page.module.css";

export default function HomePage() {
  const specials = getSpecials();

  return (
    <section>
      <div className={styles.hero}>
        <h1>Addis Eats</h1>
        <p>Authentic Ethiopian flavours, delivered warm across Addis Ababa.</p>
        <Link href="/menu" className={styles.menuLink}>
          View full menu →
        </Link>
      </div>

      <h2 className={styles.sectionHeading}>Today&apos;s specials</h2>
      <DishList dishes={specials} />
    </section>
  );
}
