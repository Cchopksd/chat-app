import jwt from "jsonwebtoken";
import { InternalServerErrorException } from "../exceptions/http.exception";

interface TokenPayload {
  user_id: string;
  email: string;
  name: string;
}

export class Token {
  private static readonly JWT_SECRET = process.env.JWT_SECRET;
  private static readonly JWT_EXPIRES_IN = "7d";

  public static generateAccessToken(payload: TokenPayload): string {
    if (!this.JWT_SECRET) {
      throw new InternalServerErrorException("Missing JWT_SECRET in env");
    }
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  public static verifyToken(token: string): TokenPayload {
    try {
      if (!this.JWT_SECRET) {
        throw new InternalServerErrorException("Missing JWT_SECRET in env");
      }
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

