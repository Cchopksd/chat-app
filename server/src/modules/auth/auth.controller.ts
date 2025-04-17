import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { successResponse } from "../../shared/exceptions/http.exception";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public async login(req: Request, res: Response): Promise<void> {
    const login: { accessToken: string } = await this.authService.login(
      req.body
    );
    console.log(req.headers["user-agent"]);
    if (req.headers["user-agent"]?.includes("Mobile")) {
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

