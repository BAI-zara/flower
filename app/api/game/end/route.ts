import { jsonError, jsonOk } from "../../../../lib/apiResponse";
import { endCurrentGame, isAdminRequest, LastBloomError } from "../../../../lib/lastBloom";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  try {
    if (!isAdminRequest(request.headers)) {
      throw new LastBloomError(403, "Only an administrator or server cron may end a game.");
    }

    return jsonOk(endCurrentGame());
  } catch (error) {
    return jsonError(error);
  }
}
