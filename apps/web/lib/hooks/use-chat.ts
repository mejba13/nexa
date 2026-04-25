'use client';

import { useCallback, useRef, useState } from 'react';

import type { Message, StreamEvent, ToolCall } from '@nexa/types';

import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { streamSSE } from '@/lib/sse';

type LocalMessage = Message & {
  streaming?: boolean;
  toolCalls?: ToolCall[] | null;
};

interface UseChatOptions {
  conversationId: string;
  initialMessages?: Message[];
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * Client-side chat hook. Sends a message to the API's SSE endpoint and accumulates
 * typed StreamEvent frames (see @nexa/types).
 */
export function useChat({ conversationId, initialMessages = [] }: UseChatOptions) {
  const { getToken } = useNexaAuth();
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;
      setError(null);
      setIsStreaming(true);

      const userMsg: LocalMessage = {
        id: `local-${Date.now()}`,
        conversationId,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };

      const draft: LocalMessage = {
        id: `draft-${Date.now()}`,
        conversationId,
        role: 'ASSISTANT',
        content: '',
        streaming: true,
        toolCalls: [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, draft]);

      abortRef.current = new AbortController();
      const token = await getToken();
      if (!token) {
        setError('Not signed in');
        setIsStreaming(false);
        return;
      }

      try {
        const gen = streamSSE<StreamEvent>(`${API}/conversations/${conversationId}/messages`, {
          token,
          body: { content },
          signal: abortRef.current.signal,
        });

        for await (const evt of gen) {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (!last || last.role !== 'ASSISTANT') return copy;
            switch (evt.type) {
              case 'content_delta':
                last.content += evt.delta;
                break;
              case 'tool_use':
                last.toolCalls = [...(last.toolCalls ?? []), evt.toolCall];
                break;
              case 'message_end':
                last.streaming = false;
                last.tokensInput = evt.tokensInput;
                last.tokensOutput = evt.tokensOutput;
                break;
              case 'error':
                setError(evt.message);
                last.streaming = false;
                break;
              default:
                break;
            }
            return copy;
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, getToken, isStreaming],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const regenerate = useCallback(async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'USER');
    if (!lastUser) return;
    setMessages((prev) =>
      prev.filter((m) => !(m.role === 'ASSISTANT' && prev.indexOf(m) === prev.length - 1)),
    );
    await send(lastUser.content);
  }, [messages, send]);

  return { messages, isStreaming, error, send, cancel, regenerate };
}
