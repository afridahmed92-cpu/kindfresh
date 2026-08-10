"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PageShell } from "../site-shell";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Product = {
  id: number;
  name: string;
  flavour: string | null;
  size: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
};

export default function Juices() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Product loading error:", error);
        setLoading(false);
        return;
      }

      setItems(data || []);
      setLoading(false);
    }

    loadProducts();
  }, []);

  const list = useMemo(() => {
    const search = q.toLowerCase().trim();

    if (!search) return items;

    return items.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const flavour = product.flavour?.toLowerCase() || "";

      return name.includes(search) || flavour.includes(search);
    });
  }, [items, q]);

  return (
    <PageShell accent="#f19a38">
      <section className="catalog-hero">
        <p className="eyebrow">The Fresh Kind family</p>

        <h1>
          30+ products.
          <br />
          One Fresh Kind.
        </h1>

        <p>
          Explore classic, tropical and speciality fruit beverages across our
          growing range.
        </p>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search juices..."
          aria-label="Search juices"
        />
      </section>

      <section className="catalog-grid">
        {loading && <p>Loading products...</p>}

        {!loading && list.length === 0 && (
          <p>No products found.</p>
        )}

        {!loading &&
          list.map((product) => (
            <article className="catalog-card" key={product.id}>
              <div>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "260px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "260px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f5f5f5",
                      borderRadius: "12px",
                    }}
                  >
                    No image
                  </div>
                )}
              </div>

              <h3>{product.name}</h3>

              {product.flavour && (
                <p>{product.flavour}</p>
              )}

              {product.size && (
                <p>{product.size}</p>
              )}

              {product.description && (
                <p>{product.description}</p>
              )}
            </article>
          ))}
      </section>
    </PageShell>
  );
}
