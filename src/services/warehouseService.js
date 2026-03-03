const prisma = require("../db/prisma");
const { haversineKm } = require("../utils/haversine");
const { AppError } = require("../middlewares/errors");

/**
 * Find nearest warehouse to a seller (seller -> warehouse distance).
 * Validates seller exists, and product exists + belongs to seller.
 */
async function findNearestWarehouseForSeller({ sellerId, productId }) {
  const redis = require('../db/redis');
  const cacheKey = `nearestWarehouse:${sellerId}:${productId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!seller) throw new AppError(`Seller not found: ${sellerId}`, 404, "SELLER_NOT_FOUND");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(`Product not found: ${productId}`, 404, "PRODUCT_NOT_FOUND");
  if (product.sellerId !== sellerId) {
    throw new AppError(`Product ${productId} does not belong to seller ${sellerId}`, 400, "INVALID_PARAMETER");
  }

  const warehouses = await prisma.warehouse.findMany({});
  if (!warehouses.length) throw new AppError("No warehouses found", 404, "WAREHOUSE_NOT_FOUND");

  let nearest = null;
  let minDist = Infinity;

  for (const wh of warehouses) {
    const dist = haversineKm(seller.lat, seller.lng, wh.lat, wh.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = wh;
    }
  }

  const result = {
    warehouseId: nearest.id,
    warehouseLocation: { lat: nearest.lat, long: nearest.lng }, // match assignment field naming
    distanceKm: minDist,
  };
  await redis.set(cacheKey, JSON.stringify(result), { EX: 300 }); // cache for 5 min
  return result;
}

module.exports = { findNearestWarehouseForSeller };