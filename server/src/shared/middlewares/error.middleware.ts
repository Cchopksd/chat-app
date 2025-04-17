// src/shared/middlewares/ErrorMiddleware.ts

import { Request, Response, NextFunction } from "express";
import {
  BadRequestException,
  HttpException,
} from "../exceptions/http.exception";
import { logger } from "../logger/logger";

export class ErrorMiddleware {
  public static handleError(
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

  public static handleNotFound(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: `Route ${req.path} Not Found`,
    });
  }

  public static handleSyntaxError(
    err: SyntaxError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (err instanceof SyntaxError && "body" in err) {
      throw new BadRequestException(err.message);
    }
    next(err);
  }
}

