import Link from "next/link";

export default function NotFound() {
  return (
    <section className="stack">
      <h1 className="page-title">Not Found</h1>
      <div className="surface stack">
        <p className="muted">The requested record or page does not exist.</p>
        <Link href="/tickets" className="button secondary">
          Go to Tickets
        </Link>
      </div>
    </section>
  );
}

