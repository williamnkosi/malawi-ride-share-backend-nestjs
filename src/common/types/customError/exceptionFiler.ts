import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorDetails } from './errorDetails';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const res = isHttpException
      ? (exception.getResponse() as {
          message: string;
          details?: ErrorDetails;
        })
      : null;

    response.status(status).json({
      statusCode: status,
      message: res?.message || 'Internal server error',
      details: res?.details ?? null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
