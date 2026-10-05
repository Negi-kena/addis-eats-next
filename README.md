# Addis Eats — Next.js Foundations Project

Day 35's Addis Eats (React/Vite), rebuilt on Next.js App Router: file-based routing,
nested layouts, a deliberate rendering strategy per route, server components reading
their own data, and real endpoints/actions behind the UI — per the Day 40 brief.

Full reasoning lives in [`STRATEGY.md`](./STRATEGY.md) (rendering strategy, one line
per route) and [`BOUNDARY.md`](./BOUNDARY.md) (server/client boundary, one line per
component).

## Stack

- Next.js 16.3.6 (App Router, Turbopack)
- React 19.2.8
- zod — shared validation schema, used by both the server action and the route handler
- Real Day 35 data: `public/menu-data.json` (18 dishes), `public/images/`

## Routes

| Route         | Strategy                  | Notes |
|---------------|----------------------------|-------|
| `/`           | Static                     | Today's specials from `lib/dishes.js` |
| `/menu`       | ISR, `revalidate = 3600`   | Category filter is client-side state, not `searchParams` — keeps this static/ISR |
| `/menu/[id]`  | Static via params          | `generateStaticParams` prerenders all 18 dishes; `notFound()` on unknown id |
| `/cart`       | Client (static shell)      | `localStorage`-persisted cart, private to the browser tab |
| `/checkout`   | Dynamic                    | Reads `searchParams` for the confirmation/error state after the server action redirects back |

## Endpoints

Our own pages never call these — they read `lib/dishes.js` / `lib/orders-store.js`
directly, or go through the `placeOrder` server action. These exist for callers
outside our own UI.

### `GET /api/dishes`
Returns the full dish list.

curl localhost:3000/api/dishes
→ `200`, JSON array of 18 dishes.

### `GET /api/dishes/[id]`
Single dish by id.

curl -i localhost:3000/api/dishes/1
curl -i localhost:3000/api/dishes/not-a-dish

→ `200` with the dish, or `404` — `{"error":"Dish not found: not-a-dish"}`

### `POST /api/orders`
Validates with the same `orderSchema` (zod) the server action uses. Recomputes
price and delivery fee from trusted server-side data — never trusts a client-
submitted total.

Invalid:

$body = '{"name":"Almaz","phone":"0912"}'
curl -i -X POST localhost:3000/api/orders -H "Content-Type: application/json" -d $body

→ `422` —
```json
{"error":"Validation failed.","fieldErrors":{"phone":["Enter a valid Ethiopian phone number (e.g. 0912 345 678)."],"area":["Invalid option: expected one of \"bole\"|\"piazza\"|\"cmc\"|\"megenagna\"|\"sarbet\""],"items":["Invalid input: expected array, received undefined"]}}
```

Valid:

$body = '{"name":"Almaz","phone":"0912345678","area":"bole","items":[{"id":1,"quantity":2}]}'
curl -i -X POST localhost:3000/api/orders -H "Content-Type: application/json" -d $body

→ `201` — real order object with server-computed `subtotal`, `deliveryFee`, `total`, a generated `id` (`AE-XXXX`), and `status: "Pending"`.

### `placeOrder` (server action, `app/actions.js`)
Bound directly to the checkout `<form action={placeOrder}>` — a real HTML form
post, not a `fetch` call, so it works with JavaScript disabled. Validates with the
same shared schema as the route handler above, recomputes the trusted total
server-side, saves the order, and redirects to `/checkout?order=<id>` on success
or `/checkout?error=1&field=...&message=...` on failure.

## The six failure checks (run on `npm run build && npm run start`)

| Check | Result |
|---|---|
| Throttle to Slow 3G on `/menu` | `app/menu/loading.js` skeleton shows before real content |
| Throw inside `/menu` (temporarily forced dynamic to test at request time, since `/menu` is normally static) | `app/menu/error.js` renders; header/nav from `app/layout.js` stayed visible around it |
| Open `/menu/not-a-dish` | `app/menu/[id]/not-found.js` renders, no crash |
| Post an invalid phone through the real checkout form | Redirects back with the field-specific error shown beside the phone input |
| Disable JavaScript, submit checkout | Order still places — real `<form action={placeOrder}>`, no `fetch` dependency |
| Search the built bundle for secrets | Nothing sensitive found (no env vars/credentials exist in this project yet) |

## Build output


▲ Next.js 16.3.6 (Turbopack)

Route (app) Revalidate Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/dishes
├ ƒ /api/dishes/[id]
├ ƒ /api/orders
├ ○ /cart
├ ƒ /checkout
├ ○ /menu 1h 1y
└ /menu/[id]
├ ● /menu/1
├ ● /menu/2
├ ● /menu/3
└ ● [+15 more paths]

○ (Static) prerendered as static content
● (SSG) prerendered as static HTML (uses generateStaticParams)
ƒ (Dynamic) server-rendered on demand



Matches [`STRATEGY.md`](./STRATEGY.md) line for line.

## Running locally

```powershell
npm install
npm run build
npm run start
```

Visit `http://localhost:3000`.