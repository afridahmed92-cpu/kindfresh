"use client";

import { useMemo, useState } from "react";
import { PageShell } from "../site-shell";

const items = [
  { n: "Papaya Juice", f: "Papaya", i: "papaya-full.png", c: "#ee8b35", category: "Bottle", size: "250 ML" },
  { n: "Guava Juice", f: "Pink Guava", i: "guava-full.png", c: "#75a93e", category: "Bottle", size: "250 ML" },
  { n: "Litchi Juice", f: "Litchi", i: "litchi-full.png", c: "#df6f80", category: "Bottle", size: "250 ML" },
  { n: "Chiku Juice", f: "Chiku", i: "chiku-full.png", c: "#b58a5b", category: "Bottle", size: "250 ML" },
  { n: "Pineapple Juice", f: "Pineapple", i: "pineapple-full.png", c: "#e3ad20", category: "Bottle", size: "250 ML" },
  { n: "Blueberry Boba", f: "Blueberry", i: "blueberry-full.png", c: "#7257a8", category: "Boba", size: "250 ML" },
  { n: "Lemon Mojito Boba", f: "Lemon", i: "lemon-full.png", c: "#9dc538", category: "Boba", size: "250 ML" },
  { n: "Tender Coconut Water", f: "Tender Coconut", i: "tender-coconut.png", c: "#8db532", category: "Tin", size: "330 ML" },
];

export default function Juices() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const list = useMemo(
    () => items.filter((x) => (category === "All" || x.category === category) && (x.n + x.f).toLowerCase().includes(q.toLowerCase())),
    [q, category],
  );

  return <PageShell accent="#f19a38">
    <section className="catalog-hero">
      <p className="eyebrow">The Fresh Kind family</p>
      <h1>30+ products.<br />One Fresh Kind.</h1>
      <p>Explore classic, tropical and speciality fruit beverages across our growing range.</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search juices..." aria-label="Search juices" />
      <div className="catalog-filters" aria-label="Product categories">
        {["All", "Bottle", "Boba", "Tin"].map((name) => <button key={name} className={category === name ? "active" : ""} onClick={() => setCategory(name)}>{name}</button>)}
      </div>
    </section>
    <section className="catalog-grid">
      {list.map((x) => <article key={x.n} style={{ "--accent": x.c } as React.CSSProperties}>
        <div><img src={`/assets/${x.i}`} alt={x.n} /><i /></div>
        <small>{x.category} · {x.f} · {x.size}</small>
        <h2>{x.n}</h2>
        <p>{x.category === "Tin" ? "Naturally hydrating coconut water with real tender coconut pulp and refreshing electrolytes." : "Refreshing fruit flavour in a convenient bottle. Shake well and enjoy fresh."}</p>
        <a href={`https://wa.me/919741189488?text=${encodeURIComponent(`Hi Fresh Kind, I'm interested in ${x.n}.`)}`}>Enquire on WhatsApp ↗</a>
      </article>)}
    </section>
    <section className="page-cta"><h2>Need the complete catalogue?</h2><a className="button" href="/contact">Request catalogue ↗</a></section>
  </PageShell>;
}
