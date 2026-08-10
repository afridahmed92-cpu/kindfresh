"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [flavour, setFlavour] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts(data || []);
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { error } = await supabase.from("products").insert({
      name,
      slug,
      flavour,
      size,
      description,
      image_url: imageUrl || null,
      is_active: true,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setName("");
    setFlavour("");
    setSize("");
    setDescription("");
    setImageUrl("");

    setMessage("Product added successfully.");

    await loadProducts();
    setLoading(false);
  }

  async function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadProducts();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7f2",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <a href="/admin">← Back to Dashboard</a>

          <h1 style={{ marginTop: "20px" }}>Products</h1>

          <p style={{ color: "#666" }}>
            Add and manage Fresh Kind products.
          </p>
        </div>

        <form
          onSubmit={addProduct}
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            marginBottom: "30px",
          }}
        >
          <h2>Add New Product</h2>

          <input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            placeholder="Flavour"
            value={flavour}
            onChange={(e) => setFlavour(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Size e.g. 250 ML"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: "100px",
            }}
          />

          <input
            placeholder="Product Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 25px",
              background: "#315c2b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>

          {message && (
            <p style={{ marginTop: "15px" }}>{message}</p>
          )}
        </form>

        <div>
          <h2>Current Products</h2>

          {products.length === 0 && (
            <p>No products added yet.</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "14px",
                }}
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "contain",
                      marginBottom: "15px",
                    }}
                  />
                )}

                <h3>{product.name}</h3>

                <p>{product.flavour}</p>

                <p>{product.size}</p>

                <p style={{ color: "#666" }}>
                  {product.description}
                </p>

                <button
                  onClick={() => deleteProduct(product.id)}
                  style={{
                    marginTop: "10px",
                    color: "#b00020",
                    background: "transparent",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px",
  marginTop: "10px",
  marginBottom: "15px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxSizing: "border-box" as const,
};
