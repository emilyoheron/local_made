'use client'
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database, Tables } from '@/app/lib/database.types'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/auth-helpers-nextjs'
import PostImage from './account/post-image'
import { CSSProperties } from 'react';

const centerContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

// Styling for the top right buttons
const topRightButtonsStyle: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  right: '16px',
};

// Styling for the white border around each profile
const profileListItemStyle = {
  border: '1px solid black',
  borderRadius: '8px', // Optional: Add border radius for rounded corners
  padding: '16px', // Optional: Add padding for space around each profile
  margin: '8px 0', // Optional: Add margin for space between profiles
};

// Styling for the border around each post in PublicProfiles
const postListItemStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  marginRight: '16px', // Add margin between posts
};

// Create a new functional component to display public profiles
const PublicProfiles = () => {
  const supabase = createClientComponentClient<Database>();
  const [publicProfiles, setPublicProfiles] = useState<{
    profile: Tables<'profiles'>;
    posts: Tables<'posts'>[];
  }[]>([]);

  useEffect(() => {
    // Fetch public profiles from the database
    const fetchPublicProfiles = async () => {
      try {
        const {data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, description, location, job_role, avatar_url, full_name, public_profile, updated_at')
          .eq('public_profile', true);

        if (profilesError) {
          throw profilesError;
        }

        const profilesWithPosts = await Promise.all(
          profiles.map(async (profile) => {
            const { data: posts, error: postsError } = await supabase
              .from('posts')
              .select('*')
              .eq('user_id', profile.id);

            if (postsError) {
              throw postsError;
            }

            return { profile, posts: posts as Tables<'posts'>[] };
          })
        );

        setPublicProfiles(profilesWithPosts);

      } catch (error) {
        console.error('Error fetching public profiles:', error);
      }
    };

    // Call the function to fetch public profiles
    fetchPublicProfiles();
  }, [supabase]);

  return (
    <div style={centerContainerStyle}>
      <h2>Artists</h2>
      {publicProfiles.map(({ profile, posts }) => (
        <div key={profile.username} style={profileListItemStyle}>
          <p>User: {profile.username}</p>
          <p>{profile.job_role}</p>
          <p>Location: {profile.location}</p>
          <p>{profile.description}</p>
          <div style={{ display: 'flex', listStyleType: 'none', padding: 0 }}>
            {posts.map((post) => (
              <div key={post.id} style={postListItemStyle}>
                <PostImage postId={post.id} url={post.image_url} size={200} />
                <p>{post.caption}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

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
        <h1>Local Made</h1>
        <div style={topRightButtonsStyle}>
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
        <PublicProfiles />
      </main>
    </div>
  );
};

export default PublicPage;


