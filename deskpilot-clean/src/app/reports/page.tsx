import { requireUser } from "@/lib/auth";
import { listTickets } from "@/lib/store";

export default async function ReportsPage() {
  const user = await requireUser();
  const tickets = await listTickets(user.orgId);

  const open = tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status)).length;
  const resolved = tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status)).length;
  const urgent = tickets.filter((ticket) => ticket.priority === "urgent").length;
  const waiting = tickets.filter((ticket) => ticket.status === "waiting_on_customer").length;

  return (
    <section className="stack">
      <h1 className="page-title">Reports Overview</h1>
      <div className="row">
        <article className="surface" style={{ minWidth: 180 }}>
          <p className="muted">Open Tickets</p>
          <h2 style={{ margin: 0 }}>{open}</h2>
        </article>
        <article className="surface" style={{ minWidth: 180 }}>
          <p className="muted">Resolved/Closed</p>
          <h2 style={{ margin: 0 }}>{resolved}</h2>
        </article>
        <article className="surface" style={{ minWidth: 180 }}>
          <p className="muted">Urgent Tickets</p>
          <h2 style={{ margin: 0 }}>{urgent}</h2>
        </article>
        <article className="surface" style={{ minWidth: 180 }}>
          <p className="muted">Waiting On Customer</p>
          <h2 style={{ margin: 0 }}>{waiting}</h2>
        </article>
      </div>

      <div className="surface stack">
        <h3 style={{ margin: 0 }}>Status Distribution</h3>
        <ul style={{ margin: 0 }}>
          {["open", "in_progress", "waiting_on_customer", "blocked", "resolved", "closed"].map((status) => (
            <li key={status}>
              {status}: {tickets.filter((ticket) => ticket.status === status).length}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

