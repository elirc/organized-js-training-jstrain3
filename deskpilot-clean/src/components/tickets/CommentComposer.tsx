"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  ticketId: string;
}

export function CommentComposer({ ticketId }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
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
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, isInternal }),
      });
      const json = (await response.json()) as { success: boolean; error?: { message: string } };
      if (!json.success) {
        setError(json.error?.message ?? "Failed to add comment.");
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
      <h3 style={{ margin: 0 }}>Add Comment</h3>
      <textarea
        className="textarea"
        placeholder="Write a public reply or internal note..."
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <label className="row" htmlFor="internal-note">
        <input
          id="internal-note"
          type="checkbox"
          checked={isInternal}
          onChange={(event) => setIsInternal(event.target.checked)}
        />
        Internal note
      </label>
      {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
      <button type="submit" className="button" disabled={loading}>
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}

