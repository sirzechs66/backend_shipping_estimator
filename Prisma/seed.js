/**
 * Seed script to insert sample Customers, Sellers, Products and Warehouses.
 * Run: npm run seed
 */
const prisma = require("../src/db/prisma");

async function main() {
  // Clean existing data (order matters because of relations)
  await prisma.product.deleteMany({});
  await prisma.seller.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.warehouse.deleteMany({});

  // Warehouses (sample coords)
  const warehouses = await prisma.warehouse.createMany({
    data: [
      { code: "BLR_WAREHOUSE", name: "BLR_Warehouse", lat: 12.99999, lng: 77.923273 },
      { code: "MUMB_WAREHOUSE", name: "MUMB_Warehouse", lat: 19.0760, lng: 72.8777 },
      { code: "DEL_WAREHOUSE", name: "DEL_Warehouse", lat: 28.6139, lng: 77.2090 },
      { code: "KOL_WAREHOUSE", name: "KOL_Warehouse", lat: 22.5726, lng: 88.3639 },
      { code: "HYD_WAREHOUSE", name: "HYD_Warehouse", lat: 17.3850, lng: 78.4867 },
      { code: "CHEN_WAREHOUSE", name: "CHEN_Warehouse", lat: 13.0827, lng: 80.2707 }
    ],
  });

  // Customers (Kirana stores)
  const cust1 = await prisma.customer.create({
    data: { code: "Cust-123", name: "Shree Kirana Store", phone: "9847000000", lat: 12.9716, lng: 77.5946 },
  });
  const cust2 = await prisma.customer.create({
    data: { code: "Cust-124", name: "Andheri Mini Mart", phone: "9101000000", lat: 19.1197, lng: 72.8464 },
  });
  const cust3 = await prisma.customer.create({
    data: { code: "Cust-125", name: "Delhi Corner Store", phone: "9811000000", lat: 28.7041, lng: 77.1025 },
  });
  const cust4 = await prisma.customer.create({
    data: { code: "Cust-126", name: "Hyderabad Supermart", phone: "9000000001", lat: 17.3850, lng: 78.4867 },
  });
  const cust5 = await prisma.customer.create({
    data: { code: "Cust-127", name: "Chennai Grocery", phone: "9000000002", lat: 13.0827, lng: 80.2707 },
  });

  // Sellers
  const seller1 = await prisma.seller.create({
    data: { code: "SELL-001", name: "Nestle Seller", lat: 13.0827, lng: 80.2707 }, // Chennai
  });
  const seller2 = await prisma.seller.create({
    data: { code: "SELL-002", name: "Rice Seller", lat: 23.0225, lng: 72.5714 }, // Ahmedabad
  });
  const seller3 = await prisma.seller.create({
    data: { code: "SELL-003", name: "Sugar Seller", lat: 17.3850, lng: 78.4867 }, // Hyderabad
  });
  const seller4 = await prisma.seller.create({
    data: { code: "SELL-004", name: "Oil Seller", lat: 22.5726, lng: 88.3639 }, // Kolkata
  });
  const seller5 = await prisma.seller.create({
    data: { code: "SELL-005", name: "Spice Seller", lat: 28.6139, lng: 77.2090 }, // Delhi
  });

  // Products
  const p1 = await prisma.product.create({
    data: {
      sellerId: seller1.id,
      name: "Maggie 500g Packet",
      priceRs: 10,
      weightKg: 0.5,
      lengthCm: 10,
      widthCm: 10,
      heightCm: 10,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      sellerId: seller2.id,
      name: "Rice Bag 10kg",
      priceRs: 500,
      weightKg: 10,
      lengthCm: 100,
      widthCm: 80,
      heightCm: 50,
    },
  });

  const p3 = await prisma.product.create({
    data: {
      sellerId: seller3.id,
      name: "Sugar Bag 25kg",
      priceRs: 700,
      weightKg: 25,
      lengthCm: 100,
      widthCm: 90,
      heightCm: 60,
    },
  });

  const p4 = await prisma.product.create({
    data: {
      sellerId: seller4.id,
      name: "Sunflower Oil 5L",
      priceRs: 600,
      weightKg: 5,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 20,
    },
  });

  const p5 = await prisma.product.create({
    data: {
      sellerId: seller5.id,
      name: "Garam Masala 1kg",
      priceRs: 400,
      weightKg: 1,
      lengthCm: 15,
      widthCm: 10,
      heightCm: 10,
    },
  });

  console.log("Seeded:");
  console.table({
    warehousesCreated: warehouses.count,
    customers: [cust1.id, cust2.id, cust3.id, cust4.id, cust5.id],
    sellers: [seller1.id, seller2.id, seller3.id, seller4.id, seller5.id],
    products: [p1.id, p2.id, p3.id, p4.id, p5.id],
  });
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });