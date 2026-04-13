const API_BASE = "../../backend";

const products = [
  { name: "Item 1", price: 10, seller: "Alice", category: "Tech", image: "" },
  { name: "Item 2", price: 20, seller: "Bob", category: "Clothes", image: "" }
];

const latestproducts = [
  { name: "Item 1", price: 10, seller: "Alice", category: "Tech", image: "" },
  { name: "Item 2", price: 20, seller: "Bob", category: "Clothes", image: "" }
];

async function loadCurrentCustomer() {
  const res = await fetch(`${API_BASE}/me.php`, { credentials: "include" });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

function renderProductCard(product, container) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <img src="${product.image}" class="product-image">
    <h2>${product.name}</h2>
    <p>£${product.price}</p>
    <p>Seller: ${product.seller}</p>
    <p>${product.category}</p>
  `;
  container.appendChild(card);
}

document.addEventListener("DOMContentLoaded", async function () {
  const customer = await loadCurrentCustomer();
  if (!customer) {
    window.location.href = "main-G06.html";
    return;
  }

  window.iBayCurrentUser = customer;
  sessionStorage.setItem("iBayCurrentUser", JSON.stringify(customer));

  const Reccontainer = document.getElementById("products-container");
  const Latcontainer = document.getElementById("latest-products-container");

  products.forEach((product) => renderProductCard(product, Reccontainer));
  latestproducts.forEach((product) => renderProductCard(product, Latcontainer));
});
