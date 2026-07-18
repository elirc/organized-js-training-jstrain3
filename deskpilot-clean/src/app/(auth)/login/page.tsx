import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="stack">
      <h1 className="page-title">Login</h1>
      <div className="surface stack">
        <p className="muted" style={{ margin: 0 }}>
          Authentication wiring is scaffolded for DeskPilot. The current MVP runs with a seeded signed-in admin user.
        </p>
        <Link href="/tickets" className="button">
          Continue to DeskPilot
        </Link>
      </div>
    </section>
  );
}

