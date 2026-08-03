export function calculateShippingCost(
  shippingMethod: { basePrice: number; pricePerKg: number },
  totalWeightGrams: number,
) {
  const totalWeightKg = totalWeightGrams / 1000;
  return shippingMethod.basePrice + shippingMethod.pricePerKg * totalWeightKg;
}
