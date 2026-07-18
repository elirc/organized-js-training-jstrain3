import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCustomers } from "@/lib/store";
import { NewTicketForm } from "@/components/tickets/NewTicketForm";

export default async function NewTicketPage() {
  const user = await requireUser();
  const customers = await getCustomers(user.orgId);

  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="page-title">Create Ticket</h1>
        <Link href="/tickets" className="button secondary">
          Back
        </Link>
      </div>
      <NewTicketForm customers={customers} />
    </section>
  );
}

