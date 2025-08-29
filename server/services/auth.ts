import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";

interface JWTPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
}

class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
  }

  generateJWT(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '7d', // Token expires in 7 days
      issuer: 'zkEngage',
      audience: 'zkEngage-users'
    });
  }

  verifyJWT(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'zkEngage',
        audience: 'zkEngage-users'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      console.error("JWT verification error:", error);
      return null;
    }
  }

  authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const payload = this.verifyJWT(token);
    
    if (!payload) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Add user info to request
    (req as any).userId = payload.userId;
    (req as any).username = payload.username;
    (req as any).isAdmin = payload.isAdmin;

    next();
  };

  requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const isAdmin = (req as any).isAdmin;

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  };

  // Generate secure state parameter for OAuth flows
  generateState(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }

  // Verify state parameter
  verifyState(providedState: string, storedState: string): boolean {
    return providedState === storedState;
  }
}

export const authService = new AuthService();
