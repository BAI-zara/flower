import { createHash, randomUUID } from "crypto";

export type GameStatus = "waiting" | "active" | "ended" | "cancelled";
export type WinnerStatus = "pending" | "approved" | "paid" | "rejected";
export type ProductType = "skin" | "background" | "animation" | "membership";
export type PurchaseStatus = "created" | "paid" | "failed" | "cancelled";
export type FraudSeverity = "low" | "medium" | "high";

export type User = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export type Game = {
  id: string;
  status: GameStatus;
  startsAt: string | null;
  endsAt: string | null;
  countdownEndsAt: string | null;
  prize1: number;
  prize2: number;
  prize3: number;
  minParticipants: number;
  totalParticipants: number;
  participantIds: string[];
  manualStart: boolean;
  cancellationReason?: string;
  createdAt: string;
};

export type Click = {
  id: string;
  gameId: string;
  userId: string;
  clickedAt: string;
  ipHash: string;
  userAgentHash: string;
  deviceHash: string;
};

export type Winner = {
  id: string;
  gameId: string;
  userId: string;
  rank: 1 | 2 | 3;
  prizeAmount: number;
  status: WinnerStatus;
  createdAt: string;
};

export type Purchase = {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  provider: "airwallex";
  status: PurchaseStatus;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  active: boolean;
};

export type AntiFraudLog = {
  id: string;
  userId: string;
  gameId: string;
  reason: string;
  severity: FraudSeverity;
  createdAt: string;
};

export type PrizePoolSettings = {
  dailyPrizeBudget: number;
  maxGamesPerDay: number;
  minParticipants: number;
  cashAwardMinParticipants: number;
  minSponsorRevenue: number;
  sponsorRevenuePool: number;
  clickCooldownSeconds: number;
};

type LastBloomStore = {
  users: User[];
  games: Game[];
  clicks: Click[];
  winners: Winner[];
  purchases: Purchase[];
  products: Product[];
  antiFraudLogs: AntiFraudLog[];
  settings: PrizePoolSettings;
  dailyBudgetUsed: Record<string, number>;
};

export const databaseDesign = {
  users: ["id", "email", "displayName", "createdAt"],
  games: [
    "id",
    "status",
    "startsAt",
    "endsAt",
    "countdownEndsAt",
    "prize1",
    "prize2",
    "prize3",
    "minParticipants",
    "totalParticipants",
    "createdAt"
  ],
  clicks: ["id", "gameId", "userId", "clickedAt", "ipHash", "userAgentHash"],
  winners: ["id", "gameId", "userId", "rank", "prizeAmount", "status", "createdAt"],
  purchases: ["id", "userId", "productId", "amount", "provider", "status", "createdAt"],
  products: ["id", "name", "type", "price", "active"],
  antiFraudLogs: ["id", "userId", "gameId", "reason", "severity", "createdAt"]
} as const;

const DEFAULT_SETTINGS: PrizePoolSettings = {
  dailyPrizeBudget: 18,
  maxGamesPerDay: 1,
  minParticipants: 20,
  cashAwardMinParticipants: 30,
  minSponsorRevenue: 18,
  sponsorRevenuePool: 0,
  clickCooldownSeconds: 2
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "flower-skin-pack",
    name: "Flower Skin Pack",
    type: "skin",
    price: 2.99,
    active: true
  },
  {
    id: "dream-background-pack",
    name: "Dream Background Pack",
    type: "background",
    price: 4.99,
    active: true
  },
  {
    id: "premium-animation-pack",
    name: "Premium Animation Pack",
    type: "animation",
    price: 9.99,
    active: true
  }
];

declare global {
  // eslint-disable-next-line no-var
  var __lastBloomStore: LastBloomStore | undefined;
}

function createInitialGame(now = new Date()): Game {
  return {
    id: `game_${randomUUID()}`,
    status: "waiting",
    startsAt: null,
    endsAt: null,
    countdownEndsAt: null,
    prize1: 10,
    prize2: 5,
    prize3: 3,
    minParticipants: DEFAULT_SETTINGS.minParticipants,
    totalParticipants: 0,
    participantIds: [],
    manualStart: false,
    createdAt: now.toISOString()
  };
}

function createStore(): LastBloomStore {
  return {
    users: [],
    games: [createInitialGame()],
    clicks: [],
    winners: [],
    purchases: [],
    products: DEFAULT_PRODUCTS,
    antiFraudLogs: [],
    settings: { ...DEFAULT_SETTINGS },
    dailyBudgetUsed: {}
  };
}

function getStore() {
  if (!globalThis.__lastBloomStore) {
    globalThis.__lastBloomStore = createStore();
  }

  return globalThis.__lastBloomStore;
}

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function hash(value: string) {
  return createHash("sha256").update(value || "unknown").digest("hex");
}

function getIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const firstForwarded = forwarded?.split(",")[0]?.trim();

  return firstForwarded || realIp || "local";
}

function publicUser(userId: string) {
  const store = getStore();
  const user = store.users.find((item) => item.id === userId);

  return {
    id: userId,
    displayName: user?.displayName ?? "Flower Guest"
  };
}

function addFraudLog(userId: string, gameId: string, reason: string, severity: FraudSeverity) {
  const store = getStore();
  const exists = store.antiFraudLogs.some(
    (log) => log.userId === userId && log.gameId === gameId && log.reason === reason
  );

  if (exists) {
    return;
  }

  store.antiFraudLogs.push({
    id: `fraud_${randomUUID()}`,
    userId,
    gameId,
    reason,
    severity,
    createdAt: new Date().toISOString()
  });
}

function paidGamesToday(date = new Date()) {
  const store = getStore();
  const today = dayKey(date);

  return store.games.filter(
    (game) =>
      (game.status === "active" || game.status === "ended") &&
      game.startsAt?.slice(0, 10) === today
  ).length;
}

function dailyBudgetRemaining(date = new Date()) {
  const store = getStore();
  const used = store.dailyBudgetUsed[dayKey(date)] ?? 0;

  return Math.max(0, store.settings.dailyPrizeBudget - used);
}

function hasFundingForGame(game: Game) {
  const store = getStore();

  return (
    dailyBudgetRemaining() >= game.prize1 + game.prize2 + game.prize3 ||
    store.settings.sponsorRevenuePool >= store.settings.minSponsorRevenue ||
    game.manualStart
  );
}

function canStartGame(game: Game) {
  const store = getStore();
  const hasParticipantGate =
    game.totalParticipants >= game.minParticipants ||
    store.settings.sponsorRevenuePool >= store.settings.minSponsorRevenue ||
    game.manualStart;

  return (
    game.status === "waiting" &&
    hasParticipantGate &&
    hasFundingForGame(game) &&
    paidGamesToday() < store.settings.maxGamesPerDay
  );
}

function ensureCurrentGame() {
  const store = getStore();
  const current = store.games.find((game) => game.status === "waiting" || game.status === "active");

  if (current) {
    return current;
  }

  const next = createInitialGame();
  next.minParticipants = store.settings.minParticipants;
  store.games.unshift(next);

  return next;
}

function startGame(game: Game) {
  const now = new Date();

  game.status = "active";
  game.startsAt = now.toISOString();
  game.countdownEndsAt = new Date(now.getTime() + 60000).toISOString();
  game.endsAt = null;
  game.cancellationReason = undefined;

  return game;
}

function maybeStartGame(game: Game) {
  if (canStartGame(game)) {
    return startGame(game);
  }

  return game;
}

function getUserClickIntervals(userId: string, gameId: string) {
  const store = getStore();
  const userClicks = store.clicks
    .filter((click) => click.userId === userId && click.gameId === gameId)
    .map((click) => new Date(click.clickedAt).getTime())
    .sort((a, b) => a - b);

  return userClicks.slice(-4).reduce<number[]>((intervals, clickedAt, index, source) => {
    if (index > 0) {
      intervals.push(clickedAt - source[index - 1]);
    }

    return intervals;
  }, []);
}

function checkFraudSignals(userId: string, game: Game, ipHash: string, deviceHash: string) {
  const store = getStore();
  const gameClicks = store.clicks.filter((click) => click.gameId === game.id);
  const ipUsers = new Set(gameClicks.filter((click) => click.ipHash === ipHash).map((click) => click.userId));
  const deviceUsers = new Set(
    gameClicks.filter((click) => click.deviceHash === deviceHash).map((click) => click.userId)
  );

  ipUsers.add(userId);
  deviceUsers.add(userId);

  if (ipUsers.size >= 5) {
    addFraudLog(userId, game.id, "Many accounts from the same IP", "medium");
  }

  if (deviceUsers.size >= 2) {
    addFraudLog(userId, game.id, "Multiple accounts from the same device", "medium");
  }

  const intervals = getUserClickIntervals(userId, game.id);

  if (intervals.length >= 3) {
    const average = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const tooRegular = intervals.every((interval) => Math.abs(interval - average) <= 80);

    if (tooRegular) {
      addFraudLog(userId, game.id, "Click interval is unusually regular", "high");
    }
  }
}

function getUniqueParticipantCount(gameId: string) {
  const store = getStore();
  const game = store.games.find((item) => item.id === gameId);

  if (!game) {
    return 0;
  }

  const clickParticipants = new Set(
    store.clicks.filter((click) => click.gameId === gameId).map((click) => click.userId)
  );

  game.participantIds.forEach((userId) => clickParticipants.add(userId));

  return clickParticipants.size;
}

export function getRequestUser(headers: Headers) {
  const userId = headers.get("x-last-bloom-user-id")?.trim();
  const email = headers.get("x-last-bloom-email")?.trim();
  const displayName = headers.get("x-last-bloom-display-name")?.trim();

  if (!userId || !email) {
    return null;
  }

  return {
    id: userId,
    email,
    displayName: displayName || email.split("@")[0] || "Flower Guest"
  };
}

export function upsertUser(input: Pick<User, "id" | "email" | "displayName">) {
  const store = getStore();
  const existing = store.users.find((user) => user.id === input.id);

  if (existing) {
    existing.email = input.email;
    existing.displayName = input.displayName;
    return existing;
  }

  const user: User = {
    ...input,
    createdAt: new Date().toISOString()
  };

  store.users.push(user);
  return user;
}

export function getPublicGameState(gameOverride?: Game) {
  const store = getStore();
  const game = gameOverride ?? ensureCurrentGame();
  const now = Date.now();
  const countdownRemaining =
    game.status === "active" && game.countdownEndsAt
      ? Math.max(0, Math.ceil((new Date(game.countdownEndsAt).getTime() - now) / 1000))
      : 60;
  const gameClicks = store.clicks.filter((click) => click.gameId === game.id);
  const recentClicks = gameClicks
    .slice(-10)
    .reverse()
    .map((click) => ({
      id: click.id,
      clickedAt: click.clickedAt,
      user: publicUser(click.userId)
    }));

  return {
    game: {
      id: game.id,
      status: game.status,
      startsAt: game.startsAt,
      endsAt: game.endsAt,
      countdownEndsAt: game.countdownEndsAt,
      countdownRemaining,
      prize1: game.prize1,
      prize2: game.prize2,
      prize3: game.prize3,
      minParticipants: game.minParticipants,
      cashAwardMinParticipants: store.settings.cashAwardMinParticipants,
      totalParticipants: game.totalParticipants,
      totalClicks: gameClicks.length,
      cancellationReason: game.cancellationReason ?? null
    },
    settings: {
      dailyPrizeBudget: store.settings.dailyPrizeBudget,
      maxGamesPerDay: store.settings.maxGamesPerDay,
      minParticipants: store.settings.minParticipants,
      cashAwardMinParticipants: store.settings.cashAwardMinParticipants,
      minSponsorRevenue: store.settings.minSponsorRevenue,
      sponsorRevenuePool: store.settings.sponsorRevenuePool,
      clickCooldownSeconds: store.settings.clickCooldownSeconds,
      dailyBudgetRemaining: dailyBudgetRemaining()
    },
    prizes: [
      { rank: 1, amount: game.prize1 },
      { rank: 2, amount: game.prize2 },
      { rank: 3, amount: game.prize3 }
    ],
    recentClicks,
    legal: {
      noPurchaseNecessary: "No purchase necessary.",
      purchaseNoAdvantage: "Purchase does not increase your chances of winning."
    }
  };
}

export function joinCurrentGame(userInput: Pick<User, "id" | "email" | "displayName">) {
  const user = upsertUser(userInput);
  const game = ensureCurrentGame();

  if (!game.participantIds.includes(user.id)) {
    game.participantIds.push(user.id);
    game.totalParticipants = game.participantIds.length;
  }

  maybeStartGame(game);

  return getPublicGameState();
}

export function clickCurrentGame(
  userInput: Pick<User, "id" | "email" | "displayName">,
  headers: Headers
) {
  const store = getStore();
  const user = upsertUser(userInput);
  const game = ensureCurrentGame();

  if (game.status !== "active") {
    const started = maybeStartGame(game);

    if (started.status !== "active") {
      throw new LastBloomError(
        409,
        "The current game is waiting for enough participants or sponsor budget."
      );
    }
  }

  if (!game.participantIds.includes(user.id)) {
    throw new LastBloomError(403, "Use the free entry button before blooming.");
  }

  const now = new Date();
  const lastUserClick = store.clicks
    .filter((click) => click.gameId === game.id && click.userId === user.id)
    .at(-1);

  if (
    lastUserClick &&
    now.getTime() - new Date(lastUserClick.clickedAt).getTime() <
      store.settings.clickCooldownSeconds * 1000
  ) {
    throw new LastBloomError(429, "Please wait 2 seconds before blooming again.");
  }

  const ipHash = hash(getIp(headers));
  const userAgentHash = hash(headers.get("user-agent") ?? "unknown");
  const deviceHash = hash(headers.get("x-last-bloom-device") ?? userAgentHash);

  checkFraudSignals(user.id, game, ipHash, deviceHash);

  store.clicks.push({
    id: `click_${randomUUID()}`,
    gameId: game.id,
    userId: user.id,
    clickedAt: now.toISOString(),
    ipHash,
    userAgentHash,
    deviceHash
  });

  game.countdownEndsAt = new Date(now.getTime() + 60000).toISOString();
  game.totalParticipants = game.participantIds.length;

  return getPublicGameState();
}

export function endCurrentGame(force = false) {
  const store = getStore();
  const game = ensureCurrentGame();

  if (game.status !== "active") {
    throw new LastBloomError(409, "No active game is ready to end.");
  }

  if (!force && game.countdownEndsAt && new Date(game.countdownEndsAt).getTime() > Date.now()) {
    return {
      ended: false,
      reason: "Countdown has not expired.",
      state: getPublicGameState()
    };
  }

  const uniqueParticipants = getUniqueParticipantCount(game.id);

  game.endsAt = new Date().toISOString();

  if (uniqueParticipants < store.settings.cashAwardMinParticipants) {
    game.status = "cancelled";
    game.cancellationReason = "Not enough participants; prizes were cancelled for this round.";

    return {
      ended: true,
      reason: "参与人数不足，本局取消奖励",
      state: getPublicGameState(game)
    };
  }

  const totalPrize = game.prize1 + game.prize2 + game.prize3;

  if (dailyBudgetRemaining() < totalPrize && store.settings.sponsorRevenuePool < totalPrize && !game.manualStart) {
    game.status = "cancelled";
    game.cancellationReason = "Prize pool is not funded for this round.";

    return {
      ended: true,
      reason: "Prize pool is not funded for this round.",
      state: getPublicGameState(game)
    };
  }

  const winners = store.clicks
    .filter((click) => click.gameId === game.id)
    .slice()
    .reverse()
    .reduce<string[]>((userIds, click) => {
      if (!userIds.includes(click.userId) && userIds.length < 3) {
        userIds.push(click.userId);
      }

      return userIds;
    }, []);

  if (winners.length < 3) {
    game.status = "cancelled";
    game.cancellationReason = "Not enough distinct last bloomers for all prize ranks.";

    return {
      ended: true,
      reason: "Not enough distinct last bloomers for all prize ranks.",
      state: getPublicGameState(game)
    };
  }

  const prizeByRank = [game.prize1, game.prize2, game.prize3] as const;
  const today = dayKey();

  store.winners.push(
    ...winners.map((userId, index) => ({
      id: `winner_${randomUUID()}`,
      gameId: game.id,
      userId,
      rank: (index + 1) as 1 | 2 | 3,
      prizeAmount: prizeByRank[index],
      status: "pending" as WinnerStatus,
      createdAt: new Date().toISOString()
    }))
  );

  if (store.settings.sponsorRevenuePool >= totalPrize) {
    store.settings.sponsorRevenuePool -= totalPrize;
  } else {
    store.dailyBudgetUsed[today] = (store.dailyBudgetUsed[today] ?? 0) + totalPrize;
  }

  game.status = "ended";

  return {
    ended: true,
    reason: "Winners generated and pending administrator review.",
    state: getPublicGameState(game)
  };
}

export function getProducts() {
  return getStore().products.filter((product) => product.active);
}

export function createCosmeticCheckout(userInput: Pick<User, "id" | "email" | "displayName">, productId: string) {
  const store = getStore();
  const product = store.products.find((item) => item.id === productId && item.active);

  if (!product) {
    throw new LastBloomError(404, "Product not found.");
  }

  if (!["skin", "background", "animation", "membership"].includes(product.type)) {
    throw new LastBloomError(400, "Only cosmetic products are available.");
  }

  const user = upsertUser(userInput);
  const purchase: Purchase = {
    id: `purchase_${randomUUID()}`,
    userId: user.id,
    productId: product.id,
    amount: product.price,
    provider: "airwallex",
    status: "created",
    createdAt: new Date().toISOString()
  };

  store.purchases.push(purchase);

  return {
    purchase,
    product,
    provider: "airwallex" as const,
    checkoutMode: "cosmetic-only",
    legal: "Purchase does not increase your chances of winning."
  };
}

export function getWallet(userId: string) {
  const store = getStore();
  const user = store.users.find((item) => item.id === userId);
  const purchases = store.purchases
    .filter((purchase) => purchase.userId === userId)
    .map((purchase) => ({
      ...purchase,
      product: store.products.find((product) => product.id === purchase.productId) ?? null
    }));
  const winners = store.winners
    .filter((winner) => winner.userId === userId)
    .map((winner) => ({
      ...winner,
      game: store.games.find((game) => game.id === winner.gameId) ?? null
    }));

  return {
    user: user ? { id: user.id, email: user.email, displayName: user.displayName } : null,
    balances: {
      cosmeticBalance: 0,
      withdrawablePurchaseBalance: 0,
      pendingPrizeAmount: winners
        .filter((winner) => winner.status === "pending")
        .reduce((sum, winner) => sum + winner.prizeAmount, 0),
      approvedPrizeAmount: winners
        .filter((winner) => winner.status === "approved" || winner.status === "paid")
        .reduce((sum, winner) => sum + winner.prizeAmount, 0)
    },
    purchases,
    winners,
    legal: "Recharge balances cannot be withdrawn. Prizes require administrator review before payout."
  };
}

export function getAdminState() {
  const store = getStore();
  const publicState = getPublicGameState();

  return {
    ...publicState,
    settings: {
      ...publicState.settings,
      raw: store.settings
    },
    winners: store.winners.map((winner) => ({
      ...winner,
      user: publicUser(winner.userId)
    })),
    antiFraudLogs: store.antiFraudLogs.map((log) => ({
      ...log,
      user: publicUser(log.userId)
    })),
    products: store.products,
    databaseDesign
  };
}

export function updateSettings(input: Partial<PrizePoolSettings>) {
  const store = getStore();

  store.settings = {
    ...store.settings,
    ...Object.fromEntries(
      Object.entries(input).filter(([, value]) => typeof value === "number" && Number.isFinite(value))
    )
  };

  const current = ensureCurrentGame();
  current.minParticipants = store.settings.minParticipants;

  return getAdminState();
}

export function adminManualStart() {
  const game = ensureCurrentGame();

  if (game.status !== "waiting") {
    throw new LastBloomError(409, "Only waiting games can be started manually.");
  }

  game.manualStart = true;
  startGame(game);

  return getAdminState();
}

export function adminCancelCurrentGame() {
  const game = ensureCurrentGame();

  if (game.status !== "waiting" && game.status !== "active") {
    throw new LastBloomError(409, "Only waiting or active games can be cancelled.");
  }

  game.status = "cancelled";
  game.endsAt = new Date().toISOString();
  game.cancellationReason = "Cancelled by administrator.";

  return getAdminState();
}

export function reviewWinner(winnerId: string, status: WinnerStatus) {
  const store = getStore();
  const winner = store.winners.find((item) => item.id === winnerId);

  if (!winner) {
    throw new LastBloomError(404, "Winner not found.");
  }

  winner.status = status;
  return getAdminState();
}

export function flagUser(userId: string, gameId: string, reason: string) {
  addFraudLog(userId, gameId, reason || "Manually flagged by administrator", "high");
  return getAdminState();
}

export function exportClickRecords() {
  const store = getStore();

  return store.clicks.map((click) => ({
    id: click.id,
    gameId: click.gameId,
    userId: click.userId,
    displayName: publicUser(click.userId).displayName,
    clickedAt: click.clickedAt,
    ipHash: click.ipHash,
    userAgentHash: click.userAgentHash,
    deviceHash: click.deviceHash
  }));
}

export function isAdminRequest(headers: Headers, searchParams?: URLSearchParams) {
  const configuredToken = process.env.LAST_BLOOM_ADMIN_TOKEN || process.env.ADMIN_TOKEN;
  const token = headers.get("x-admin-token") || searchParams?.get("token") || "";

  if (configuredToken) {
    return token === configuredToken;
  }

  return process.env.NODE_ENV !== "production" && token === "demo-admin";
}

export class LastBloomError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
