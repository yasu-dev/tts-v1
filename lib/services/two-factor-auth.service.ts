import { PrismaClient } from '@prisma/client';
import { emailAdapter } from './adapters/email.adapter';
import { serviceConfig } from './config';

const prisma = new PrismaClient();

export class TwoFactorAuthService {
  /**
   * 6桁の認証コードを生成
   */
  private static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * 2段階認証コードを生成して送信
   */
  static async sendCode(userId: string, email: string): Promise<boolean> {
    try {
      // 2段階認証が無効の場合はスキップ
      if (!serviceConfig.twoFactorAuth.enabled) {
        return true;
      }
      
      // 既存の未検証コードを削除
      await (prisma as any).twoFactorAuth.deleteMany({
        where: {
          userId,
          verified: false,
        },
      });
      
      // 新しいコードを生成
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + serviceConfig.twoFactorAuth.codeExpiry * 1000);
      
      // データベースに保存
      await (prisma as any).twoFactorAuth.create({
        data: {
          userId,
          code,
          expiresAt,
        },
      });
      
      // メールで送信
      const result = await emailAdapter.sendTwoFactorCode(email, code);
      
      return result.success;
    } catch (error) {
      console.error('Two-factor auth send error:', error);
      return false;
    }
  }
  
  /**
   * 認証コードを検証
   */
  static async verifyCode(userId: string, code: string): Promise<boolean> {
    try {
      // 2段階認証が無効の場合は常に成功
      if (!serviceConfig.twoFactorAuth.enabled) {
        return true;
      }
      
      const authRecord = await (prisma as any).twoFactorAuth.findFirst({
        where: {
          userId,
          code,
          verified: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      
      if (!authRecord) {
        return false;
      }
      
      // コードを検証済みにする
      await (prisma as any).twoFactorAuth.update({
        where: { id: authRecord.id },
        data: { verified: true },
      });
      
      return true;
    } catch (error) {
      console.error('Two-factor auth verify error:', error);
      return false;
    }
  }
  
  /**
   * 期限切れコードをクリーンアップ
   */
  static async cleanupExpiredCodes(): Promise<void> {
    try {
      await (prisma as any).twoFactorAuth.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Two-factor auth cleanup error:', error);
    }
  }
} 