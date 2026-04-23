export const ORDER_STATUSES = [
  "NOUVELLE",
  "CONFIRMEE",
  "PREPAREE",
  "LIVREE",
  "ANNULEE",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const OrderStatus = {
  NOUVELLE: "NOUVELLE",
  CONFIRMEE: "CONFIRMEE",
  PREPAREE: "PREPAREE",
  LIVREE: "LIVREE",
  ANNULEE: "ANNULEE",
} as const satisfies Record<OrderStatus, OrderStatus>;
