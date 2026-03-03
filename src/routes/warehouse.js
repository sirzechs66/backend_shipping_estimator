const express = require("express");
const { asyncHandler } = require("../middlewares/errors");
const { parseOrThrow, idSchema } = require("../utils/validators");
const { findNearestWarehouseForSeller } = require("../services/warehouseService");

const router = express.Router();

/**
 * GET /api/v1/warehouse/nearest?sellerId=123&productId=456
 */
router.get(
  "/nearest",
  asyncHandler(async (req, res) => {
    const sellerId = parseOrThrow(idSchema, req.query.sellerId, "sellerId must be a positive integer");
    const productId = parseOrThrow(idSchema, req.query.productId, "productId must be a positive integer");

    const nearest = await findNearestWarehouseForSeller({ sellerId, productId });

    // Match assignment sample response shape
    res.json({
      warehouseId: nearest.warehouseId,
      warehouseLocation: nearest.warehouseLocation,
    });
  })
);

module.exports = router;