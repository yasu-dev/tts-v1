import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// メッセージ一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const supabase = await createClient();
    const { sellerId } = await params; // Next.js 15: params is now a Promise

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // チャット取得または作成
    let { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .single();

    if (!chat) {
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      chat = newChat;
    }

    // メッセージ一覧取得
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ chat, messages });
  } catch (error) {
    // TODO: 本番環境では適切なロギングサービスを使用
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// メッセージ送信
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const supabase = await createClient();
    const { sellerId } = await params; // Next.js 15: params is now a Promise

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { body: messageBody } = body;

    if (!messageBody) {
      return NextResponse.json(
        { error: 'Message body is required' },
        { status: 400 }
      );
    }

    // チャット取得または作成
    let { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .single();

    if (!chat) {
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      chat = newChat;
    }

    // メッセージ作成
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chat.id,
        sender_id: user.id,
        body: messageBody,
      })
      .select()
      .single();

    if (messageError) {
      return NextResponse.json(
        { error: messageError.message },
        { status: 500 }
      );
    }

    // チャットの最終メッセージ日時を更新
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chat.id);

    return NextResponse.json({ message });
  } catch (error) {
    // TODO: 本番環境では適切なロギングサービスを使用
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
