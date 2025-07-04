import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './database';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'seller' | 'staff' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface JWTPayload {
  userId: string;
  sessionId: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return null;
    }
  }

  static async login(email: string, password: string): Promise<{ user: SessionUser; token: string } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return null;
      }

      const isValid = await this.verifyPassword(password, user.password);
      if (!isValid) {
        return null;
      }

      // Create session
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: this.generateToken({
            userId: user.id,
            sessionId: 'temp-' + Date.now(),
          }),
          expiresAt: new Date(Date.now() + SESSION_DURATION),
        },
      });

      const token = this.generateToken({
        userId: user.id,
        sessionId: session.id,
      });

      // Update session with correct token
      await prisma.session.update({
        where: { id: session.id },
        data: { token },
      });

      const sessionUser: SessionUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      };

      return { user: sessionUser, token };
    } catch (error) {
      return null;
    }
  }

  static async logout(token: string): Promise<void> {
    try {
      const payload = this.verifyToken(token);
      if (payload) {
        await prisma.session.delete({
          where: { id: payload.sessionId },
        });
      }
    } catch (error) {
      // Silently fail
    }
  }

  static async validateSession(token: string): Promise<SessionUser | null> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) {
        return null;
      }

      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        role: session.user.role,
      };
    } catch (error) {
      return null;
    }
  }

  static async getUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return null;
    }

    return this.validateSession(token);
  }

  static async requireAuth(request: NextRequest): Promise<SessionUser> {
    const user = await this.getUserFromRequest(request);
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  }

  static async requireRole(request: NextRequest, allowedRoles: string[]): Promise<SessionUser> {
    const user = await this.requireAuth(request);
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Forbidden');
    }
    return user;
  }

  static async cleanExpiredSessions(): Promise<void> {
    try {
      await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      // Silently fail
    }
  }
}

// APIルート用のrequireAuth高階関数
export function requireAuth(
  handler: (req: NextRequest, context: { user: SessionUser }) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await AuthService.getUserFromRequest(req);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized',
        authenticated: false 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return handler(req, { user });
  };
}