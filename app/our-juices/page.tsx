"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../site-shell";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../cms-config";

type Product = { id?: number; name: string; flavour: string; image_url: string; accent: string; category: string; size: string; description: string; is_active?: boolean };
const defaults: Product[] = [
  { name: "Papaya Juice", flavour: "Papaya", image_url: "/assets/papaya-full.png", accent: "#ee8b35", category: "Bottle", size: "250 ML", description: "Refreshing fruit flavour in a convenient bottle. Shake well and enjoy fresh." },
  { name: "Guava Juice", flavour: "Pink Guava", image_url: "/assets/guava-full.png", accent: "#75a93e", category: "Bottle", size: "250 ML", description: "Refreshing fruit flavour in a convenient bottle. Shake well and enjoy fresh." },
  { name: "Litchi Juice", flavour: "Litchi", image_url: "/assets/litchi-full.png", accent: "#df6f80", category: "Bottle", size: "250 ML", description: "Refreshing fruit flavour in a convenient bottle. Shake well and enjoy fresh." },
  { name: "Chiku Juice", flavour: "Chiku", image_url: "/assets/chiku-full.png", accent: "#b58a5b", category: "Bottle", size: "250 ML", description: "Refreshing fruit flavour in a convenient bottle. Shake well and enjoy fresh." },
  { name: "Pineapple Juice", flavour: "Pineapple", image_url: "/assets/pineapple-full.png", accent: "#e3ad20", category: "Bottle", size: "250 ML", description: "Refreshing fruit flavour in a convenient bottle. Shake well and enjoy fresh." },
  { name: "Blueberry Boba", flavour: "Blueberry", image_url: "/assets/blueberry-full.png", accent: "#7257a8", category: "Boba", size: "250 ML", description: "A playful blueberry fruit drink with chewy boba pearls." },
  { name: "Lemon Mojito Boba", flavour: "Lemon", image_url: "/assets/lemon-full.png", accent: "#9dc538", category: "Boba", size: "250 ML", description: "A bright lemon mojito fruit drink with chewy boba pearls." },
  { name: "Tender Coconut Water", flavour: "Tender Coconut", image_url: "/assets/tender-coconut.png", accent: "#8db532", category: "Tin", size: "330 ML", description: "Naturally hydrating coconut water with real tender coconut pulp and refreshing electrolytes." },
];

export default function Juices() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [items, setItems] = useState<Product[]>(defaults);
  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/products?is_active=eq.true&select=*&order=position.asc,created_at.asc`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } })
      .then(async (response) => response.ok ? response.json() : Promise.reject())
      .then((rows: Product[]) => { if (rows.length) setItems(rows); })
      .catch(() => { /* Preserve the full built-in range if Supabase is unavailable. */ });
  }, []);
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const list = useMemo(() => items.filter((item) => (category === "All" || item.category === category) && (item.name + item.flavour).toLowerCase().includes(q.toLowerCase())), [q, category, items]);

  return <PageShell accent="#f19a38">
    <section className="catalog-hero"><p className="eyebrow">The Fresh Kind family</p><h1>30+ products.<br />One Fresh Kind.</h1><p>Explore classic, tropical and speciality fruit beverages across our growing range.</p><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search juices..." aria-label="Search juices" /><div className="catalog-filters" aria-label="Product categories">{categories.map((name) => <button key={name} className={category === name ? "active" : ""} onClick={() => setCategory(name)}>{name}</button>)}</div></section>
    <section className="catalog-grid">{list.map((item) => <article key={item.id || item.name} style={{ "--accent": item.accent } as React.CSSProperties}><div><img src={item.image_url} alt={item.name} /><i /></div><small>{item.category} · {item.flavour} · {item.size}</small><h2>{item.name}</h2><p>{item.description}</p><a href={`https://wa.me/919741189488?text=${encodeURIComponent(`Hi Fresh Kind, I'm interested in ${item.name}.`)}`}>Enquire on WhatsApp ↗</a></article>)}</section>
    <section className="page-cta"><h2>Need the complete catalogue?</h2><a className="button" href="/contact">Request catalogue ↗</a></section>
  </PageShell>;
}
