const { z } = require("zod");
const { AppError } = require("../middlewares/errors");

const idSchema = z.coerce.number().int().positive();

const deliverySpeedSchema = z
  .string()
  .transform((s) => String(s).toLowerCase())
  .pipe(z.enum(["standard", "express"]));

const weightSchema = z.coerce.number().positive().max(100000).default(1);

function parseOrThrow(schema, value, errorMessage = "Invalid input") {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new AppError(errorMessage, 400, "INVALID_PARAMETER");
  }
  return parsed.data;
}

module.exports = {
  idSchema,
  deliverySpeedSchema,
  weightSchema,
  parseOrThrow,
};