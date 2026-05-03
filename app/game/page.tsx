"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Scene } from "../../components/scene/Scene";
import type { SceneMode } from "../../components/scene/SceneContext";
import { defaultPlant } from "../../data/plants";
import { getProfileHeaders, getStoredProfile, saveProfile, type LastBloomProfile } from "../../lib/lastBloomProfile";
import type { GrowthState } from "../../hooks/useGrowth";
import { Plant } from "../components/Plant";

type PublicGameState = {
  game: {
    id: string;
    status: "waiting" | "active" | "ended" | "cancelled";
    startsAt: string | null;
    endsAt: string | null;
    countdownEndsAt: string | null;
    countdownRemaining: number;
    prize1: number;
    prize2: number;
    prize3: number;
    minParticipants: number;
    cashAwardMinParticipants: number;
    totalParticipants: number;
    totalClicks: number;
    cancellationReason: string | null;
  };
  settings: {
    dailyBudgetRemaining: number;
    minSponsorRevenue: number;
    sponsorRevenuePool: number;
    clickCooldownSeconds: number;
  };
  recentClicks: Array<{
    id: string;
    clickedAt: string;
    user: {
      id: string;
      displayName: string;
    };
  }>;
};

function stageForClicks(clicks: number): GrowthState {
  if (clicks > 100) {
    return "giant";
  }

  if (clicks > 50) {
    return "mature";
  }

  if (clicks > 20) {
    return "flower";
  }

  if (clicks > 5) {
    return "sprout";
  }

  return "idle";
}

function stageLabel(clicks: number) {
  if (clicks > 100) {
    return "glowing magic flower";
  }

  if (clicks > 50) {
    return "big flower";
  }

  if (clicks > 20) {
    return "small flower";
  }

  if (clicks > 5) {
    return "sprout";
  }

  return "seed";
}

function formatClock(seconds: number) {
  return String(Math.max(0, seconds)).padStart(2, "0");
}

export default function GamePage() {
  const [sceneMode, setSceneMode] = useState<SceneMode>("day");
  const [profile, setProfile] = useState<LastBloomProfile | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [state, setState] = useState<PublicGameState | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const stage = stageForClicks(state?.game.totalClicks ?? 0);
  const canBloom = Boolean(profile && state?.game.status === "active" && !busy);

  const requestHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...getProfileHeaders(profile)
    }),
    [profile]
  );

  const refresh = useCallback(async () => {
    const response = await fetch("/api/game/current", { cache: "no-store" });
    const payload = (await response.json()) as PublicGameState;

    if (!response.ok) {
      throw new Error("Could not load the current game.");
    }

    setState(payload);
    setCountdown(payload.game.countdownRemaining);
  }, []);

  useEffect(() => {
    const stored = getStoredProfile();

    setProfile(stored);

    if (stored) {
      setEmail(stored.email);
      setDisplayName(stored.displayName);
    }

    refresh().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Could not load Last Bloom.");
    });
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!state?.game.countdownEndsAt || state.game.status !== "active") {
        return;
      }

      const remaining = Math.ceil((new Date(state.game.countdownEndsAt).getTime() - Date.now()) / 1000);
      setCountdown(Math.max(0, remaining));
    }, 250);

    return () => window.clearInterval(timer);
  }, [state?.game.countdownEndsAt, state?.game.status]);

  useEffect(() => {
    const poller = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 3000);

    return () => window.clearInterval(poller);
  }, [refresh]);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = saveProfile(email.trim(), displayName.trim() || email.split("@")[0] || "Flower Guest");

    setProfile(nextProfile);
    setMessage("Signed in. Use Free Entry to join the current round.");
  }

  async function joinGame() {
    if (!profile) {
      setMessage("Sign in first. Login is required before prize review.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/game/join", {
        method: "POST",
        headers: requestHeaders
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not join the game.");
      }

      setState(payload as PublicGameState);
      setMessage("Free entry confirmed. Purchases are never required.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not join the game.");
    } finally {
      setBusy(false);
    }
  }

  async function bloom() {
    if (!profile) {
      setMessage("Sign in first. Login is required before prize review.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/game/click", {
        method: "POST",
        headers: requestHeaders
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Bloom was not recorded.");
      }

      setState(payload as PublicGameState);
      setMessage("Bloom recorded. The countdown reset to 60 seconds.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bloom was not recorded.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Scene stage={stage} looking={state?.game.status === "active"} sceneMode={sceneMode} setSceneMode={setSceneMode}>
      <nav className="last-bloom-nav" aria-label="Last Bloom navigation">
        <Link href="/">Flower</Link>
        <Link href="/rules">Rules</Link>
        <Link href="/shop">Flower Shop</Link>
        <Link href="/wallet">Wallet</Link>
      </nav>

      <section className="scene-layer last-bloom-game" aria-live="polite">
        <div className="last-bloom-layout">
          <aside className="bloom-panel bloom-prizes">
            <p className="eyebrow">Daily prizes</p>
            <h1>Last Bloom</h1>
            <div className="prize-row"><span>1st</span><strong>$10</strong></div>
            <div className="prize-row"><span>2nd</span><strong>$5</strong></div>
            <div className="prize-row"><span>3rd</span><strong>$3</strong></div>
            <p className="legal-note">
              No purchase necessary. Purchase does not increase your chances of winning.
            </p>
          </aside>

          <section className="bloom-stage-panel" aria-label="Last Bloom game">
            <div className="countdown-display" aria-label={`${countdown} seconds remaining`}>
              {formatClock(countdown)}
            </div>
            <div className="game-flower-stage">
              <Plant type={defaultPlant} state={stage} alive={state?.game.status === "active"} sceneMode={sceneMode} />
              <div className="soil-disc" aria-hidden="true" />
              <div className="sparkles" aria-hidden="true">
                {Array.from({ length: stage === "giant" ? 18 : 8 }, (_, index) => (
                  <span key={index} />
                ))}
              </div>
            </div>
            <div className="game-status-line">
              <strong>{stageLabel(state?.game.totalClicks ?? 0)}</strong>
              <span>{state?.game.status ?? "loading"}</span>
            </div>
            <button className="bloom-button" type="button" disabled={!canBloom} onClick={bloom}>
              Bloom
            </button>
            <button className="free-entry-button" type="button" disabled={!profile || busy} onClick={joinGame}>
              Free Entry
            </button>
            {message ? <p className="inline-alert">{message}</p> : null}
          </section>

          <aside className="bloom-panel bloom-stats">
            <p className="eyebrow">Round status</p>
            <dl className="stat-list">
              <div>
                <dt>Players</dt>
                <dd>{state?.game.totalParticipants ?? 0}</dd>
              </div>
              <div>
                <dt>Clicks</dt>
                <dd>{state?.game.totalClicks ?? 0}</dd>
              </div>
              <div>
                <dt>Required for cash awards</dt>
                <dd>{state?.game.cashAwardMinParticipants ?? 30}</dd>
              </div>
              <div>
                <dt>Budget left today</dt>
                <dd>${state?.settings.dailyBudgetRemaining ?? 18}</dd>
              </div>
            </dl>

            <div className="recent-clicks">
              <h2>Recent blooms</h2>
              {state?.recentClicks.length ? (
                <ol>
                  {state.recentClicks.map((click) => (
                    <li key={click.id}>
                      <span>{click.user.displayName}</span>
                      <time>{new Date(click.clickedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No blooms yet.</p>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="login-strip" aria-label="Login and compliance">
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
        <p>
          Login is required for prize review. Bots, scripts, automation tools, and multiple accounts
          are prohibited.
        </p>
      </section>
    </Scene>
  );
}
