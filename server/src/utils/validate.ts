import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { BadRequestException } from "../utils/exceptions/http.exception";

export const validateBody =
  (schema: ZodSchema<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new BadRequestException("Validation Failed", errors);
    }
    req.body = result.data;
    next();
  };

