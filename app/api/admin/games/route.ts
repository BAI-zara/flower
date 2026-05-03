import { jsonError, jsonOk, readJson } from "../../../../lib/apiResponse";
import {
  adminCancelCurrentGame,
  adminManualStart,
  endCurrentGame,
  flagUser,
  getAdminState,
  isAdminRequest,
  LastBloomError,
  reviewWinner,
  updateSettings,
  type PrizePoolSettings,
  type WinnerStatus
} from "../../../../lib/lastBloom";

export const dynamic = "force-dynamic";

type AdminBody = {
  action: string;
  settings: Partial<PrizePoolSettings>;
  winnerId: string;
  status: WinnerStatus;
  userId: string;
  gameId: string;
  reason: string;
};

function requireAdmin(request: Request) {
  if (!isAdminRequest(request.headers)) {
    throw new LastBloomError(403, "Admin token required.");
  }
}

export function GET(request: Request) {
  try {
    requireAdmin(request);
    return jsonOk(getAdminState());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);

    const body = await readJson<AdminBody>(request);

    switch (body.action) {
      case "manualStart":
        return jsonOk(adminManualStart());
      case "cancel":
        return jsonOk(adminCancelCurrentGame());
      case "end":
        return jsonOk(endCurrentGame(true));
      case "updateSettings":
        return jsonOk(updateSettings(body.settings ?? {}));
      case "reviewWinner":
        if (!body.winnerId || !body.status) {
          throw new LastBloomError(400, "winnerId and status are required.");
        }

        return jsonOk(reviewWinner(body.winnerId, body.status));
      case "flagUser":
        if (!body.userId || !body.gameId) {
          throw new LastBloomError(400, "userId and gameId are required.");
        }

        return jsonOk(flagUser(body.userId, body.gameId, body.reason ?? "Manually flagged"));
      default:
        throw new LastBloomError(400, "Unknown admin action.");
    }
  } catch (error) {
    return jsonError(error);
  }
}
