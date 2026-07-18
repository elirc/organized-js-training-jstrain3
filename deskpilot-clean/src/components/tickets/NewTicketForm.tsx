"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CustomerOption {
  id: string;
  name: string;
  email: string;
}

interface Props {
  customers: CustomerOption[];
}

export function NewTicketForm({ customers }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description, priority, customerId }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: { ticket: { id: string } };
        error?: { message: string };
      };
      if (!json.success || !json.data) {
        setError(json.error?.message ?? "Failed to create ticket.");
        return;
      }
      router.push(`/tickets/${json.data.ticket.id}`);
      router.refresh();
    } catch {
      setError("Unexpected network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface stack">
      <div className="stack">
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          className="input"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Short summary of the issue"
          required
        />
      </div>

      <div className="stack">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the issue in detail"
          required
        />
      </div>

      <div className="row">
        <div className="stack" style={{ flex: 1 }}>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            className="select"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="stack" style={{ flex: 1 }}>
          <label htmlFor="customer">Customer</label>
          <select
            id="customer"
            className="select"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            required
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="muted" style={{ color: "var(--danger)" }}>{error}</p> : null}

      <button type="submit" className="button" disabled={loading}>
        {loading ? "Creating..." : "Create Ticket"}
      </button>
    </form>
  );
}

