import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema.js";
import { sendSlackMessage } from "./slack.js";
import { getOverduePendingOrders } from "./queries/pending_alerts_queries.js";

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db, false);

  const overdueOrders = await getOverduePendingOrders(db, 3);

  for (const order of overdueOrders) {
    const phone = order.phone ?? "no phone on file";
    const message =
      `*Pending order alert* — Order #${order.order_number} has been pending for ` +
      `${order.days_pending} day(s).\n` +
      `Customer: ${order.customer_name} | Phone: ${phone}`;

    await sendSlackMessage("#order-alerts", message);
  }
}

main();
