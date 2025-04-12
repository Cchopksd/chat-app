import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("💥", err.message);
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ message: "Something went wrong!" });
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({ message: "Not Found" });
}

