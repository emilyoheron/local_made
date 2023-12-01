'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/app/lib/database.types'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/auth-helpers-nextjs'

const PublicPage = () => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [session, setSession] = useState<Session|null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleArtistLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div>
      <header>
        <h1>Artists Showcase</h1>
        <div>
          {session ? (
            <>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={() => router.push('/account')}>Account</button>
            </>
          ) : (
            <button onClick={handleArtistLogin}>Artist Login</button>
          )}
        </div>
      </header>
      {/* Display artists and their profiles here */}
      <main>
        {/* Your artist cards or listing go here */}
      </main>
    </div>
  );
};

export default PublicPage;


