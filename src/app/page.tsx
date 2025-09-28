// This page redirects to the Advisory Neural Board
export default function HomePage() {
  if (typeof window !== 'undefined') {
    window.location.href = '/advisory';
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-2xl font-bold text-white mb-2">Redirecting to Advisory Neural Board...</h1>
        <p className="text-blue-200">If you&apos;re not redirected automatically, <a href="/advisory" className="underline hover:text-white">click here</a></p>
      </div>
    </div>
  );
}
