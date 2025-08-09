import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    console.log('[DEBUG] 画像配信リクエスト:', params.path);

    if (!params.path || params.path.length === 0) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      );
    }

    // パスを結合
    const imagePath = params.path.join('/');
    console.log('[DEBUG] 画像パス:', imagePath);

    // uploads ディレクトリの画像ファイルパス
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const fullImagePath = path.join(uploadsDir, imagePath);
    
    console.log('[DEBUG] フルパス:', fullImagePath);

    try {
      // ファイルが存在するかチェック
      await fs.access(fullImagePath);
      
      // ファイルを読み込み
      const fileBuffer = await fs.readFile(fullImagePath);
      
      // MIMEタイプを決定
      const ext = path.extname(fullImagePath).toLowerCase();
      let contentType = 'image/jpeg';
      
      switch (ext) {
        case '.png':
          contentType = 'image/png';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        default:
          contentType = 'image/jpeg';
      }

      console.log('[DEBUG] 画像配信成功:', imagePath, 'Type:', contentType);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (fileError) {
      console.error('[ERROR] ファイル読み込みエラー:', fileError);
      
      // デフォルト画像または404画像を返す
      return NextResponse.json(
        { error: '画像が見つかりません' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[ERROR] 画像配信エラー:', error);
    return NextResponse.json(
      { error: '画像の読み込み中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
