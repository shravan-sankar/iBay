const API_BASE = "../../backend";

function showPurchaseToastIfNeeded() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("purchased") !== "1") {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "purchase-toast";
  toast.innerHTML = `
    <img src="../images/iBay_logo.jpg" alt="iBay logo" class="purchase-toast__logo">
    <div class="purchase-toast__text-wrap">
      <p class="purchase-toast__title">Thank you for purchasing!</p>
      <p class="purchase-toast__subtitle">Your order has been placed successfully.</p>
    </div>
  `;
  document.body.appendChild(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      toast.remove();
    }, 320);
  }, 3200);
}


window.addEventListener('DOMContentLoaded', () => {
    // 1. Get the category from the URL (?cat=Electronics)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');


    console.log('User ID from URL:', userId);
    showPurchaseToastIfNeeded();
    document.getElementById('profile-image-link').href = `upload.html?id=${encodeURIComponent(String(userId))}`;
    document.getElementById('basket-image-link').href = `basket.html?id=${encodeURIComponent(String(userId))}`;


        const categoryButtons = document.querySelectorAll('.category_btn');

        categoryButtons.forEach(button => {


            const currentHref = button.getAttribute('href');
            
            const separator = currentHref.includes('?') ? '&' : '?';
            
            button.href = `${currentHref}${separator}id=${userId}`;
        });
        
        console.log(`Updated ${categoryButtons.length} buttons with User ID: ${userId}`);

      const Reccontainer = document.getElementById("recommended-products-container");

      const formData = new FormData();
      formData.append('user_id', userId);

    fetch('../../backend/get_recommended_products.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `user_id=${userId}`
})
.then(res => res.json())
.then(data => {
  console.log('Response from get_recommended_products.php:', data);
    if (!data.success) return console.error('Error:', data.message);

    data.products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = 
      `<a href="product.html?id=${product.id}" class="product-link">
          <img src="../../product_images/${product.image_url_1}" alt="${product.productName}" class="product-image">
          <h2>${product.productName}</h2>
          <p>£${product.price}</p>
          <p>Seller: ${product.seller}</p>
          <p>${product.category}</p>
          <p>${product.item_condition}</p>
        </a>`;

      Reccontainer.appendChild(card);
    });
})
.catch(err => console.error('Fetch failed:', err));


const container = document.getElementById("latest-products-container");

fetch('../../backend/get_latest_products.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})
.then(res => res.json())
.then(data => {
    if (!data.success) return console.error('Error:', data.message);

    data.products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        console.log('Rendering product:', product);
        card.innerHTML = 
        `<a href="product.html?id=${product.id}" class="product-link">
            <img src="../../product_images/${product.image}" alt="${product.productName}" class="product-image">
            <h2>${product.productName}</h2>
            <p>£${product.price}</p>
            <p>Seller: ${product.seller}</p>
            <p>${product.category}</p>
            <p>${product.item_condition}</p>
        </a>`;

        container.appendChild(card);
    });
})
.catch(err => console.error('Fetch failed:', err));
});






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
      <img src="../../product_images/${product.image}" alt="${product.productName}" class="product-image">
      <h2>${product.productName}</h2>
      <p>£${product.price}</p>
      <p>Seller: ${product.seller}</p>
      <p>${product.category}</p>
      <p>${product.item_condition}</p>
    </a>`;
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
