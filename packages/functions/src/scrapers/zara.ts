import { chromiumScraper } from "src/services/chromiumScraper";
import { ScrapeResult } from "src/types/ProductInsertion";
import { getPtBrNumber } from "src/utils/getPtBrNumber";
import AppError from "../errors/AppError";

interface Variation {
  sku: string;
  name: string;
  brand: string;
  description: string;
  offers: {
    priceCurrency: string;
    price: string;
    itemCondition: string;
  };
  image: string[];
}

export default async function fetchProduct(
  url: string,
  domainWithoutWWW: string
): Promise<ScrapeResult> {
  try {
    const $ = await chromiumScraper(url, domainWithoutWWW);

    const productSchemas = JSON.parse(
      $('script[type="application/ld+json"]').text()
    ) as Variation[];

    const productDiv = $("div.product-detail-view__main");

    const name = productSchemas[0].name;
    const sku = productSchemas[0].sku;
    const brand = productSchemas[0].brand;
    const description = productSchemas[0].description;
    const images = productSchemas[0].image;

    const priceWrapper = productDiv
      .find("span.price__amount-wrapper")
      .children();

    const hasPromotionalPrice = priceWrapper.length > 1;

    let old_price;
    const price = parseFloat(productSchemas[0].offers.price);

    if (hasPromotionalPrice) {
      old_price = getPtBrNumber(
        productDiv
          .find(
            "span.price__amount-wrapper .price-old__amount .money-amount__main"
          )
          .text()
          .trim()
      );
    }

    const sizes = productDiv
      .find("ul.size-selector__size-list li")
      .map(function () {
        const available = !$(this)
          .attr("data-qa-action")
          ?.includes("out-of-stock");
        const size = $(this).find("span.product-size-info__main-label").text();
        return { size, available };
      })
      .get();

    const available = sizes.some((size) => size.available);

    const product = {
      name,
      sku,
      brand,
      description,
      old_price,
      price,
      currency: "R$",
      available,
      url,
      store: brand,
      store_url: domainWithoutWWW,
      images,
      sizes,
    };

    const related = $(
      "div.product-detail-cross-selling ul.product-grid__product-list li a.product-link.product-grid-product__link"
    )
      .map(function () {
        return $(this).attr("href");
      })
      .get();

    return { product, related };
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode);
  }
}
