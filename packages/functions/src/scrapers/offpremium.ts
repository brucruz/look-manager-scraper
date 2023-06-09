import { chromiumScraper } from "src/services/chromiumScraper";
import { ProductInsertion, Size } from "src/types/ProductInsertion";
import { getPtBrNumber } from "src/utils/getPtBrNumber";

interface JSONLdProduct {
  "@type": "Product";
  name: string;
  image: string[];
  sku: string;
  gtin: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  description: string;
  offers: {
    "@type": "AggregateOffer";
    priceCurrency: string;
    offers: {
      availability:
        | "https://schema.org/InStock"
        | "https://schema.org/OutOfStock";
      price: number;
      priceValidUntil: string;
      itemCondition:
        | "https://schema.org/NewCondition"
        | "https://schema.org/UsedCondition";
      listPrice: number;
    }[];
  };
}

export default async function fetchProduct(
  url: string,
  domainWithoutWWW: string
): Promise<ProductInsertion> {
  try {
    const $ = await chromiumScraper(url, domainWithoutWWW);

    // get json ld scripts
    const jsonLdScripts = $("script[type='application/ld+json']");

    // parse json ld scripts to get json objects
    const jsonLdObjects = jsonLdScripts.map((_, jsonLdScript: any) =>
      JSON.parse(jsonLdScript.children[0].data)
    );

    // get the one with Product @type
    const jsonLdProduct = jsonLdObjects.filter(
      (_, jsonLdObject: any) => jsonLdObject["@type"] === "Product"
    )[0] as JSONLdProduct;

    const available =
      jsonLdProduct.offers.offers[0].availability ===
      "https://schema.org/InStock";

    const productDiv = $('[class*="ProductDetailsSection"]');

    const name = productDiv.find(".product__name").text().trim();
    const sku = jsonLdProduct.gtin;
    const brand = jsonLdProduct.brand.name;
    const description = productDiv.find(".content").text().trim();

    const old_price = jsonLdProduct.offers.offers[0].listPrice;
    const price = jsonLdProduct.offers.offers[0].price;

    const currentSize = productDiv
      .find('[class*="SizeSelectorComboTitleButton"] span:nth-child(2)')
      .text()
      .trim();

    const otherAvailableSizes = productDiv
      .find('[class*="SizeSelectorOptionButton"] span')
      .toArray()
      .map((span) => $(span).text().trim());

    const size: Size = {
      size: currentSize,
      available: available,
    };

    const sizes = [
      size,
      ...otherAvailableSizes.map((size) => ({ size, available: true })),
    ];

    const images = jsonLdProduct.image;

    if (!available) {
      return {
        name,
        sku,
        brand,
        description,
        old_price,
        price,
        images,
        available,
        currency: "R$",
        url,
        store: "OffPremium",
        store_url: domainWithoutWWW,
        sizes,
      };
    }

    // get installment text, trim it and remove first 3 characters ('ou ') and last 9 characters (' s/ juros')
    const installment_text = productDiv
      .find('p:contains("x de")')
      .text()
      .trim()
      .slice(3)
      .slice(0, -9);

    const installment_quantity = parseInt(installment_text.split("x de ")[0]);

    const installment_value = getPtBrNumber(installment_text.split("x de ")[1]);

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
      store: "OffPremium",
      store_url: domainWithoutWWW,
      images,
      sizes,
    };

    return product;
  } catch (error: any) {
    throw new Error(error);
  }
}
