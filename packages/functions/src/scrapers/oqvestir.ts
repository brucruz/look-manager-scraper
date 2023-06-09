import { chromiumScraper } from "src/services/chromiumScraper";
import { ProductInsertion } from "src/types/ProductInsertion";
import { getPtBrNumber } from "src/utils/getPtBrNumber";

export default async function fetchProduct(
  url: string,
  domainWithoutWWW: string
): Promise<ProductInsertion> {
  try {
    const $ = await chromiumScraper(url, domainWithoutWWW);

    const productDiv = $(".product-essential");

    const name = productDiv.find(".produt-title--name").text().trim();
    const sku = productDiv.find(".product--sku").text().trim();
    const brand = productDiv.find(".produt-title--brand a").text().trim();

    const descriptionText = productDiv.find(".descPrincipal .panel-body p");

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
        productDiv.find(".product-price span.price[id^=old]").text().trim()
      );
      price = getPtBrNumber(
        productDiv.find(".product-price span.price[id^=product]").text().trim()
      );
    }

    const installment_quantity = parseInt(
      productDiv
        .find(".product-price .product-installment")
        .text()
        .trim()
        .split("x de ")[0]
    );

    const installment_value = getPtBrNumber(
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
            domainWithoutWWW,
          });
        }
        return { size, available, url };
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
    throw new Error(error);
  }
}
