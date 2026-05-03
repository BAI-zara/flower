"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type AdminState = {
  game: {
    id: string;
    status: string;
    countdownRemaining: number;
    totalParticipants: number;
    totalClicks: number;
    minParticipants: number;
    cashAwardMinParticipants: number;
    cancellationReason: string | null;
  };
  settings: {
    dailyPrizeBudget: number;
    maxGamesPerDay: number;
    minParticipants: number;
    cashAwardMinParticipants: number;
    minSponsorRevenue: number;
    sponsorRevenuePool: number;
    clickCooldownSeconds: number;
    dailyBudgetRemaining: number;
  };
  winners: Array<{
    id: string;
    gameId: string;
    userId: string;
    rank: 1 | 2 | 3;
    prizeAmount: number;
    status: string;
    createdAt: string;
    user: {
      displayName: string;
    };
  }>;
  antiFraudLogs: Array<{
    id: string;
    userId: string;
    gameId: string;
    reason: string;
    severity: string;
    createdAt: string;
    user: {
      displayName: string;
    };
  }>;
};

type SettingsForm = {
  dailyPrizeBudget: number;
  maxGamesPerDay: number;
  minParticipants: number;
  cashAwardMinParticipants: number;
  minSponsorRevenue: number;
  sponsorRevenuePool: number;
};

const defaultSettings: SettingsForm = {
  dailyPrizeBudget: 18,
  maxGamesPerDay: 1,
  minParticipants: 20,
  cashAwardMinParticipants: 30,
  minSponsorRevenue: 18,
  sponsorRevenuePool: 0
};

export default function AdminGamesPage() {
  const [token, setToken] = useState("demo-admin");
  const [state, setState] = useState<AdminState | null>(null);
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings);
  const [flagUserId, setFlagUserId] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const adminHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-token": token
    }),
    [token]
  );

  const loadAdmin = useCallback(async () => {
    const response = await fetch("/api/admin/games", {
      cache: "no-store",
      headers: adminHeaders
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Could not load admin state.");
    }

    const nextState = payload as AdminState;

    setState(nextState);
    setSettings({
      dailyPrizeBudget: nextState.settings.dailyPrizeBudget,
      maxGamesPerDay: nextState.settings.maxGamesPerDay,
      minParticipants: nextState.settings.minParticipants,
      cashAwardMinParticipants: nextState.settings.cashAwardMinParticipants,
      minSponsorRevenue: nextState.settings.minSponsorRevenue,
      sponsorRevenuePool: nextState.settings.sponsorRevenuePool
    });
  }, [adminHeaders]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("last-bloom-admin-token");

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("last-bloom-admin-token", token);
  }, [token]);

  useEffect(() => {
    loadAdmin().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Could not load admin state.");
    });
  }, [loadAdmin]);

  async function runAction(action: string, body: Record<string, unknown> = {}) {
    setBusy(true);

    try {
      const response = await fetch("/api/admin/games", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action, ...body })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Admin action failed.");
      }

      if ("game" in payload) {
        setState(payload as AdminState);
      }

      setMessage(`Action complete: ${action}`);
      await loadAdmin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Admin action failed.");
    } finally {
      setBusy(false);
    }
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction("updateSettings", { settings });
  }

  async function exportClicks() {
    setBusy(true);

    try {
      const response = await fetch("/api/admin/games/export", {
        cache: "no-store",
        headers: adminHeaders
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Export failed.");
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `last-bloom-clicks-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Click records exported.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-page">
      <nav className="bloom-info-nav" aria-label="Admin navigation">
        <Link href="/game">Game</Link>
        <Link href="/rules">Rules</Link>
        <Link href="/shop">Shop</Link>
        <Link href="/wallet">Wallet</Link>
      </nav>

      <section className="admin-hero">
        <p className="eyebrow">Operations</p>
        <h1>Last Bloom Admin</h1>
        <label>
          Admin token
          <input value={token} onChange={(event) => setToken(event.target.value)} />
        </label>
      </section>

      <section className="admin-grid">
        <article className="info-panel">
          <h2>Current Game</h2>
          <dl className="stat-list">
            <div><dt>Status</dt><dd>{state?.game.status ?? "loading"}</dd></div>
            <div><dt>Game ID</dt><dd>{state?.game.id ?? "-"}</dd></div>
            <div><dt>Countdown</dt><dd>{state?.game.countdownRemaining ?? 60}s</dd></div>
            <div><dt>Players</dt><dd>{state?.game.totalParticipants ?? 0}</dd></div>
            <div><dt>Clicks</dt><dd>{state?.game.totalClicks ?? 0}</dd></div>
            <div><dt>Minimum players</dt><dd>{state?.game.minParticipants ?? 20}</dd></div>
          </dl>
          {state?.game.cancellationReason ? <p className="inline-alert">{state.game.cancellationReason}</p> : null}
          <div className="admin-actions">
            <button type="button" disabled={busy} onClick={() => runAction("manualStart")}>
              Manual Start
            </button>
            <button type="button" disabled={busy} onClick={() => runAction("cancel")}>
              Cancel
            </button>
            <button type="button" disabled={busy} onClick={() => runAction("end")}>
              End Now
            </button>
            <button type="button" disabled={busy} onClick={exportClicks}>
              Export Clicks
            </button>
          </div>
        </article>

        <article className="info-panel">
          <h2>Prize Pool Settings</h2>
          <form className="settings-form" onSubmit={saveSettings}>
            {Object.entries(settings).map(([key, value]) => (
              <label key={key}>
                {key}
                <input
                  type="number"
                  min="0"
                  step={key.includes("Prize") || key.includes("Revenue") || key.includes("Pool") ? "0.01" : "1"}
                  value={value}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, [key]: Number(event.target.value) }))
                  }
                />
              </label>
            ))}
            <button type="submit" disabled={busy}>Save Settings</button>
          </form>
        </article>

        <article className="info-panel">
          <h2>Winner Review</h2>
          {state?.winners.length ? (
            <ul className="admin-list">
              {state.winners.map((winner) => (
                <li key={winner.id}>
                  <span>{winner.user.displayName} · Rank {winner.rank} · ${winner.prizeAmount}</span>
                  <em>{winner.status}</em>
                  <button type="button" onClick={() => runAction("reviewWinner", { winnerId: winner.id, status: "approved" })}>
                    Approve
                  </button>
                  <button type="button" onClick={() => runAction("reviewWinner", { winnerId: winner.id, status: "rejected" })}>
                    Reject
                  </button>
                  <button type="button" onClick={() => runAction("reviewWinner", { winnerId: winner.id, status: "paid" })}>
                    Mark Paid
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No winners yet.</p>
          )}
        </article>

        <article className="info-panel">
          <h2>Fraud Review</h2>
          <form
            className="settings-form"
            onSubmit={(event) => {
              event.preventDefault();
              runAction("flagUser", {
                userId: flagUserId,
                gameId: state?.game.id,
                reason: flagReason || "Manually flagged by administrator"
              });
            }}
          >
            <label>
              User ID
              <input value={flagUserId} onChange={(event) => setFlagUserId(event.target.value)} />
            </label>
            <label>
              Reason
              <input value={flagReason} onChange={(event) => setFlagReason(event.target.value)} />
            </label>
            <button type="submit" disabled={busy}>Flag User</button>
          </form>
          {state?.antiFraudLogs.length ? (
            <ul className="admin-list">
              {state.antiFraudLogs.map((log) => (
                <li key={log.id}>
                  <span>{log.user.displayName} · {log.reason}</span>
                  <em>{log.severity}</em>
                </li>
              ))}
            </ul>
          ) : (
            <p>No fraud logs yet.</p>
          )}
        </article>
      </section>

      {message ? <p className="admin-toast">{message}</p> : null}
    </main>
  );
}
