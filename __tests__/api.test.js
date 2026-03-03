const request = require('supertest');
const app = require('../src/app');

describe('Shipping API Endpoints', () => {
  it('GET /api/v1/shipping-charge returns shipping charge', async () => {
    const res = await request(app)
      .get('/api/v1/shipping-charge')
      .query({ warehouseId: 1, customerId: 1, deliverySpeed: 'standard', weightKg: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('shippingCharge');
    expect(typeof res.body.shippingCharge).toBe('number');
  });

  it('POST /api/v1/shipping-charge/calculate returns shipping charge and nearest warehouse', async () => {
    const res = await request(app)
      .post('/api/v1/shipping-charge/calculate')
      .send({ sellerId: 1, customerId: 1, deliverySpeed: 'express', weightKg: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('shippingCharge');
    expect(res.body).toHaveProperty('nearestWarehouse');
    expect(typeof res.body.shippingCharge).toBe('number');
    expect(res.body.nearestWarehouse).toHaveProperty('warehouseId');
  });

  it('GET /api/v1/shipping-charge with invalid params returns error', async () => {
    const res = await request(app)
      .get('/api/v1/shipping-charge')
      .query({ warehouseId: 'bad', customerId: 1, deliverySpeed: 'standard', weightKg: 2 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Warehouse API Endpoints', () => {
  it('GET /api/v1/warehouse/nearest returns nearest warehouse', async () => {
    const res = await request(app)
      .get('/api/v1/warehouse/nearest')
      .query({ sellerId: 1, productId: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('warehouseId');
    expect(res.body).toHaveProperty('warehouseLocation');
  });

  it('GET /api/v1/warehouse/nearest with invalid params returns error', async () => {
    const res = await request(app)
      .get('/api/v1/warehouse/nearest')
      .query({ sellerId: 'bad', productId: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
