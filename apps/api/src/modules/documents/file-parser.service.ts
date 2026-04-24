import { Injectable, Logger, UnsupportedMediaTypeException } from '@nestjs/common';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

/**
 * Minimal file → plain text extraction for RAG.
 * Supported per PRD §F-004: PDF, DOCX, TXT, MD, CSV.
 */
@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  async parse(buffer: Buffer, mimeType: string): Promise<string> {
    switch (mimeType) {
      case 'application/pdf': {
        const { text } = await pdfParse(buffer);
        return text.trim();
      }
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const { value } = await mammoth.extractRawText({ buffer });
        return value.trim();
      }
      case 'text/plain':
      case 'text/markdown':
      case 'text/csv':
        return buffer.toString('utf8').trim();
      default:
        throw new UnsupportedMediaTypeException(`Unsupported MIME type: ${mimeType}`);
    }
  }
}
