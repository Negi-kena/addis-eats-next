import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import AddToCartButton from "./AddToCartButton";
import styles from "./DishCard.module.css";

export default function DishCard({ dish }) {
  return (
    <article className={styles.card}>
      <Link href={`/menu/${dish.id}`} className={styles.link}>
        {dish.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dish.image} alt={dish.name} className={styles.image} />
        )}
        <div className={styles.body}>
          <h3 className={styles.name}>{dish.name}</h3>
          <p className={styles.description}>{dish.description}</p>
          <p className={styles.price}>{formatCurrency(dish.price)}</p>
        </div>
      </Link>
      <div className={styles.footer}>
        <AddToCartButton dish={dish} />
      </div>
    </article>
  );
}
