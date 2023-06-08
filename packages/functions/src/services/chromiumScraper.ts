import chromium from "@sparticuz/chromium";
import { load } from "cheerio";
import fetch from "node-fetch";
import puppeteer from "puppeteer-core";
import { getDomainWithoutWWW } from "src/utils/getDomainWithoutUrl";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export async function chromiumScraper(url: string, domainWithoutWWW: string) {
  console.log(`fetching product from ${domainWithoutWWW}`);

  // test if url is valid
  try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error("Product not found");
    }
  } catch (error) {
    throw new Error("Problem connecting to webpage");
  }

  // Launch a headless browser
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: process.env.IS_LOCAL
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : await chromium.executablePath(
          "/opt/nodejs/node_modules/@sparticuz/chromium/bin"
        ),
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
  });

  try {
    // Create a new page
    const page = await browser.newPage();

    // Navigate to the product page
    await page.goto(url);

    // get page html
    const html = await page.content();

    await browser.close();

    const $ = load(html);

    return $;
  } catch (error: any) {
    // Handle any errors that occur during crawling
    await browser.close();

    throw new Error(error);
  }
}
