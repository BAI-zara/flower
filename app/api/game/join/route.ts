import { jsonError, jsonOk } from "../../../../lib/apiResponse";
import { getRequestUser, joinCurrentGame, LastBloomError } from "../../../../lib/lastBloom";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  try {
    const user = getRequestUser(request.headers);

    if (!user) {
      throw new LastBloomError(401, "Sign in before joining Last Bloom.");
    }

    return jsonOk(joinCurrentGame(user));
  } catch (error) {
    return jsonError(error);
  }
}
