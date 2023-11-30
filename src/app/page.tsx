'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PublicPage = () => {
  const router = useRouter();

  const handleArtistLogin = () => {
    // Redirect to the artist login page
    router.push('/login');
  };

  return (
    <div>
      <header>
        <h1>Artists Showcase</h1>
        <button onClick={handleArtistLogin}>Artist Login</button>
      </header>
      {/* Display artists and their profiles here */}
      <main>
        {/* Your artist cards or listing go here */}
      </main>
    </div>
  );
};

export default PublicPage;
