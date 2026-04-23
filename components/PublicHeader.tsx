import PublicHeaderClient from "./PublicHeaderClient";

import { getRestaurantSettings } from "@/lib/restaurant-data";

export default async function PublicHeader() {
  const settings = await getRestaurantSettings();
  const whatsappLink = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : "/contact";
  const initials = (settings?.restaurantName ?? "Restaurant")
    .split(" ")
    .slice(0, 2)
    .map((word: string) => word[0]?.toUpperCase())
    .join("");

  return (
    <PublicHeaderClient
      restaurantName={settings?.restaurantName ?? "Restaurant"}
      whatsappLink={whatsappLink}
      initials={initials || "RF"}
    />
  );
}
