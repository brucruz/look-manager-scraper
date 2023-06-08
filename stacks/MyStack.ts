import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    routes: {
      "GET /product/web": {
        function: {
          handler: "packages/functions/src/getWebProduct.handler",
          timeout: 60,
          runtime: "nodejs14.x",
        },
      },
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
