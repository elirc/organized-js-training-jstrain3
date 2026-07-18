"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  ticketId: string;
  portalToken: string;
}

export function PortalReplyForm({ ticketId, portalToken }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/portal/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalToken, body }),
      });
      const json = (await response.json()) as { success: boolean; error?: { message: string } };
      if (!json.success) {
        setError(json.error?.message ?? "Failed to post reply.");
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="surface stack">
      <h3 style={{ margin: 0 }}>Reply</h3>
      <textarea className="textarea" value={body} onChange={(event) => setBody(event.target.value)} />
      {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
      <button type="submit" className="button" disabled={loading}>
        {loading ? "Posting..." : "Post Reply"}
      </button>
    </form>
  );
}

