// Supabase middleware
// 次のステップでSupabase接続時に実装します

import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // プレースホルダー - Supabase接続時に実装
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}
