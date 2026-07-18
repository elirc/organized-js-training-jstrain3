"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="stack">
      <h1 className="page-title">Something Went Wrong</h1>
      <div className="surface stack">
        <p className="muted">{error.message}</p>
        <button type="button" className="button" onClick={reset}>
          Try Again
        </button>
      </div>
    </section>
  );
}

