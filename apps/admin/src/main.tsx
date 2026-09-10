import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@foundry/design-tokens/tokens.css";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "foundry_admin_session";

async function api(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...((init.headers || {}) as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

function App() {
  const [session, setSession] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try {
      const res = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const body = await res.json();
      if (!res.ok) throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message || "Login failed");
      if (body.user.role !== "operator") throw new Error("This account is not an operator");
      localStorage.setItem(TOKEN_KEY, body.sessionToken); setSession(body.sessionToken);
    } catch (e: any) { setError(e.message); }
  }

  async function load() {
    if (!session) return;
    try {
      setError("");
      const [m, u, a] = await Promise.all([api("/admin/metrics", session), api("/admin/users", session), api("/admin/audit", session)]);
      setMetrics(m); setUsers(u); setAudits(a);
    } catch (e: any) {
      setError(e.message);
      if (/session|token|role|unauthorized|forbidden/i.test(e.message)) { localStorage.removeItem(TOKEN_KEY); setSession(""); }
    }
  }

  useEffect(() => { load(); }, [session]);

  if (!session) return <div className="loginShell"><form className="loginCard" onSubmit={login}><span>FOUNDRY OPS</span><h1>Operator sign in</h1><p>Admin access now uses the same revocable session system plus the persisted operator role.</p><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required /></label><button>Sign in</button>{error && <div className="error">{error}</div>}</form></div>;

  return <main><header><div><span>FOUNDRY OPS</span><h1>Operator console</h1><p>Authenticated operator-only system visibility, users and security audit events.</p></div><div className="actions"><button onClick={load}>Refresh</button><button onClick={() => { localStorage.removeItem(TOKEN_KEY); setSession(""); }}>Sign out</button></div></header>{error && <div className="error">{error}</div>}
    <section className="metrics">{["users", "tasks", "sessions", "auditEvents"].map(k => <article key={k}><b>{metrics?.[k] ?? "—"}</b><span>{k}</span></article>)}</section>
    <section className="panel"><div className="panelHead"><h2>Recent users</h2><span>latest 50</span></div><div className="tableScroll"><table><thead><tr><th>Email</th><th>Role</th><th>Verified</th><th>Created</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.email}</td><td>{u.role}</td><td>{u.verified ? "Yes" : "No"}</td><td>{new Date(u.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></section>
    <section className="panel"><div className="panelHead"><h2>Security audit</h2><span>latest 100</span></div><div className="tableScroll"><table><thead><tr><th>Action</th><th>Actor</th><th>Metadata</th><th>Time</th></tr></thead><tbody>{audits.map(a => <tr key={a.id}><td>{a.action}</td><td>{a.actorUserId || "system"}</td><td><code>{JSON.stringify(a.metadata)}</code></td><td>{new Date(a.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></section>
  </main>;
}

createRoot(document.getElementById("root")!).render(<App />);
