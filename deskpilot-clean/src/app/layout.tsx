import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeskPilot",
  description: "Support ticket system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div>
              <p className="brand-title">DeskPilot</p>
              <p className="brand-subtitle">Acme Support</p>
            </div>
            <nav className="nav">
              <Link href="/tickets">Tickets</Link>
              <Link href="/tickets/new">New Ticket</Link>
              <Link href="/customers">Customers</Link>
              <Link href="/reports">Reports</Link>
              <Link href="/settings">Settings</Link>
              <Link href="/portal">Portal</Link>
            </nav>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
