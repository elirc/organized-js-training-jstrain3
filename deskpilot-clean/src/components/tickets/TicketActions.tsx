"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TicketStatus } from "@/lib/types";

interface Props {
  ticketId: string;
  status: TicketStatus;
}

const transitions: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress", "waiting_on_customer", "blocked", "resolved", "closed"],
  in_progress: ["waiting_on_customer", "blocked", "resolved", "closed"],
  waiting_on_customer: ["in_progress", "blocked", "resolved", "closed"],
  blocked: ["in_progress", "resolved", "closed"],
  resolved: ["in_progress", "closed"],
  closed: ["in_progress"],
};

export function TicketActions({ ticketId, status }: Props) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<TicketStatus>(transitions[status][0] ?? status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTransition() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/tickets/${ticketId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStatus }),
      });
      const json = (await response.json()) as { success: boolean; error?: { message: string } };
      if (!json.success) {
        setError(json.error?.message ?? "Transition failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  const allowed = transitions[status];

  return (
    <div className="surface stack">
      <h3 style={{ margin: 0 }}>Status Transition</h3>
      <div className="row">
        <span className="badge">Current: {status}</span>
      </div>
      {allowed.length > 0 ? (
        <>
          <select
            className="select"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as TicketStatus)}
          >
            {allowed.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button type="button" className="button" onClick={handleTransition} disabled={loading}>
            {loading ? "Applying..." : "Apply Transition"}
          </button>
        </>
      ) : (
        <p className="muted">No transitions available.</p>
      )}
      {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
    </div>
  );
}

