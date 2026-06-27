"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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
  const [activeCategory, setActiveCategory] = useState("Mind");
  const [votes, setVotes] = useState({ home: 348, draw: 97, away: 98 });
  const [userVote, setUserVote] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [tip, setTip] = useState("home");
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

useEffect(() => {
  fetch('/api/posts')
    .then(res => res.json())
    .then(data => setPosts(data))
}, []);

  const categories = ["Mind", "Foci", "Lakhatás", "Politika"];
  const filtered = activeCategory === "Mind" ? posts : posts.filter(p => p.category === activeCategory);

  const total = votes.home + votes.draw + votes.away;
  const ph = Math.round(votes.home / total * 100);
  const pd = Math.round(votes.draw / total * 100);
  const pa = 100 - ph - pd;

async function castVote(opt: string) {
  if (userVote === opt) return;
  const nv = {...votes, [opt]: votes[opt as keyof typeof votes] + 1};
  if (userVote) nv[userVote as keyof typeof votes]--;
  setVotes(nv);
  setUserVote(opt);

  if (selectedTopic) {
    await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: selectedTopic.id,
        vote: opt
      })
    });
  }
}

  async function postComment() {
    if (!text.trim()) return;
    const newComments = [{id: Date.now(), user: "Te", tip, text, likes: 0, dislikes: 0, liked: false, disliked: false}, ...comments];
    setComments(newComments);
    setText("");
    await generateSummary(newComments);
  }

  async function generateSummary(cmts: Comment[]) {
    setAiLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({comments: cmts})
      });
      const data = await res.json();
      setAiSummary(data);
    } catch(e) { console.error(e); }
    setAiLoading(false);
  }

  function voteLike(id: number) {
    setComments(cs => cs.map(c => {
      if (c.id !== id) return c;
      if (c.liked) return {...c, likes: c.likes - 1, liked: false};
      return {...c, likes: c.likes + 1, liked: true, dislikes: c.disliked ? c.dislikes - 1 : c.dislikes, disliked: false};
    }));
  }

  function voteDislike(id: number) {
    setComments(cs => cs.map(c => {
      if (c.id !== id) return c;
      if (c.disliked) return {...c, dislikes: c.dislikes - 1, disliked: false};
      return {...c, dislikes: c.dislikes + 1, disliked: true, likes: c.liked ? c.likes - 1 : c.likes, liked: false};
    }));
  }

  const tipLabel: Record<string,string> = {home:"Igen", draw:"Nem tudom", away:"Nem"};
  const tipBg: Record<string,string> = {home:"#dcfce7", draw:"#fef9c3", away:"#fee2e2"};
  const tipColor: Record<string,string> = {home:"#166534", draw:"#92400e", away:"#991b1b"};
  const tipBorder: Record<string,string> = {home:"#16a34a", draw:"#d97706", away:"#dc2626"};

  const categoryIcon: Record<string,string> = {"Foci":"⚽","Lakhatás":"🏠","Politika":"🗳️"};

  if (selectedTopic !== null) {
    return (
      <div style={{background:"#f8fafc",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
        <div style={{background:"white",borderBottom:"1px solid #e5e7eb",padding:"14px 16px",display:"flex",alignItems:"center",gap:"12px",position:"sticky",top:0,zIndex:10}}>
          <button onClick={()=>setSelectedTopic(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"20px",padding:"4px"}}>←</button>
          <div>
            <div style={{fontSize:"11px",color:"#6b7280"}}>{categoryIcon[selectedTopic.category]} {selectedTopic.category}</div>
            <div style={{fontSize:"16px",fontWeight:"700"}}>{selectedTopic.title}</div>
          </div>
        </div>

        <div style={{maxWidth:"600px",margin:"0 auto",padding:"16px"}}>
          <div style={{background:"white",borderRadius:"16px",padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",marginBottom:"12px"}}>
            <p style={{textAlign:"center",fontWeight:"600",marginBottom:"12px",color:"#374151"}}>Mi a véleményed?</p>
            <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
              {["home","draw","away"].map(opt => (
                <button key={opt} onClick={()=>castVote(opt)} style={{flex:1,padding:"10px 6px",background:userVote===opt?tipBg[opt]:"#f9fafb",border:"2px solid "+(userVote===opt?tipBorder[opt]:"#e5e7eb"),borderRadius:"10px",cursor:"pointer",fontWeight:userVote===opt?"700":"400",color:userVote===opt?tipColor[opt]:"#374151",fontSize:"12px"}}>
                  {tipLabel[opt]}
                </button>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",fontWeight:"600",marginBottom:"5px"}}>
              <span style={{color:"#166534"}}>{ph}%</span>
              <span style={{color:"#92400e"}}>{pd}%</span>
              <span style={{color:"#991b1b"}}>{pa}%</span>
            </div>
            <div style={{height:"8px",borderRadius:"99px",overflow:"hidden",display:"flex"}}>
              <div style={{width:ph+"%",background:"#16a34a"}}></div>
              <div style={{width:pd+"%",background:"#d97706"}}></div>
              <div style={{width:pa+"%",background:"#dc2626"}}></div>
            </div>
            <p style={{textAlign:"center",fontSize:"12px",color:"#9ca3af",marginTop:"6px"}}>{total} szavazat</p>
          </div>

          {aiSummary ? (
            <div style={{background:"linear-gradient(135deg,#e8f5e9,#f0fdf4)",border:"1px solid #a5d6a7",borderRadius:"16px",padding:"16px",marginBottom:"12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                <span style={{background:"#166534",color:"white",fontSize:"11px",padding:"3px 10px",borderRadius:"99px",fontWeight:"600"}}>🤖 CrowdMind AI</span>
                <span style={{fontSize:"12px",color:"#166534"}}>{comments.length} vélemény alapján</span>
              </div>
              <div style={{background:"white",borderRadius:"12px",padding:"12px",marginBottom:"8px"}}>
                <div style={{fontSize:"13px",color:"#374151",lineHeight:"1.7"}}>{aiSummary.summary}</div>
              </div>
              <button onClick={()=>setShowAll(!showAll)} style={{marginTop:"10px",background:"none",border:"1px solid #a5d6a7",borderRadius:"8px",padding:"6px 14px",cursor:"pointer",fontSize:"12px",color:"#166534",width:"100%"}}>
                {showAll ? "Elrejtés ▲" : `Összes vélemény (${comments.length}) ▼`}
              </button>
            </div>
          ) : (
            <div style={{background:"white",borderRadius:"16px",padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",marginBottom:"12px",textAlign:"center"}}>
              <button onClick={()=>generateSummary(comments)} style={{background:"#1a1a2e",color:"white",border:"none",borderRadius:"10px",padding:"10px 20px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}>
                {aiLoading ? "⏳ AI elemez..." : "🤖 AI összefoglaló"}
              </button>
            </div>
          )}

          <div style={{background:"white",borderRadius:"16px",padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",marginBottom:"12px"}}>
            <textarea value={text} onChange={e=>setText(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:"10px",border:"1.5px solid #e5e7eb",height:"70px",fontFamily:"inherit",fontSize:"14px",resize:"none",outline:"none",boxSizing:"border-box"}} placeholder="Írd le a véleményed..."/>
            <div style={{display:"flex",gap:"6px",marginTop:"8px",alignItems:"center"}}>
              {["home","draw","away"].map(opt => (
                <button key={opt} onClick={()=>setTip(opt)} style={{padding:"5px 10px",borderRadius:"99px",border:"1.5px solid "+(tip===opt?tipBorder[opt]:"#e5e7eb"),background:tip===opt?tipBg[opt]:"white",cursor:"pointer",fontSize:"11px",fontWeight:tip===opt?"600":"400",color:tip===opt?tipColor[opt]:"#6b7280"}}>
                  {tipLabel[opt]}
                </button>
              ))}
              <button onClick={postComment} style={{marginLeft:"auto",padding:"8px 16px",background:"#1a1a2e",color:"white",border:"none",borderRadius:"10px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>
                {aiLoading ? "⏳" : "Küldés"}
              </button>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {(showAll ? comments : comments.slice(0,3)).map(c => (
              <div key={c.id} style={{background:"white",borderRadius:"16px",padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                  <div style={{width:"34px",height:"34px",borderRadius:"50%",background:tipBg[c.tip],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",fontSize:"12px",color:tipColor[c.tip]}}>
                    {c.user.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight:"600",fontSize:"14px"}}>{c.user}</div>
                    <span style={{background:tipBg[c.tip],color:tipColor[c.tip],fontSize:"11px",padding:"1px 8px",borderRadius:"99px",fontWeight:"500"}}>{tipLabel[c.tip]}</span>
                  </div>
                </div>
                <p style={{fontSize:"14px",color:"#374151",lineHeight:"1.5",marginBottom:"10px"}}>{c.text}</p>
                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={()=>voteLike(c.id)} style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 12px",borderRadius:"99px",border:"1px solid "+(c.liked?"#16a34a":"#e5e7eb"),background:c.liked?"#dcfce7":"white",cursor:"pointer",fontSize:"13px",color:c.liked?"#166534":"#6b7280"}}>
                    👍 {c.likes}
                  </button>
                  <button onClick={()=>voteDislike(c.id)} style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 12px",borderRadius:"99px",border:"1px solid "+(c.disliked?"#dc2626":"#e5e7eb"),background:c.disliked?"#fee2e2":"white",cursor:"pointer",fontSize:"13px",color:c.disliked?"#991b1b":"#6b7280"}}>
                    👎 {c.dislikes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"#f8fafc",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:"#1a1a2e",padding:"16px 20px",color:"white"}}>
        <div style={{maxWidth:"600px",margin:"0 auto"}}>
          <h1 style={{fontSize:"22px",fontWeight:"800",margin:0,letterSpacing:"-0.5px"}}>CrowdMind 🧠</h1>
          <p style={{fontSize:"13px",opacity:0.6,margin:"2px 0 0"}}>A közösség véleménye, AI-al rendszerezve</p>
        </div>
      </div>

      <div style={{background:"white",borderBottom:"1px solid #e5e7eb",padding:"0 16px"}}>
        <div style={{maxWidth:"600px",margin:"0 auto",display:"flex",gap:"4px",overflowX:"auto"}}>
          {categories.map(cat => (
            <button key={cat} onClick={()=>setActiveCategory(cat)} style={{padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontWeight:activeCategory===cat?"700":"400",color:activeCategory===cat?"#1a1a2e":"#6b7280",borderBottom:activeCategory===cat?"3px solid #1a1a2e":"3px solid transparent",whiteSpace:"nowrap",fontSize:"14px",fontFamily:"inherit"}}>
              {cat === "Mind" ? "Mind" : categoryIcon[cat]+" "+cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:"600px",margin:"0 auto",padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
        {filtered.map(post => (
          <div key={post.id} onClick={()=>setSelectedTopic(post)} style={{background:"white",borderRadius:"16px",padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
              <span style={{fontSize:"12px",color:"#6b7280"}}>{categoryIcon[post.category]} {post.category}</span>
            </div>
            <div style={{fontSize:"17px",fontWeight:"700",color:"#1a1a2e",marginBottom:"4px"}}>{post.title}</div>
            <div style={{fontSize:"13px",color:"#6b7280",marginBottom:"12px"}}>{post.description}</div>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <div style={{flex:1,height:"6px",borderRadius:"99px",overflow:"hidden",display:"flex",background:"#f3f4f6"}}>
                <div style={{width:Math.round(post.yes_votes/(post.yes_votes+post.no_votes)*100)+"%",background:"#16a34a"}}></div>
                <div style={{width:Math.round(post.no_votes/(post.yes_votes+post.no_votes)*100)+"%",background:"#dc2626"}}></div>
              </div>
              <span style={{fontSize:"12px",color:"#6b7280",whiteSpace:"nowrap"}}>{post.yes_votes+post.no_votes} szavazat</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-around",padding:"10px 0 20px"}}>
        <button style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",border:"none",background:"none",cursor:"pointer",color:"#1a1a2e"}}>
          <span style={{fontSize:"20px"}}>🏠</span>
          <span style={{fontSize:"10px",fontWeight:"600"}}>Főoldal</span>
        </button>
        <button style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",border:"none",background:"none",cursor:"pointer",color:"#9ca3af"}}>
          <span style={{fontSize:"20px"}}>🔥</span>
          <span style={{fontSize:"10px"}}>Trending</span>
        </button>
        <button style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",border:"none",background:"none",cursor:"pointer",color:"#9ca3af"}}>
          <span style={{fontSize:"20px"}}>🔔</span>
          <span style={{fontSize:"10px"}}>Értesítések</span>
        </button>
        <button style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",border:"none",background:"none",cursor:"pointer",color:"#9ca3af"}}>
          <span style={{fontSize:"20px"}}>👤</span>
          <span style={{fontSize:"10px"}}>Profil</span>
        </button>
      </div>
    </div>
  );
}