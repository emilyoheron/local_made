'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/app/lib/database.types'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const supabase = createClientComponentClient<Database>();
  const [session, setSession] = useState<Session|null>(null);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = (email: string) => {
    // You can use a more sophisticated email validation regex if needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password: string) => {
    return password.length > 6;
  };

  const handleSignUp = async () => {
    try {
      if (!isEmailValid(email)) {
        throw new Error('Invalid email format');
      }

      if (!isPasswordValid(password)) {
        throw new Error('Password must be at least 6 characters long');
      }

      await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      router.refresh();
    } catch (error: any) {
      if (error.message === 'Invalid email format') {
        setError('Invalid email format. Please enter a valid email address.');
      } else if (error.message === 'Password must be at least 6 characters long') {
        setError('Password must be at least 6 characters long.');
      } else {
        setError("Sorry, you cannot sign up at this time. Please try again later.");
      }
    }
  }

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setError("The login information is incorrect");
      router.refresh();
    } catch (error) {
      setError("The login information is incorrect");
      console.error('Sign In Error:', error);
    }
  }

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

  if (!session) {
    return (
      <>
        <input name="email" onChange={(e) => setEmail(e.target.value)} value={email} />
        <input
          type="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button onClick={handleSignUp}>Sign up</button>
        <button onClick={handleSignIn}>Sign in</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </>
    );
  } else {
    // Redirect to the account page if the user is logged in
    router.push('/account');
    // Return null or a loading indicator, as the user will be redirected
    return null;
  }
}
