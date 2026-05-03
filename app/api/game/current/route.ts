import { jsonError, jsonOk } from "../../../../lib/apiResponse";
import { getPublicGameState } from "../../../../lib/lastBloom";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    return jsonOk(getPublicGameState());
  } catch (error) {
    return jsonError(error);
  }
}
