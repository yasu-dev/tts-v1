import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

/**
 * WebRTC/RTMPストリーミングサーバー情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ストリーミングサーバーの設定情報を返す
    const serverConfig = {
      webrtc: {
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302'
            ]
          }
        ],
        // 本番環境ではTURNサーバーも追加
        ...(process.env.TURN_SERVER_URL && {
          turnServer: {
            urls: process.env.TURN_SERVER_URL,
            username: process.env.TURN_USERNAME,
            credential: process.env.TURN_CREDENTIAL
          }
        })
      },
      rtmp: {
        url: process.env.RTMP_SERVER_URL || 'rtmp://localhost:1935/live',
        streamKey: `${user.id}-${Date.now()}`
      },
      websocket: {
        url: process.env.WEBSOCKET_URL || 'ws://localhost:3002'
      }
    }

    return NextResponse.json(serverConfig)
  } catch (error) {
    console.error('Streaming server config error:', error)
    return NextResponse.json(
      { error: 'Failed to get streaming config' },
      { status: 500 }
    )
  }
}

/**
 * ストリーミングセッションを開始
 */
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request)
    if (!user || user.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, productId, phase } = await request.json()

    // ストリーミングセッションを記録
    const streamingSession = {
      id: `stream-${Date.now()}`,
      staffId: user.id,
      type, // 'inspection' | 'packing'
      productId,
      phase, // 'phase2' | 'phase4'
      startTime: new Date().toISOString(),
      status: 'active'
    }

    // セッション情報を返す
    return NextResponse.json({
      session: streamingSession,
      uploadUrl: `/api/videos/stream/${streamingSession.id}`
    })
  } catch (error) {
    console.error('Streaming session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create streaming session' },
      { status: 500 }
    )
  }
} 