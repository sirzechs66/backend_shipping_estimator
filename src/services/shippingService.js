const prisma = require("../db/prisma");
const { haversineKm } = require("../utils/haversine");
const { getTransport } = require("../utils/transport");
const { round2 } = require("../utils/round");
const { AppError } = require("../middlewares/errors");

/**
 * Compute shipping charge using assignment rules.
 * Standard: 10 Rs + baseShipping
 * Express:  10 Rs + (1.2 Rs/kg) + baseShipping
 * baseShipping = distanceKm * rate * weightKg
 */
function computeShippingCharge({ distanceKm, weightKg, deliverySpeed }) {
  const { rate } = getTransport(distanceKm);
  const baseShipping = distanceKm * rate * weightKg;
  let total = baseShipping + 10;

  if (deliverySpeed === "express") {
    total += 1.2 * weightKg;
  }

  return round2(total);
}

async function shippingChargeFromWarehouseToCustomer({ warehouseId, customerId, weightKg, deliverySpeed }) {
  const redis = require('../db/redis');
  const cacheKey = `shipping:${warehouseId}:${customerId}:${weightKg}:${deliverySpeed}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
  if (!warehouse) throw new AppError(`Warehouse not found: ${warehouseId}`, 404, "WAREHOUSE_NOT_FOUND");

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new AppError(`Customer not found: ${customerId}`, 404, "CUSTOMER_NOT_FOUND");

  const distanceKm = haversineKm(warehouse.lat, warehouse.lng, customer.lat, customer.lng);
  const shippingCharge = computeShippingCharge({ distanceKm, weightKg, deliverySpeed });

  const result = { shippingCharge, distanceKm };
  await redis.set(cacheKey, JSON.stringify(result), { EX: 300 }); // cache for 5 min
  return result;
}

/**
 * Optional: compute weight from items [{productId, quantity}].
 * Also validates product belongs to seller.
 */
async function computeWeightFromItems({ sellerId, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  let total = 0;
  for (const it of items) {
    const product = await prisma.product.findUnique({ where: { id: it.productId } });
    if (!product) throw new AppError(`Product not found: ${it.productId}`, 404, "PRODUCT_NOT_FOUND");
    if (product.sellerId !== sellerId) {
      throw new AppError(`Product ${it.productId} does not belong to seller ${sellerId}`, 400, "INVALID_PARAMETER");
    }
    const qty = Number(it.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new AppError(`Invalid quantity for product ${it.productId}`, 400, "INVALID_PARAMETER");
    }
    total += product.weightKg * qty;
  }
  return total;
}

module.exports = {
  computeShippingCharge,
  shippingChargeFromWarehouseToCustomer,
  computeWeightFromItems,
};