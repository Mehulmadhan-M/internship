import { useState, useEffect, useRef } from "react";

// ── Palette & fonts injected via a style tag ──────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink:      #1a1610;
      --paper:    #f5f0e8;
      --cream:    #ede8dc;
      --rust:     #c0392b;
      --gold:     #b8860b;
      --muted:    #7a6f60;
      --line:     #d4cec4;
      --white:    #faf8f4;
      --shadow:   0 2px 12px rgba(26,22,16,.10);
      --radius:   4px;
    }

    html, body { height: 100%; background: var(--paper); color: var(--ink); }

    .serif   { font-family: 'Playfair Display', serif; }
    .sans    { font-family: 'DM Sans', sans-serif; }
    .mono    { font-family: 'DM Mono', monospace; }

    /* scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--cream); }
    ::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 3px; }

    /* fade-in */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .fadeUp { animation: fadeUp .4s ease both; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin .8s linear infinite; display:inline-block; }

    /* toast */
    @keyframes slideIn {
      from { opacity:0; transform:translateX(60px); }
      to   { opacity:1; transform:translateX(0); }
    }
    .toast { animation: slideIn .3s ease both; }
  `}</style>
);

// ── Tiny in-memory "database" ─────────────────────────────────────────────────
let DB = {
  users: [
    { id: 1, name: "Ada Lovelace",   email: "ada@example.com",   password: "password", avatar: "AL", bio: "Pioneer of computing & poetry." },
    { id: 2, name: "Charles Babbage", email: "charlie@example.com", password: "password", avatar: "CB", bio: "Mechanical mind, analytical soul." },
  ],
  posts: [
    {
      id: 1, authorId: 1,
      title: "The First Algorithm",
      excerpt: "Long before silicon chips, one mind imagined what machines could compute…",
      body: `Long before silicon chips, one mind imagined what machines could compute. Ada Lovelace's notes on Babbage's Analytical Engine contain what many historians consider the first algorithm — a procedure designed to be executed by a machine.\n\nHer insight was not merely technical. She understood that the Engine could manipulate symbols according to rules, extending far beyond arithmetic. This conceptual leap — from calculation to computation — is the foundation of everything we build today.\n\nWhen we write code, we inherit her vision: that thought itself can be mechanised, iterated, and shared across time.`,
      tags: ["history", "computing"],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: null,
    },
    {
      id: 2, authorId: 2,
      title: "On Difference Engines",
      excerpt: "Building a machine to eliminate human arithmetic error seemed straightforward. It was not.",
      body: `Building a machine to eliminate human arithmetic error seemed straightforward. It was not.\n\nThe Difference Engine required thousands of precision parts machined to tolerances that nineteenth-century craftsmen could barely achieve. Funding dried up. Parts were wrong. The vision outran the technology of its age.\n\nYet the idea was sound. A century later, Konrad Zuse and then the wartime engineers of Bletchley and Bell Labs would finally build what Babbage had imagined. Sometimes a design is simply too early — not wrong, just premature.\n\nPatience, precision, and persistence: the three virtues of every engineer.`,
      tags: ["engineering", "history"],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: null,
    },
  ],
  comments: [
    { id: 1, postId: 1, authorId: 2, body: "Brilliant overview. The leap from arithmetic to symbolic manipulation was truly revolutionary.", createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: 2, postId: 1, authorId: 1, body: "Thank you! The symbolic angle is what makes her work timeless.", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 3, postId: 2, authorId: 1, body: "The 'too early' framing is apt. I think of Nikola Tesla in the same breath.", createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
  nextUserId: 3,
  nextPostId: 3,
  nextCommentId: 4,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = iso => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const fmtTime = iso => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const initials = name => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

// ── AI helper ─────────────────────────────────────────────────────────────────
async function askClaude(prompt, systemPrompt = "") {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt || "You are a helpful editorial assistant for a blog platform.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = "info", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const bg = type === "error" ? "#c0392b" : type === "success" ? "#2d6a4f" : "#1a1610";
  return (
    <div className="toast" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: "#fff", padding: "10px 18px",
      borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontSize: 14,
      boxShadow: "0 4px 20px rgba(0,0,0,.25)", maxWidth: 320,
    }}>{message}</div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  const colors = ["#8B4513","#2E4057","#5C4033","#1B4332","#4A1942"];
  const color = colors[(user?.id || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
      fontSize: size * 0.36, flexShrink: 0,
    }}>{user ? initials(user.name) : "?"}</div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ currentUser, onNav, currentPage, onLogout }) {
  return (
    <nav style={{
      borderBottom: "2px solid var(--ink)",
      background: "var(--paper)",
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center",
      padding: "0 32px", height: 56,
      gap: 0,
    }}>
      <button onClick={() => onNav("home")} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, marginRight: "auto" }}>
        <span className="serif" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--ink)" }}>
          ✦ Folio
        </span>
      </button>

      {["home", "explore"].map(p => (
        <button key={p} onClick={() => onNav(p)} style={{
          border: "none", background: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
          color: currentPage === p ? "var(--rust)" : "var(--muted)",
          padding: "0 16px", height: "100%",
          borderBottom: currentPage === p ? "2px solid var(--rust)" : "2px solid transparent",
          marginBottom: -2, textTransform: "uppercase", letterSpacing: "0.08em",
          transition: "color .2s",
        }}>{p}</button>
      ))}

      {currentUser ? (
        <>
          <button onClick={() => onNav("new-post")} style={{
            marginLeft: 16, padding: "6px 16px",
            background: "var(--ink)", color: "var(--paper)",
            border: "none", borderRadius: 2, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
          }}>+ Write</button>
          <button onClick={() => onNav("profile")} style={{
            marginLeft: 10, border: "none", background: "none", cursor: "pointer", padding: 0,
          }}>
            <Avatar user={currentUser} size={32} />
          </button>
          <button onClick={onLogout} style={{
            marginLeft: 8, border: "1px solid var(--line)", background: "none",
            padding: "5px 12px", borderRadius: 2, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--muted)",
          }}>Out</button>
        </>
      ) : (
        <>
          <button onClick={() => onNav("login")} style={{
            marginLeft: 16, padding: "6px 16px",
            border: "1px solid var(--ink)", background: "none",
            borderRadius: 2, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          }}>Sign in</button>
          <button onClick={() => onNav("register")} style={{
            marginLeft: 8, padding: "6px 16px",
            background: "var(--ink)", color: "var(--paper)",
            border: "none", borderRadius: 2, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          }}>Register</button>
        </>
      )}
    </nav>
  );
}

// ── Auth Forms ────────────────────────────────────────────────────────────────
function AuthForm({ mode, onSuccess, onSwitch, toast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const handle = () => {
    setErr("");
    if (mode === "login") {
      const user = DB.users.find(u => u.email === form.email && u.password === form.password);
      if (!user) return setErr("Invalid email or password.");
      onSuccess(user);
    } else {
      if (!form.name || !form.email || !form.password) return setErr("All fields required.");
      if (DB.users.find(u => u.email === form.email)) return setErr("Email already registered.");
      const user = { id: DB.nextUserId++, name: form.name, email: form.email, password: form.password, avatar: initials(form.name), bio: "" };
      DB.users.push(user);
      onSuccess(user);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    border: "1px solid var(--line)", borderRadius: 2,
    fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    background: "var(--white)", color: "var(--ink)",
    outline: "none", marginBottom: 12,
  };

  return (
    <div className="fadeUp" style={{ maxWidth: 420, margin: "80px auto", padding: "0 24px" }}>
      <h1 className="serif" style={{ fontSize: 36, marginBottom: 6 }}>{mode === "login" ? "Welcome back." : "Join Folio."}</h1>
      <p className="sans" style={{ color: "var(--muted)", marginBottom: 32, fontSize: 15 }}>
        {mode === "login" ? "Sign in to your account." : "Create your account to start writing."}
      </p>

      {mode === "register" && (
        <input style={inputStyle} placeholder="Full name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />
      )}
      <input style={inputStyle} type="email" placeholder="Email address" value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })} />
      <input style={inputStyle} type="password" placeholder="Password" value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        onKeyDown={e => e.key === "Enter" && handle()} />

      {err && <p style={{ color: "var(--rust)", fontSize: 13, marginBottom: 12 }}>{err}</p>}

      <button onClick={handle} style={{
        width: "100%", padding: "11px",
        background: "var(--ink)", color: "var(--paper)",
        border: "none", borderRadius: 2, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
      }}>{mode === "login" ? "Sign in" : "Create account"}</button>

      <p className="sans" style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted)" }}>
        {mode === "login" ? "No account? " : "Have an account? "}
        <button onClick={onSwitch} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--rust)", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
          {mode === "login" ? "Register" : "Sign in"}
        </button>
      </p>

      <p className="sans" style={{ marginTop: 24, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
        Demo: ada@example.com / password
      </p>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, onClick }) {
  const author = DB.users.find(u => u.id === post.authorId);
  const commentCount = DB.comments.filter(c => c.postId === post.id).length;

  return (
    <article onClick={onClick} style={{
      borderBottom: "1px solid var(--line)", padding: "28px 0", cursor: "pointer",
      display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start",
      transition: "opacity .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".8"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {post.tags.map(t => (
            <span key={t} className="mono" style={{
              fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
              background: "var(--cream)", color: "var(--muted)", padding: "2px 7px", borderRadius: 2,
            }}>{t}</span>
          ))}
        </div>
        <h2 className="serif" style={{ fontSize: 22, lineHeight: 1.3, marginBottom: 8 }}>{post.title}</h2>
        <p className="sans" style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{post.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar user={author} size={24} />
          <span className="sans" style={{ fontSize: 13, color: "var(--muted)" }}>{author?.name}</span>
          <span style={{ color: "var(--line)" }}>·</span>
          <span className="sans" style={{ fontSize: 13, color: "var(--muted)" }}>{fmt(post.createdAt)}</span>
          <span style={{ color: "var(--line)" }}>·</span>
          <span className="sans" style={{ fontSize: 13, color: "var(--muted)" }}>💬 {commentCount}</span>
        </div>
      </div>
    </article>
  );
}

// ── Home / Feed ───────────────────────────────────────────────────────────────
function Home({ currentUser, onNav, onPostClick }) {
  const sorted = [...DB.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="fadeUp" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ borderBottom: "2px solid var(--ink)", paddingBottom: 24, marginBottom: 8 }}>
        <h1 className="serif" style={{ fontSize: 48, lineHeight: 1.1, marginBottom: 12 }}>
          Ideas worth<br /><em>writing down.</em>
        </h1>
        <p className="sans" style={{ color: "var(--muted)", fontSize: 16 }}>
          A quiet corner for long-form thought. {DB.posts.length} essays published.
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="sans" style={{ color: "var(--muted)", padding: "40px 0" }}>No posts yet. Be the first to write!</p>
      ) : (
        sorted.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p.id)} />)
      )}
    </div>
  );
}

// ── Explore ───────────────────────────────────────────────────────────────────
function Explore({ onPostClick }) {
  const [query, setQuery] = useState("");
  const results = DB.posts.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.body.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fadeUp" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <h1 className="serif" style={{ fontSize: 36, marginBottom: 24 }}>Explore</h1>
      <input value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Search posts, tags…"
        style={{
          width: "100%", padding: "12px 16px", border: "2px solid var(--ink)",
          borderRadius: 2, fontFamily: "'DM Sans', sans-serif", fontSize: 15,
          background: "var(--white)", marginBottom: 32, outline: "none",
        }} />
      {results.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p.id)} />)}
      {results.length === 0 && <p className="sans" style={{ color: "var(--muted)" }}>No results found.</p>}
    </div>
  );
}

// ── Post Detail ───────────────────────────────────────────────────────────────
function PostDetail({ postId, currentUser, onNav, toast }) {
  const [post, setPost] = useState(DB.posts.find(p => p.id === postId));
  const [comments, setComments] = useState(DB.comments.filter(c => c.postId === postId));
  const [commentBody, setCommentBody] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ title: post?.title || "", body: post?.body || "", tags: post?.tags?.join(", ") || "" });

  if (!post) return <div style={{ padding: 80, textAlign: "center" }} className="sans">Post not found.</div>;

  const author = DB.users.find(u => u.id === post.authorId);
  const isAuthor = currentUser?.id === post.authorId;

  const submitComment = () => {
    if (!commentBody.trim()) return;
    if (!currentUser) return toast("Sign in to comment.", "error");
    const c = { id: DB.nextCommentId++, postId, authorId: currentUser.id, body: commentBody.trim(), createdAt: new Date().toISOString() };
    DB.comments.push(c);
    setComments(DB.comments.filter(c => c.postId === postId));
    setCommentBody("");
    toast("Comment posted!", "success");
  };

  const deletePost = () => {
    if (!confirm("Delete this post?")) return;
    DB.posts = DB.posts.filter(p => p.id !== postId);
    DB.comments = DB.comments.filter(c => c.postId !== postId);
    toast("Post deleted.", "info");
    onNav("home");
  };

  const saveEdit = () => {
    const tags = editData.tags.split(",").map(t => t.trim()).filter(Boolean);
    const idx = DB.posts.findIndex(p => p.id === postId);
    DB.posts[idx] = { ...DB.posts[idx], title: editData.title, body: editData.body, tags, updatedAt: new Date().toISOString(), excerpt: editData.body.slice(0, 120) + "…" };
    setPost(DB.posts[idx]);
    setEditMode(false);
    toast("Post updated!", "success");
  };

  const deleteComment = (cId) => {
    DB.comments = DB.comments.filter(c => c.id !== cId);
    setComments(DB.comments.filter(c => c.postId === postId));
    toast("Comment removed.", "info");
  };

  const summarise = async () => {
    setAiLoading(true);
    try {
      const s = await askClaude(`Summarise this blog post in 2 sentences:\n\nTitle: ${post.title}\n\n${post.body}`);
      setAiSummary(s);
    } catch { toast("AI unavailable.", "error"); }
    setAiLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 2,
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, background: "var(--white)", marginBottom: 10, outline: "none",
  };

  return (
    <div className="fadeUp" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <button onClick={() => onNav("home")} className="sans" style={{
        border: "none", background: "none", cursor: "pointer", color: "var(--muted)",
        fontSize: 13, marginBottom: 32, display: "flex", alignItems: "center", gap: 6,
      }}>← All posts</button>

      {editMode ? (
        <div>
          <input style={{ ...inputStyle, fontSize: 22, fontFamily: "'Playfair Display', serif" }}
            value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
          <textarea style={{ ...inputStyle, minHeight: 280, resize: "vertical", lineHeight: 1.7 }}
            value={editData.body} onChange={e => setEditData({ ...editData, body: e.target.value })} />
          <input style={inputStyle} placeholder="Tags (comma-separated)"
            value={editData.tags} onChange={e => setEditData({ ...editData, tags: e.target.value })} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveEdit} style={{ padding: "8px 20px", background: "var(--ink)", color: "var(--paper)", border: "none", borderRadius: 2, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Save</button>
            <button onClick={() => setEditMode(false)} style={{ padding: "8px 20px", background: "none", border: "1px solid var(--line)", borderRadius: 2, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {post.tags.map(t => (
              <span key={t} className="mono" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", background: "var(--cream)", color: "var(--muted)", padding: "2px 7px", borderRadius: 2 }}>{t}</span>
            ))}
          </div>

          <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.15, marginBottom: 20 }}>{post.title}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36, paddingBottom: 28, borderBottom: "1px solid var(--line)" }}>
            <Avatar user={author} size={40} />
            <div>
              <p className="sans" style={{ fontWeight: 500, fontSize: 14 }}>{author?.name}</p>
              <p className="sans" style={{ color: "var(--muted)", fontSize: 13 }}>{fmt(post.createdAt)}{post.updatedAt ? " · edited" : ""}</p>
            </div>
            {isAuthor && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={() => setEditMode(true)} style={{ padding: "5px 14px", border: "1px solid var(--line)", background: "none", borderRadius: 2, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Edit</button>
                <button onClick={deletePost} style={{ padding: "5px 14px", border: "1px solid var(--rust)", color: "var(--rust)", background: "none", borderRadius: 2, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Delete</button>
              </div>
            )}
          </div>

          <div className="sans" style={{ fontSize: 17, lineHeight: 1.85, color: "#2a2520", whiteSpace: "pre-line", marginBottom: 40 }}>
            {post.body}
          </div>

          {/* AI Summary */}
          <div style={{ background: "var(--cream)", borderLeft: "3px solid var(--gold)", padding: "16px 20px", marginBottom: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: aiSummary ? 8 : 0 }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>✦ AI Summary</span>
              <button onClick={summarise} disabled={aiLoading} style={{
                padding: "4px 12px", fontSize: 12, border: "1px solid var(--gold)", color: "var(--gold)",
                background: "none", borderRadius: 2, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>{aiLoading ? <span className="spin">⟳</span> : "Summarise"}</button>
            </div>
            {aiSummary && <p className="sans" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>{aiSummary}</p>}
          </div>
        </>
      )}

      {/* Comments */}
      <section>
        <h3 className="serif" style={{ fontSize: 24, marginBottom: 24 }}>Discussion <span style={{ color: "var(--muted)", fontSize: 16 }}>({comments.length})</span></h3>

        {currentUser ? (
          <div style={{ marginBottom: 32 }}>
            <textarea value={commentBody} onChange={e => setCommentBody(e.target.value)}
              placeholder="Share your thoughts…"
              style={{
                width: "100%", padding: "12px", border: "1px solid var(--line)", borderRadius: 2,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, resize: "vertical", minHeight: 90,
                background: "var(--white)", outline: "none", marginBottom: 8,
              }} />
            <button onClick={submitComment} style={{
              padding: "8px 20px", background: "var(--ink)", color: "var(--paper)",
              border: "none", borderRadius: 2, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            }}>Post comment</button>
          </div>
        ) : (
          <p className="sans" style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
            <button onClick={() => onNav("login")} style={{ border: "none", background: "none", color: "var(--rust)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Sign in</button> to join the discussion.
          </p>
        )}

        {comments.length === 0 && <p className="sans" style={{ color: "var(--muted)", fontSize: 14 }}>No comments yet. Start the conversation!</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {comments.map(c => {
            const cAuthor = DB.users.find(u => u.id === c.authorId);
            const canDelete = currentUser?.id === c.authorId || currentUser?.id === post.authorId;
            return (
              <div key={c.id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Avatar user={cAuthor} size={28} />
                  <span className="sans" style={{ fontWeight: 500, fontSize: 13 }}>{cAuthor?.name}</span>
                  <span className="sans" style={{ color: "var(--muted)", fontSize: 12 }}>{fmtTime(c.createdAt)}</span>
                  {canDelete && (
                    <button onClick={() => deleteComment(c.id)} style={{ marginLeft: "auto", border: "none", background: "none", color: "var(--muted)", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>✕</button>
                  )}
                </div>
                <p className="sans" style={{ fontSize: 14, lineHeight: 1.65, color: "#2a2520" }}>{c.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── New / Edit Post ───────────────────────────────────────────────────────────
function NewPost({ currentUser, onSuccess, toast }) {
  const [form, setForm] = useState({ title: "", body: "", tags: "" });
  const [aiLoading, setAiLoading] = useState(false);

  if (!currentUser) return <div style={{ padding: 80, textAlign: "center" }} className="sans">Please sign in to write.</div>;

  const publish = () => {
    if (!form.title.trim() || !form.body.trim()) return toast("Title and body required.", "error");
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const post = {
      id: DB.nextPostId++,
      authorId: currentUser.id,
      title: form.title.trim(),
      excerpt: form.body.trim().slice(0, 140) + "…",
      body: form.body.trim(),
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    DB.posts.push(post);
    toast("Post published!", "success");
    onSuccess(post.id);
  };

  const aiAssist = async () => {
    if (!form.title) return toast("Enter a title first.", "error");
    setAiLoading(true);
    try {
      const draft = await askClaude(
        `Write a compelling 3-paragraph blog post introduction for the title: "${form.title}". Be thoughtful, substantive, and intellectual.`,
        "You are a skilled essayist. Write clear, elegant prose without bullet points or headers."
      );
      setForm(f => ({ ...f, body: draft }));
      toast("Draft generated!", "success");
    } catch { toast("AI unavailable.", "error"); }
    setAiLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 2,
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, background: "var(--white)", marginBottom: 12, outline: "none",
  };

  return (
    <div className="fadeUp" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <h1 className="serif" style={{ fontSize: 36, marginBottom: 28 }}>New Essay</h1>

      <input style={{ ...inputStyle, fontSize: 24, fontFamily: "'Playfair Display', serif", padding: "12px" }}
        placeholder="Your title…" value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })} />

      <input style={inputStyle} placeholder="Tags (comma-separated, e.g. technology, culture)"
        value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />

      <div style={{ position: "relative" }}>
        <textarea style={{ ...inputStyle, minHeight: 360, resize: "vertical", lineHeight: 1.8, fontSize: 15 }}
          placeholder="Write your post here…"
          value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={publish} style={{
          padding: "10px 24px", background: "var(--ink)", color: "var(--paper)",
          border: "none", borderRadius: 2, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
        }}>Publish</button>

        <button onClick={aiAssist} disabled={aiLoading} style={{
          padding: "10px 18px", background: "none", border: "1px solid var(--gold)",
          color: "var(--gold)", borderRadius: 2, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
        }}>
          {aiLoading ? <span className="spin">⟳</span> : "✦"} AI Draft
        </button>

        <span className="sans" style={{ fontSize: 12, color: "var(--muted)" }}>Enter a title, then let AI draft your intro.</span>
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function Profile({ currentUser, onPostClick }) {
  const myPosts = DB.posts.filter(p => p.authorId === currentUser.id);
  const myComments = DB.comments.filter(c => c.authorId === currentUser.id);

  return (
    <div className="fadeUp" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 40, paddingBottom: 32, borderBottom: "2px solid var(--ink)" }}>
        <Avatar user={currentUser} size={64} />
        <div>
          <h1 className="serif" style={{ fontSize: 32 }}>{currentUser.name}</h1>
          <p className="sans" style={{ color: "var(--muted)", fontSize: 14 }}>{currentUser.email}</p>
          {currentUser.bio && <p className="sans" style={{ marginTop: 6, fontSize: 14 }}>{currentUser.bio}</p>}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24 }}>
          {[["Posts", myPosts.length], ["Comments", myComments.length]].map(([label, n]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p className="serif" style={{ fontSize: 28 }}>{n}</p>
              <p className="sans" style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="serif" style={{ fontSize: 24, marginBottom: 16 }}>Your essays</h2>
      {myPosts.length === 0
        ? <p className="sans" style={{ color: "var(--muted)" }}>Nothing published yet.</p>
        : myPosts.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p.id)} />)
      }
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [activePostId, setActivePostId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
  };

  const removeToast = id => setToasts(t => t.filter(x => x.id !== id));

  const navigate = p => { setPage(p); window.scrollTo(0, 0); };

  const openPost = id => { setActivePostId(id); navigate("post"); };

  return (
    <>
      <GlobalStyles />
      <Navbar currentUser={currentUser} onNav={navigate} currentPage={page} onLogout={() => { setCurrentUser(null); navigate("home"); toast("Signed out."); }} />

      <main>
        {page === "home" && <Home currentUser={currentUser} onNav={navigate} onPostClick={openPost} />}
        {page === "explore" && <Explore onPostClick={openPost} />}
        {page === "post" && <PostDetail postId={activePostId} currentUser={currentUser} onNav={navigate} toast={toast} />}
        {page === "new-post" && <NewPost currentUser={currentUser} onSuccess={id => { setActivePostId(id); navigate("post"); }} toast={toast} />}
        {page === "profile" && currentUser && <Profile currentUser={currentUser} onPostClick={openPost} />}
        {(page === "login" || page === "register") && (
          <AuthForm
            mode={page}
            onSuccess={user => { setCurrentUser(user); navigate("home"); toast(`Welcome, ${user.name.split(" ")[0]}!`, "success"); }}
            onSwitch={() => navigate(page === "login" ? "register" : "login")}
            toast={toast}
          />
        )}
      </main>

      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />)}
    </>
  );
}
