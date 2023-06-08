export function getDomainWithoutWWW(url: string) {
  const domain = new URL(url).hostname;

  return domain.replace("www.", "");
}
