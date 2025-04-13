import { Response } from "express";

export class HttpException extends Error {
  statusCode: number;
  message: string;
  data?: any;

  constructor(statusCode: number, message: string, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export function successResponse(res: Response, data: any, message = "Success") {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data,
  });
}

export class BadRequestException extends HttpException {
  constructor(message: string = "Bad Request", data?: any) {
    super(400, message, data);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized", data?: any) {
    super(401, message, data);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden", data?: any) {
    super(403, message, data);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = "Not Found", data?: any) {
    super(404, message, data);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = "Conflict", data?: any) {
    super(409, message, data);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message: string = "Too Many Requests", data?: any) {
    super(429, message, data);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = "Internal Server Error", data?: any) {
    super(500, message, data);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: string, data?: any) {
    super(503, message, data);
  }
}

export class GatewayTimeoutException extends HttpException {
  constructor(message: string = "Gateway Timeout", data?: any) {
    super(504, message, data);
  }
}

