import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCustomers, listTickets } from "@/lib/store";

export default async function CustomersPage() {
  const user = await requireUser();
  const customers = await getCustomers(user.orgId);
  const tickets = await listTickets(user.orgId);
  const countByCustomer = new Map<string, number>();
  for (const ticket of tickets) {
    countByCustomer.set(ticket.customerId, (countByCustomer.get(ticket.customerId) ?? 0) + 1);
  }

  return (
    <section className="stack">
      <h1 className="page-title">Customers</h1>
      <div className="ticket-list">
        {customers.map((customer) => (
          <Link key={customer.id} href={`/customers/${customer.id}`} className="ticket-item">
            <div className="stack" style={{ gap: 6 }}>
              <strong>{customer.name}</strong>
              <p className="ticket-meta">
                {customer.email}
                {customer.company ? ` · ${customer.company}` : ""}
              </p>
            </div>
            <span className="badge">{countByCustomer.get(customer.id) ?? 0} tickets</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

