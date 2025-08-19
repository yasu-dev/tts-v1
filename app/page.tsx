'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NexusLoadingSpinner from '@/app/components/ui/NexusLoadingSpinner';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // クライアントサイドでのリダイレクト
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexus-background via-blue-50 to-blue-100">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        
        {/* メインスピナー */}
        <NexusLoadingSpinner 
          size="lg" 
          variant="primary" 
          text="ログインページに移動中..."
          className="scale-150"
        />
        
        {/* システム名表示 */}
        <h1 className="text-2xl font-bold text-primary-blue mt-4">
          THE WORLD DOOR
        </h1>
        
      </div>
    </div>
  );
}