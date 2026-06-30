'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Post = {
  id: number;
  title: string;
  category: string;
  description: string;
  yes_votes: number;
  no_votes: number;
};

type Comment = {
  id: number;
  user: string;
  tip: string;
  text: string;
  likes: number;
  dislikes: number;
  liked: boolean;
  disliked: boolean;
};

type AISummary = {
  agree: string[];
  disagree: string[];
  summary: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Post | null>(null);
  const [activeCategory, setActiveCategory] = useState('Mind');
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [tip, setTip] = useState('home');
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    function checkWidth() {
      setIsWide(window.innerWidth >= 1100);
    }
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const categories = ['Mind', 'Foci', 'Lakhatás', 'Politika', 'Tech', 'Egyéb'];
  const filtered = activeCategory === 'Mind' ? posts : posts.filter(p => p.category === activeCategory);

  const categoryEmojis: Record<string, string> = {
    Foci: '⚽', Lakhatás: '🏠', Politika: '🏛️', Tech: '💻', Egyéb: '💬'
  };

  async function castPostVote(postId: number, vote: 'yes' | 'no') {
    await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, vote }),
    });
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
    if (selectedTopic) {
      const updated = data.find((p: Post) => p.id === postId);
      if (updated) setSelectedTopic(updated);
    }
  }

  async function loadComments(postId: number) {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    if (data) {
      setComments(data.map((c: any) => ({ ...c, liked: false, disliked: false })));
    }
  }

  async function submitComment() {
    if (!text.trim() || !selectedTopic) return;
    await (supabase.from('comments') as any).insert({
      post_id: selectedTopic.id,
      user: 'Felhasználó',
      tip,
      text: text.trim(),
      likes: 0,
      dislikes: 0,
    });
    setText('');
    loadComments(selectedTopic.id);
  }

  async function summarize() {
    if (!selectedTopic) return;
    setAiLoading(true);
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: selectedTopic.id }),
    });
    const data = await res.json();
    setAiSummary(data);
    setAiLoading(false);
  }

  function openTopic(post: Post) {
    setSelectedTopic(post);
    setAiSummary(null);
    loadComments(post.id);
  }

  function closeTopic() {
    setSelectedTopic(null);
    setAiSummary(null);
    setComments([]);
  }

  const bg = '#0a0a0f';
  const card = '#16161f';
  const border = '#2a2a3a';
  const purple = '#7c3aed';
  const purpleLight = '#8b5cf6';
  const green = '#10b981';
  const red = '#ef4444';
  const textPrimary = '#f0f0ff';
  const textSecondary = '#9090b0';
  const textMuted = '#55556a';

  const S = {
    page: { background: bg, minHeight: '100vh', color: textPrimary, fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' },
    card: { background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '16px', marginBottom: '10px', cursor: 'pointer' },
    categoryLabel: { fontSize: '10px', fontWeight: 700, color: purpleLight, textTransform: 'uppercase' as const, letterSpacing: '0.06em', display: 'inline-block', background: 'rgba(124,58,237,0.15)', padding: '3px 8px', borderRadius: '6px', marginBottom: '8px' },
    title: { fontSize: '16px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 },
    desc: { fontSize: '13px', color: textSecondary, marginBottom: '12px', lineHeight: 1.5 },
    barBg: { height: '5px', background: '#111118', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' },
    barFill: (pct: number) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '3px' }),
    voteRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 },
  };

  if (selectedTopic) {
    const yes = selectedTopic.yes_votes || 0;
    const no = selectedTopic.no_votes || 0;
    const tot = yes + no;
    const yesPct = tot > 0 ? Math.round(yes / tot * 100) : 50;
    const noPct = 100 - yesPct;

    return (
      <div style={S.page}>
        <div style={{ background: bg, borderBottom: `1px solid ${border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={closeTopic} style={{ background: card, border: `1px solid ${border}`, borderRadius: '10px', color: textPrimary, width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px' }}>←</button>
          <div>
            <div style={S.categoryLabel}>{categoryEmojis[selectedTopic.category] || '💬'} {selectedTopic.category}</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{selectedTopic.title}</div>
          </div>
        </div>

        <div style={{ padding: '16px', paddingBottom: '100px', maxWidth: '480px', margin: '0 auto' }}>
          {selectedTopic.description && (
            <p style={{ color: textSecondary, fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{selectedTopic.description}</p>
          )}

          <div style={S.card}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: textSecondary, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Közösségi szavazás</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: green }}>{yesPct}%</div>
                <div style={{ fontSize: '12px', color: textSecondary }}>{yes} igen</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: red }}>{noPct}%</div>
                <div style={{ fontSize: '12px', color: textSecondary }}>{no} nem</div>
              </div>
            </div>
            <div style={S.barBg}><div style={S.barFill(yesPct)} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={() => castPostVote(selectedTopic.id, 'yes')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${green}`, background: 'rgba(16,185,129,0.1)', color: green, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>✓ Igen</button>
              <button onClick={() => castPostVote(selectedTopic.id, 'no')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${red}`, background: 'rgba(239,68,68,0.1)', color: red, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>✗ Nem</button>
            </div>
          </div>

          <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>🧠</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: purpleLight, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Összefoglaló</span>
            </div>
            {!aiSummary && !aiLoading && (
              <button onClick={summarize} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: `linear-gradient(135deg, ${purple}, ${purpleLight})`, border: 'none', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Összefoglalás generálása</button>
            )}
            {aiLoading && <div style={{ textAlign: 'center', color: textSecondary, fontSize: '14px' }}>⏳ Elemzés...</div>}
            {aiSummary && (
              <div>
                <p style={{ color: '#d0d0f0', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>{aiSummary.summary}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: green, marginBottom: '8px' }}>MELLETTE</div>
                    {aiSummary.agree.map((a, i) => <div key={i} style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>✓ {a}</div>)}
                  </div>
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: red, marginBottom: '8px' }}>ELLENE</div>
                    {aiSummary.disagree.map((d, i) => <div key={i} style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>✗ {d}</div>)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={S.card}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: textSecondary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hozzászólások</div>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Írd le a véleményed..." style={{ width: '100%', background: '#111118', border: `1.5px solid ${border}`, borderRadius: '10px', color: textPrimary, fontSize: '14px', padding: '12px', minHeight: '80px', resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: '10px', boxSizing: 'border-box' }} />
            <button onClick={submitComment} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: `linear-gradient(135deg, ${purple}, ${purpleLight})`, border: 'none', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Küldés</button>
          </div>

          {comments.map(c => (
            <div key={c.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '14px', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: purpleLight, marginBottom: '6px' }}>{c.user}</div>
              <div style={{ fontSize: '14px', color: '#d0d0f0', lineHeight: 1.5 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const trending = [...posts].sort((a, b) => (b.yes_votes + b.no_votes) - (a.yes_votes + a.no_votes)).slice(0, 5);

  return (
    <div style={S.page}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: `1px solid ${border}` }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: card, border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 12px' }}>
              <span style={{ color: textSecondary, marginRight: '8px' }}>🔍</span>
              <input type="text" placeholder="Keresés témákra..." style={{ background: 'none', border: 'none', outline: 'none', color: textPrimary, fontSize: '14px', flex: 1 }} />
            </div>
            <button onClick={() => window.location.href = '/create'} style={{ background: `linear-gradient(135deg, ${purple}, ${purpleLight})`, border: 'none', borderRadius: '10px', color: 'white', padding: '9px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Új téma</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ flexShrink: 0, padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid', whiteSpace: 'nowrap', background: activeCategory === cat ? purple : 'transparent', borderColor: activeCategory === cat ? purple : border, color: activeCategory === cat ? 'white' : textSecondary }}>{cat}</button>
            ))}
          </div>

          <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: 800 }}>Aktív viták</div>
            <div style={{ fontSize: '12px', color: textSecondary }}>{filtered.length} téma</div>
          </div>

          <div style={{ padding: '0 16px 100px' }}>
            {filtered.map(post => {
              const yes = post.yes_votes || 0;
              const no = post.no_votes || 0;
              const tot = yes + no;
              const yesPct = tot > 0 ? Math.round(yes / tot * 100) : 50;
              return (
                <div key={post.id} onClick={() => openTopic(post)} style={S.card}>
                  <div style={S.categoryLabel}>{categoryEmojis[post.category] || '💬'} {post.category}</div>
                  <div style={S.title}>{post.title}</div>
                  {post.description && <div style={S.desc}>{post.description}</div>}
                  <div style={S.barBg}><div style={S.barFill(yesPct)} /></div>
                  <div style={S.voteRow}>
                    <span style={{ color: green }}>✓ {yesPct}% igen</span>
                    <span style={{ color: textMuted }}>{tot} szavazat</span>
                    <span style={{ color: red }}>✗ {100 - yesPct}% nem</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isWide && (
          <div style={{ width: '300px', flexShrink: 0, padding: '16px', borderLeft: `1px solid ${border}` }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: textSecondary, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔥 Trendek</div>
            <div style={S.card}>
              {trending.map((post, i) => (
                <div key={post.id} onClick={() => openTopic(post)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < trending.length - 1 ? `1px solid ${border}` : 'none', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: purpleLight, fontWeight: 700 }}>#{i + 1}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{post.title}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: textSecondary, margin: '20px 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hangulatindex</div>
            <div style={S.card}>
              <div style={{ textAlign: 'center', fontSize: '32px', fontWeight: 800, color: green }}>65%</div>
              <div style={{ textAlign: 'center', fontSize: '12px', color: textSecondary }}>Pozitív hangulat</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
