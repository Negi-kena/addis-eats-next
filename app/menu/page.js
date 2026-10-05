import { getAvailableDishes, CATEGORIES } from "@/lib/dishes";
import CategoryBar from "@/components/CategoryBar";

export const revalidate = 3600;

export default function MenuPage() {
  const dishes = getAvailableDishes();

  return (
    <section>
      <h1>Menu</h1>
      <CategoryBar categories={CATEGORIES} dishes={dishes} />
    </section>
  );
}