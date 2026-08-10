"use client";

import { FormEvent, useEffect, useState } from "react";
import { CMS_BUCKET, SUPABASE_ANON_KEY, SUPABASE_URL } from "../../cms-config";
import styles from "./products.module.css";

type Session = { access_token: string; user?: { email?: string } };
type Product = { id?: number; name: string; slug: string; flavour: string; category: string; size: string; description: string; image_url: string; accent: string; is_active: boolean; position: number };
const empty: Product = { name: "", slug: "", flavour: "", category: "Bottle", size: "250 ML", description: "", image_url: "", accent: "#8db532", is_active: true, position: 100 };

export default function ProductsAdmin() {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product>({ ...empty });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem("fresh-kind-cms-session"); if (!raw) { location.href = "/admin"; return; } const next = JSON.parse(raw); setSession(next); load(next); } catch { location.href = "/admin"; }
  }, []);
  const headers = (token = session?.access_token) => ({ apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`, "Content-Type": "application/json" });

  async function load(activeSession = session) {
    if (!activeSession) return;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=position.asc,created_at.asc`, { headers: headers(activeSession.access_token) });
    if (!response.ok) { setMessage("Products table is not ready. Run the latest supabase/setup.sql once more."); return; }
    setProducts(await response.json());
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!session) return; setBusy(true); setMessage("");
    const product = { ...editing, slug: editing.slug || editing.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") };
    const isEdit = Boolean(product.id);
    const url = isEdit ? `${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}` : `${SUPABASE_URL}/rest/v1/products`;
    const response = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { ...headers(), Prefer: "return=minimal" }, body: JSON.stringify(product) });
    setBusy(false); if (!response.ok) { setMessage(await response.text()); return; }
    setEditing({ ...empty }); setMessage(isEdit ? "Product updated." : "Product added."); await load();
  }
  async function remove(id?: number) {
    if (!id || !session || !confirm("Delete this product permanently?")) return;
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: "DELETE", headers: headers() }); await load();
  }
  async function toggle(product: Product) {
    if (!session || !product.id) return;
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, { method: "PATCH", headers: { ...headers(), Prefer: "return=minimal" }, body: JSON.stringify({ is_active: !product.is_active }) }); await load();
  }
  async function upload(file: File) {
    if (!session) return; setBusy(true);
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-"); const path = `products/${Date.now()}-${safe}`;
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${CMS_BUCKET}/${path}`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" }, body: file });
    setBusy(false); if (!response.ok) { setMessage(`Image upload failed: ${await response.text()}`); return; }
    setEditing((current) => ({ ...current, image_url: `${SUPABASE_URL}/storage/v1/object/public/${CMS_BUCKET}/${path}` }));
  }

  return <main className={styles.page} data-cms-ignore><header><div><a href="/admin">← Website editor</a><h1>Product manager</h1><p>Add, edit and organise products shown on the public Our Juices page.</p></div><a href="/our-juices" target="_blank">View products ↗</a></header>
    {message && <div className={styles.message}>{message}</div>}
    <section className={styles.layout}><form onSubmit={save}><h2>{editing.id ? "Edit product" : "Add a product"}</h2><div className={styles.imageBox}>{editing.image_url ? <img src={editing.image_url} alt="Product preview" /> : <span>Product image<br /><small>Recommended: 1086 × 1448 px portrait</small></span>}</div><label className={styles.upload}>Upload from computer<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} /></label><label>Name<input required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label><div className={styles.two}><label>Flavour<input value={editing.flavour} onChange={(event) => setEditing({ ...editing, flavour: event.target.value })} /></label><label>Category<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })}><option>Bottle</option><option>Boba</option><option>Tin</option></select></label></div><div className={styles.two}><label>Size<input value={editing.size} onChange={(event) => setEditing({ ...editing, size: event.target.value })} /></label><label>Accent colour<input type="color" value={editing.accent} onChange={(event) => setEditing({ ...editing, accent: event.target.value })} /></label></div><label>Description<textarea rows={4} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label><label>Image URL<input required value={editing.image_url} onChange={(event) => setEditing({ ...editing, image_url: event.target.value })} /></label><label>Display order<input type="number" value={editing.position} onChange={(event) => setEditing({ ...editing, position: Number(event.target.value) })} /></label><label className={styles.check}><input type="checkbox" checked={editing.is_active} onChange={(event) => setEditing({ ...editing, is_active: event.target.checked })} /> Active on website</label><div className={styles.actions}><button disabled={busy}>{busy ? "Saving…" : editing.id ? "Save product" : "Add product"}</button>{editing.id && <button type="button" className={styles.cancel} onClick={() => setEditing({ ...empty })}>Cancel</button>}</div></form>
      <div className={styles.list}><div className={styles.listHead}><h2>Current products</h2><span>{products.length} products</span></div>{products.map((product) => <article key={product.id}><img src={product.image_url} alt={product.name} /><div><span>{product.category} · {product.size}</span><h3>{product.name}</h3><p>{product.flavour}</p></div><em className={product.is_active ? styles.live : styles.hidden}>{product.is_active ? "Live" : "Hidden"}</em><div className={styles.cardActions}><button onClick={() => { setEditing(product); scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button><button onClick={() => toggle(product)}>{product.is_active ? "Hide" : "Activate"}</button><button className={styles.delete} onClick={() => remove(product.id)}>Delete</button></div></article>)}</div>
    </section></main>;
}
