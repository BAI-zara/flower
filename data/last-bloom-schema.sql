CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE games (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'ended', 'cancelled')),
  "startsAt" TIMESTAMPTZ,
  "endsAt" TIMESTAMPTZ,
  "countdownEndsAt" TIMESTAMPTZ,
  prize1 NUMERIC(10, 2) NOT NULL DEFAULT 10,
  prize2 NUMERIC(10, 2) NOT NULL DEFAULT 5,
  prize3 NUMERIC(10, 2) NOT NULL DEFAULT 3,
  "minParticipants" INTEGER NOT NULL DEFAULT 20,
  "totalParticipants" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clicks (
  id TEXT PRIMARY KEY,
  "gameId" TEXT NOT NULL REFERENCES games(id),
  "userId" TEXT NOT NULL REFERENCES users(id),
  "clickedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipHash" TEXT NOT NULL,
  "userAgentHash" TEXT NOT NULL
);

CREATE INDEX clicks_game_clicked_at_idx ON clicks ("gameId", "clickedAt" DESC);
CREATE INDEX clicks_user_game_idx ON clicks ("userId", "gameId");
CREATE INDEX clicks_ip_hash_idx ON clicks ("ipHash");
CREATE INDEX clicks_user_agent_hash_idx ON clicks ("userAgentHash");

CREATE TABLE winners (
  id TEXT PRIMARY KEY,
  "gameId" TEXT NOT NULL REFERENCES games(id),
  "userId" TEXT NOT NULL REFERENCES users(id),
  rank INTEGER NOT NULL CHECK (rank IN (1, 2, 3)),
  "prizeAmount" NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("gameId", "userId"),
  UNIQUE ("gameId", rank)
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('skin', 'background', 'animation', 'membership')),
  price NUMERIC(10, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id),
  "productId" TEXT NOT NULL REFERENCES products(id),
  amount NUMERIC(10, 2) NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "antiFraudLogs" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id),
  "gameId" TEXT NOT NULL REFERENCES games(id),
  reason TEXT NOT NULL,
  severity TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (id, name, type, price, active)
VALUES
  ('flower-skin-pack', 'Flower Skin Pack', 'skin', 2.99, TRUE),
  ('dream-background-pack', 'Dream Background Pack', 'background', 4.99, TRUE),
  ('premium-animation-pack', 'Premium Animation Pack', 'animation', 9.99, TRUE);
