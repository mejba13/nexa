export const DOCUMENT_QUEUE = 'file-processing';

export interface ProcessDocumentJob {
  documentId: string;
  userId: string;
}
