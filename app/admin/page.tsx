"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CmsField } from "../cms-runtime";
import { CMS_ADMIN_EMAIL, CMS_BUCKET, SUPABASE_ANON_KEY, SUPABASE_URL } from "../cms-config";
import styles from "./admin.module.css";

type Session = { access_token: string; user?: { email?: string } };
type SavedRow = { field_key: string; value: string };
const pages = [
  { path: "/", name: "Home" }, { path: "/our-story", name: "Our Story" }, { path: "/our-juices", name: "Our Juices" },
  { path: "/partnership", name: "Partnership" }, { path: "/contact", name: "Contact" },
];

const apiHeaders = (token?: string) => ({ apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`, "Content-Type": "application/json" });

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [pagePath, setPagePath] = useState("/");
  const [fields, setFields] = useState<CmsField[]>([]);
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "text" | "image" | "link">("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { try { const raw = localStorage.getItem("fresh-kind-cms-session"); if (raw) setSession(JSON.parse(raw)); } catch {} }, []);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin === location.origin && event.data?.type === "fresh-kind-cms-fields" && event.data.pagePath === pagePath) setFields(event.data.fields);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [pagePath]);
  useEffect(() => { if (session) loadSaved(); }, [session, pagePath]);

  async function loadSaved() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?page_path=eq.${encodeURIComponent(pagePath)}&select=field_key,value`, { headers: apiHeaders(session?.access_token) });
    if (!response.ok) { setNotice("Supabase setup is not complete. Run supabase/setup.sql in the Supabase SQL Editor."); return; }
    const rows = await response.json() as SavedRow[];
    setSaved(Object.fromEntries(rows.map((row) => [row.field_key, row.value])));
    setNotice("");
  }

  async function saveField(field: CmsField, value: string) {
    if (!session) return;
    setLoading(true);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?on_conflict=page_path,field_key`, {
      method: "POST", headers: { ...apiHeaders(session.access_token), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ page_path: pagePath, field_key: field.key, kind: field.kind, value, label: field.label, image_width: field.width || null, image_height: field.height || null, updated_at: new Date().toISOString() }),
    });
    setLoading(false);
    if (!response.ok) { setNotice(`Could not save: ${await response.text()}`); return; }
    setSaved((current) => ({ ...current, [field.key]: value }));
    setNotice("Saved. Refresh the preview or public page to see the update.");
  }

  async function resetField(field: CmsField) {
    if (!session) return;
    await fetch(`${SUPABASE_URL}/rest/v1/site_content?page_path=eq.${encodeURIComponent(pagePath)}&field_key=eq.${field.key}`, { method: "DELETE", headers: apiHeaders(session.access_token) });
    setSaved((current) => { const next = { ...current }; delete next[field.key]; return next; });
    setNotice("Restored the original website content.");
  }

  async function uploadImage(field: CmsField, file: File) {
    if (!session) return;
    setLoading(true);
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const objectPath = `${pagePath === "/" ? "home" : pagePath.slice(1)}/${Date.now()}-${safe}`;
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${CMS_BUCKET}/${objectPath}`, {
      method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" }, body: file,
    });
    if (!response.ok) { setLoading(false); setNotice(`Upload failed: ${await response.text()}`); return; }
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${CMS_BUCKET}/${objectPath}`;
    await saveField(field, publicUrl);
    setLoading(false);
  }

  function signOut() { localStorage.removeItem("fresh-kind-cms-session"); setSession(null); }
  const visible = useMemo(() => fields.filter((field) => (filter === "all" || field.kind === filter) && (field.label + field.value).toLowerCase().includes(search.toLowerCase())), [fields, filter, search]);

  if (!session) return <Login onSession={(next) => { localStorage.setItem("fresh-kind-cms-session", JSON.stringify(next)); setSession(next); }} />;
  return <main className={styles.admin} data-cms-ignore>
    <header className={styles.topbar}><div><span className={styles.mark}>FK</span><div><b>Fresh Kind CMS</b><small>Complete website editor</small></div></div><div><span>{session.user?.email || CMS_ADMIN_EMAIL}</span><button onClick={signOut}>Sign out</button></div></header>
    <div className={styles.workspace}>
      <aside className={styles.sidebar}><p>Website pages</p><a href="/admin/products" style={{display:"flex",justifyContent:"space-between",background:"#173c27",color:"#fff",padding:"13px 12px",borderRadius:8,fontSize:12,fontWeight:800,marginBottom:10}}>Manage products <span>↗</span></a>{pages.map((page) => <button key={page.path} className={pagePath === page.path ? styles.active : ""} onClick={() => { setFields([]); setPagePath(page.path); }}>{page.name}<span>›</span></button>)}<div className={styles.tip}><b>Image sizing</b><p>Every image field displays its current pixel size. Upload the same size and aspect ratio for the best result.</p></div></aside>
      <section className={styles.editor}>
        <div className={styles.editorHead}><div><p>Editing page</p><h1>{pages.find((page) => page.path === pagePath)?.name}</h1></div><a href={pagePath} target="_blank">Open live page ↗</a></div>
        {notice && <div className={styles.notice}>{notice}</div>}
        <div className={styles.tools}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search text, images or links…" /><div>{(["all", "text", "image", "link"] as const).map((name) => <button key={name} className={filter === name ? styles.activeFilter : ""} onClick={() => setFilter(name)}>{name === "all" ? "All fields" : `${name}s`}</button>)}</div></div>
        <div className={styles.fieldList}>{!fields.length && <div className={styles.loading}>Loading every editable field from the page…</div>}{visible.map((field) => <FieldEditor key={field.key} field={field} value={saved[field.key] ?? field.value} changed={field.key in saved} busy={loading} onSave={(value) => saveField(field, value)} onReset={() => resetField(field)} onUpload={(file) => uploadImage(field, file)} />)}</div>
      </section>
      <aside className={styles.preview}><div><b>Live page preview</b><button onClick={() => { const frame = document.querySelector<HTMLIFrameElement>("#cms-preview-frame"); if (frame) frame.src = `${pagePath}?cms-preview=1&t=${Date.now()}`; }}>Refresh</button></div><iframe id="cms-preview-frame" title="Website page preview" key={pagePath} src={`${pagePath}?cms-preview=1`} /></aside>
    </div>
  </main>;
}

function FieldEditor({ field, value, changed, busy, onSave, onReset, onUpload }: { field: CmsField; value: string; changed: boolean; busy: boolean; onSave: (value: string) => void; onReset: () => void; onUpload: (file: File) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return <article className={styles.fieldCard}>
    <div className={styles.fieldTitle}><span className={`${styles.kind} ${styles[field.kind]}`}>{field.kind}</span><div><b>{field.label}</b><small>{field.key}{changed ? " · Custom content active" : " · Original content"}</small></div></div>
    {field.kind === "image" ? <div className={styles.imageEditor}><img src={draft} alt="Current CMS asset" /><div><b>Recommended image size</b><strong>{field.width && field.height ? `${field.width} × ${field.height} px` : "Match the original aspect ratio"}</strong><small>{field.width && field.height ? `Aspect ratio ${(field.width / field.height).toFixed(2)}:1 · PNG, JPG or WebP` : "PNG, JPG or WebP"}</small><label>Replace image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} /></label><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Or paste an image URL" /></div></div> : field.kind === "text" ? <textarea rows={Math.min(7, Math.max(2, Math.ceil(draft.length / 75)))} value={draft} onChange={(event) => setDraft(event.target.value)} /> : <input value={draft} onChange={(event) => setDraft(event.target.value)} />}
    <div className={styles.fieldActions}><button disabled={busy || draft === value} onClick={() => onSave(draft)}>Save change</button>{changed && <button className={styles.reset} onClick={onReset}>Restore original</button>}</div>
  </article>;
}

function Login({ onSession }: { onSession: (session: Session) => void }) {
  const [email, setEmail] = useState(CMS_ADMIN_EMAIL); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent, mode: "login" | "signup") {
    event.preventDefault(); setBusy(true); setMessage("");
    if (email.toLowerCase() !== CMS_ADMIN_EMAIL) { setBusy(false); setMessage("This email is not authorised for the Fresh Kind dashboard."); return; }
    const endpoint = mode === "login" ? "/auth/v1/token?grant_type=password" : "/auth/v1/signup";
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(data.msg || data.error_description || data.message || "Unable to continue."); return; }
    if (data.access_token) onSession(data); else setMessage("Account created. Confirm the email if Supabase asks you to, then sign in.");
  }
  return <main className={styles.login} data-cms-ignore><section><span className={styles.loginLogo}>FK</span><p>Fresh Kind</p><h1>Website admin dashboard</h1><p>Edit every page, image, product description, button and contact detail from one place.</p><form onSubmit={(event) => submit(event, "login")}><label>Admin email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>{message && <div className={styles.loginMessage}>{message}</div>}<button disabled={busy}>{busy ? "Please wait…" : "Sign in"}</button><button type="button" className={styles.create} onClick={(event) => submit(event as unknown as FormEvent, "signup")}>Create first admin account</button></form><small>Only {CMS_ADMIN_EMAIL} is authorised.</small></section></main>;
}
