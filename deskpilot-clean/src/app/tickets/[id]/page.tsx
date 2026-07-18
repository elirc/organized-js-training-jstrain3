import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentComposer } from "@/components/tickets/CommentComposer";
import { TicketActions } from "@/components/tickets/TicketActions";
import { requireUser } from "@/lib/auth";
import { getCustomerById, getTicketById, getTimeline, readDb } from "@/lib/store";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const ticket = await getTicketById(user.orgId, id);
  if (!ticket) {
    notFound();
  }

  const customer = await getCustomerById(user.orgId, ticket.customerId);
  const timeline = await getTimeline(user.orgId, ticket.id);
  const db = await readDb();
  const userMap = new Map(db.users.map((item) => [item.id, item.name]));
  const customerMap = new Map(db.customers.map((item) => [item.id, item.name]));

  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            #{ticket.ticketNumber} {ticket.subject}
          </h1>
          <p className="muted">
            {ticket.status} · {ticket.priority} · {customer?.name ?? "Unknown customer"}
          </p>
        </div>
        <Link href="/tickets" className="button secondary">
          Back to Tickets
        </Link>
      </div>

      <div className="surface stack">
        <h3 style={{ margin: 0 }}>Ticket Details</h3>
        <p>{ticket.description}</p>
        <div className="row">
          {ticket.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
          {ticket.tags.length === 0 ? <span className="muted">No tags</span> : null}
        </div>
      </div>

      <div className="row" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 2 }} className="stack">
          <div className="surface stack">
            <h3 style={{ margin: 0 }}>Timeline</h3>
            <div className="timeline">
              {timeline.map((entry) => (
                <div className="timeline-item" key={`${entry.kind}-${entry.createdAt}-${entry.comment?.id ?? entry.event?.id}`}>
                  {entry.kind === "comment" && entry.comment ? (
                    <div className="stack" style={{ gap: 4 }}>
                      <strong>
                        {entry.comment.authorType === "agent"
                          ? userMap.get(entry.comment.authorUserId ?? "") ?? "Agent"
                          : customerMap.get(entry.comment.authorCustomerId ?? "") ?? "Customer"}
                        {entry.comment.isInternal ? " (internal note)" : ""}
                      </strong>
                      <p style={{ margin: 0 }}>{entry.comment.bodyText}</p>
                      <span className="ticket-meta">{new Date(entry.comment.createdAt).toLocaleString()}</span>
                    </div>
                  ) : null}
                  {entry.kind === "event" && entry.event ? (
                    <div className="stack" style={{ gap: 4 }}>
                      <strong>{entry.event.eventType}</strong>
                      <span className="ticket-meta">{new Date(entry.event.createdAt).toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <CommentComposer ticketId={ticket.id} />
        </div>
        <div style={{ flex: 1 }} className="stack">
          <TicketActions ticketId={ticket.id} status={ticket.status} />
          <div className="surface stack">
            <h3 style={{ margin: 0 }}>Customer</h3>
            <p style={{ margin: 0 }}>{customer?.name ?? "Unknown"}</p>
            <p style={{ margin: 0 }} className="muted">
              {customer?.email ?? ""}
            </p>
            {customer ? (
              <Link href={`/customers/${customer.id}`} className="button secondary">
                View Profile
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

