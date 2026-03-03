const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const warehouseRoutes = require("./routes/warehouse");
const shippingRoutes = require("./routes/shipping");
const { notFound, errorHandler } = require("./middlewares/errors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// optional explicit homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1/warehouse", warehouseRoutes);
app.use("/api/v1/shipping-charge", shippingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;