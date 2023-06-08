import { parseLocaleNumber } from "./parseLocaleNumber";

export function getPtBrNumber(valueString: string) {
  // get the value as a string, but keep the commas
  const stringValue = valueString.replace(/[^0-9\,]+/g, "");
  return parseLocaleNumber(stringValue, "pt-BR");
}
