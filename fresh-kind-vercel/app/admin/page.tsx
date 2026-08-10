"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [email, setEmail] = useState("admin@fresh-kind.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setMessage("Login failed.");
      setLoading(false);
      return;
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (adminError || adminProfile?.role !== "admin") {
      await supabase.auth.signOut();
      setMessage("You are not authorized as an admin.");
      setLoading(false);
      return;
    }

    setLoggedIn(true);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setLoggedIn(false);
    setPassword("");
  }

  if (loggedIn) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f4f7ef",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div>
              <h1 style={{ margin: 0 }}>Fresh Kind Admin</h1>
              <p>Dashboard</p>
            </div>

            <button onClick={handleLogout}>Logout</button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <DashboardCard title="Products" />
            <DashboardCard title="Categories" />
            <DashboardCard title="Partnership Leads" />
            <DashboardCard title="Contact Enquiries" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7ef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>Fresh Kind Admin</h1>

        <p style={{ marginBottom: "30px", color: "#666" }}>
          Sign in to manage your website.
        </p>

        <label>Email</label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
          }}
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
          }}
        />

        {message && (
          <p
            style={{
              color: "red",
              marginBottom: "20px",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "8px",
            background: "#315c2b",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}

function DashboardCard({ title }: { title: string }) {
  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "14px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
      }}
    >
      <h3>{title}</h3>
      <p style={{ color: "#777" }}>Manage {title.toLowerCase()}</p>
    </div>
  );
}
