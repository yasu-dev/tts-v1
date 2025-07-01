import { serviceConfig } from '../config';

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * メール送信アダプター
 * 開発環境ではコンソール出力、本番環境ではSendGrid使用
 */
export class EmailAdapter {
  private from: string;
  
  constructor() {
    this.from = serviceConfig.sendgrid.fromEmail;
  }
  
  /**
   * メールを送信
   */
  async send(data: EmailData): Promise<EmailResponse> {
    try {
      if (serviceConfig.useMockServices) {
        // 開発環境：コンソールに出力
        console.log('=== Mock Email ===');
        console.log('To:', data.to);
        console.log('From:', data.from || this.from);
        console.log('Subject:', data.subject);
        console.log('Body:', data.text || data.html);
        console.log('==================');
        
        return {
          success: true,
          messageId: `mock-${Date.now()}`,
        };
      }
      
      // 本番環境：SendGrid APIを使用
      // 注意: @sendgrid/mail パッケージをインストールする必要があります
      try {
        // @ts-ignore
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(serviceConfig.sendgrid.apiKey);
        
        const msg = {
          to: data.to,
          from: data.from || this.from,
          subject: data.subject,
          text: data.text,
          html: data.html,
        };
        
        const response = await sgMail.default.send(msg);
        
        return {
          success: true,
          messageId: response[0].headers['x-message-id'],
        };
      } catch (importError) {
        console.error('SendGrid not available. Please install @sendgrid/mail package for production use.');
        return {
          success: false,
          error: 'Email service not configured',
        };
      }
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * 2段階認証コードを送信
   */
  async sendTwoFactorCode(email: string, code: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0064D2;">THE WORLD DOOR - 認証コード</h1>
        <p>ログインを完了するために、以下の認証コードを入力してください：</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
        </div>
        <p style="color: #666;">このコードは5分間有効です。</p>
        <p style="color: #666;">心当たりのないログイン試行の場合は、このメールを無視してください。</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          THE WORLD DOOR<br>
          高付加価値商品の物流フルフィルメントシステム
        </p>
      </div>
    `;
    
    return this.send({
      to: email,
      subject: '【THE WORLD DOOR】認証コード',
      html,
      text: `認証コード: ${code}\n\nこのコードは5分間有効です。`,
    });
  }
  
  /**
   * パスワードリセットメールを送信
   */
  async sendPasswordReset(email: string, resetUrl: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0064D2;">THE WORLD DOOR - パスワードリセット</h1>
        <p>パスワードリセットのリクエストを受け付けました。</p>
        <p>以下のボタンをクリックして、新しいパスワードを設定してください：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0064D2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            パスワードをリセット
          </a>
        </div>
        <p style="color: #666;">このリンクは24時間有効です。</p>
        <p style="color: #666;">心当たりのないリクエストの場合は、このメールを無視してください。</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：<br>
          ${resetUrl}
        </p>
      </div>
    `;
    
    return this.send({
      to: email,
      subject: '【THE WORLD DOOR】パスワードリセット',
      html,
      text: `パスワードリセット\n\n以下のリンクからパスワードをリセットしてください：\n${resetUrl}\n\nこのリンクは24時間有効です。`,
    });
  }
}

// シングルトンインスタンス
export const emailAdapter = new EmailAdapter(); 