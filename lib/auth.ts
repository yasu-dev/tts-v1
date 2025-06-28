import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

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

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: object): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '24h' });
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        return null;
      }

      const isValidPassword = await this.verifyPassword(credentials.password, user.password);
      if (!isValidPassword) {
        return null;
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role as 'seller' | 'staff' | 'admin',
      };

      const token = this.generateToken({ userId: user.id, role: user.role });

      // Create session record
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return { user: authUser, token };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  static async logout(token: string): Promise<boolean> {
    try {
      await prisma.session.deleteMany({
        where: { token },
      });
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  static async validateSession(token: string): Promise<AuthUser | null> {
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        // Clean up expired session
        if (session) {
          await prisma.session.delete({ where: { id: session.id } });
        }
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        role: session.user.role as 'seller' | 'staff' | 'admin',
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  static async getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    return this.validateSession(token);
  }

  static async requireAuth(request: NextRequest, allowedRoles?: string[]): Promise<AuthUser | null> {
    const user = await this.getUserFromRequest(request);

    if (!user) {
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return null;
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
      console.error('Session cleanup error:', error);
    }
  }
}