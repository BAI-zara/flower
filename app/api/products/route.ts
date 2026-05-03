import { jsonError, jsonOk } from "../../../lib/apiResponse";
import { getProducts } from "../../../lib/lastBloom";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    return jsonOk({
      products: getProducts(),
      legal: "No purchase necessary. Purchase does not increase your chances of winning."
    });
  } catch (error) {
    return jsonError(error);
  }
}
