import chromium from "@sparticuz/chromium";
import { load } from "cheerio";
import fetch from "node-fetch";
import puppeteer from "puppeteer-core";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export default async function fetchProduct(
  url: string,
  domain: string,
  domainWithoutWWW: string
) {
  console.log("fetching product from oqvestir");

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

    const productDiv = $(".product-essential");

    const name = productDiv.find(".produt-title--name").text().trim();
    const sku = productDiv.find(".product--sku").text().trim();
    const brand = productDiv.find(".produt-title--brand a").text().trim();
    const description = productDiv
      .find(".stylesTips .panel-body")
      .text()
      .trim();
    const old_price = getNumber(
      productDiv.find(".product-price span.price[id^=old]").text().trim()
    );
    const price = getNumber(
      productDiv.find(".product-price span.price[id^=product]").text().trim()
    );

    const installment_quantity = parseInt(
      productDiv
        .find(".product-price .product-installment")
        .text()
        .trim()
        .split("x de ")[0]
    );

    const installment_value = getNumber(
      productDiv
        .find(".product-price .product-installment")
        .text()
        .trim()
        .split("x de ")[1]
    );

    const available = productDiv.find(".availability").attr("class")
      ? !productDiv
          .find(".availability")
          .attr("class")!
          .includes("out-of-stock")
      : false;

    const images = productDiv
      .find(".slick-cloned img")
      .map(function () {
        return $(this).attr("src");
      })
      .get();

    const sizes = productDiv
      .find("#attribute185 option")
      .filter(function () {
        return $(this).attr("data-label") !== undefined;
      })
      .map(function () {
        const size = $(this).attr("data-label") || "not-found";
        const available = !$(this).attr("class")?.includes("out-of-stock");

        if (!size) {
          console.log({
            error: 1,
            errorName: "Size not found",
            store: "oqvestir",
            url: url,
            domain,
          });
        }
        return { size, available };
      })
      .get();

    const product = {
      name,
      sku,
      brand,
      description,
      old_price,
      price,
      currency: "R$",
      installment_value,
      installment_quantity,
      available,
      url,
      store: "OQVestir",
      store_url: domainWithoutWWW,
      images,
      sizes,
    };

    return product;
  } catch (error: any) {
    // Handle any errors that occur during crawling
    await browser.close();

    throw new Error(error);
  }
}

interface DOMPrice {
  old?: number;
  new: number;
  installments: {
    qty: number;
    value: number;
  };
}

function getNumber(valueString: string) {
  // get the value as a string, but keep the commas
  const stringValue = valueString.replace(/[^0-9\,]+/g, "");
  return parseLocaleNumber(stringValue, "pt-BR");
}

function parseLocaleNumber(
  stringNumber: string,
  locale: string | string[] | undefined
) {
  var thousandSeparator = Intl.NumberFormat(locale)
    .format(11111)
    .replace(/\p{Number}/gu, "");
  var decimalSeparator = Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\p{Number}/gu, "");

  return parseFloat(
    stringNumber
      .replace(new RegExp("\\" + thousandSeparator, "g"), "")
      .replace(new RegExp("\\" + decimalSeparator), ".")
  );
}
