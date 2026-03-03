/**
 * Transport slab logic:
 * - distanceKm >= 500 => Aeroplane @ 1 Rs/km/kg
 * - else if distanceKm >= 100 => Truck @ 2 Rs/km/kg
 * - else => Mini Van @ 3 Rs/km/kg
 */
function getTransport(distanceKm) {
  if (distanceKm >= 500) return { mode: "AEROPLANE", rate: 1 };
  if (distanceKm >= 100) return { mode: "TRUCK", rate: 2 };
  return { mode: "MINI_VAN", rate: 3 };
}

module.exports = { getTransport };