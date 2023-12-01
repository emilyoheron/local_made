'use client'
import { useCallback, useEffect, useState } from 'react'
import { Database, Tables, TablesInsert, TablesUpdate } from '../lib/database.types'
import Avatar from './avatar'
import PostImage from './post-image';
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';


export default function AccountForm({ session }: { session: Session | null }) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postCaption, setPostCaption] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<Tables<'posts'>[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState<string | null>(null);

  const user = session?.user

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, description, avatar_url, location, location, job_role`)
        .eq('id', user?.id || '')
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFullname(data.full_name)
        setUsername(data.username)
        setDescription(data.description)
        setAvatarUrl(data.avatar_url)
        setLocation(data.location);
        setJobRole(data.job_role);
      }
    } catch (error) {
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({
    username,
    fullname,
    description,
    avatar_url,
    location,
    jobRole,
  }: {
    username: string | null
    fullname: string | null
    description: string | null
    avatar_url: string | null
    location: string | null;
    jobRole: string | null;
  }) {
    try {
      setLoading(true)

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        full_name: fullname,
        username,
        description,
        avatar_url,
        location,
        job_role: jobRole,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }
  
  const deletePost = async (postId: string) => {
    try {
      setLoading(true);
      console.log('Deleting post:', postId);

      // Delete post image from storage
      const postToDelete = userPosts.find((post) => post.id === postId);
      if (postToDelete) {
        await supabase.storage.from('posts').remove([postToDelete.image_url]);
      }

    // Delete post data from the 'posts' table
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user?.id as string);

      if (deleteError) {
        throw deleteError;
      }
      alert('Post deleted successfully!');
      getUserPosts(); // Refresh the user's posts after deletion
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post!');
    } finally {
      router.refresh();
      setLoading(false);
    }
  };

  const handlePostUpload: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      setPostImage(file);
    } catch (error) {
      alert('Error uploading post image!');
    }
  };

  const handlePostCaptionChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setPostCaption(event.target.value);
  };

  const handlePostSubmit = async () => {
    try {
      setLoading(true);

      const postId = uuidv4();

      // Upload post image to storage
      const fileExt = postImage?.name.split('.').pop();
      const postImageFilePath = `${user?.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(postImageFilePath, postImage!);

      if (uploadError) {
        throw uploadError;
      }

      // Insert post data into the 'posts' table
      const { error: insertError } = await supabase.from('posts').upsert([
        {
          user_id: user?.id as string,
          image_url: postImageFilePath,
          caption: postCaption,
          id: postId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      alert('Post uploaded successfully!');
    } catch (error) {
      router.refresh();
      console.error('Error uploading post:', error);
      alert('Error uploading post!');
    } finally {
      router.refresh();
      setLoading(false);
      setPostImage(null);
      setPostCaption(null);
    }
  };

  const getUserPosts = async () => {
    try {
      setLoading(true);
  
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user?.id || '');
  
      if (error) {
        throw error;
      }
  
      if (data) {
        setUserPosts(data as Tables<'posts'>[]); // Explicitly cast data to the desired type
      }
    } catch (error) {
      console.error('Error loading user posts:', error);
      alert('Error loading user posts!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
    getUserPosts();
  }, [user]);


  return (
    <div className="form-widget">
      <Avatar
        uid={user?.id as string}
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          setAvatarUrl(url)
          updateProfile({ fullname, username, description, avatar_url: url, location, jobRole})
        }}
        />
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session?.user.email} disabled />
      </div>
      <div>
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          value={fullname || ''}
          onChange={(e) => setFullname(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          value={location || ''}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="jobRole">Your Craft</label>
        <input
          id="jobRole"
          type="text"
          value={jobRole || ''}
          onChange={(e) => setJobRole(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          value={description || ''}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => updateProfile({ fullname, username, description, avatar_url, location, jobRole})}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <form action="/auth/signout" method="post">
          <button className="button block" type="submit">
            Sign out
          </button>
        </form>
      </div>
      <div>
        <label htmlFor="postImage">Post Image</label>
        <input
          id="postImage"
          type="file"
          accept="image/*"
          onChange={handlePostUpload}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="postCaption">Post Caption</label>
        <input
          id="postCaption"
          type="text"
          value={postCaption || ''}
          onChange={handlePostCaptionChange}
        />
      </div>
      <div>
        <button
          className="button primary block"
          onClick={handlePostSubmit}
          disabled={!postImage || !postCaption || loading}
        >
          {loading ? 'Uploading Post...' : 'Upload Post'}
        </button>
      </div>
      {userPosts.length > 0 && (
        <div>
          <h2>Your Posts</h2>
          <ul>
            {userPosts.map((post) => (
              <li key={post.id}>
                <PostImage postId={post.id} url={post.image_url} size={100} />
                <p>{post.caption}</p>
                <button onClick={() => deletePost(post.id)}>Delete Post</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
