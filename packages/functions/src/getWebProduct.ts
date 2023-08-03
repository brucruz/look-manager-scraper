import * as t from "io-ts";
import { apiLambdaRawHandler } from "@look-manager-scraper/core/src/cdk-util/lambda-wrapper/api-lambda-wrapper";
import { fetchProductFromUrl } from "./fetchProductFromUrl";
import AppError from "@look-manager-scraper/functions/src/errors/AppError";

export type GetWebProductEnv = {};

const inputType = t.type({});

export type GetWebProductInput = t.TypeOf<typeof inputType>;
export type GetWebProductResult = undefined;

export const handler = apiLambdaRawHandler(
  async ({ queryStringParameters }, _ctx, _env, headers) => {
    const productUrl = queryStringParameters?.url;

    if (!productUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing url query parameter",
        }),
      };
    }

    try {
      const result = await fetchProductFromUrl(productUrl);

      return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: {
          "content-type": "application/json",
        },
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode);
    }
  }
);
