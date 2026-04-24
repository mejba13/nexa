import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

const logger = new Logger('Sentry');

/**
 * Initialize Sentry once at process boot. No-op when SENTRY_DSN is missing
 * so dev environments stay quiet.
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    // Conservative sampling — bump in prod once cost is understood.
    tracesSampleRate: 0.1,
    profilesSampleRate: 0,
  });
  logger.log('Sentry initialized');
}
