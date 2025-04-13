import { Request, Response, NextFunction } from "express";
import {
  BadRequestException,
  HttpException,
} from "../utils/exceptions/http.exception";
import { logger } from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      ...(err.data && { data: err.data }),
    });
  }
  console.error(err);
  logger.error(err);
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal Server Error",
  });
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({ message: "Not Found" });
}

export function handleSyntaxError(
  err: SyntaxError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof SyntaxError && "body" in err) {
    throw new BadRequestException(err.message);
  }
  next(err);
}

