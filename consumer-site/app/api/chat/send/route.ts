import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chat_id, body: messageBody } = body;

    if (!chat_id || !messageBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        chat_id,
        sender_id: user.id,
        body: messageBody,
      })
      .select('*, profiles!chat_messages_sender_id_fkey(full_name)')
      .single();

    if (messageError) {
      // TODO: 本番環境では適切なロギングサービスを使用
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      );
    }

    // Update chat last_message_at
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chat_id);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    // TODO: 本番環境では適切なロギングサービスを使用
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
