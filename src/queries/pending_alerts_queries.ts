import { Database } from "sqlite";

export interface OverduePendingOrder {
  order_id: number;
  order_number: string;
  customer_name: string;
  phone: string | null;
  days_pending: number;
}

export async function getOverduePendingOrders(
  db: Database,
  thresholdDays: number = 3
): Promise<OverduePendingOrder[]> {
  return db.all(
    `SELECT
       o.id          AS order_id,
       o.order_number,
       c.first_name || ' ' || c.last_name AS customer_name,
       c.phone,
       CAST(julianday('now') - julianday(o.created_at) AS INTEGER) AS days_pending
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.status = 'pending'
       AND julianday('now') - julianday(o.created_at) > ?
     ORDER BY o.created_at`,
    [thresholdDays]
  );
}
