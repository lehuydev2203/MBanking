import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = 'INTERNAL_SERVER_ERROR';
    let message: string = 'Internal server error';
    let details: any = undefined;

    // Log the full error for debugging
    console.error('=== EXCEPTION DEBUG ===');
    console.error('Exception:', exception);
    console.error('Type:', typeof exception);
    console.error('Constructor:', exception?.constructor?.name);
    if (exception instanceof Error) {
      console.error('Message:', exception.message);
      console.error('Stack:', exception.stack);
    }
    console.error('Request body:', request.body);
    console.error('========================');

    this.logger.error('Exception caught:', {
      exception: exception instanceof Error ? exception.message : exception,
      stack: exception instanceof Error ? exception.stack : undefined,
      url: request.url,
      method: request.method,
      body: request.body,
      headers: request.headers,
      exceptionType: typeof exception,
      exceptionConstructor: exception?.constructor?.name,
    });

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        code = this.getCodeFromStatus(status);
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        code = responseObj.code || this.getCodeFromStatus(status);
        message = responseObj.message || exception.message;
        details = responseObj.details;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_SERVER_ERROR';
      message = 'Internal server error';

      // Log non-HTTP exceptions with full details
      if (exception instanceof Error) {
        this.logger.error('Non-HTTP Exception:', {
          name: exception.name,
          message: exception.message,
          stack: exception.stack,
          cause: (exception as any).cause,
        });
      } else {
        this.logger.error('Unknown exception type:', {
          type: typeof exception,
          value: exception,
          constructor: exception?.constructor?.name,
        });
      }
    }

    const errorResponse: ErrorResponse = {
      success: false,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private getCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
