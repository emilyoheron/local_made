// post-image.tsx
import React, { useEffect, useState } from 'react';
import { Database } from '../lib/database.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

type Posts = Database['public']['Tables']['posts']['Row'];

export default function PostImage({
  postId,
  url,
  size,
}: {
  postId: string;
  url: Posts['image_url'];
  size: number;
}) {
  const supabase = createClientComponentClient<Database>();
  const [imageUrl, setImageUrl] = useState<Posts['image_url']>(url);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from('posts').download(path);
        if (error) {
          throw error;
        }

        const imageUrl = URL.createObjectURL(data);
        setImageUrl(imageUrl);
      } catch (error) {
        console.log('Error downloading post image: ', error);
      }
    }

    if (url) downloadImage(url);
  }, [url, supabase]);

  return (
    <div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Post ${postId}`}
          className="post-image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="post-image no-image" style={{ height: size, width: size }} />
      )}
    </div>
  );
}
