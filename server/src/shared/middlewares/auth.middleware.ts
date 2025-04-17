import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { user_id: string; email: string };
    }
  }
}

import { Token } from "../utils/token";
import { UnauthorizedException } from "../exceptions/http.exception";
import cookie from "cookie";

export class AuthMiddleware {
  public static handleAuthentication(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let token: string | undefined;

    // Validate for Mobile app
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Validate for browser
    if (!token && req.headers.cookie) {
      const parsedCookie = cookie.parse(req.headers.cookie);
      token = parsedCookie["user-token"];
    }

    if (!token) {
      throw new UnauthorizedException("Token not provided");
    }

    const user = Token.verifyToken(token);
    req.user = user;
    next();
  }
}

