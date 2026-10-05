import { readFileSync } from "fs";
import { join } from "path";

let cached = null;

function loadDishes() {
  if (cached) return cached;
  const path = join(process.cwd(), "public", "menu-data.json");
  const raw = readFileSync(path, "utf8");
  cached = JSON.parse(raw).map((d) => ({
    ...d,
    image: d.image?.startsWith("/") ? d.image : `/${d.image}`,
  }));
  return cached;
}

export const CATEGORIES = ["ethiopian", "pizza", "burgers", "drinks"];

export function getDishes() {
  return loadDishes();
}

export function getDishById(id) {
  return loadDishes().find((d) => String(d.id) === String(id)) ?? null;
}

export function getSpecials() {
  return loadDishes().filter((d) => d.popular && d.available !== false);
}

export function getAvailableDishes() {
  return loadDishes().filter((d) => d.available !== false);
}

export function getDishesByCategory(category) {
  const list = getAvailableDishes();
  if (!category || category === "all") return list;
  return list.filter((d) => d.category === category);
}