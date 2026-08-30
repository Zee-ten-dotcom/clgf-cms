import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  Request,
  Response,
} from 'express';

@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter
{
  private readonly logger =
    new Logger(AllExceptionsFilter.name);

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const context =
      host.switchToHttp();

    const response =
      context.getResponse<Response>();

    const request =
      context.getRequest<Request>();

    if (
      exception instanceof HttpException
    ) {
      const status =
        exception.getStatus();

      const exceptionResponse =
        exception.getResponse();

      return response
        .status(status)
        .json(
          typeof exceptionResponse ===
            'string'
            ? {
                statusCode: status,
                message:
                  exceptionResponse,
                path:
                  request.url,
                timestamp:
                  new Date().toISOString(),
              }
            : {
                ...exceptionResponse,
                path:
                  request.url,
                timestamp:
                  new Date().toISOString(),
              },
        );
    }

    const status =
      HttpStatus.INTERNAL_SERVER_ERROR;

    const error =
      exception instanceof Error
        ? exception
        : new Error(
            'Unknown application error',
          );

    this.logger.error(
      `${request.method} ${request.url}`,
      error.stack,
    );

    return response.status(status).json({
      statusCode: status,
      message:
        'Internal server error',
      path:
        request.url,
      timestamp:
        new Date().toISOString(),
    });
  }
}
