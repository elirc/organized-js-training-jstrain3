import { NextResponse } from "next/server";

export async function GET() {
  let interval: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`event: ready\ndata: ${JSON.stringify({ status: "connected" })}\n\n`));
      interval = setInterval(() => {
        controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`));
      }, 15_000);
    },
    cancel() {
      if (interval) {
        clearInterval(interval);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
