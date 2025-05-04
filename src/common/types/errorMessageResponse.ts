import { HttpException, HttpStatus } from '@nestjs/common';

// 400 Bad Request: The request is malformed or invalid (e.g., missing required parameters).

// 401 Unauthorized: Authentication is required, or the provided credentials are invalid.

// 403 Forbidden: The server understood the request, but the client doesn't have permission to access the resource.

// 404 Not Found: The requested resource could not be found (e.g., incorrect endpoint or non-existent resource).

// 405 Method Not Allowed: The HTTP method used is not supported by the resource (e.g., trying to GET a resource that only supports POST).

// 406 Not Acceptable: The server cannot generate a response that the client can accept based on the Accept header.

// 409 Conflict: The request could not be completed due to a conflict with the current state of the resource (e.g., attempting to create a duplicate entry).

// 422 Unprocessable Entity: The server understands the content type but cannot process the contained instructions (e.g., validation errors).

// 429 Too Many Requests: The client has sent too many requests in a given amount of time (rate limiting).

export class CustomErrorResonse extends HttpException {
  constructor(
    public message: string, // Custom error message
    public statusCode: HttpStatus, // HTTP status code
  ) {
    super(
      {
        statusCode,
        message,
      },
      statusCode,
    );
  }
}
