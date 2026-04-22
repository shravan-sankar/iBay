const API_BASE = "../../backend";

const products = [
  { id: 1, name: "Item 1", price: 10, seller: "Alice", category: "Tech", image: "" },
  { name: "Item 2", price: 20, seller: "Bob", category: "Clothes", image: "" }
];

const Reccontainer = document.getElementById("recommended-products-container");

/////

fetch("../../backend/get_products.php")

  .then(response => response.json())
  .then(products => {
    //const container = document.getElementById("products-container");

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = 
      `<a href="product.html?id=${product.id}" class="product-link">
          <h2>${product.name}</h2>
          <p>£${product.price}</p>
          <p>Seller: ${product.seller}</p>
          <p>${product.category}</p>
        </a>`;

      Reccontainer.appendChild(card);
    });
  });


/*

////
products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
  <a href="product.html?id=${product.id}" class="product-link">
    <img src="${product.image}" class="product-image">
    <h2>${product.name}</h2>
    <p>£${product.price}</p>
    <p>Seller: ${product.seller}</p>
    <p>${product.category}</p>
  </a>
  `;

  Reccontainer.appendChild(card);
});
*/
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

function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function redirectToLogin() {
  window.location.replace("main-G06.html");
}

async function validateActiveSession() {
  const customer = await loadCurrentCustomer();
  if (!customer) {
    redirectToLogin();
    return null;
  }

  const urlUserId = getUserIdFromUrl();
  const sessionUserId = String(customer.id);
  if (!urlUserId || String(urlUserId) !== sessionUserId) {
    window.location.replace(`browse.html?id=${encodeURIComponent(String(customer.id))}`);
    return null;
  }

  window.iBayCurrentUser = customer;
  window.iBaySignedInUserId = sessionUserId;
  sessionStorage.setItem("iBayCurrentUser", JSON.stringify(customer));
  return customer;
}

function setupLogoutLink() {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) {
    return;
  }

  logoutLink.addEventListener("click", function (event) {
    event.preventDefault();
    sessionStorage.removeItem("iBayCurrentUser");
    window.location.replace(logoutLink.href);
  });
}

function renderProductCard(product, container) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
  <a href="product.html?id=${product.id}" class="product-link">
    <img src="${product.image}" class="product-image">
    <h2>${product.name}</h2>
    <p>£${product.price}</p>
    <p>Seller: ${product.seller}</p>
    <p>${product.category}</p>
  </a>
  `;
  container.appendChild(card);
}

document.addEventListener("DOMContentLoaded", async function () {
  setupLogoutLink();
  const customer = await validateActiveSession();
  if (!customer) {
    return;
  }

  const Reccontainer = document.getElementById("products-container");
  const Latcontainer = document.getElementById("latest-products-container");

  products.forEach((product) => renderProductCard(product, Reccontainer));
  latestproducts.forEach((product) => renderProductCard(product, Latcontainer));
});

window.addEventListener("pageshow", async function () {
  await validateActiveSession();
});
