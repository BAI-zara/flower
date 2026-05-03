import { jsonError, jsonOk } from "../../../../lib/apiResponse";
import { clickCurrentGame, getRequestUser, LastBloomError } from "../../../../lib/lastBloom";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  try {
    const user = getRequestUser(request.headers);

    if (!user) {
      throw new LastBloomError(401, "Sign in before blooming.");
    }

    return jsonOk(clickCurrentGame(user, request.headers));
  } catch (error) {
    return jsonError(error);
  }
}
