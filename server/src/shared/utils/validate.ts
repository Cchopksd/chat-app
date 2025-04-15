import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { BadRequestException } from "../exceptions/http.exception";

export const validateBody =
  (schema: ZodSchema<any>, path: "body" | "params" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const dataToValidate =
      path === "body" ? req.body : path === "params" ? req.params : req.query;

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new BadRequestException("Validation Failed", errors);
    }

    if (path === "body") {
      req.body = result.data;
    } else if (path === "params") {
      req.params = result.data;
    } else if (path === "query") {
      req.query = result.data;
    }

    next();
  };

