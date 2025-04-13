import { Request, Response, NextFunction } from "express";

export function allowRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.headers["x-role"] as string | undefined;
    if (!userRole) {
      return res.status(400).json({ message: "Role header is missing" });
    }
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

