import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/database'

/**
 * ストリーミング動画チャンクを受信
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const isLastChunk = formData.get('isLastChunk') === 'true'
    const timestamp = formData.get('timestamp') as string

    if (!chunk) {
      return NextResponse.json({ error: 'No video chunk provided' }, { status: 400 })
    }

    // チャンクを一時的に保存（実際の実装ではS3やローカルストレージに保存）
    const chunkBuffer = await chunk.arrayBuffer()
    const chunkData = Buffer.from(chunkBuffer)

    // セッションIDに基づいて動画を構築
    // 本番環境では、FFmpegを使用してチャンクを結合し、適切なフォーマットに変換
    
    if (isLastChunk) {
      // 最後のチャンクの場合、動画を完成させてDBに記録
      const videoRecord = await (prisma as any).videoRecord.create({
        data: {
          type: 'inspection', // セッション情報から取得
          productId: params.sessionId.split('-')[1], // 簡易的な実装
          staffId: user.id,
          fileUrl: `videos/stream/${params.sessionId}.mp4`,
          fileSize: chunkData.length, // 実際は全チャンクの合計
          duration: 0, // FFmpegで計算
          metadata: {
            sessionId: params.sessionId,
            format: 'mp4',
            resolution: '1920x1080',
            fps: 30,
            codec: 'h264'
          }
        }
      })

      return NextResponse.json({
        success: true,
        videoId: videoRecord.id,
        message: 'Streaming completed'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Chunk received',
      timestamp
    })
  } catch (error) {
    console.error('Stream upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process video stream' },
      { status: 500 }
    )
  }
}

/**
 * ストリーミングセッションの状態を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // セッション情報を取得（実際の実装ではRedisやDBから取得）
    const sessionInfo = {
      sessionId: params.sessionId,
      status: 'active',
      duration: 0,
      chunks: 0,
      startTime: new Date().toISOString()
    }

    return NextResponse.json(sessionInfo)
  } catch (error) {
    console.error('Session info error:', error)
    return NextResponse.json(
      { error: 'Failed to get session info' },
      { status: 500 }
    )
  }
} 