import { chromiumScraper } from "src/services/chromiumScraper";
import { ScrapeResult } from "src/types/ProductInsertion";
import { getPtBrNumber } from "src/utils/getPtBrNumber";
import AppError from "../errors/AppError";

export default async function fetchProduct(
  url: string,
  domainWithoutWWW: string
): Promise<ScrapeResult> {
  try {
    const $ = await chromiumScraper(url, domainWithoutWWW);

    const productDiv = $(".product-essential");

    const name = productDiv.find(".product-name span.h1").text().trim();
    const variantFullName = name;
    const productName = name.split(" - ")[0];
    const variantTitle = name.split(" - ")[1];

    const sku = productDiv.find(".product-name p.new-sku-style").text().trim();
    const productSku = sku.split("_")[0];
    const variantSku = sku;

    const brand = productDiv.find(".product-brand a").text().trim();

    const descriptionText = productDiv.find(".new-product-tabs-desc-content");
    // replace breaks with new lines (\n)
    descriptionText.find("br").replaceWith("\n");
    const description = descriptionText.text().trim();

    const regularPrice = productDiv.find(".regular-price span.price");

    const regularPriceExists =
      productDiv.find(".regular-price span.price").length > 0;

    let old_price;
    let price;

    if (regularPriceExists) {
      price = getPtBrNumber(regularPrice.text().trim());
    } else {
      old_price = getPtBrNumber(
        productDiv.find(".old-price span.price").text().trim()
      );
      price = getPtBrNumber(
        productDiv.find(".special-price span.price").text().trim()
      );
    }

    const installment_quantity = parseInt(
      productDiv.find(".product-installment").text().trim().split("x de ")[0]
    );

    const installment_value = getPtBrNumber(
      productDiv.find(".product-installment").text().trim().split("x ")[1]
    );

    const available = productDiv.find(".availability").attr("class")
      ? !productDiv
          .find(".availability")
          .attr("class")!
          .includes("out-of-stock")
      : false;

    const images = productDiv
      .find(".product-image-gallery img")
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
            domainWithoutWWW,
          });
        }
        return { size, available, url };
      })
      .get();

    const breadcrumbList = $("div.breadcrumbs ul li")
      .not(":first")
      .map(function () {
        return $(this).text().trim();
      })
      .get();

    const listToCheckGender = [productName, ...breadcrumbList, description];

    // go through listToCheckGender and try to match 'feminin' or 'masculin'
    const isFemale = listToCheckGender.some((text) =>
      text.toLowerCase().includes("feminin")
    );
    const isMale = listToCheckGender.some((text) =>
      text.toLowerCase().includes("masculin")
    );

    const gender = isFemale ? "female" : isMale ? "male" : undefined;

    const product = {
      name: productName,
      sku: productSku,
      brand,
      store: "Shop2gether",
      store_url: domainWithoutWWW,
      gender,
    };

    const variant = {
      title: variantTitle,
      full_name: variantFullName,
      sku: variantSku,
      description,
      old_price,
      price,
      currency: "R$",
      installment_value,
      installment_quantity,
      available,
      url,
      images,
      sizes,
    };

    const suggested = $("div.box-related li a.product-image")
      .map(function () {
        return $(this).attr("href");
      })
      .get();

    const upsell = $("div.box-up-sell li a.product-image")
      .map(function () {
        return $(this).attr("href");
      })
      .get();

    const otherVariants = $("div.box-crosssell li a.product-image")
      .map(function () {
        return $(this).attr("href");
      })
      .get();

    const related = [...suggested, ...upsell, ...otherVariants];

    return { product, variants: [variant], related };
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode);
  }
}
