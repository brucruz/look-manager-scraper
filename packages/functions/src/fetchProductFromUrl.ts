import scraper from "./scrapers";
import { ProductInsertion } from "./types/ProductInsertion";

export const supportedDomains = ["oqvestir.com.br", "shop2gether.com.br"];

export async function fetchProductFromUrl(url: string) {
  // get url domain
  const domain = new URL(url).hostname;

  // check if domain has www and remove it
  const domainWithoutWWW = domain.replace("www.", "");

  // check if domain is supported
  if (!supportedDomains.includes(domainWithoutWWW)) {
    throw new Error("Unsupported domain");
  }

  let product: ProductInsertion | null;

  switch (domainWithoutWWW) {
    case "oqvestir.com.br":
      // fetch product from oqvestir
      product = await scraper.oqvestir(url, domain, domainWithoutWWW);
      break;
    case "shop2gether.com.br":
      // fetch product from oqvestir
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
