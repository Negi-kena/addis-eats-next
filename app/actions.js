"use server";

import { redirect } from "next/navigation";
import { orderSchema } from "@/lib/validation";
import { getDishById } from "@/lib/dishes";
import { getDeliveryEstimate } from "@/lib/delivery";
import { saveOrder } from "@/lib/orders-store";

export async function placeOrder(formData) {
  const raw = {
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    area: formData.get("area") ?? "",
    note: formData.get("note") ?? "",
    items: safeParseItems(formData.get("items")),
  };

  const parsed = orderSchema.safeParse(raw);

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    const firstField = Object.keys(fieldErrors)[0] ?? "form";
    const firstMessage = fieldErrors[firstField]?.[0] ?? "Please check your order details.";
    // redirect() must never be inside a try/catch — it works by throwing
    // internally, and a catch block would swallow that throw.
    redirect(
      `/checkout?error=1&field=${encodeURIComponent(firstField)}&message=${encodeURIComponent(firstMessage)}`
    );
  }

  const { name, phone, area, note, items } = parsed.data;

  // Recompute everything server-side. A hidden form field can be edited
  // by anyone before submit — only the server's own dish data and
  // delivery table are trusted for money. This is our version of the
  // brief's "authorisation checked inside the action" requirement.
  const lineItems = [];
  for (const line of items) {
    const dish = getDishById(line.id);
    if (!dish) {
      redirect(
        `/checkout?error=1&field=form&message=${encodeURIComponent(
          "One of the items in your cart is no longer available."
        )}`
      );
    }
    lineItems.push({ id: dish.id, name: dish.name, price: dish.price, quantity: line.quantity });
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { fee: deliveryFee, etaLabel } = getDeliveryEstimate(area);
  const total = subtotal + deliveryFee;

  const order = saveOrder({
    customer: { name, phone, area, note },
    items: lineItems,
    subtotal,
    deliveryFee,
    etaLabel,
    total,
    status: "Pending",
  });

  redirect(`/checkout?order=${order.id}`);
}

function safeParseItems(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}