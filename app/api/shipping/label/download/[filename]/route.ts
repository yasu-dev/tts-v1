import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // ユーザー認証
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { filename } = params;

    if (!filename) {
      return NextResponse.json(
        { error: 'ファイル名が必要です' },
        { status: 400 }
      );
    }

    // ファイルパスのセキュリティチェック
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: '無効なファイル名です' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, filename);

    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 404 }
      );
    }

    // ファイルを読み込み
    const fileBuffer = fs.readFileSync(filePath);

    // PDFファイルとしてレスポンス
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Download label error:', error);
    return NextResponse.json(
      { error: 'ラベルファイルのダウンロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}




