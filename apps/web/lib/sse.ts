import type { StreamEvent } from '@nexa/types';

/**
 * POST an SSE request and stream typed StreamEvent frames.
 *
 * We can't use EventSource because it doesn't support custom headers (Clerk JWT)
 * or POST bodies. Instead we use fetch + ReadableStream + a minimal parser.
 */
export async function* streamSSE<T = StreamEvent>(
  url: string,
  init: { token: string; body: unknown; signal?: AbortSignal },
): AsyncGenerator<T, void, unknown> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${init.token}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(init.body),
    signal: init.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`SSE ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let i: number;
    while ((i = buffer.indexOf('\n\n')) >= 0) {
      const frame = buffer.slice(0, i);
      buffer = buffer.slice(i + 2);
      const dataLine = frame
        .split('\n')
        .find((l) => l.startsWith('data:'))
        ?.slice(5)
        .trim();
      if (dataLine) {
        try {
          yield JSON.parse(dataLine) as T;
        } catch {
          // swallow malformed frames
        }
      }
    }
  }
}
