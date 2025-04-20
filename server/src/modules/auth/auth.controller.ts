import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { successResponse } from "../../shared/exceptions/http.exception";
import { logger } from "../../shared/logger/logger";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public async login(req: Request, res: Response): Promise<void> {
    const login: { accessToken: string } = await this.authService.login(
      req.body
    );
    logger.log({
      level: "info",
      message: req.headers["user-agent"]?.toString() || "Unknown user-agent",
    });
    if (
      req.headers["user-agent"]?.includes("Mobile") ||
      req.headers["user-agent"]?.includes("node")
    ) {
      // For mobile
      successResponse(res, login.accessToken, "Login SuccessFully");
    } else {
      // For browser
      res.cookie("user-token", login.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 * 24,
      });
      successResponse(res, "Login SuccessFully");
    }
  }
}

