// In-memory — resets whenever the server restarts. That's a real
// limitation, acceptable for a foundations exercise; a production app
// would persist this to a database instead.
let orders = [];
let nextId = 2048;

export function saveOrder(order) {
  const id = `AE-${nextId++}`;
  const record = { id, createdAt: new Date().toISOString(), ...order };
  orders.unshift(record);
  return record;
}

export function getOrderById(id) {
  return orders.find((o) => o.id === id) ?? null;
}

export function getAllOrders() {
  return orders;
}