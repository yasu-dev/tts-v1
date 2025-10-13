import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ChatListPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's chats with seller info and last message
  const { data: chats, error } = await supabase
    .from('chats')
    .select(
      `
      *,
      sellers!chats_seller_id_fkey(
        user_id,
        farm_name,
        prefecture,
        city
      ),
      chat_messages(body, created_at)
    `
    )
    .eq('buyer_id', user.id)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
  }

  // Process chats to get last message
  const processedChats = chats?.map((chat: any) => {
    const lastMessage = chat.chat_messages?.[chat.chat_messages.length - 1];
    return {
      ...chat,
      lastMessage: lastMessage?.body || '',
      lastMessageTime: lastMessage?.created_at || chat.last_message_at,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">チャット一覧</h1>

        {processedChats && processedChats.length > 0 ? (
          <div className="space-y-3">
            {processedChats.map((chat: any) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.seller_id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🌾</span>
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg">
                        {chat.sellers?.farm_name}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {chat.lastMessageTime
                          ? new Date(chat.lastMessageTime).toLocaleString(
                              'ja-JP',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )
                          : ''}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {chat.sellers?.prefecture} {chat.sellers?.city}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-700 truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-600 mb-6">
              まだチャットがありません
            </p>
            <p className="text-sm text-gray-500 mb-6">
              商品詳細ページから出品者にメッセージを送信できます
            </p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              商品を探す
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
