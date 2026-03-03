const { getTransport } = require("../src/utils/transport");

describe("Transport slab selection", () => {
  test("distance < 100 => MINI_VAN", () => {
    expect(getTransport(99.99)).toEqual({ mode: "MINI_VAN", rate: 3 });
  });

  test("distance >= 100 and < 500 => TRUCK", () => {
    expect(getTransport(100)).toEqual({ mode: "TRUCK", rate: 2 });
    expect(getTransport(499.99)).toEqual({ mode: "TRUCK", rate: 2 });
  });

  test("distance >= 500 => AEROPLANE", () => {
    expect(getTransport(500)).toEqual({ mode: "AEROPLANE", rate: 1 });
  });
});