import * as t from "io-ts";
// import { ApiHandler } from "sst/node/api";
import { apiLambdaRawHandler } from "@look-manager-scraper/core/src/cdk-util/lambda-wrapper/api-lambda-wrapper";
import { fetchProductFromUrl } from "./fetchProductFromUrl";

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

    let result;

    try {
      result = await fetchProductFromUrl(productUrl);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: (error as any).message,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        "content-type": "application/json",
      },
    };
  }
);
