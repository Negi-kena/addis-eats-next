import DishCard from "./DishCard";
import styles from "./DishList.module.css";

export default function DishList({ dishes }) {
  if (!dishes || dishes.length === 0) {
    return <p className={styles.empty}>No dishes found.</p>;
  }
  return (
    <div className={styles.grid}>
      {dishes.map((dish) => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}
