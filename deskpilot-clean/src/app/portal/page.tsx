import Link from "next/link";
import { PortalTicketCreateForm } from "@/components/portal/PortalTicketCreateForm";
import { readDb } from "@/lib/store";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "portal_alice_token";
  const db = await readDb();
  const customer = db.customers.find((item) => item.portalToken === token);
  const tickets = customer ? db.tickets.filter((ticket) => ticket.customerId === customer.id && !ticket.isMerged) : [];

  return (
    <section className="stack">
      <h1 className="page-title">Customer Portal</h1>
      <p className="muted">
        Demo token: <code>{token}</code>
      </p>
      <PortalTicketCreateForm />

      <div className="surface stack">
        <h3 style={{ margin: 0 }}>Your Tickets</h3>
        {customer ? (
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/portal/${ticket.id}?token=${encodeURIComponent(token)}`} className="ticket-item">
                <div>
                  <strong>
                    #{ticket.ticketNumber} {ticket.subject}
                  </strong>
                  <p className="ticket-meta">{new Date(ticket.updatedAt).toLocaleString()}</p>
                </div>
                <div className="row">
                  <span className="badge">{ticket.status}</span>
                  <span className="badge">{ticket.priority}</span>
                </div>
              </Link>
            ))}
            {tickets.length === 0 ? <p className="muted">No portal tickets yet.</p> : null}
          </div>
        ) : (
          <p className="muted">Invalid token. Use a valid portal token from a customer profile.</p>
        )}
      </div>
    </section>
  );
}

