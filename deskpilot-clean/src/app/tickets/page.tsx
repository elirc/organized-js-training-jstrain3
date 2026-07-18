import Link from "next/link";
import { listTickets, readDb } from "@/lib/store";
import { requireUser } from "@/lib/auth";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; q?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const tickets = await listTickets(user.orgId, {
    status: (params.status as "all") ?? "all",
    priority: (params.priority as "all") ?? "all",
    q: params.q,
  });
  const db = await readDb();
  const customerMap = new Map(db.customers.map((customer) => [customer.id, customer.name]));

  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="page-title">Tickets</h1>
        <Link href="/tickets/new" className="button">
          New Ticket
        </Link>
      </div>

      <form className="surface row" action="/tickets" method="GET">
        <input name="q" className="input" placeholder="Search subject/description" defaultValue={params.q ?? ""} />
        <select name="status" className="select" defaultValue={params.status ?? "all"} style={{ maxWidth: 180 }}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_on_customer">Waiting On Customer</option>
          <option value="blocked">Blocked</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select name="priority" className="select" defaultValue={params.priority ?? "all"} style={{ maxWidth: 160 }}>
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button type="submit" className="button secondary">
          Apply
        </button>
      </form>

      <div className="ticket-list">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="ticket-item">
            <div className="stack" style={{ gap: 6 }}>
              <strong>
                #{ticket.ticketNumber} {ticket.subject}
              </strong>
              <p className="ticket-meta">
                Customer: {customerMap.get(ticket.customerId) ?? "Unknown"} · Updated {new Date(ticket.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="row">
              <span className="badge">{ticket.status}</span>
              <span className="badge">{ticket.priority}</span>
            </div>
          </Link>
        ))}
        {tickets.length === 0 ? <p className="surface muted">No tickets match your filters.</p> : null}
      </div>
    </section>
  );
}

