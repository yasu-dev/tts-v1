'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // クライアントサイドでのリダイレクト
    router.push('/login');
  }, [router]);

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>🚀 THE WORLD DOOR</h1>
      <p>ログインページに移動中...</p>
      <div style={{ margin: '20px 0' }}>
        <a 
          href="/login" 
          style={{ 
            backgroundColor: '#0070f3', 
            color: 'white', 
            padding: '12px 24px', 
            textDecoration: 'none', 
            borderRadius: '8px',
            fontSize: '16px'
          }}
        >
          手動でログインページに移動
        </a>
      </div>
      <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
        <p>⚡ サーバー: http://localhost:3002</p>
        <p>⏰ {new Date().toLocaleString('ja-JP')}</p>
      </div>
    </div>
  );
}