import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalReplyForm } from "@/components/portal/PortalReplyForm";
import { getTicketComments, getTicketById, readDb } from "@/lib/store";

export default async function PortalTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token = "" } = await searchParams;
  const db = await readDb();
  const customer = db.customers.find((item) => item.portalToken === token);
  if (!customer) {
    notFound();
  }

  const ticket = await getTicketById(customer.orgId, id);
  if (!ticket || ticket.customerId !== customer.id) {
    notFound();
  }

  const comments = (await getTicketComments(customer.orgId, ticket.id)).filter((comment) => !comment.isInternal);

  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            #{ticket.ticketNumber} {ticket.subject}
          </h1>
          <p className="muted">
            {ticket.status} · {ticket.priority}
          </p>
        </div>
        <Link href={`/portal?token=${encodeURIComponent(token)}`} className="button secondary">
          Back
        </Link>
      </div>

      <div className="surface stack">
        <h3 style={{ margin: 0 }}>Conversation</h3>
        <div className="timeline">
          {comments.map((comment) => (
            <div key={comment.id} className="timeline-item">
              <strong>{comment.authorType === "agent" ? "Support Agent" : customer.name}</strong>
              <p style={{ margin: "6px 0" }}>{comment.bodyText}</p>
              <span className="ticket-meta">{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {comments.length === 0 ? <p className="muted">No replies yet.</p> : null}
        </div>
      </div>

      <PortalReplyForm ticketId={ticket.id} portalToken={token} />
    </section>
  );
}

