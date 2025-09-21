import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, priority = 'medium', notificationType, action } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'userId, title, messageが必要です' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        type: type || 'info',
        title,
        message,
        userId,
        read: false,
        priority,
        notificationType,
        action
      }
    });

    console.log('✅ テスト通知作成完了:', notification.id);
    
    return NextResponse.json({
      success: true,
      notification: notification
    });

  } catch (error) {
    console.error('❌ テスト通知作成エラー:', error);
    return NextResponse.json(
      { error: 'テスト通知の作成に失敗しました' },
      { status: 500 }
    );
  }
}