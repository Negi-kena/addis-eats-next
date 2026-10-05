import { notFound } from "next/navigation";
import Link from "next/link";
import { getDishById, getDishes } from "@/lib/dishes";
import { formatCurrency } from "@/lib/formatCurrency";
import AddToCartButton from "@/components/AddToCartButton";
import styles from "./page.module.css";

export function generateStaticParams() {
  return getDishes().map((d) => ({ id: String(d.id) }));
}

export default async function DishPage({ params }) {
  const { id } = await params; // Next 16: params is async
  const dish = getDishById(id);

  if (!dish) {
    notFound();
  }

  return (
    <article className={styles.article}>
      <Link href="/menu" className={styles.back}>
        ← Back to menu
      </Link>

      <div className={styles.layout}>
        {dish.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dish.image} alt={dish.name} className={styles.image} />
        )}

        <div className={styles.info}>
          <h1>{dish.name}</h1>
          <p className={styles.description}>{dish.description}</p>
          <p className={styles.price}>{formatCurrency(dish.price)}</p>
          <p className={styles.meta}>
            {dish.category}
            {dish.diet ? ` · ${dish.diet}` : ""}
          </p>

          {dish.ingredients?.length > 0 && (
            <p className={styles.ingredients}>
              <strong>Ingredients:</strong> {dish.ingredients.join(", ")}
            </p>
          )}

          {dish.available === false && (
            <p className={styles.unavailable}>Currently unavailable</p>
          )}

          <div className={styles.action}>
            <AddToCartButton dish={dish} />
          </div>
        </div>
      </div>
    </article>
  );
}
