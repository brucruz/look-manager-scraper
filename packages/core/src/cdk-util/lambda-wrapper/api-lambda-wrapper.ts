/* eslint-disable no-console */
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import * as t from "io-ts";
import { PathReporter } from "io-ts/PathReporter";
import * as E from "fp-ts/lib/Either";
import AppError from "@look-manager-scraper/functions/src/errors/AppError";
// import { extractUserData } from '../../util/extract-user-data';
// import { UserData } from '../../util/user-data';

export const apiLambdaHandler = <I extends t.TypeC<any>, R, ENV>(
  type: I,
  handle: (
    input: t.TypeOf<I>,
    env: ENV /* , userData: UserData */ /* setCookie:(cookieString:string)=>void */
  ) => Promise<R>
) => {
  const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
      const input: any = JSON.parse(event.body || "{}");
      const parsedInput = type.decode(input);
      if (E.isLeft(parsedInput)) {
        throw new AppError(
          `Input validation failed: ${PathReporter.report(parsedInput)}`
        );
      }
      // const responseCookies:string[] = [];
      // const setCookie = (c: string) => responseCookies.push(c);
      // const userData = extractUserData(event);
      const result = await handle(
        parsedInput.right,
        process.env as any as ENV /* , userData */
      );
      console.log(
        JSON.stringify({
          [`${context.functionName}`]: 1,
          success: 1,
          input,
          headers: event.headers,
          result,
          // responseCookies,
        })
      );
      return {
        body: JSON.stringify(result),
        statusCode: 200,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
          // ...(responseCookies.length > 0 ? { 'set-cookie': responseCookies.join(';') } : undefined),
        },
      };
    } catch (err: any) {
      console.log(
        JSON.stringify({
          [`${context.functionName}`]: 1,
          error: 1,
          errorName: err.name,
          errorMessage: err.message,
          errorStack: err.stack,
          input: event.body,
          headers: event.headers,
        })
      );
      return {
        body: JSON.stringify({ error: err.message }),
        statusCode: 400,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
      };
    }
  };
  return handler;
};

export const apiLambdaRawHandler = <ENV>(
  handle: (
    event: APIGatewayProxyEvent,
    context: Context,
    env: ENV,
    headers: APIGatewayProxyEvent["headers"]
  ) => Promise<APIGatewayProxyResult>
) => {
  const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
      const result = await handle(
        event,
        context,
        process.env as any as ENV,
        event.headers
      );
      console.log(
        JSON.stringify({
          [`${context.functionName}`]: 1,
          success: 1,
          event,
          headers: event.headers,
          result,
          // responseCookies,
        })
      );
      return result;
    } catch (err: any) {
      console.log(
        JSON.stringify({
          [`${context.functionName}`]: 1,
          error: 1,
          errorName: err.name,
          errorMessage: err.message,
          errorStack: err.stack,
          statusCode: err.statusCode,
          input: event.body,
          headers: event.headers,
        })
      );
      return {
        body: JSON.stringify({ error: err.message }),
        statusCode: err.statusCode || 500,
      };
    }
  };
  return handler;
};
