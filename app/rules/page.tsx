import Link from "next/link";

const rules = [
  "Last Bloom is a promotional flower game.",
  "No purchase is necessary to enter or win.",
  "A purchase does not increase your chances of winning.",
  "Paid items are cosmetic only.",
  "Using bots, scripts, automation tools, or multiple accounts to manipulate the game is prohibited.",
  "Winners are subject to review before prizes are approved.",
  "Void where prohibited."
];

export default function RulesPage() {
  return (
    <main className="bloom-info-page">
      <nav className="bloom-info-nav" aria-label="Last Bloom navigation">
        <Link href="/">Flower</Link>
        <Link href="/game">Play Last Bloom</Link>
        <Link href="/shop">Flower Shop</Link>
        <Link href="/wallet">Wallet</Link>
      </nav>

      <section className="info-hero">
        <p className="eyebrow">Official rules</p>
        <h1>Last Bloom Rules</h1>
        <p>
          This is a promotional game, not gambling. Free users can fully participate in every
          eligible round and paid items never affect ranking, clicks, odds, or rewards.
        </p>
      </section>

      <section className="info-grid" aria-label="Rules summary">
        <article className="info-panel">
          <h2>Required Notices</h2>
          <ul>
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <p className="legal-note">
            No purchase necessary. Purchase does not increase your chances of winning.
          </p>
        </article>

        <article className="info-panel">
          <h2>How It Works</h2>
          <ol>
            <li>The round opens only when the participant or sponsor requirements are satisfied.</li>
            <li>The countdown starts at 60 seconds.</li>
            <li>Each Bloom click grows the flower once and resets the countdown to 60 seconds.</li>
            <li>When the countdown reaches zero, the last three distinct bloomers are reviewed.</li>
            <li>The last bloomer is eligible for $10, second-last for $5, and third-last for $3.</li>
          </ol>
        </article>

        <article className="info-panel">
          <h2>Prize Review</h2>
          <p>
            Each user can receive at most one rank per game. If fewer than 30 valid participants join
            a round, cash prizes are cancelled and the page shows that the round did not qualify.
          </p>
          <p>
            Prize records stay pending until an administrator reviews fraud signals, login identity,
            IP hash, device hash, user ID, and click timing. Money is not paid automatically.
          </p>
        </article>

        <article className="info-panel">
          <h2>Cosmetic Purchases</h2>
          <p>
            Flower skins, backgrounds, animation effects, and membership display badges are cosmetic
            only. They never increase winning probability, ranking position, click power, or rewards.
          </p>
          <p>Recharge balances are not withdrawable and are not entry fees.</p>
        </article>
      </section>
    </main>
  );
}
