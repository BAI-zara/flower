import { jsonError, jsonOk } from "../../../../../lib/apiResponse";
import { exportClickRecords, isAdminRequest, LastBloomError } from "../../../../../lib/lastBloom";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  try {
    const url = new URL(request.url);

    if (!isAdminRequest(request.headers, url.searchParams)) {
      throw new LastBloomError(403, "Admin token required.");
    }

    return jsonOk({
      exportedAt: new Date().toISOString(),
      records: exportClickRecords()
    });
  } catch (error) {
    return jsonError(error);
  }
}
