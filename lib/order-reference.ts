export function getShortOrderReference(orderId: string) {
  const normalized = orderId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const shortPart = normalized.slice(-6);

  return `CMD-${shortPart || "000000"}`;
}
