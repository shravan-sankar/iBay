
const products = [
  { name: "Item 1", price: 10, seller: "Alice", category: "Tech", image: "" },
  { name: "Item 2", price: 20, seller: "Bob", category: "Clothes", image: "" }
];

const container = document.getElementById("products-container");


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

  container.appendChild(card);
});