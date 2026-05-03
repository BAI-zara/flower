import { jsonError, jsonOk } from "../../../../lib/apiResponse";
import { getRequestUser, getWallet, LastBloomError, upsertUser } from "../../../../lib/lastBloom";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  try {
    const user = getRequestUser(request.headers);

    if (!user) {
      throw new LastBloomError(401, "Sign in to view your wallet.");
    }

    upsertUser(user);

    return jsonOk(getWallet(user.id));
  } catch (error) {
    return jsonError(error);
  }
}
