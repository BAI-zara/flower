import { jsonError, jsonOk, readJson } from "../../../../lib/apiResponse";
import {
  createCosmeticCheckout,
  getRequestUser,
  LastBloomError
} from "../../../../lib/lastBloom";

export const dynamic = "force-dynamic";

type CheckoutBody = {
  productId: string;
};

export async function POST(request: Request) {
  try {
    const user = getRequestUser(request.headers);

    if (!user) {
      throw new LastBloomError(401, "Sign in before purchasing cosmetic items.");
    }

    const body = await readJson<CheckoutBody>(request);

    if (!body.productId || typeof body.productId !== "string") {
      throw new LastBloomError(400, "Product ID is required.");
    }

    return jsonOk(createCosmeticCheckout(user, body.productId), 201);
  } catch (error) {
    return jsonError(error);
  }
}
