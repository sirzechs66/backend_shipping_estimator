const { computeShippingCharge } = require("../src/services/shippingService");

describe("Shipping calculation", () => {
  test("standard adds 10 Rs courier fee", () => {
    // distance 10km, minivan rate 3, weight 2kg => base = 10*3*2 = 60, total = 70
    const total = computeShippingCharge({ distanceKm: 10, weightKg: 2, deliverySpeed: "standard" });
    expect(total).toBe(70);
  });

  test("express adds 1.2 Rs/kg extra plus courier fee", () => {
    // same as above: base 60 + 10 + (1.2*2=2.4) => 72.4
    const total = computeShippingCharge({ distanceKm: 10, weightKg: 2, deliverySpeed: "express" });
    expect(total).toBe(72.4);
  });
});