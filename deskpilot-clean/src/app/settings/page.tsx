export default function SettingsPage() {
  return (
    <section className="stack">
      <h1 className="page-title">Settings</h1>
      <div className="surface stack">
        <h3 style={{ margin: 0 }}>Team & Configuration</h3>
        <p className="muted" style={{ margin: 0 }}>
          This MVP includes foundational settings placeholders for SLA, tags, canned replies, members, and email.
        </p>
        <div className="row">
          <span className="badge">SLA Policies</span>
          <span className="badge">Tags</span>
          <span className="badge">Canned Replies</span>
          <span className="badge">Members</span>
          <span className="badge">Email</span>
        </div>
      </div>
    </section>
  );
}

