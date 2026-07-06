'use client';
import { useEffect, useState } from 'react';
import { fetchFeedPosts } from './postsDb';
import type { FeedPost } from '@/data/types';

/** Az összes poszt betöltése klienoldalon (aloldalak közös hookja). */
export function usePosts() {
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedPosts()
      .then(setPosts)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Hiba a betöltéskor');
        setPosts([]);
      });
  }, []);

  return { posts, loading: posts === null, error };
}
