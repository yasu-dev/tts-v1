import { createClient } from '@/lib/supabase/server';
import { TriageTag } from '@/lib/types';
import CommandDashboard from './CommandDashboard';

export const dynamic = 'force-dynamic';

export default async function CommandPage() {
  const supabase = createClient();

  // トリアージタッグを取得
  const { data: triageTags, error } = await supabase
    .from('triage_tags')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // console.error('Error fetching triage tags:', error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="card max-w-md">
          <h2 className="mb-2 text-xl font-bold text-red-600">データ取得エラー</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const tags = (triageTags || []) as TriageTag[];

  return <CommandDashboard initialTags={tags} />;
}
