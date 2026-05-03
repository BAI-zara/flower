"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getProfileHeaders, getStoredProfile, saveProfile, type LastBloomProfile } from "../../lib/lastBloomProfile";

type Product = {
  id: string;
  name: string;
  type: "skin" | "background" | "animation" | "membership";
  price: number;
  active: boolean;
};

export default function ShopPage() {
  const [profile, setProfile] = useState<LastBloomProfile | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [busyProduct, setBusyProduct] = useState<string | null>(null);

  const requestHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...getProfileHeaders(profile)
    }),
    [profile]
  );

  useEffect(() => {
    const stored = getStoredProfile();

    setProfile(stored);

    if (stored) {
      setEmail(stored.email);
      setDisplayName(stored.displayName);
    }

    fetch("/api/products", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { products: Product[] }) => setProducts(payload.products))
      .catch(() => setMessage("Could not load products."));
  }, []);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = saveProfile(email.trim(), displayName.trim() || email.split("@")[0] || "Flower Guest");

    setProfile(nextProfile);
    setMessage("Signed in for cosmetic checkout.");
  }

  async function createCheckout(productId: string) {
    if (!profile) {
      setMessage("Sign in before purchasing cosmetic items.");
      return;
    }

    setBusyProduct(productId);

    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({ productId })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Checkout could not be created.");
      }

      setMessage(
        `Airwallex cosmetic checkout created for ${payload.product.name}. Purchase does not increase your chances of winning.`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout could not be created.");
    } finally {
      setBusyProduct(null);
    }
  }

  return (
    <main className="bloom-info-page shop-page">
      <nav className="bloom-info-nav" aria-label="Last Bloom navigation">
        <Link href="/">Flower</Link>
        <Link href="/game">Play Last Bloom</Link>
        <Link href="/rules">Rules</Link>
        <Link href="/wallet">Wallet</Link>
      </nav>

      <section className="info-hero">
        <p className="eyebrow">Cosmetic only</p>
        <h1>Flower Shop</h1>
        <p>
          Buy flower skins, dream backgrounds, and premium animation effects. Purchases are never
          entry fees and never improve odds, ranking, click count, or rewards.
        </p>
        <p className="legal-note">
          No purchase necessary. Purchase does not increase your chances of winning.
        </p>
      </section>

      <section className="shop-layout" aria-label="Flower Shop products">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div className={`product-swatch product-${product.type}`} aria-hidden="true" />
            <p className="eyebrow">{product.type}</p>
            <h2>{product.name}</h2>
            <strong>${product.price.toFixed(2)}</strong>
            <p>Cosmetic item only. No gameplay advantage, no extra clicks, no better odds.</p>
            <button
              type="button"
              disabled={busyProduct === product.id}
              onClick={() => createCheckout(product.id)}
            >
              Buy Cosmetic
            </button>
          </article>
        ))}
      </section>

      <section className="shop-login-panel">
        <form onSubmit={signIn}>
          <input
            type="email"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Display name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <button type="submit">{profile ? "Update Login" : "Login"}</button>
        </form>
        {message ? <p className="inline-alert">{message}</p> : null}
      </section>
    </main>
  );
}
