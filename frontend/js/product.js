// iBay - Product Page Scripts

var BASKET_STORAGE_KEY = "ibay_basket";

function getBasket() {
    try {
        var raw = localStorage.getItem(BASKET_STORAGE_KEY);
        if (!raw) {
            return [];
        }
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function setBasket(items) {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
}

// Changes the main product image when a thumbnail is clicked

function changeImage(thumbnail) {
    var mainImage = document.getElementById("main-image");
    mainImage.src = thumbnail.src;
}

// --- Add to basket ---

function addToBasket() {
    var quantityInput = document.getElementById("quantity");
    var quantity = parseInt(quantityInput.value, 10);
    var errorMsg = document.getElementById("quantity-error");

    if (isNaN(quantity) || quantity < 1) {
        errorMsg.textContent = "Please enter a valid quantity (minimum 1).";
        return;
    }

    errorMsg.textContent = "";

    var root = document.getElementById("product-page");
    var id = (root && root.getAttribute("data-product-id")) || "item-default";
    var titleEl = document.querySelector(".item-title");
    var priceEl = document.getElementById("item-price");
    var postageEl = document.getElementById("item-postage");
    var imgEl = document.getElementById("main-image");

    var price = parseFloat((priceEl && priceEl.textContent) || "0");
    var postage = parseFloat((postageEl && postageEl.textContent) || "0");
    if (isNaN(price)) {
        price = 0;
    }
    if (isNaN(postage)) {
        postage = 0;
    }

    var line = {
        id: id,
        title: (titleEl && titleEl.textContent.trim()) || "Item",
        price: price,
        postage: postage,
        quantity: quantity,
        image: (imgEl && imgEl.getAttribute("src")) || ""
    };

    var items = getBasket();
    var idx = -1;
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            idx = i;
            break;
        }
    }
    if (idx >= 0) {
        items[idx].quantity += quantity;
    } else {
        items.push(line);
    }
    setBasket(items);

    window.location.href = "basket.html";
}

// --- Buy Now Validation ---

function handleBuyNow() {
 
    // Get the quantity input
    var quantityInput = document.getElementById("quantity");
    var quantity = parseInt(quantityInput.value);
 
    var errorMsg = document.getElementById("quantity-error");
 
    // Check the quantity
    if (isNaN(quantity) || quantity < 1) {
        errorMsg.textContent = "Please enter a valid quantity (minimum 1).";
        return; // Stop here, do not proceed
    }
 
    // If validation passes, clear any error and continue
    errorMsg.textContent = "";
    alert("Proceeding to checkout with quantity: " + quantity);

}