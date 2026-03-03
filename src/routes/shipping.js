const express = require("express");
const { z } = require("zod");
const { asyncHandler, AppError } = require("../middlewares/errors");
const { parseOrThrow, idSchema, deliverySpeedSchema, weightSchema } = require("../utils/validators");
const { shippingChargeFromWarehouseToCustomer, computeWeightFromItems } = require("../services/shippingService");
const { findNearestWarehouseForSeller } = require("../services/warehouseService");

const router = express.Router();

/**
 * GET /api/v1/shipping-charge?warehouseId=789&customerId=456&deliverySpeed=standard&weightKg=2.5
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const warehouseId = parseOrThrow(idSchema, req.query.warehouseId, "warehouseId must be a positive integer");
    const customerId = parseOrThrow(idSchema, req.query.customerId, "customerId must be a positive integer");
    const deliverySpeed = parseOrThrow(deliverySpeedSchema, req.query.deliverySpeed, "deliverySpeed must be standard or express");

    // Optional, defaults to 1kg to keep assignment request shape usable
    const weightKg = parseOrThrow(weightSchema, req.query.weightKg ?? 1, "weightKg must be a positive number");

    const result = await shippingChargeFromWarehouseToCustomer({ warehouseId, customerId, weightKg, deliverySpeed });

    res.json({ shippingCharge: result.shippingCharge });
  })
);

/**
 * POST /api/v1/shipping-charge/calculate
 * body: { sellerId, customerId, deliverySpeed, items?: [{productId, quantity}], weightKg?: number }
 */
router.post(
  "/calculate",
  asyncHandler(async (req, res) => {
    const bodySchema = z.object({
      sellerId: z.coerce.number().int().positive(),
      customerId: z.coerce.number().int().positive(),
      deliverySpeed: z.string().transform((s) => String(s).toLowerCase()).pipe(z.enum(["standard", "express"])),
      weightKg: z.coerce.number().positive().optional(),
      items: z
        .array(
          z.object({
            productId: z.coerce.number().int().positive(),
            quantity: z.coerce.number().positive(),
          })
        )
        .optional(),
      // productId optional for compatibility; if provided we use it for validation in nearest warehouse
      productId: z.coerce.number().int().positive().optional(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Invalid request body", 400, "INVALID_PARAMETER");
    }

    const { sellerId, customerId, deliverySpeed, items, weightKg, productId } = parsed.data;

    // Choose a productId for the nearest-warehouse API requirement.
    // If caller doesn't provide productId, but provides items, use the first item productId.
    let productIdForNearest = productId;
    if (!productIdForNearest && Array.isArray(items) && items.length > 0) {
      productIdForNearest = items[0].productId;
    }
    if (!productIdForNearest) {
      // If not provided, pick first product for seller (or error if none).
      const prisma = require("../db/prisma");
      const firstProduct = await prisma.product.findFirst({ where: { sellerId } });
      if (!firstProduct) {
        throw new AppError("No products found for seller. Provide productId or items.", 400, "INVALID_PARAMETER");
      }
      productIdForNearest = firstProduct.id;
    }

    const nearest = await findNearestWarehouseForSeller({ sellerId, productId: productIdForNearest });

    let finalWeightKg = weightKg;
    if (!finalWeightKg) {
      const computed = await computeWeightFromItems({ sellerId, items });
      finalWeightKg = computed || 1; // default 1kg
    }

    const result = await shippingChargeFromWarehouseToCustomer({
      warehouseId: nearest.warehouseId,
      customerId,
      weightKg: finalWeightKg,
      deliverySpeed,
    });

    res.json({
      shippingCharge: result.shippingCharge,
      nearestWarehouse: {
        warehouseId: nearest.warehouseId,
        warehouseLocation: nearest.warehouseLocation,
      },
    });
  })
);

module.exports = router;