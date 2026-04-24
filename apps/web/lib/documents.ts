import type { AgentType } from '@nexa/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface DocumentRow {
  id: string;
  userId: string;
  agentType: AgentType;
  filename: string;
  mimeType: string;
  fileSize: number;
  status: 'PROCESSING' | 'INDEXED' | 'FAILED';
  createdAt: string;
}

export const documentsApi = {
  async list(token: string, agentType?: AgentType): Promise<DocumentRow[]> {
    const qs = agentType ? `?agentType=${agentType}` : '';
    const res = await fetch(`${API}/documents${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  },
  async upload(token: string, agentType: AgentType, file: File): Promise<DocumentRow> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API}/documents/upload?agentType=${agentType}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error(`Upload ${res.status}: ${res.statusText}`);
    return res.json();
  },
  async remove(token: string, id: string): Promise<void> {
    const res = await fetch(`${API}/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
  },
};
