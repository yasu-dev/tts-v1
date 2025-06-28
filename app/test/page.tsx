export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#0064D2' }}>テストページ</h1>
      <p>このページが表示されれば、Next.jsは正常に動作しています。</p>
      <p>現在の時刻: {new Date().toLocaleString('ja-JP')}</p>
      <a href="/login" style={{ color: '#0064D2', textDecoration: 'underline' }}>
        ログインページへ
      </a>
    </div>
  );
} 