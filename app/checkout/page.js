import { getOrderById } from "@/lib/orders-store";
import { formatCurrency } from "@/lib/formatCurrency";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams; // Next 16: searchParams is async

  const orderId = params?.order;
  const order = orderId ? getOrderById(orderId) : null;

  if (order) {
    return (
      <section>
        <h1>Order confirmed!</h1>
        <p>
          Order {order.id} has been received. Estimated arrival in {order.etaLabel}.
        </p>
        <p>
          <strong>Total: {formatCurrency(order.total)}</strong>
        </p>
      </section>
    );
  }

  const error = params?.error === "1" ? { field: params.field, message: params.message } : null;

  return (
    <section>
      <h1>Checkout</h1>
      <CheckoutForm error={error} />
    </section>
  );
}