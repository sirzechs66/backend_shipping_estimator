const output = document.getElementById("output");

function show(data) {
  output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!res.ok) {
      show({ status: res.status, error: json });
      return null;
    }
    show(json);
    return json;
  } catch (e) {
    show({ error: "NETWORK_ERROR", message: e.message });
    return null;
  }
}

// attach to window so onclick works
window.nearestWarehouse = async function () {
  const sellerId = document.getElementById("nwSellerId").value;
  const productId = document.getElementById("nwProductId").value;

  if (!sellerId || !productId) return show("Please enter sellerId and productId.");

  const url = `/api/v1/warehouse/nearest?sellerId=${encodeURIComponent(sellerId)}&productId=${encodeURIComponent(productId)}`;
  await safeFetch(url, { method: "GET" });
};

window.shippingCharge = async function () {
  const warehouseId = document.getElementById("scWarehouseId").value;
  const customerId = document.getElementById("scCustomerId").value;
  const deliverySpeed = document.getElementById("scSpeed").value;
  const weightKg = document.getElementById("scWeightKg").value;

  if (!warehouseId || !customerId || !deliverySpeed) {
    return show("Please enter warehouseId, customerId, and deliverySpeed.");
  }

  const params = new URLSearchParams({ warehouseId, customerId, deliverySpeed });
  if (weightKg) params.set("weightKg", weightKg);

  await safeFetch(`/api/v1/shipping-charge?${params.toString()}`, { method: "GET" });
};

window.combinedCalculate = async function () {
  const sellerId = Number(document.getElementById("ccSellerId").value);
  const customerId = Number(document.getElementById("ccCustomerId").value);
  const deliverySpeed = document.getElementById("ccSpeed").value;
  const itemsText = document.getElementById("ccItems").value.trim();
  const weightKgText = document.getElementById("ccWeightKg").value;

  if (!sellerId || !customerId || !deliverySpeed) {
    return show("Please enter sellerId, customerId, and deliverySpeed.");
  }

  const body = { sellerId, customerId, deliverySpeed };
  if (weightKgText) body.weightKg = Number(weightKgText);

  if (itemsText) {
    try {
      body.items = JSON.parse(itemsText);
    } catch {
      return show('Items JSON invalid. Example: [{"productId":1,"quantity":2}]');
    }
  }

  await safeFetch(`/api/v1/shipping-charge/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};