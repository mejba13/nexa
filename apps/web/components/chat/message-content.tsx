'use client';

import 'highlight.js/styles/github-dark.css';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className }: MessageContentProps) {
  return (
    <div
      className={cn(
        'prose prose-invert prose-p:my-2 prose-headings:font-display prose-headings:tracking-tight prose-pre:bg-brand-bg prose-pre:border prose-pre:border-brand-border prose-code:text-brand-primary prose-code:before:content-none prose-code:after:content-none max-w-none',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
