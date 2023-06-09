import scraper from "./scrapers";
import { ProductInsertion } from "./types/ProductInsertion";
import { getDomainWithoutWWW } from "./utils/getDomainWithoutUrl";

export const supportedDomains = [
  "oqvestir.com.br",
  "shop2gether.com.br",
  "offpremium.com.br",
];

export async function fetchProductFromUrl(url: string) {
  const domainWithoutWWW = getDomainWithoutWWW(url);

  if (!supportedDomains.includes(domainWithoutWWW)) {
    throw new Error("Unsupported domain");
  }

  let product: ProductInsertion | null;

  switch (domainWithoutWWW) {
    case "oqvestir.com.br":
      product = await scraper.oqvestir(url, domainWithoutWWW);
      break;
    case "shop2gether.com.br":
      product = await scraper.shop2gether(url, domainWithoutWWW);
      break;
    case "offpremium.com.br":
      product = await scraper.offpremium(url, domainWithoutWWW);
      break;
    default:
      product = null;
      break;
  }

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}
