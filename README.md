#Note : For testing purpose i have built a Frontend, you can check the endPoints by staring the server on localhost:3000.
run this command : npm run dev. By this both frontend and backend will start working. And for testing the endPoints, you can 
use the data given below in the readMe file.
Otherwise you can use CustomerID = 1, productID = 1, SellerID = 1 , weight = anything by choice.

# 📦 Shipping Charge Estimator  
Node.js + Express + Prisma + SQLite

---

# 📌 Project Overview

This project calculates shipping charges in a B2B marketplace (like Jumbotail).

It provides:

1. ✅ Find nearest warehouse for a seller  
2. ✅ Calculate shipping from warehouse → customer  
3. ✅ Calculate total shipping (seller → nearest warehouse → customer)  
4. ✅ Simple frontend UI to test APIs easily  

---

# 🧠 Business Logic

## 🚚 Transport Mode Selection

Shipping rate depends on distance:

| Distance (km) | Transport Mode | Rate (₹ per km per kg) |
|---------------|---------------|-------------------------|
| 0 – 99        | Mini Van     | 3 |
| 100 – 499     | Truck        | 2 |
| 500+          | Aeroplane    | 1 |

---

## 💰 Shipping Formula
baseShipping = distanceKm × rate × weightKg
Then:
### Standard Delivery
final = baseShipping + 10

### Express Delivery
final = baseShipping + 10 + (1.2 × weightKg)

All values are rounded to 2 decimal places.


---

# 📦 File Structure 

├── public/ # Frontend UI
│ ├── index.html
│ └── app.js
│
├── prisma/ # Database schema + seed data
│ ├── schema.prisma
│ └── seed.js
│
├── src/
│ ├── app.js # Express configuration
│ ├── index.js # Server entry point
│ ├── routes/ # API routes
│ ├── services/ # Business logic
│ ├── utils/ # Helper functions
│ └── middlewares/ # Error handling
│
├── package.json
├── .env.example
└── README.md

# 📦 Dependencies

Main dependencies used:

- express
- prisma
- @prisma/client
- sqlite
- cors
- morgan
- zod
- dotenv

Dev dependencies:

- nodemon
- jest
- supertest


# ⚙️ Installation & Setup

This project uses Redis to cache shipping charge calculations for improved performance and reduced database load.

**How caching works:**
 - When a shipping charge is calculated (warehouse → customer), the result is stored in Redis for 5 minutes.
 - Subsequent requests for the same parameters (warehouse, customer, weight, delivery speed) will return the cached result, speeding up response time.
 - After 5 minutes, the cache expires and a fresh calculation is performed.

**Implementation:**
 - Redis client is initialized in `src/db/redis.js`.
 - Caching logic is in `src/services/shippingService.js` (see `shippingChargeFromWarehouseToCustomer`).
 - Cache key format: `shipping:<warehouseId>:<customerId>:<weightKg>:<deliverySpeed>`
 - Expiry: 5 minutes (300 seconds)

**Benefits:**
 - Faster API responses for repeated queries
 - Lower database and compute load

**Note:**
Make sure Redis is running locally for caching to work. If Redis is not available, calculations will still work but without caching.

making the most of the modularity of the code i made sure to add these scalability as a project functionality...


## 1️⃣ Install Dependencies
        ```bash
        npm install

2️⃣ Create Environment File
        cp .env.example .env

3️⃣ Create Database:
        npm run prisma:migrate -- --name init

4️⃣ Seed Test Dataset : 
        npm run seed


🧪 Dataset for Testing :

After seeding, use these IDs:

🏬 Warehouses
| ID | Location  |
| -- | --------- |
| 1  | Bangalore |
| 2  | Mumbai    |
| 3  | Delhi     |
| 4  | Kolkata   |

🏪 Sellers
| ID | Name          | Location  |
| -- | ------------- | --------- |
| 1  | Nestle Seller | Chennai   |
| 2  | Rice Seller   | Ahmedabad |
| 3  | Sugar Seller  | Hyderabad |

🛒 Customers
| ID | Name               | Location  |
| -- | ------------------ | --------- |
| 1  | Shree Kirana Store | Bangalore |
| 2  | Andheri Mini Mart  | Mumbai    |
| 3  | Delhi Corner Store | Delhi     |

📦 Products
| ID | Name        | Weight |
| -- | ----------- | ------ |
| 1  | Maggie 500g | 0.5 kg |
| 2  | Rice Bag    | 10 kg  |
| 3  | Sugar Bag   | 25 kg  |



🚀 Start Server : npm run dev
    Server runs at: http://localhost:3000

1️⃣ Find Nearest Warehouse

GET : /api/v1/warehouse/nearest?sellerId=1&productId=1

Example : http://localhost:3000/api/v1/warehouse/nearest?sellerId=1&productId=1

Response : 
{
  "warehouseId": 1,
  "warehouseLocation": {
    "lat": 12.99999,
    "long": 77.923273
  }
}

2️⃣ Shipping Charge (Warehouse → Customer)

GET : /api/v1/shipping-charge?warehouseId=1&customerId=1&deliverySpeed=standard&weightKg=2

Example : http://localhost:3000/api/v1/shipping-charge?warehouseId=1&customerId=1&deliverySpeed=express&weightKg=5

Response : 
{
  "shippingCharge": 150.00
}

3️⃣ Combined Shipping Calculation 
POST : /api/v1/shipping-charge/calculate

Example : 
    Body : 
    {
  "sellerId": 1,
  "customerId": 1,
  "deliverySpeed": "express",
  "items": [
    { "productId": 1, "quantity": 4 }
  ]
}

Response : 
{
  "shippingCharge": 180.00,
  "nearestWarehouse": {
    "warehouseId": 1,
    "warehouseLocation": {
      "lat": 12.99999,
      "long": 77.923273
    }
  }
}