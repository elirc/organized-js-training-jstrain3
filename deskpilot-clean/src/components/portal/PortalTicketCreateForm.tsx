"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PortalTicketCreateForm() {
  const router = useRouter();
  const [portalToken, setPortalToken] = useState("portal_alice_token");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalToken, subject, description, priority }),
      });
      const json = (await response.json()) as { success: boolean; data?: { ticket: { id: string } }; error?: { message: string } };
      if (!json.success || !json.data) {
        setError(json.error?.message ?? "Failed to create portal ticket.");
        return;
      }
      router.push(`/portal/${json.data.ticket.id}?token=${encodeURIComponent(portalToken)}`);
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="surface stack" onSubmit={submit}>
      <h3 style={{ margin: 0 }}>Submit Ticket</h3>
      <div className="stack">
        <label htmlFor="portal-token">Portal Token</label>
        <input
          id="portal-token"
          className="input"
          value={portalToken}
          onChange={(event) => setPortalToken(event.target.value)}
          required
        />
      </div>
      <div className="stack">
        <label htmlFor="portal-subject">Subject</label>
        <input id="portal-subject" className="input" value={subject} onChange={(event) => setSubject(event.target.value)} required />
      </div>
      <div className="stack">
        <label htmlFor="portal-description">Description</label>
        <textarea
          id="portal-description"
          className="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>
      <div className="stack">
        <label htmlFor="portal-priority">Priority</label>
        <select id="portal-priority" className="select" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
      <button type="submit" className="button" disabled={loading}>
        {loading ? "Submitting..." : "Submit Ticket"}
      </button>
    </form>
  );
}

