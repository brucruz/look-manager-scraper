import { StackContext, Api } from "sst/constructs";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";

const chromeAwsLayerArn =
  "arn:aws:lambda:us-east-1:176217690016:layer:chromium:1";

export function API({ stack }: StackContext) {
  const chromeAwsLayer = LayerVersion.fromLayerVersionArn(
    stack,
    "ChromeLayer",
    chromeAwsLayerArn
  );

  const api = new Api(stack, "api", {
    routes: {
      "GET /product/web": {
        function: {
          handler: "packages/functions/src/getWebProduct.handler",
          timeout: "60 seconds",
          runtime: "nodejs14.x",
          layers: [chromeAwsLayer],
        },
      },
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
