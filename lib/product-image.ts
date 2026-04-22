const fallbackImageByKind = {
  tacos: "/images/fallback/tacos-fallback.png",
  pizza: "/images/fallback/pizza-fallback.png",
  burger: "/images/fallback/burger-fallback.png",
  generic: "/images/fallback/generic-fallback.png",
} as const;

type ProductKind = keyof typeof fallbackImageByKind;

export function detectProductImageKind(name: string, categoryName?: string | null): ProductKind {
  const text = `${name} ${categoryName ?? ""}`.toLowerCase();

  if (text.includes("tacos")) {
    return "tacos";
  }

  if (text.includes("pizza")) {
    return "pizza";
  }

  if (text.includes("burger")) {
    return "burger";
  }

  return "generic";
}

export function getProductImageSrc(name: string, imageUrl?: string | null, categoryName?: string | null) {
  if (imageUrl) {
    return imageUrl;
  }

  return fallbackImageByKind[detectProductImageKind(name, categoryName)];
}
