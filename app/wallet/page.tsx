"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getProfileHeaders, getStoredProfile, saveProfile, type LastBloomProfile } from "../../lib/lastBloomProfile";

type WalletState = {
  user: {
    id: string;
    email: string;
    displayName: string;
  } | null;
  balances: {
    cosmeticBalance: number;
    withdrawablePurchaseBalance: number;
    pendingPrizeAmount: number;
    approvedPrizeAmount: number;
  };
  purchases: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    product: {
      name: string;
      type: string;
    } | null;
  }>;
  winners: Array<{
    id: string;
    gameId: string;
    rank: 1 | 2 | 3;
    prizeAmount: number;
    status: string;
    createdAt: string;
  }>;
  legal: string;
};

export default function WalletPage() {
  const [profile, setProfile] = useState<LastBloomProfile | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [message, setMessage] = useState("");

  const requestHeaders = useMemo(
    () => ({
      ...getProfileHeaders(profile)
    }),
    [profile]
  );

  const loadWallet = useCallback(async () => {
    if (!profile) {
      return;
    }

    const response = await fetch("/api/wallet/current", {
      cache: "no-store",
      headers: requestHeaders
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Could not load wallet.");
    }

    setWallet(payload as WalletState);
  }, [profile, requestHeaders]);

  useEffect(() => {
    const stored = getStoredProfile();

    setProfile(stored);

    if (stored) {
      setEmail(stored.email);
      setDisplayName(stored.displayName);
    }
  }, []);

  useEffect(() => {
    loadWallet().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Could not load wallet.");
    });
  }, [loadWallet]);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = saveProfile(email.trim(), displayName.trim() || email.split("@")[0] || "Flower Guest");

    setProfile(nextProfile);
    setMessage("Signed in. Wallet records will load for this profile.");
  }

  return (
    <main className="bloom-info-page wallet-page">
      <nav className="bloom-info-nav" aria-label="Last Bloom navigation">
        <Link href="/">Flower</Link>
        <Link href="/game">Play Last Bloom</Link>
        <Link href="/rules">Rules</Link>
        <Link href="/shop">Flower Shop</Link>
      </nav>

      <section className="info-hero">
        <p className="eyebrow">Player account</p>
        <h1>Wallet</h1>
        <p>
          Track cosmetic items and prize records. Recharge balances cannot be withdrawn, and prize
          payouts require administrator review before release.
        </p>
      </section>

      <section className="wallet-grid" aria-label="Wallet balances">
        <article className="info-panel">
          <h2>User</h2>
          <p>{wallet?.user?.displayName ?? profile?.displayName ?? "Not signed in"}</p>
          <p className="muted-text">{wallet?.user?.email ?? profile?.email ?? "Login required"}</p>
        </article>

        <article className="info-panel">
          <h2>Purchase Balance</h2>
          <strong>${wallet?.balances.withdrawablePurchaseBalance.toFixed(2) ?? "0.00"}</strong>
          <p>Recharge balance is cosmetic only and cannot be withdrawn.</p>
        </article>

        <article className="info-panel">
          <h2>Pending Prizes</h2>
          <strong>${wallet?.balances.pendingPrizeAmount.toFixed(2) ?? "0.00"}</strong>
          <p>Prize claims stay pending until administrator approval.</p>
        </article>

        <article className="info-panel">
          <h2>Approved Prizes</h2>
          <strong>${wallet?.balances.approvedPrizeAmount.toFixed(2) ?? "0.00"}</strong>
          <p>Approved records are still not automatic withdrawals.</p>
        </article>
      </section>

      <section className="wallet-records">
        <article className="info-panel">
          <h2>Cosmetic Items</h2>
          {wallet?.purchases.length ? (
            <ul>
              {wallet.purchases.map((purchase) => (
                <li key={purchase.id}>
                  <span>{purchase.product?.name ?? purchase.id}</span>
                  <strong>${purchase.amount.toFixed(2)}</strong>
                  <em>{purchase.status}</em>
                </li>
              ))}
            </ul>
          ) : (
            <p>No cosmetic purchases yet.</p>
          )}
        </article>

        <article className="info-panel">
          <h2>Prize Records</h2>
          {wallet?.winners.length ? (
            <ul>
              {wallet.winners.map((winner) => (
                <li key={winner.id}>
                  <span>Rank {winner.rank}</span>
                  <strong>${winner.prizeAmount.toFixed(2)}</strong>
                  <em>{winner.status}</em>
                </li>
              ))}
            </ul>
          ) : (
            <p>No prize records yet.</p>
          )}
        </article>
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
          <button type="button" onClick={() => loadWallet().catch(() => undefined)}>
            Refresh
          </button>
        </form>
        <p className="legal-note">
          No purchase necessary. Purchase does not increase your chances of winning.
        </p>
        {message ? <p className="inline-alert">{message}</p> : null}
      </section>
    </main>
  );
}
