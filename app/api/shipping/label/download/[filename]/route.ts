import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileName: string } }
) {
  try {
    const { fileName } = params;
    if (!fileName) {
      return NextResponse.json({ error: 'fileName は必須です' }, { status: 400 });
    }

    const labelsDir = path.join(process.cwd(), 'public', 'labels');
    const filePath = path.join(labelsDir, fileName);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const ext = path.extname(fileName).toLowerCase();
      const contentType = ext === '.pdf' ? 'application/pdf' :
                         ext === '.png' ? 'image/png' :
                         ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream';
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
          'Cache-Control': 'private, max-age=0, must-revalidate'
        }
      });
    } catch (e) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 404 });
    }
  } catch (error) {
    console.error('[ERROR] label/download:', error);
    return NextResponse.json({ error: 'ラベルダウンロードでエラーが発生しました' }, { status: 500 });
  }
}

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




