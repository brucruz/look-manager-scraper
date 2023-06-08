import scraper from "./scrapers";
import { ProductInsertion } from "./types/ProductInsertion";

export const supportedDomains = ["oqvestir.com.br", "shop2gether.com.br"];

export async function fetchProductFromUrl(url: string) {
  const domain = new URL(url).hostname;
  const domainWithoutWWW = domain.replace("www.", "");

  if (!supportedDomains.includes(domainWithoutWWW)) {
    throw new Error("Unsupported domain");
  }

  let product: ProductInsertion | null;

  switch (domainWithoutWWW) {
    case "oqvestir.com.br":
      product = await scraper.oqvestir(url, domain, domainWithoutWWW);
      break;
    case "shop2gether.com.br":
      product = await scraper.shop2gether(url, domain, domainWithoutWWW);
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
