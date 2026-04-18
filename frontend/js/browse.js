
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

const Latcontainer = document.getElementById("latest-products-container");


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

  Latcontainer.appendChild(card);
});

