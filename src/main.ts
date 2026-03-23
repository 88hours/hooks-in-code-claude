import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getPendingOrders } from "./queries/order_queries";
import { sendSlackMessage } from "./slack";

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db, false);

  const staleOrders = await getPendingOrders(db, 3);
  for (const order of staleOrders) {
    const phone = order.phone ?? "no phone on file";
    const days = Math.floor(order.days_pending);
    await sendSlackMessage(
      "#order-alerts",
      `Pending order *${order.order_number}* has been waiting ${days} day(s).\n` +
        `Customer: ${order.customer_name} — ${phone}`
    );
  }
}

main();
