import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import ChatInterface from './ChatInterface';

interface PageProps {
  params: {
    sellerId: string;
  };
}

export default async function ChatPage({ params }: PageProps) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get seller info
  const { data: seller, error: sellerError } = await supabase
    .from('sellers')
    .select('*, profiles!sellers_user_id_fkey(full_name)')
    .eq('user_id', params.sellerId)
    .single();

  if (sellerError || !seller) {
    notFound();
  }

  // Get or create chat
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('seller_id', params.sellerId)
    .single();

  let chatId = existingChat?.id;

  if (!chatId) {
    // Create new chat
    const { data: newChat, error: chatError } = await supabase
      .from('chats')
      .insert({
        buyer_id: user.id,
        seller_id: params.sellerId,
      })
      .select('id')
      .single();

    if (chatError) {
      console.error('Error creating chat:', chatError);
    } else {
      chatId = newChat?.id;
    }
  }

  // Fetch chat messages
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*, profiles!chat_messages_sender_id_fkey(full_name)')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Link href="/" className="text-green-600 hover:text-green-700">
            ← 戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-4">
            <h1 className="text-xl font-bold">{seller.farm_name}</h1>
            <p className="text-sm opacity-90">
              {seller.prefecture} {seller.city}
            </p>
          </div>

          {/* Chat Interface */}
          <ChatInterface
            chatId={chatId || ''}
            userId={user.id}
            sellerId={params.sellerId}
            initialMessages={messages || []}
          />
        </div>
      </div>
    </div>
  );
}
