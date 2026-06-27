'use client';
import { useState, useEffect } from 'react';

type Post = {
  id: number;
  title: string;
  category: string;
  yes_votes: number;
  no_votes: number;
  description: string;
}

export default function TrendingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        const sorted = [...data].sort((a, b) => 
          (b.yes_votes + b.no_votes) - (a.yes_votes + a.no_votes)
        );
        setPosts(sorted);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Betöltés...</div>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>🔥 Trending</h1>
      <p style={{ color: '#666', marginBottom: 20 }}>A legtöbb szavazatot kapott témák</p>
      {posts.map((post, index) => {
        const total = post.yes_votes + post.no_votes;
        const yesPercent = total > 0 ? Math.round(post.yes_votes / total * 100) : 0;
        return (
          <div key={post.id} style={{ 
            border: '1px solid #eee', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            backgroundColor: index === 0 ? '#fff8f0' : 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#f97316' }}>#{index + 1}</span>
              <span style={{ fontSize: 12, color: '#666', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: 20 }}>{post.category}</span>
            </div>
            <h3 style={{ margin: '0 0 8px 0' }}>{post.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666' }}>
              <span>✅ {yesPercent}% igen</span>
              <span>🗳️ {total} szavazat</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}