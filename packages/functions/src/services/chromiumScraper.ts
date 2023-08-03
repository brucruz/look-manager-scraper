import chromium from "@sparticuz/chromium";
import { load } from "cheerio";
import fetch from "node-fetch";
import puppeteer from "puppeteer-core";
import AppError from "../errors/AppError";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export async function chromiumScraper(url: string, domainWithoutWWW: string) {
  console.log(`fetching product from ${domainWithoutWWW}`);

  // test if url is valid
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      },
    });

    if (response.status !== 200) {
      throw new AppError("Product not found", response.status);
    }
  } catch (error: any) {
    throw new AppError(
      `Problem connecting to webpage: ${error.message}`,
      error.statusCode
    );
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
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    // get page html
    const html = await page.content();

    await browser.close();

    const $ = load(html);

    return $;
  } catch (error: any) {
    // Handle any errors that occur during crawling
    await browser.close();

    throw new AppError(error.message, error.statusCode);
  }
}
