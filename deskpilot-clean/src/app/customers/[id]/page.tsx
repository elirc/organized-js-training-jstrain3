import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCustomerById, listTickets } from "@/lib/store";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const customer = await getCustomerById(user.orgId, id);
  if (!customer) {
    notFound();
  }

  const tickets = (await listTickets(user.orgId)).filter((ticket) => ticket.customerId === customer.id);

  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="page-title">{customer.name}</h1>
        <Link href="/customers" className="button secondary">
          Back
        </Link>
      </div>

      <div className="surface stack">
        <p style={{ margin: 0 }}>{customer.email}</p>
        <p style={{ margin: 0 }} className="muted">
          {customer.company ?? "No company set"}
        </p>
        <p className="muted" style={{ margin: 0 }}>
          Portal token: <code>{customer.portalToken}</code>
        </p>
      </div>

      <div className="surface stack">
        <h3 style={{ margin: 0 }}>Ticket History</h3>
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="ticket-item">
              <div>
                <strong>
                  #{ticket.ticketNumber} {ticket.subject}
                </strong>
                <p className="ticket-meta">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div className="row">
                <span className="badge">{ticket.status}</span>
                <span className="badge">{ticket.priority}</span>
              </div>
            </Link>
          ))}
          {tickets.length === 0 ? <p className="muted">No tickets yet.</p> : null}
        </div>
      </div>
    </section>
  );
}

