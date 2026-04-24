import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const body = this.buildBody(exception, req.url);

    if (body.statusCode >= 500) {
      this.logger.error(
        `[${body.statusCode}] ${req.method} ${req.url} — ${JSON.stringify(body.message)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    res.status(body.statusCode).json(body);
  }

  private buildBody(exception: unknown, path: string): ErrorBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      return {
        statusCode: status,
        error: HttpStatus[status] ?? 'Error',
        message: typeof response === 'string' ? response : ((response as { message?: string | string[] }).message ?? exception.message),
        path,
        timestamp,
      };
    }

    if (exception instanceof ZodError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'ValidationError',
        message: exception.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        path,
        timestamp,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = unique constraint, P2025 = record not found
      if (exception.code === 'P2002') {
        return {
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'Unique constraint violated',
          path,
          timestamp,
        };
      }
      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NotFound',
          message: 'Record not found',
          path,
          timestamp,
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message: 'Unexpected error',
      path,
      timestamp,
    };
  }
}
