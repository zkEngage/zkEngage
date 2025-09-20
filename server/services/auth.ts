import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client"; // Use Prisma User type

interface JWTPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
}

class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "super-secret-key-change-in-production";
  }

  generateJWT(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: (user as any).username || "", // optional
      isAdmin: (user as any).isAdmin || false
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: "7d",
      issuer: "zkEngage",
      audience: "zkEngage-users",
    });
  }

  verifyJWT(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: "zkEngage",
        audience: "zkEngage-users",
      }) as JWTPayload;
    } catch (err) {
      console.error("JWT verification error:", err);
      return null;
    }
  }

  authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access token required" });

    const payload = this.verifyJWT(token);
    if (!payload) return res.status(403).json({ message: "Invalid or expired token" });

    (req as any).userId = payload.userId;
    (req as any).username = payload.username;
    (req as any).isAdmin = payload.isAdmin;

    next();
  };

  requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const isAdmin = (req as any).isAdmin;
    if (!isAdmin) return res.status(403).json({ message: "Admin access required" });
    next();
  };
}

export const authService = new AuthService();
