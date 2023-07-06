import scraper from "./scrapers";
import { ScrapeResult } from "./types/ProductInsertion";
import { getDomainWithoutWWW } from "./utils/getDomainWithoutUrl";

export const supportedDomains = [
  "zara.com",
  "oqvestir.com.br",
  "shop2gether.com.br",
  "alayabrand.com",
];

export async function fetchProductFromUrl(url: string) {
  const domainWithoutWWW = getDomainWithoutWWW(url);

  if (!supportedDomains.includes(domainWithoutWWW)) {
    throw new Error("Unsupported domain");
  }

  let result: ScrapeResult | null;

  switch (domainWithoutWWW) {
    case "zara.com":
      result = await scraper.zara(url, domainWithoutWWW);
      break;
    case "oqvestir.com.br":
      result = await scraper.oqvestir(url, domainWithoutWWW);
      break;
    case "shop2gether.com.br":
      result = await scraper.shop2gether(url, domainWithoutWWW);
      break;
    case "alayabrand.com":
      result = await scraper.alayabrand(url, domainWithoutWWW);
      break;
    default:
      result = null;
      break;
  }

  if (!result?.product) {
    throw new Error("Product not found");
  }

  return result;
}
