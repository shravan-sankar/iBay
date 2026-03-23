
const products = [
  { name: "Item 1", price: 10, seller: "Alice", category: "Tech", image: "" },
  { name: "Item 2", price: 20, seller: "Bob", category: "Clothes", image: "" }
];

const Reccontainer = document.getElementById("products-container");


products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${product.image}" class="product-image">
    <h2>${product.name}</h2>
    <p>£${product.price}</p>
    <p>Seller: ${product.seller}</p>
    <p>${product.category}</p>
  `;

  Reccontainer.appendChild(card);
});

const latestproducts = [
  { name: "Item 1", price: 10, seller: "Alice", category: "Tech", image: "" },
  { name: "Item 2", price: 20, seller: "Bob", category: "Clothes", image: "" }
];

const Latcontainer = document.getElementById("latest-products-container");


products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${product.image}" class="product-image">
    <h2>${product.name}</h2>
    <p>£${product.price}</p>
    <p>Seller: ${product.seller}</p>
    <p>${product.category}</p>
  `;

  Latcontainer.appendChild(card);
});

